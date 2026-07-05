import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";

export default async function MovieDetail({ params }) {
  const { id } = await params;

  const { data: movie, error } = await supabase
    .from("dramas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !movie) {
    return <div className="p-10 text-neutral-100 bg-neutral-950 min-h-screen">Drama not found.</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <Link href="/" className="text-amber-400 text-sm">← Back to Meridian</Link>

      <div className="mt-6">
        <div className="text-4xl mb-2">{movie.flag}</div>
        <h1 className="text-3xl font-semibold">{movie.title}</h1>
        <p className="text-neutral-400 mt-1">{movie.year} · {movie.country} · {movie.genre}</p>
        <p className="mt-4 max-w-xl text-neutral-300">{movie.synopsis}</p>

        {movie.playback_id ? (
          <div className="mt-8 max-w-2xl">
            <MuxPlayer
              playbackId={movie.playback_id}
              metadata={{ video_title: movie.title }}
              streamType="on-demand"
              style={{ aspectRatio: "16/9", width: "100%" }}
            />
          </div>
        ) : (
          <div className="mt-8 max-w-md border border-dashed border-neutral-700 rounded-lg p-6 text-neutral-500 text-sm">
            Coming soon to Meridian — not yet available to stream.
          </div>
        )}
      </div>
    </main>
  );
}