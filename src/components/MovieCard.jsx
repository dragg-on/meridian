import Link from "next/link";

export default function MovieCard({ movie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="border border-neutral-800 rounded-lg p-4 w-52 bg-neutral-900 hover:border-amber-400 transition-colors cursor-pointer">
        <div className="text-2xl mb-2">{movie.flag}</div>
        <h3 className="font-medium text-neutral-100">{movie.title}</h3>
        <p className="text-sm text-neutral-400">{movie.year} · {movie.country}</p>
        <p className="text-sm text-neutral-400">{movie.genre}</p>
        <p className="text-xs text-amber-400 mt-2">
          {movie.episodes.length} episode{movie.episodes.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}