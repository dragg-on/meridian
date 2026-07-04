import { MOVIES } from "@/lib/data";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Meridian</h1>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {MOVIES.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}