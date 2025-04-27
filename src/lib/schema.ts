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
  GRADE: z.string().nullable(),
  Latitude: z.number().nullable(),
  Longitude: z.number().nullable(),
  
})

export type Company = z.infer<typeof CompanySchema>
export type Restaurant = z.infer<typeof RestaurantSchema>

export {SearchSchema, CompanySchema, RestaurantSchema};

