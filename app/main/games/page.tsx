"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/comporents/navbar";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

// games array'ini ve useState'i şununla değiştir:


import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";



export default function Page() {
  const [games, setGames] = useState<{name: string; imgurl: string; url: string; category: string}[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  // useEffect:
useEffect(() => {
  if (!user) return;
  getDocs(collection(db, "games")).then((snap) => {
    const list = snap.docs.map((doc) => ({
      name: doc.id,
      imgurl: doc.data().img ?? "",
      url: doc.data().iframeurl ?? "",
      category: doc.data().category ?? "Diğer",
    }));
    setGames(list);
  });
}, [user]);
  useEffect(() => {
    if (!loading && !user) router.push("/webdev/login/sign-in");
  }, [user, loading]);

  if (loading || !user) return (
    <div className="flex h-screen items-center justify-center">
      <ProgressSpinner />
    </div>
  );

  const categories = ["Tümü", ...Array.from(new Set(games.map((g) => g.category)))];

  const filtered = games.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Tümü" || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Oyunlar</h1>
          <p className="text-sm text-gray-400 mt-1">{games.length} oyun mevcut</p>
        </div>

        {/* Arama */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Oyun ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Kategori filtreleri */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeCategory === cat
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Oyun grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <svg className="mx-auto mb-3" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="text-sm">Sonuç bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((game) => (
              <a
                key={game.name}
                href={`/webdev/main/games/game?name=${game.name}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={game.imgurl}
                    alt={game.name}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-0.5 rounded-full">
                    {game.category}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{game.name}</span>
                  <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}