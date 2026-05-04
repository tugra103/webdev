"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, app } from "@/lib/firebase";

export default function VerifyPassword() {
  const { data: session } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Mastodon ID'ye göre email'i bul
      const q = query(
        collection(db, "users"),
        where("mastodonId", "==", session?.user.id)
      );
      const snap = await getDocs(q);
      const email = snap.docs[0].data().email;

      // Firebase ile giriş yap
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);

      router.replace("/dashboard");
    } catch (e: any) {
      setError("Şifre yanlış.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Şifreni gir</h1>
      <p>@{session?.user.name} olarak devam ediyorsun</p>

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Kontrol ediliyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
