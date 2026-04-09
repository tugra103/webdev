"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/comporents/navbar";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/app/firebase";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const ADMIN_UIDS = ["yV1XalyS2qh1cWe1JfUxTmmjkT42"];

type UserData = { uid: string; displayName: string; email: string; friendcode: string };
type Game = { name: string; img: string; iframeurl: string; category: string };

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"users" | "games">("users");
  const [users, setUsers] = useState<UserData[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [newUser, setNewUser] = useState({ displayName: "", email: "", password: "", friendcode: "" });
  const [newGame, setNewGame] = useState({ name: "", img: "", iframeurl: "", category: "" });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });

  useEffect(() => {
    if (!loading && !user) router.push("/webdev/login/sign-in");
    if (!loading && user && !ADMIN_UIDS.includes(user.uid)) router.push("/webdev/main");
  }, [user, loading]);

  useEffect(() => {
    if (!user || !ADMIN_UIDS.includes(user.uid)) return;
    Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "games")),
    ]).then(([uSnap, gSnap]) => {
      setUsers(uSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserData)));
      setGames(gSnap.docs.map((d) => ({ name: d.id, ...d.data() } as Game)));
      setDataLoading(false);
    });
  }, [user]);

  const flash = (text: string, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3000);
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.displayName) {
      flash("Ad, email ve şifre zorunlu.", "error");
      return;
    }
    setSaving(true);
    try {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary_" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const { user: created } = await createUserWithEmailAndPassword(
        secondaryAuth, newUser.email, newUser.password
      );

      await updateProfile(created, { displayName: newUser.displayName });

      await setDoc(doc(db, "users", created.uid), {
        displayName: newUser.displayName,
        email: newUser.email,
        friendcode: newUser.friendcode || created.uid,
      });

      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      setUsers((prev) => [...prev, {
        uid: created.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        friendcode: newUser.friendcode || created.uid,
      }]);

      setNewUser({ displayName: "", email: "", password: "", friendcode: "" });
      flash("Kullanıcı oluşturuldu.");
    } catch (e: any) {
      flash(e.message ?? "Hata oluştu.", "error");
    }
    setSaving(false);
  };

  const deleteUser = async (uid: string) => {
    if (!confirm("Kullanıcıyı Firestore'dan sil? (Auth kaydı silinmez)")) return;
    await deleteDoc(doc(db, "users", uid));
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
    flash("Kullanıcı silindi.");
  };

  const saveGame = async () => {
    if (!newGame.name || !newGame.iframeurl) {
      flash("Oyun adı ve iframe URL zorunlu.", "error");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "games", newGame.name), {
        img: newGame.img,
        iframeurl: newGame.iframeurl,
        category: newGame.category || "Diğer",
      });
      setGames((prev) => {
        const exists = prev.find((g) => g.name === newGame.name);
        if (exists) return prev.map((g) => g.name === newGame.name ? { ...newGame } : g);
        return [...prev, { ...newGame }];
      });
      setNewGame({ name: "", img: "", iframeurl: "", category: "" });
      flash("Oyun kaydedildi.");
    } catch (e: any) {
      flash(e.message ?? "Hata oluştu.", "error");
    }
    setSaving(false);
  };

  const deleteGame = async (name: string) => {
    if (!confirm("Oyunu sil?")) return;
    await deleteDoc(doc(db, "games", name));
    setGames((prev) => prev.filter((g) => g.name !== name));
    flash("Oyun silindi.");
  };

  if (loading || dataLoading) return (
    <div className="flex h-screen items-center justify-center"><ProgressSpinner /></div>
  );

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-full";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Admin Paneli</h1>
            <p className="text-sm text-gray-400 mt-1">Kullanıcılar ve oyunları yönet</p>
          </div>
          {msg.text && (
            <span className={`text-sm px-4 py-2 rounded-xl border ${
              msg.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {msg.text}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["users", "games"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                tab === t
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "users" ? `Kullanıcılar (${users.length})` : `Oyunlar (${games.length})`}
            </button>
          ))}
        </div>

        {/* KULLANICILAR */}
        {tab === "users" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-4">Yeni kullanıcı oluştur</p>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Görünen Ad *" value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} />
                <input className={inputCls} placeholder="Email *" type="email" value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input className={inputCls} placeholder="Şifre *" type="password" value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <input className={inputCls} placeholder="Arkadaşlık Kodu (opsiyonel)" value={newUser.friendcode}
                  onChange={(e) => setNewUser({ ...newUser, friendcode: e.target.value })} />
              </div>
              <button onClick={createUser} disabled={saving}
                className="mt-3 bg-blue-500 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                {saving ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Ad</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">UID</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.displayName}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 truncate max-w-24">{u.uid}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteUser(u.uid)}
                          className="text-xs text-red-400 hover:underline">
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center text-gray-300 text-sm py-8">Kullanıcı yok</p>
              )}
            </div>
          </div>
        )}

        {/* OYUNLAR */}
        {tab === "games" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-4">Oyun ekle / güncelle</p>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Oyun Adı (ID) *" value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })} />
                <input className={inputCls} placeholder="Kategori" value={newGame.category}
                  onChange={(e) => setNewGame({ ...newGame, category: e.target.value })} />
                <input className={inputCls} placeholder="Görsel URL" value={newGame.img}
                  onChange={(e) => setNewGame({ ...newGame, img: e.target.value })} />
                <input className={inputCls} placeholder="Iframe URL *" value={newGame.iframeurl}
                  onChange={(e) => setNewGame({ ...newGame, iframeurl: e.target.value })} />
              </div>
              <button onClick={saveGame} disabled={saving}
                className="mt-3 bg-blue-500 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Ad</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Kategori</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Iframe URL</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{g.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{g.category}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-40">{g.iframeurl}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                        <button onClick={() => setNewGame(g)}
                          className="text-xs text-blue-500 hover:underline">
                          Düzenle
                        </button>
                        <button onClick={() => deleteGame(g.name)}
                          className="text-xs text-red-400 hover:underline">
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {games.length === 0 && (
                <p className="text-center text-gray-300 text-sm py-8">Oyun yok</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
