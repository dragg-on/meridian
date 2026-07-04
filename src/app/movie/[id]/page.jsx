import { MOVIES } from "@/lib/data";
import Link from "next/link";

export default async function MovieDetail({ params }) {
  const { id } = await params;
  const movie = MOVIES.find((m) => m.id === Number(id));

  if (!movie) {
    return <div className="p-10 text-neutral-100">Drama not found.</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <Link href="/" className="text-amber-400 text-sm">← Back to Meridian</Link>

      <div className="mt-6">
        <div className="text-4xl mb-2">{movie.flag}</div>
        <h1 className="text-3xl font-semibold">{movie.title}</h1>
        <p className="text-neutral-400 mt-1">{movie.year} · {movie.country} · {movie.genre}</p>
        <p className="mt-4 max-w-xl text-neutral-300">{movie.synopsis}</p>

        <h2 className="mt-8 mb-3 text-lg font-medium text-amber-400">Episodes</h2>
        <div className="flex flex-col gap-2 max-w-md">
          {movie.episodes.map((ep) => (
            <div
              key={ep.id}
              className="border border-neutral-800 rounded-lg p-3 flex justify-between items-center hover:border-amber-400 cursor-pointer transition-colors"
            >
              <span>{ep.title}</span>
              <span className="text-sm text-neutral-400">{ep.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}