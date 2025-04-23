import { z } from "zod";

const SearchSchema = z.object({
  prompt: z.string(),
});

const CompanySchema = z.object({
  name: z.string(),
  header: z.string(), 
  description: z.string(),
  tags: z.array(z.string()),
  logo_url: z.string()
})

const RestaurantSchema = z.object({
  CAMIS: z.number(),
  DBA: z.string(),
  BORO: z.string(),
  BUILDING: z.string(),
  STREET: z.string(),
  ZIPCODE: z.string(),
  PHONE: z.string(),
  "CUISINE DESCRIPTION": z.string(),
  "INSPECTION DATE": z
    .string(),
  ACTION: z.string(),
  "VIOLATION CODE": z.string().nullable(),
  "VIOLATION DESCRIPTION": z.string().nullable(),
  "CRITICAL FLAG": z.string(),
  SCORE: z.number().nullable(),
  GRADE: z.string().nullable(),
  "GRADE DATE": z
    .string()
    .nullable(),
  "RECORD DATE": z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  "INSPECTION TYPE": z.string(),
  Latitude: z.number().nullable(),
  Longitude: z.number().nullable(),
  "Community Board": z.string().nullable(),
  "Council District": z.string().nullable(),
  "Census Tract": z.string().nullable(),
  BIN: z.string().nullable(),
  BBL: z.string().nullable(),
  NTA: z.string().nullable()
})

export type Company = z.infer<typeof CompanySchema>
export type Restaurant = z.infer<typeof RestaurantSchema>

export {SearchSchema, CompanySchema, RestaurantSchema};

