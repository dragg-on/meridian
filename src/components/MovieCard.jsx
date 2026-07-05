import Link from "next/link";

export default function MovieCard({ movie, inList, onToggleList }) {
  return (
    <div className="relative border border-neutral-800 rounded-lg p-4 w-52 bg-neutral-900 hover:border-amber-400 transition-colors">
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleList();
        }}
        className="absolute top-3 right-3 text-lg"
      >
        {inList ? "❤️" : "🤍"}
      </button>

      <Link href={`/movie/${movie.id}`}>
        <div className="text-2xl mb-2">{movie.flag}</div>
        <h3 className="font-medium text-neutral-100">{movie.title}</h3>
        <p className="text-sm text-neutral-400">{movie.year} · {movie.country}</p>
        <p className="text-sm text-neutral-400">{movie.genre}</p>
      </Link>
    </div>
  );
}