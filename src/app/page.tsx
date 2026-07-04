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
    <main style={{ padding: "40px" }}>
      <h1>Meridian</h1>

      <input
        type="text"
        placeholder="Search titles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px", width: "250px" }}
      />

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setSelectedCountry(null)}>All</button>
        {countries.map((country) => (
          <button key={country} onClick={() => setSelectedCountry(country)}>
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