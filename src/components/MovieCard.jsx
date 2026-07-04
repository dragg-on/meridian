export default function MovieCard({ movie }) {
  return (
    <div style={{
      border: "1px solid #333",
      borderRadius: "8px",
      padding: "16px",
      width: "200px",
    }}>
      <div style={{ fontSize: "24px" }}>{movie.flag}</div>
      <h3>{movie.title}</h3>
      <p>{movie.year} · {movie.country}</p>
      <p>{movie.genre}</p>
    </div>
  );
}