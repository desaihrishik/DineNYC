import { NextResponse } from "next/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { headers } from "next/headers";

import Restaurants from "@/lib/data/Restaurants-Dataset.json";

const rateLimit = new Map();

function fallbackSearch(prompt: string) {
  const terms = prompt
    .toLowerCase()
    .split(/[\s,]+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const scored = Restaurants.map((restaurant) => {
    const searchableText = [
      restaurant.DBA,
      restaurant["CUISINE DESCRIPTION"],
      restaurant.BORO,
      restaurant.STREET,
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (searchableText.includes(term)) {
        score += 1;
      }
    }

    return { restaurant, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((entry) => entry.restaurant);

  return scored;
}

export async function POST(request: Request) {
  let prompt = "";

  try {
    // rate limiting
    const headersList = headers();
    const ip = (await headersList).get("x-forwarded-for") || "anonymous";
    const nowtime = Date.now();
    const userLimit = rateLimit.get(ip) || { count: 0, timestamp: nowtime };

    if (nowtime - userLimit.timestamp > 24 * 60 * 60 * 1000) {
      userLimit.count = 0;
      userLimit.timestamp = nowtime;
    }
    // max requests per day = 50
    if (userLimit.count >= 50) {
      const resetTime = new Date(userLimit.timestamp + 24 * 60 * 60 * 1000);
      return Response.json(
        {
          error: "Rate limit exceeded",
          details: `Daily limit reached. Try again after ${resetTime.toLocaleTimeString()}`,
        },
        { status: 429 }
      );
    }

    // get prompt
    const body = await request.json();
    prompt = body.prompt;

    userLimit.count++;
    rateLimit.set(ip, userLimit);

    if (!prompt || prompt === "") {
      return NextResponse.json({
        message: "Prompt is either empty or wrong",
        statusCode: 422,
      });
    }

    const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
    const pineconeApiKey = process.env.PINECONE_API_KEY?.trim();
    const pineconeIndex = process.env.PINECONE_INDEX?.trim();

    if (!openAiApiKey || !pineconeApiKey || !pineconeIndex) {
      const localResults = fallbackSearch(prompt);
      return NextResponse.json({
        response: localResults,
        mode: "fallback",
      });
    }

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
      apiKey: openAiApiKey,
    });

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: openAiApiKey,
    });

    const pinecone = new PineconeClient({ apiKey: pineconeApiKey });
    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex: pinecone.Index(pineconeIndex),
    });

    const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    const InputStateAnnotation = Annotation.Root({
      question: Annotation<string>,
    });

    const StateAnnotation = Annotation.Root({
      question: Annotation<string>,
      context: Annotation<Document[]>,
      answer: Annotation<string>,
    });

    const retrieve = async (state: typeof InputStateAnnotation.State) => {
      const retrievedDocs = await vectorStore.similaritySearch(state.question,10);
      return { context: retrievedDocs };
    };

    const generate = async (state: typeof StateAnnotation.State) => {
      const docsContent = state.context
        .map((doc: Document) => {
          return "{ restaurant_name: " + doc.metadata.name + " description: " + doc.pageContent + "}";
        })
        .join("\n");
      const messages = await promptTemplate.invoke({
        question: state.question,
        context: docsContent,
      });
      const response = await llm.invoke(messages);
      return { answer: response.content };
    };

    const graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

    const result = await graph.invoke({
      question:
        "return only the names of the restaurants and in an array and return all the matching restaurants " +
        prompt,
    });

    const company_names:string[] = JSON.parse(result.answer);
    
    const normalizedNamesArray = company_names.map(name => name.toLowerCase());
    console.log("restaurants: ", company_names)
    const comps = Restaurants.filter((comp) => normalizedNamesArray.includes(comp.DBA.toLowerCase()))
    
    return NextResponse.json({
      response: comps,
      mode: "vector",
    });
  } catch (error) {
    console.log("error here: ", error);
    const localResults = fallbackSearch(prompt);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        response: localResults,
        mode: "fallback",
        warning: "Vector search failed. Returned fallback dataset results.",
        details: message,
      },
      { status: 200 }
    );
  }
  
}
