"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<number[]>([]);
  const [showMyList, setShowMyList] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      const { data, error } = await supabase.from("dramas").select("*");
      if (error) {
        console.error("Error fetching dramas:", error);
      } else {
        setMovies(data);
      }
      setLoading(false);
    }
    fetchMovies();

    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        const storedProfileId = localStorage.getItem("activeProfileId");
        const storedProfileName = localStorage.getItem("activeProfileName");
        if (storedProfileId) {
          setProfileId(Number(storedProfileId));
          setProfileName(storedProfileName);
          fetchMyList(Number(storedProfileId));
          fetchContinueWatching(Number(storedProfileId));
        } else {
          router.push("/profiles");
        }
      }
    }
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setMyList([]);
        setContinueWatching([]);
        setProfileId(null);
        setProfileName(null);
        localStorage.removeItem("activeProfileId");
        localStorage.removeItem("activeProfileName");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchMyList(profId: number) {
    const { data, error } = await supabase
      .from("my_list")
      .select("drama_id")
      .eq("profile_id", profId);
    if (!error && data) {
      setMyList(data.map((row) => row.drama_id));
    }
  }

  async function fetchContinueWatching(profId: number) {
    const { data, error } = await supabase
      .from("watch_progress")
      .select("drama_id, updated_at, episodes(title), dramas(*)")
      .eq("profile_id", profId)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setContinueWatching(data);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
        router.push("/profiles");
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMyList([]);
    setContinueWatching([]);
    setProfileId(null);
    setProfileName(null);
    localStorage.removeItem("activeProfileId");
    localStorage.removeItem("activeProfileName");
  }

  const countries = [...new Set(movies.map((m) => m.country))];
  const genres = [...new Set(movies.map((m) => m.genre))];

  async function toggleMyList(id: number) {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!profileId) {
      router.push("/profiles");
      return;
    }
    if (myList.includes(id)) {
      await supabase.from("my_list").delete().eq("profile_id", profileId).eq("drama_id", id);
      setMyList((prev) => prev.filter((x) => x !== id));
    } else {
      await supabase.from("my_list").insert({ user_id: user.id, profile_id: profileId, drama_id: id });
      setMyList((prev) => [...prev, id]);
    }
  }

  const baseList = showMyList ? movies.filter((m) => myList.includes(m.id)) : movies;

  const filtered = baseList.filter((movie) => {
    const matchesCountry = selectedCountry ? movie.country === selectedCountry : true;
    const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase());
    return matchesCountry && matchesQuery;
  });

  if (loading) {
    return <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">Loading...</main>;
  }

  const featured = movies[0];
  const heroLinkClass = "inline-block bg-amber-400 text-neutral-900 font-semibold px-5 py-2 rounded-md text-sm hover:bg-amber-300";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-10 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-amber-400">Meridian</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowMyList(!showMyList)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border ${
              showMyList
                ? "bg-amber-400 text-neutral-900 border-amber-400"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            My List ({myList.length})
          </button>

          {user ? (
            <>
              {profileName && (
                <button
                  onClick={() => router.push("/profiles")}
                  className="text-xs sm:text-sm text-neutral-400 hover:text-amber-400"
                >
                  {profileName}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border border-neutral-700 text-neutral-300"
              >
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm bg-amber-400 text-neutral-900 font-semibold"
            >
              Log in
            </button>
          )}
        </div>
      </div>

      {featured && !showMyList && !query && (
        <div
          className="mx-4 sm:mx-10 mb-8 sm:mb-10 rounded-xl p-6 sm:p-10 flex flex-col justify-end min-h-48 sm:min-h-64"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.3) 100%), linear-gradient(135deg, #4a2d6b, #180f24)",
          }}
        >
          <p className="text-xs tracking-widest text-amber-300 mb-2">FEATURED · {featured.country?.toUpperCase()}</p>
          <h2 className="text-2xl sm:text-4xl font-semibold mb-2">{featured.title}</h2>
          <p className="text-neutral-300 max-w-lg mb-4 text-sm">{featured.synopsis}</p>
          <div>
            <a href={`/movie/${featured.id}`} className={heroLinkClass}>View drama</a>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-10">
        {continueWatching.length > 0 && !showMyList && !query && (
          <div className="mb-8 sm:mb-10">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Continue Watching</h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
              {continueWatching.map((row: any) => (
                <MovieCard
                  key={row.drama_id}
                  movie={row.dramas}
                  inList={myList.includes(row.drama_id)}
                  onToggleList={() => toggleMyList(row.drama_id)}
                />
              ))}
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Search titles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 mb-5 sm:mb-6 w-full sm:w-64 text-sm focus:outline-none focus:border-amber-400"
        />

        <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
          <button
            onClick={() => setSelectedCountry(null)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border ${
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
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border ${
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
          <p className="text-neutral-500 pb-20">Nothing here yet.</p>
        ) : (
          <div className="pb-20">
            {genres.map((genre) => {
              const inGenre = filtered.filter((m) => m.genre === genre);
              if (inGenre.length === 0) return null;
              return (
                <div key={genre} className="mb-8 sm:mb-10">
                  <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">{genre}</h2>
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
                    {inGenre.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        inList={myList.includes(movie.id)}
                        onToggleList={() => toggleMyList(movie.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 sm:p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100 text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold text-amber-400 mb-1">Meridian</h2>
            <p className="text-neutral-400 text-sm mb-6">
              {authMode === "login" ? "Sign in to your account" : "Create your account"}
            </p>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
              />

              {authError && <p className="text-red-400 text-sm">{authError}</p>}

              <button
                type="submit"
                className="bg-amber-400 text-neutral-900 font-semibold py-3 rounded-md text-sm hover:bg-amber-300 mt-2"
              >
                {authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-neutral-400 text-sm mt-5">
              {authMode === "login" ? "New to Meridian? " : "Already have an account? "}
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                className="text-neutral-100 hover:underline"
              >
                {authMode === "login" ? "Sign up now" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}