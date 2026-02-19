"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Edit,
  Globe,
  Lock,
  PenTool,
  BookOpen,
} from "lucide-react";
import { Post } from "@prisma/client";

type PostWithTags = any;

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 箱を2つに分けます
  const [myPosts, setMyPosts] = useState<PostWithTags[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ★ 追加：今どちらのタブを開いているかを記憶する箱
  const [activeTab, setActiveTab] = useState<"posts" | "bookmarks">("posts");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/mypage")
        .then((res) => res.json())
        .then((data) => {
          setMyPosts(data.myPosts || []);
          setBookmarkedPosts(data.bookmarkedPosts || []);
          setIsLoading(false);
        });
    }
  }, [status, router]);

  if (isLoading)
    return (
      <div className="mt-20 p-8 text-center text-gray-500">読み込み中...</div>
    );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-end justify-between border-b pb-6">
        <div className="flex items-center gap-3 text-3xl font-black text-gray-800">
          <PenTool size={32} className="text-pink-400" />
          <h1>マイページ</h1>
        </div>
        <Link
          href="/create"
          className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:scale-105"
        >
          ＋ 新規作成
        </Link>
      </div>

      {/* ★ タブ切り替えボタン */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition ${
            activeTab === "posts"
              ? "bg-black text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <PenTool size={18} /> 自分の作品 ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition ${
            activeTab === "bookmarks"
              ? "bg-black text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Bookmark size={18} /> ブックマーク ({bookmarkedPosts.length})
        </button>
      </div>

      {/* ■ 自分の作品タブの中身 ■ */}
      {activeTab === "posts" &&
        (myPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white py-20 text-center font-bold text-gray-400">
            まだ投稿した作品がありません。
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col gap-4">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col items-center gap-6 rounded-xl border bg-white p-5 transition hover:shadow-md md:flex-row"
              >
                <div className="w-full flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {post.isPublished ? (
                      <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                        <Globe size={12} /> 公開中
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-[10px] font-bold text-gray-700">
                        <Lock size={12} /> 非公開
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    href={`/posts/${post.id}`}
                    className="block hover:underline"
                  >
                    <h2 className="mb-1 text-xl font-bold text-gray-800">
                      {post.title}
                    </h2>
                  </Link>
                  <div className="mt-3 flex gap-4 text-sm font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart size={16} className="text-pink-400" />{" "}
                      {post._count?.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} className="text-blue-400" />{" "}
                      {post._count?.comments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark size={16} className="text-green-400" />{" "}
                      {post._count?.bookmarks || 0}
                    </span>
                  </div>
                </div>

                <div className="flex w-full gap-2 md:w-auto">
                  <Link
                    href={`/edit/${post.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-200 md:flex-none"
                  >
                    <Edit size={16} /> 編集・設定
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* ■ ブックマークタブの中身 ■ */}
      {activeTab === "bookmarks" &&
        (bookmarkedPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white py-20 text-center font-bold text-gray-400">
            まだブックマークした作品がありません。
          </div>
        ) : (
          <div className="animate-fade-in grid grid-cols-1 gap-4 md:grid-cols-2">
            {bookmarkedPosts.map((post) => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className="group block rounded-xl border bg-white p-5 transition hover:shadow-md"
              >
                <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 transition group-hover:text-blue-600">
                  {post.title}
                </h2>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <PenTool size={14} />{" "}
                    {post.author?.name ||
                      post.author?.email?.split("@")[0] ||
                      "名無し"}
                  </span>
                  <div className="flex gap-3 font-bold">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-pink-400" />{" "}
                      {post._count?.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark size={14} className="text-green-400" />{" "}
                      {post._count?.bookmarks || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
    </main>
  );
}
