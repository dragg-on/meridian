"use client";

import { useState } from "react";
import { MOVIES } from "@/lib/data";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countries = [...new Set(MOVIES.map((m) => m.country))];

  const filtered = selectedCountry
    ? MOVIES.filter((m) => m.country === selectedCountry)
    : MOVIES;

  return (
    <main style={{ padding: "40px" }}>
      <h1>Meridian</h1>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setSelectedCountry(null)}>
          All
        </button>
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
          >
            {country}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {filtered.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}