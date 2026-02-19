"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, User, Gamepad2, Hash, PenTool } from "lucide-react"; // ★ PenToolを追加
import { Post } from "@prisma/client";

// ★ 型定義に author を追加
type PostWithTags = Post & {
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  author?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export default function Home() {
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    // 記事一覧を取得
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  // フィルタリング処理（ALLなら全部、それ以外ならタイプで絞り込み）
  const filteredPosts =
    filter === "ALL" ? posts : posts.filter((p) => p.type === filter);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="mb-4 text-3xl font-black tracking-tighter">
            NOVEL & GAMEBOOK
          </h1>
          {/* タブメニュー */}
          <div className="flex gap-6">
            {[
              { id: "ALL", label: "ALL" },
              { id: "NOVEL", label: "NOVEL" },
              { id: "DREAM", label: "DREAM" },
              { id: "GAMEBOOK", label: "GAMEBOOK" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`text-sm font-bold transition-colors ${filter === t.id ? "border-b-2 border-black pb-1 text-black" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/create"
          className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
        >
          ＋ 新規作成
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          // ★ 大元のLinkをdivに変更し、デザイン（groupなど）はそのまま維持
          <div
            key={post.id}
            className="group flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-xl"
          >
            {/* ★ 画像部分を独立したリンクに */}
            <Link href={`/posts/${post.id}`} className="relative block">
              {/* 表紙画像があれば表示 */}
              {post.coverImageURL ? (
                <div className="relative h-48 overflow-hidden border-b bg-gray-100">
                  <img
                    src={post.coverImageURL}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  {/* タイプバッジ */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {post.type === "NOVEL" && (
                      <span className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-black shadow">
                        <Book size={10} /> 小説
                      </span>
                    )}
                    {post.type === "DREAM" && (
                      <span className="flex items-center gap-1 rounded bg-pink-100/90 px-2 py-1 text-[10px] font-bold text-pink-700 shadow">
                        <User size={10} /> 夢
                      </span>
                    )}
                    {post.type === "GAMEBOOK" && (
                      <span className="flex items-center gap-1 rounded bg-purple-100/90 px-2 py-1 text-[10px] font-bold text-purple-700 shadow">
                        <Gamepad2 size={10} /> GB
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                // 画像がない場合のデフォルトヘッダー
                <div className="relative flex h-24 items-center justify-center border-b bg-gray-50">
                  {post.type === "NOVEL" && (
                    <Book className="text-gray-200" size={32} />
                  )}
                  {post.type === "DREAM" && (
                    <User className="text-pink-200" size={32} />
                  )}
                  {post.type === "GAMEBOOK" && (
                    <Gamepad2 className="text-purple-200" size={32} />
                  )}
                  <div className="absolute top-2 left-2">
                    {post.type === "NOVEL" && (
                      <span className="flex items-center gap-1 rounded border bg-white px-2 py-1 text-[10px] font-bold text-black shadow-sm">
                        <Book size={10} /> 小説
                      </span>
                    )}
                    {post.type === "DREAM" && (
                      <span className="flex items-center gap-1 rounded border border-pink-100 bg-pink-50 px-2 py-1 text-[10px] font-bold text-pink-700 shadow-sm">
                        <User size={10} /> 夢
                      </span>
                    )}
                    {post.type === "GAMEBOOK" && (
                      <span className="flex items-center gap-1 rounded border border-purple-100 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 shadow-sm">
                        <Gamepad2 size={10} /> GB
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
              {/* ★ タイトルと本文を独立したリンクに */}
              <Link href={`/posts/${post.id}`} className="mb-4 block flex-1">
                <h2 className="mb-2 text-lg leading-tight font-bold transition group-hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="line-clamp-3 text-xs leading-relaxed text-gray-500 opacity-80">
                  {post.type === "GAMEBOOK"
                    ? "（ゲームブック作品）"
                    : post.content}
                </p>
              </Link>

              {/* ★ フッター（日付・作者・タグ）はリンクの外へ */}
              <div className="mt-auto flex items-end justify-between border-t pt-3 text-[10px] text-gray-400">
                <div className="flex flex-col gap-1.5">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {/* ★ 作者名＆リンクを追加 */}
                  {post.author ? (
                    <Link
                      href={`/users/${post.author.id}`} // ★ 作者のプロフィールページへのリンク
                      className="flex w-fit items-center gap-1 font-bold transition hover:text-blue-500 hover:underline"
                    >
                      <PenTool size={10} />
                      {post.author.name ||
                        post.author.email?.split("@")[0] ||
                        "名無し作者"}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1">
                      <PenTool size={10} /> 作者不明
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap justify-end gap-1">
                  {post.tags?.map((t) => (
                    <span
                      key={t.tag.id}
                      className="flex items-center gap-0.5 rounded bg-gray-100 px-2 py-1 text-gray-600"
                    >
                      <Hash size={8} />
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
