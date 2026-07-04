"use client";

import { useState } from "react";
import { MOVIES } from "@/lib/data";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [query, setQuery] = useState("");

  const countries = [...new Set(MOVIES.map((m) => m.country))];

  const filtered = MOVIES.filter((movie) => {
    const matchesCountry = selectedCountry ? movie.country === selectedCountry : true;
    const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase());
    return matchesCountry && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <h1 className="text-3xl font-semibold text-amber-400 mb-6">Meridian</h1>

      <input
        type="text"
        placeholder="Search titles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 mb-6 w-64 text-sm focus:outline-none focus:border-amber-400"
      />

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedCountry(null)}
          className={`px-4 py-2 rounded-full text-sm border ${
            selectedCountry === null
              ? "bg-amber-400 text-neutral-900 border-amber-400"
              : "border-neutral-700 text-neutral-300"
          }`}
        >
          All
        </button>
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
            className={`px-4 py-2 rounded-full text-sm border ${
              selectedCountry === country
                ? "bg-amber-400 text-neutral-900 border-amber-400"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            {country}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        {filtered.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}