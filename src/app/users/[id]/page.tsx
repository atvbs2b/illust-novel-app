"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Book, User, Gamepad2, Hash, PenTool } from "lucide-react";

type AuthorInfo = {
  id: string;
  name: string | null;
  email: string | null;
  posts: {
    id: string;
    title: string;
    caption: string | null;
    type: string;
    content: string;
    coverImageURL: string | null;
    createdAt: string;
    tags: {
      tag: {
        id: string;
        name: string;
      };
    }[];
  }[];
};

export default function UserProfilePage() {
  const params = useParams();
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo | null>(null);
  useEffect(() => {
    // id が undefinedの時は通信をストップする
    if (!params || !params.id) return;

    fetch(`/api/users/${params.id}`)
      .then((res) => res.json())
      .then((data) => setAuthorInfo(data));
  }, [params]);

  if (!authorInfo) {
    return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  }

  // 表示する名前（設定されていなければメアドの一部）
  const displayName =
    authorInfo.name || authorInfo.email?.split("@")[0] || "名無し作者";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center gap-3 text-3xl font-black text-gray-800">
          <PenTool size={32} className="text-pink-400" />
          <h1>{displayName} さんの作品一覧</h1>
        </div>
        <p className="mt-2 font-bold text-gray-500">
          全 {authorInfo.posts.length} 作品
        </p>
      </div>

      {authorInfo.posts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white py-20 text-center font-bold text-gray-400">
          まだ作品が投稿されていません。
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {authorInfo.posts.map((post) => (
            <div
              key={post.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-xl"
            >
              {/* 画像リンク部分 */}
              <Link href={`/posts/${post.id}`} className="relative block">
                {post.coverImageURL ? (
                  <div className="relative h-48 overflow-hidden border-b bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageURL}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
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
                  </div>
                )}
              </Link>

              {/* タイトルと本文 */}
              <div className="flex flex-1 flex-col p-5">
                <Link href={`/posts/${post.id}`} className="mb-4 block flex-1">
                  <h2 className="mb-2 text-lg leading-tight font-bold transition group-hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 text-xs leading-relaxed text-gray-500 opacity-80">
                    {post.caption ? post.caption : "キャプションがありません"}
                  </p>
                </Link>

                {/* フッター（日付とタグ） */}
                <div className="mt-auto flex items-end justify-between border-t pt-3 text-[10px] text-gray-400">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
      )}
    </main>
  );
}
