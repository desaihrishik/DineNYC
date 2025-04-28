"use client";

import SearchComponent from "@/components/search-form";
import { Restaurant } from "@/lib/schema";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchState } from "@/lib/constants";

export default function Home() {
  const [searchState, setSearchState] = useState<SearchState>(SearchState.IDLE);
  const [companies, setCompanies] = useState<Restaurant[]>([]);

  // filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
  const grades = ["A", "B", "C"];
  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  // filtered list
  const displayed = companies.filter(c =>
    (selectedBoroughs.length === 0 || selectedBoroughs.includes(c.BORO)) &&
    (selectedGrades.length === 0 || selectedGrades.includes(c.GRADE ?? ""))
  );

  return (
    <div className="relative bg-gray-50 font-sans flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-1 max-w-4xl mx-auto py-12 px-4">
        
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Dine<span className="text-orange-600">NYC</span>
          </h1>
          <p className="text-lg text-gray-600">
            Uncover authentic flavors and neighborhood favorites
          </p>
        </header>
  
        {/* Search + Filter Controls */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchComponent
              setCompanies={setCompanies}
              setSearchState={setSearchState}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilterOpen(prev => !prev)}
            >
              {filterOpen ? "Hide Filters" : "Filters"}
            </Button>
          </div>
  
          <div className="mt-4 text-center text-orange-600">
            {searchState === SearchState.SEARCHING && (
              <span className="animate-pulse">Searching …</span>
            )}
            {searchState === SearchState.NORESULT && (
              "Sorry, no restaurants found."
            )}
            {searchState === SearchState.ERROR && (
              "Oops! Something went wrong. Please try again."
            )}
            {searchState === SearchState.IDLE && (
              <p className="italic text-gray-500">
                Try: “Give me restaurants that serve Chinese”
              </p>
            )}
          </div>
  
          {filterOpen && (
            <div className="mt-6 bg-gray-100 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Borough Filter */}
              <div>
                <p className="font-medium mb-2">Borough</p>
                {boroughs.map(b => (
                  <label key={b} className="inline-flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      value={b}
                      checked={selectedBoroughs.includes(b)}
                      onChange={() =>
                        setSelectedBoroughs(prev =>
                          prev.includes(b)
                            ? prev.filter(x => x !== b)
                            : [...prev, b]
                        )
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{b}</span>
                  </label>
                ))}
              </div>
  
              {/* Grade Filter */}
              <div>
                <p className="font-medium mb-2">Grade</p>
                {grades.map(g => (
                  <label key={g} className="inline-flex items-center mr-4 mb-2">
                    <input
                      type="checkbox"
                      value={g}
                      checked={selectedGrades.includes(g)}
                      onChange={() =>
                        setSelectedGrades(prev =>
                          prev.includes(g)
                            ? prev.filter(x => x !== g)
                            : [...prev, g]
                        )
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
  
        {/* Results Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {displayed.map((company, idx) => (
              <Card
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col"
              >
                <CardHeader className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    {company.DBA}
                    <span
                      className={`
                        ml-2 flex items-center justify-center
                        w-8 h-8 rounded-full text-sm font-semibold
                        ${
                          company.GRADE === "A"
                            ? "bg-green-100 text-green-800"
                            : company.GRADE === "B"
                            ? "bg-yellow-100 text-yellow-800"
                            : company.GRADE === "C"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }
                      `}
                    >
                      {company.GRADE ?? "N/A"}
                    </span>
                  </h3>
                </CardHeader>
  
                <CardContent className="flex-1 mb-6 space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">ADDRESS:</span>{" "}
                    {company.BUILDING} {company.STREET}, {company.BORO}{" "}
                    {company.ZIPCODE}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">PHONE:</span>{" "}
                    {company.PHONE}
                  </p>
                </CardContent>
  
                <CardFooter className="flex gap-4">
                  {company.PHONE && (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`tel:${company.PHONE}`}>Call</a>
                    </Button>
                  )}
                  {company.Latitude && company.Longitude && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
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
            ))}
          </div>
        </section>
      </div>
  
      {/* Sticky Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        Built by{" "}
        <Link
          href="https://www.linkedin.com/in/hrishik-desai/"
          className="text-orange-500 hover:underline"
        >
          Hrishik Desai
        </Link>
      </footer>
    </div>
  );
}
