"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ログインしていない場合はログイン画面へ
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
    // 現在の名前をフォームにセット
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [status, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setIsSaving(false);

    if (res.ok) {
      alert("プロフィールを更新しました！");
      // セッション（画面右上の表示など）を最新化する
      await update({ name: name });
      router.push("/");
    } else {
      alert("エラーが発生しました。");
    }
  };

  if (status === "loading")
    return <div className="mt-20 text-center">読み込み中...</div>;

  return (
    <main className="mx-auto mt-20 max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        プロフィール設定
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-500">
            ペンネーム（表示名）
          </label>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-gray-200 p-3 transition focus:border-pink-300 focus:outline-none"
            placeholder="例: 名無し作者"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-400">
            ※設定しない場合は、メールアドレスの一部が表示されます。
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-black py-3 font-bold text-white transition hover:scale-105 disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "保存する"}
        </button>
      </form>
    </main>
  );
}
