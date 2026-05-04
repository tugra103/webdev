// app/complete-profile/page.tsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase"; // senin mevcut firebase config'in

export default function CompleteProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    friendcode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = getAuth(app);
      
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await updateProfile(user, {
        displayName: session?.user.name,
        photoURL: session?.user.image,
      });

      await setDoc(doc(db, "users", user.uid), {
        displayName: session?.user.name,
        email: form.email,
        friendcode: form.friendcode || user.uid,
        mastodonId: session?.user.id,
        image: session?.user.image,
        createdAt: new Date().toISOString(),
      });

      router.replace("/dashboard");
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") {
        setError("Bu email zaten kullanımda.");
      } else {
        setError(e.message ?? "Bir hata oluştu.");
      }
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Hesabını tamamla</h1>
      <p>@{session?.user.name} olarak devam ediyorsun</p>

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
        required
      />
      <input
        type="password"
        placeholder="Şifre"
        value={form.password}
        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
        required
        minLength={8}
      />
      <input
        placeholder="Friendcode (opsiyonel)"
        value={form.friendcode}
        onChange={(e) => setForm(prev => ({ ...prev, friendcode: e.target.value }))}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
      </button>
    </form>
  );
}