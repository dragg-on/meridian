import Link from "next/link";

const GRADIENTS = [
  ["#7c2d3a", "#1a0f14"],
  ["#1f4d4d", "#0c1a1a"],
  ["#4a2d6b", "#180f24"],
  ["#8a5a1f", "#241a0a"],
  ["#1f3d6b", "#0c1424"],
  ["#6b2d4a", "#20101a"],
];

export default function MovieCard({ movie, inList, onToggleList }) {
  const [g1, g2] = GRADIENTS[movie.id % GRADIENTS.length];

  return (
    <div className="relative w-32 sm:w-44 shrink-0">
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleList();
        }}
        className="absolute top-2 right-2 z-10 text-base sm:text-lg"
      >
        {inList ? "❤️" : "🤍"}
      </button>

      <Link href={`/movie/${movie.id}`}>
        <div
          className="w-32 h-48 sm:w-44 sm:h-64 rounded-lg flex flex-col justify-between p-2 sm:p-3 hover:scale-105 transition-transform cursor-pointer"
          style={{ background: `linear-gradient(150deg, ${g1}, ${g2})` }}
        >
          <div className="text-xl sm:text-2xl">{movie.flag}</div>
          <div>
            <p className="text-[10px] sm:text-xs text-amber-300 mb-1">{movie.genre}</p>
            <h3 className="font-medium text-xs sm:text-sm leading-tight">{movie.title}</h3>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-neutral-400 mt-2">{movie.year} · {movie.country}</p>
      </Link>
    </div>
  );
}