"use client";

import SearchComponent from "@/components/search-form";
import { Company, Restaurant } from "@/lib/schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchState } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { format } from "path";


function getGradeVariant(grade?: string) {
  switch (grade) {
    case "A": return "success";
    case "B": return "warning";
    case "C": return "destructive";
    default:  return "secondary";
  }
}


export default function Home() {
  const [searchState, setSearchState] = useState<SearchState>(SearchState.IDLE);

  const [companies, setCompanies] = useState<Restaurant[]>([]);

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] ${
        searchState === SearchState.IDLE ? "items-center" : "items-start"
      } justify-items-center min-h-screen p-6 pb-20 gap-16 sm:pb-10 sm:pt-6 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className={`flex flex-col gap-8 row-start-2 items-center w-full`}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-x-[2px] ">
            <span className="text-2xl font-semibold">Hi, I am </span>
            <span className="text-2xl font-semibold text-orange-600"
            >RestaurantSeek</span>
          </div>
          <span className="font-medium">
            Search for Restaurants in NYC
          </span>
        </div>
        <SearchComponent
          setCompanies={setCompanies}
          setSearchState={setSearchState}
        />

        <span className="text-wrap text-orange-600">
          {searchState === SearchState.SEARCHING ? (
            <span className=" animate-pulse">Searching ...</span>
          ) : searchState === SearchState.NORESULT ? (
            "Sorry, couldn't find any comapnies"
          ) : searchState === SearchState.ERROR ? (
            "Error fetching Companies, try again later"
          ) : (
            searchState === SearchState.IDLE && (
              <div className="typed-out overflow-hidden text-center">
                Try: Give me restaurants that serve chinese
              </div>
            )
          )}
        </span>

        <div className="grid sm:grid-cols-2 gap-6 w-fit">
          {Array.isArray(companies) &&
            companies.map((company, index) => {
              return (
                <Card key={index} className="lg:w-[29rem]">
                <CardHeader className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-semibold">{company.DBA}</h3>
                  <Badge >
                    {company.GRADE ?? "N/A"}
                  </Badge>
                </CardHeader>
          
                <CardContent className="p-4 space-y-2">
                  {/* Cuisine */}
                  <div className="text-sm text-gray-600">
                    {company["CUISINE DESCRIPTION"]}
                  </div>
          
                  {/* Address */}
                  <div className="text-sm">
                    <span className="font-medium">{company.BUILDING} {company.STREET}</span>, {company.BORO} {company.ZIPCODE}
                  </div>
          
                  {/* Score & Date */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium">Score:</span>{" "}
                      {company.SCORE != null ? company.SCORE : "–"}
                    </div>
                    
                  </div>
                </CardContent>
          
                <CardFooter className="flex flex-wrap gap-2 p-4">
                  {/* Call button */}
                  {company.PHONE && (
                    <Button size="sm" asChild>
                      <a href={`tel:${company.PHONE}`}>Call</a>
                    </Button>
                  )}
          
                  {/* Map button */}
                  {company.Latitude && company.Longitude && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://maps.google.com/?q=${company.Latitude},${company.Longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Map
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
              );
            })}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <span>
          Built by{" "}
          <Link
            className="cursor-pointer hover:underline text-orange-500"
            href={"https://www.linkedin.com/in/hrishik-desai/"}
          >
            Hrishik Desai
          </Link>
        </span>
      </footer>
    </div>
  );
}
