"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("登録完了！ログインしてください");
      router.push("/api/auth/signin");
    } else {
      alert("登録に失敗しました");
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-bold">新規アカウント登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold">メールアドレス</label>
          <input
            type="email"
            className="w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold">パスワード</label>
          <input
            type="password"
            className="w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full rounded-lg bg-black py-3 font-bold text-white">
          登録する
        </button>
      </form>
    </main>
  );
}
