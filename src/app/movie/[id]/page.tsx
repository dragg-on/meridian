"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      const { data: movieData } = await supabase.from("dramas").select("*").eq("id", id).single();
      setMovie(movieData);

      const { data: episodeData } = await supabase
        .from("episodes")
        .select("*")
        .eq("drama_id", id)
        .order("episode_number", { ascending: true });
      setEpisodes(episodeData || []);

      const firstPlayable = episodeData?.find((ep) => ep.playback_id);
      setActiveEpisode(firstPlayable || null);

      setLoading(false);
    }
    load();
  }, [id]);

  async function playEpisode(ep: any) {
    if (!ep.playback_id) return;
    setActiveEpisode(ep);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const profileId = localStorage.getItem("activeProfileId");
    if (!profileId) {
      router.push("/profiles");
      return;
    }

    await supabase.from("watch_progress").upsert(
      {
        user_id: userData.user.id,
        profile_id: Number(profileId),
        drama_id: Number(id),
        episode_id: ep.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,drama_id" }
    );
  }

  function handleEnded() {
    if (!activeEpisode) return;
    const currentIndex = episodes.findIndex((ep) => ep.id === activeEpisode.id);
    const next = episodes
      .slice(currentIndex + 1)
      .find((ep) => ep.playback_id);
    if (next) {
      playEpisode(next);
    }
  }

  if (loading) {
    return <div className="p-6 sm:p-10 text-neutral-100 bg-neutral-950 min-h-screen">Loading...</div>;
  }

  if (!movie) {
    return <div className="p-6 sm:p-10 text-neutral-100 bg-neutral-950 min-h-screen">Drama not found.</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-10">
      <Link href="/" className="text-amber-400 text-sm">← Back to Meridian</Link>

      <div className="mt-6">
        <div className="text-3xl sm:text-4xl mb-2">{movie.flag}</div>
        <h1 className="text-2xl sm:text-3xl font-semibold">{movie.title}</h1>
        <p className="text-neutral-400 mt-1 text-sm sm:text-base">{movie.year} · {movie.country} · {movie.genre}</p>
        <p className="mt-4 max-w-xl text-neutral-300 text-sm sm:text-base">{movie.synopsis}</p>

        {activeEpisode ? (
          <div className="mt-6 sm:mt-8 w-full max-w-2xl">
            <MuxPlayer
              ref={playerRef}
              playbackId={activeEpisode.playback_id}
              metadata={{ video_title: `${movie.title} - ${activeEpisode.title}` }}
              streamType="on-demand"
              style={{ aspectRatio: "16/9", width: "100%" }}
              onEnded={handleEnded}
            />
            <p className="text-xs text-neutral-500 mt-2">Now playing: {activeEpisode.title}</p>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 max-w-md border border-dashed border-neutral-700 rounded-lg p-6 text-neutral-500 text-sm">
            Coming soon to Meridian — not yet available to stream.
          </div>
        )}

        {episodes.length > 0 && (
          <>
            <h2 className="mt-6 sm:mt-8 mb-3 text-lg font-medium text-amber-400">Episodes</h2>
            <div className="flex flex-col gap-2 max-w-md">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => playEpisode(ep)}
                  className={`border rounded-lg p-3 flex justify-between items-center transition-colors ${
                    ep.playback_id
                      ? "border-neutral-800 hover:border-amber-400 cursor-pointer"
                      : "border-neutral-900 opacity-50 cursor-not-allowed"
                  } ${activeEpisode?.id === ep.id ? "border-amber-400" : ""}`}
                >
                  <span className="text-sm sm:text-base">{ep.title}</span>
                  <span className="text-xs sm:text-sm text-neutral-400">{ep.duration}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}