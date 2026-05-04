"use client";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, app } from "@/app/firebase";

type Step = "email" | "login" | "register";

export default function CompleteProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [friendcode, setFriendcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Adım 1: Email kontrol
  async function checkEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      setStep(methods.length > 0 ? "login" : "register");
    } catch {
      setError("Geçersiz email.");
    } finally {
      setLoading(false);
    }
  }

  // Adım 2a: Mevcut hesap — şifre al, mastodonId bağla
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);

      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "users", snap.docs[0].id), {
          mastodonId: session?.user.id,
        });
      }

      router.replace("/main");
    } catch {
      setError("Şifre yanlış.");
    } finally {
      setLoading(false);
    }
  }

  // Adım 2b: Yeni hesap — şifre + friendcode al
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(user, {
        displayName: session?.user.name,
        photoURL: session?.user.image ?? undefined,
      });

      await setDoc(doc(db, "users", user.uid), {
        displayName: session?.user.name,
        email,
        friendcode: friendcode || user.uid,
        mastodonId: session?.user.id,
        image: session?.user.image,
        createdAt: new Date().toISOString(),
      });

      router.replace("/main");
    } catch (e: any) {
      setError(e.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, string> = {
    email: "Hesabını Tamamla",
    login: "Hesabını Bağla",
    register: "Hesap Oluştur",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50/30 p-4">
      <Card className="w-full max-w-md" title={titles[step]}>

        <p className="text-sm text-gray-500 mb-4">
          {step === "email" && `@${session?.user.name} olarak devam ediyorsun`}
          {step === "login" && `${email} zaten kayıtlı. Mastodon hesabını bağlamak için şifreni gir.`}
          {step === "register" && `${email} için yeni hesap oluşturuyorsun.`}
        </p>

        {/* Adım 1: Email */}
        {step === "email" && (
          <form onSubmit={checkEmail} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <InputText
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email adresin"
                className="w-full p-2 rounded border border-gray-300"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kontrol ediliyor..." : "Devam Et"}
            </Button>
          </form>
        )}

        {/* Adım 2a: Mevcut hesap */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <InputText
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Şifreni gir"
                className="w-full p-2 rounded border border-gray-300"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Bağlanıyor..." : "Hesabı Bağla"}
            </Button>
            <button
              type="button"
              className="text-sm text-gray-400 w-full text-center"
              onClick={() => { setStep("email"); setPassword(""); setError(""); }}
            >
              Farklı email kullan
            </button>
          </form>
        )}

        {/* Adım 2b: Yeni hesap */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <InputText
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Şifre oluştur (min. 8 karakter)"
                className="w-full p-2 rounded border border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Friendcode <span className="text-gray-400">(opsiyonel)</span>
              </label>
              <InputText
                value={friendcode}
                onChange={(e) => setFriendcode(e.target.value)}
                placeholder="Friendcode"
                className="w-full p-2 rounded border border-gray-300"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
            <button
              type="button"
              className="text-sm text-gray-400 w-full text-center"
              onClick={() => { setStep("email"); setPassword(""); setError(""); }}
            >
              Farklı email kullan
            </button>
          </form>
        )}

      </Card>
    </div>
  );
}