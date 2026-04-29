"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

type Game = {
  name: string;
  img: string;
  iframeurl: string;
  category: string;
};


function GamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "";

  const [game, setGame] = useState<Game | null>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            setFullscreen(false); // ESC ile çıkınca state'i sıfırla
        }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  useEffect(() => {
    if (!loading && !user) router.push("/login/sign-in");
  }, [user, loading]);

  useEffect(() => {
    if (!name) return;
    getDoc(doc(db, "games", name)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGame({
          name: snap.id,
          img: data.img ?? "",
          iframeurl: data.iframeurl ?? "",
          category: data.category ?? "Diğer",
        });
      } else {
        setNotFound(true);
      }
      setGameLoading(false);
    });
  }, [name]);

  if (loading || gameLoading) return (
    <div className="flex h-screen items-center justify-center">
      <ProgressSpinner />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <p className="text-xl font-semibold text-gray-400">Oyun bulunamadı</p>
        <button
          onClick={() => router.push("/main/games")}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Oyunlara dön
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!fullscreen && <Navbar />}

      <div className={fullscreen ? "fixed inset-0 z-50 bg-black" : "max-w-5xl mx-auto px-4 py-6"}>

        {/* Üst bar */}
        {!fullscreen && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/main/games")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold">{game?.name}</h1>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {game?.category}
                </span>
              </div>
            </div>

            <button
              onClick={() => {setFullscreen(true)
                 document.documentElement.requestFullscreen();
              }}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              Tam ekran
            </button>
          </div>
        )}

        {/* Oyun iframe */}
        <div className={`relative bg-black overflow-hidden ${fullscreen ? "w-full h-screen" : "rounded-2xl shadow-md"}`}
          style={fullscreen ? {} : { aspectRatio: "16/9" }}
        >
          {fullscreen && (
            <button
              onClick={() => {setFullscreen(false)
                document.exitFullscreen();
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-60 rounded-lg text-white hover:bg-opacity-80 transition"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
          )}

          {game?.iframeurl ? (
            <iframe
              src={game.iframeurl}
              className="w-full h-full border-0"
              allow="fullscreen; autoplay"
              title={game.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              URL bulunamadı
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><ProgressSpinner /></div>}>
      <GamePage />
    </Suspense>
  );
}