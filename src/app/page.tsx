"use client";

import { useState } from "react";
import { MOVIES } from "@/lib/data";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState([]);
  const [showMyList, setShowMyList] = useState(false);

  const countries = [...new Set(MOVIES.map((m) => m.country))];

  const toggleMyList = (id) => {
    setMyList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const baseList = showMyList ? MOVIES.filter((m) => myList.includes(m.id)) : MOVIES;

  const filtered = baseList.filter((movie) => {
    const matchesCountry = selectedCountry ? movie.country === selectedCountry : true;
    const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase());
    return matchesCountry && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-amber-400">Meridian</h1>
        <button
          onClick={() => setShowMyList(!showMyList)}
          className={`px-4 py-2 rounded-full text-sm border ${
            showMyList
              ? "bg-amber-400 text-neutral-900 border-amber-400"
              : "border-neutral-700 text-neutral-300"
          }`}
        >
          My List ({myList.length})
        </button>
      </div>

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

      {filtered.length === 0 ? (
        <p className="text-neutral-500">Nothing here yet.</p>
      ) : (
        <div className="flex gap-4 flex-wrap">
          {filtered.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              inList={myList.includes(movie.id)}
              onToggleList={() => toggleMyList(movie.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}