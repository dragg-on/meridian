"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const COLORS = ["#C9A227", "#2F6F6F", "#7c2d3a", "#4a2d6b", "#1f3d6b"];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/");
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id);
    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  }

  function selectProfile(profile: any) {
    localStorage.setItem("activeProfileId", String(profile.id));
    localStorage.setItem("activeProfileName", profile.name);
    router.push("/");
  }

  async function addProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const color = COLORS[profiles.length % COLORS.length];

    const { error } = await supabase.from("profiles").insert({
      user_id: userData.user.id,
      name: newName.trim(),
      avatar_color: color,
    });

    if (!error) {
      setNewName("");
      setShowAdd(false);
      loadProfiles();
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-amber-400 mb-10">Who's watching?</h1>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-2xl">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => selectProfile(profile)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-semibold text-neutral-900 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {profile.name[0].toUpperCase()}
            </div>
            <span className="text-sm text-neutral-300">{profile.name}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAdd(true)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center text-3xl text-neutral-500 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
            +
          </div>
          <span className="text-sm text-neutral-400">Add Profile</span>
        </button>
      </div>

      {showAdd && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium text-amber-400 mb-4">New profile</h2>
            <form onSubmit={addProfile} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Profile name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                maxLength={20}
                className="bg-neutral-800 border border-neutral-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 text-neutral-900 font-semibold py-2 rounded-md text-sm hover:bg-amber-300"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}