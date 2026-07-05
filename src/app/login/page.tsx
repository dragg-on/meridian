"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [myList, setMyList] = useState<number[]>([]);
  const [showMyList, setShowMyList] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [showAuthBox, setShowAuthBox] = useState(false);
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
      if (data.user) fetchMyList(data.user.id);
    }
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMyList(session.user.id);
      } else {
        setMyList([]);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchMyList(userId: string) {
    const { data, error } = await supabase
      .from("my_list")
      .select("drama_id")
      .eq("user_id", userId);
    if (!error && data) {
      setMyList(data.map((row) => row.drama_id));
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
        setShowAuthBox(false);
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setShowAuthBox(false);
        setEmail("");
        setPassword("");
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMyList([]);
  }

  const countries = [...new Set(movies.map((m) => m.country))];
  const genres = [...new Set(movies.map((m) => m.genre))];

  async function toggleMyList(id: number) {
    if (!user) {
      setShowAuthBox(true);
      return;
    }
    if (myList.includes(id)) {
      await supabase.from("my_list").delete().eq("user_id", user.id).eq("drama_id", id);
      setMyList((prev) => prev.filter((x) => x !== id));
    } else {
      await supabase.from("my_list").insert({ user_id: user.id, drama_id: id });
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
    return <main className="min-h-screen bg-neutral-950 text-neutral-100 p-10">Loading...</main>;
  }

  const featured = movies[0];
  const heroLinkClass = "inline-block bg-amber-400 text-neutral-900 font-semibold px-5 py-2 rounded-md text-sm hover:bg-amber-300";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex justify-between items-center px-10 py-6 relative">
        <h1 className="text-3xl font-semibold text-amber-400">Meridian</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMyList(!showMyList)}
            className={`px-4 py-2 rounded-full text-sm border ${
              showMyList
                ? "bg-amber-400 text-neutral-900 border-amber-400"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            My List ({myList.length})
          </button>

          {user ? (
            <>
              <span className="text-sm text-neutral-400 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm border border-neutral-700 text-neutral-300"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowAuthBox(!showAuthBox)}
                className="px-4 py-2 rounded-full text-sm bg-amber-400 text-neutral-900 font-semibold"
              >
                Log in
              </button>

              {showAuthBox && (
                <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-lg p-4 shadow-lg z-50">
                  <div className="flex mb-4 border border-neutral-700 rounded-full overflow-hidden">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-1.5 text-sm ${authMode === "login" ? "bg-amber-400 text-neutral-900" : "text-neutral-300"}`}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 py-1.5 text-sm ${authMode === "signup" ? "bg-amber-400 text-neutral-900" : "text-neutral-300"}`}
                    >
                      Sign up
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="flex flex-col gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />

                    {authError && <p className="text-red-400 text-xs">{authError}</p>}

                    <button
                      type="submit"
                      className="bg-amber-400 text-neutral-900 font-semibold py-2 rounded-md text-sm hover:bg-amber-300 mt-1"
                    >
                      {authMode === "login" ? "Log in" : "Create account"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {featured && !showMyList && !query && (
        <div
          className="mx-10 mb-10 rounded-xl p-10 flex flex-col justify-end min-h-64"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.3) 100%), linear-gradient(135deg, #4a2d6b, #180f24)",
          }}
        >
          <p className="text-xs tracking-widest text-amber-300 mb-2">FEATURED · {featured.country?.toUpperCase()}</p>
          <h2 className="text-4xl font-semibold mb-2">{featured.title}</h2>
          <p className="text-neutral-300 max-w-lg mb-4 text-sm">{featured.synopsis}</p>
          <div>
            <a href={`/movie/${featured.id}`} className={heroLinkClass}>View drama</a>
          </div>
        </div>
      )}

      <div className="px-10">
        <input
          type="text"
          placeholder="Search titles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 mb-6 w-64 text-sm focus:outline-none focus:border-amber-400"
        />

        <div className="flex gap-3 mb-10 flex-wrap">
          <button
            onClick={() => setSelectedCountry(null)}
            className={`px-4 py-2 rounded-full text-sm border ${
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
              className={`px-4 py-2 rounded-full text-sm border ${
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
                <div key={genre} className="mb-10">
                  <h2 className="text-lg font-medium mb-4">{genre}</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
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
    </main>
  );
}