"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Save, Trash2, Globe, Lock } from "lucide-react";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    title: "",
    caption: "",
    content: "",
    isPublished: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 1. ページを開いた時に、元の作品のデータを取ってくる
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated" && params?.id) {
      fetch(`/api/posts/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert("作品が見つかりません。");
            router.push("/mypage");
            return;
          }
          setForm({
            title: data.title || "",
            caption: data.caption || "",
            content: data.content || "",
            isPublished: data.isPublished,
          });
          setIsLoading(false);
        });
    }
  }, [status, params, router]);

  // 2. 「保存」ボタンを押した時の処理
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/posts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("作品を更新しました！");
      router.push("/mypage");
    } else {
      alert("更新に失敗しました。");
    }
  };

  // 3. 「削除」ボタンを押した時の処理
  const handleDelete = async () => {
    const confirmed = confirm(
      "本当にこの作品を削除しますか？\n（この操作は取り消せません）",
    );
    if (!confirmed) return;

    const res = await fetch(`/api/posts/${params.id}`, { method: "DELETE" });

    if (res.ok) {
      alert("作品を削除しました。");
      router.push("/mypage");
    } else {
      alert("削除に失敗しました。");
    }
  };

  if (isLoading)
    return <div className="mt-20 text-center text-gray-500">読み込み中...</div>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 border-b pb-4 text-2xl font-black">
        作品の編集・設定
      </h1>

      <form
        onSubmit={handleUpdate}
        className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8"
      >
        {/* 公開・非公開スイッチ */}
        <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
          <div>
            <p className="font-bold text-gray-800">公開設定</p>
            <p className="mt-1 text-xs text-gray-500">
              非公開にすると、マイページ以外のどこにも表示されなくなります（下書きとして使えます）。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              form.isPublished
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {form.isPublished ? (
              <>
                <Globe size={16} /> 公開中
              </>
            ) : (
              <>
                <Lock size={16} /> 非公開
              </>
            )}
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-500">
            タイトル
          </label>
          <input
            className="w-full rounded-xl border-2 p-3 text-lg font-bold focus:border-black focus:outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-500">
            キャプション（あらすじ）
          </label>
          <textarea
            className="h-24 w-full resize-none rounded-xl border-2 p-3 text-sm focus:border-black focus:outline-none"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-500">
            本文
          </label>
          <textarea
            className="h-96 w-full resize-none rounded-xl border-2 p-4 text-base leading-loose focus:border-black focus:outline-none"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t pt-4 md:flex-row">
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-red-500 transition hover:bg-red-50 md:w-auto"
          >
            <Trash2 size={18} /> 作品を削除する
          </button>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-10 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 md:w-auto"
          >
            <Save size={20} /> 更新を保存する
          </button>
        </div>
      </form>
    </main>
  );
}
