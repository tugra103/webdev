"use client";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, app } from "@/app/firebase";

type Step = "loading" | "login" | "register";

export default function CompleteProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [existingDocId, setExistingDocId] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user.id) return;

    async function check() {
      // Mastodon ID ile kayıt var mı?
      const q = query(
        collection(db, "users"),
        where("mastodonId", "==", session!.user.id)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        // Zaten bağlı, verify-password'e at
        router.replace("/auth/verify-password");
        return;
      }

      // Firebase'de email ile kayıt var mı?
      // Mastodon username'ini email olarak deneyelim — bilmiyoruz
      // Firestore'da hiç mastodonId'si olmayan ama email eşleşen kayıt arayacağız
      // Bunun için email bilmemiz lazım, önce register adımına al
      setStep("register");
    }

    check();
  }, [session]);

  async function handleEmailCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setExistingDocId(snap.docs[0].id);
        setExistingEmail(email);
        setStep("login");
      }
      // email yoksa zaten register formunda kalıyor
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, existingEmail, password);
      await updateDoc(doc(db, "users", existingDocId), {
        mastodonId: session?.user.id,
      });
      router.replace("/main");
    } catch {
      setError("Şifre yanlış.");
    } finally {
      setLoading(false);
    }
  }

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

  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50/30 p-4">
      <Card
        className="w-full max-w-md"
        title={step === "login" ? "Hesabını Bağla" : "Hesap Oluştur"}
      >
        <p className="text-sm text-gray-500 mb-4">
          @{session?.user.name} olarak devam ediyorsun
        </p>

        {/* Email + şifre — hesap var mı kontrol */}
        {step === "register" && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            // Önce email var mı bak
            await handleEmailCheck(e);
            // Email yoksa direkt register
            const q = query(collection(db, "users"), where("email", "==", email));
            const snap = await getDocs(q);
            if (snap.empty) await handleRegister(e);
          }} className="space-y-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <InputText
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Şifre (min. 8 karakter)"
                className="w-full p-2 rounded border border-gray-300"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Lütfen bekle..." : "Devam Et"}
            </Button>
          </form>
        )}

        {/* Hesap bulundu, sadece şifre */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-sm text-gray-400">{existingEmail}</p>
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
          </form>
        )}

      </Card>
    </div>
  );
}