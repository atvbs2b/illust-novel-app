"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Book,
  Gamepad2,
  Hash,
  PenTool,
  User as UserIcon,
  X,
  Search,
  LayoutGrid,
  Flame,
  Clock,
  Heart,
} from "lucide-react";

type PostWithAuthorAndTags = {
  id: string;
  title: string;
  caption?: string;
  type: string;
  createdAt: string;
  coverImageURL?: string;
  author: { id: string; name: string | null; email: string | null };
  tags: { tag: { id: string; name: string } }[];
  _count?: { likes: number };
};

export default function Home() {
  const [posts, setPosts] = useState<PostWithAuthorAndTags[]>([]);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<"latest" | "popular">("latest");

  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data);
      });
  }, []);

  useEffect(() => {
    let url = `/api/posts?type=${typeFilter}&sort=${sortOrder}`;
    if (selectedTag) {
      url += `&tag=${encodeURIComponent(selectedTag)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setPosts([]);
      });
  }, [typeFilter, selectedTag, sortOrder]);

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-24 pb-8 shadow-sm md:pt-32 md:pb-12">
        {/* 背景の装飾 */}
        <div className="absolute top-0 left-0 z-0 h-full w-full overflow-hidden opacity-40">
          <div className="animate-blob absolute -top-20 -left-20 h-64 w-64 rounded-full bg-pink-200 opacity-50 mix-blend-multiply blur-3xl filter"></div>
          <div className="animate-blob animation-delay-2000 absolute top-20 -right-20 h-72 w-72 rounded-full bg-purple-200 opacity-50 mix-blend-multiply blur-3xl filter"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          {/* 予測変換つき検索バー */}
          <div className="relative z-30 mx-auto mb-6 flex w-full max-w-xl justify-center md:mb-8">
            <div className="relative w-full">
              <Search
                className="absolute top-1/2 left-5 -translate-y-1/2 text-pink-400"
                size={18}
              />
              <input
                type="text"
                placeholder="好きなタグで探す..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full rounded-2xl border border-gray-200/80 bg-white/80 py-4 pr-5 pl-12 text-sm font-bold text-gray-700 placeholder-gray-400 shadow-sm backdrop-blur-sm transition-all focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100 focus:outline-none md:text-base"
              />

              {showSuggestions && searchInput && filteredTags.length > 0 && (
                <div className="animate-fade-in absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                  <div className="max-h-60 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setSearchInput("");
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center gap-2 border-b border-gray-50 px-5 py-3 text-left text-xs font-bold text-gray-600 transition-colors last:border-0 hover:bg-pink-50 hover:text-pink-600 md:text-sm"
                      >
                        <Hash size={14} /> {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 絞り込みボタン（作品の種類） */}
          <div className="mx-auto flex w-full max-w-2xl justify-between gap-1 md:justify-center md:gap-3">
            {[
              {
                id: "ALL",
                label: "すべて",
                icon: <LayoutGrid size={18} className="md:h-5 md:w-5" />,
              },
              {
                id: "NOVEL",
                label: "NOVEL",
                icon: <Book size={18} className="md:h-5 md:w-5" />,
              },
              {
                id: "DREAM",
                label: "DREAM",
                icon: <UserIcon size={18} className="md:h-5 md:w-5" />,
              },
              {
                id: "GAMEBOOK",
                label: "GAMEBOOK",
                icon: <Gamepad2 size={18} className="md:h-5 md:w-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTypeFilter(tab.id);
                  setSelectedTag(null);
                  setSearchInput("");
                }}
                className={`flex w-[24%] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-bold shadow-sm transition-all md:w-auto md:flex-row md:gap-2 md:rounded-full md:px-6 md:py-3 md:text-sm ${
                  typeFilter === tab.id
                    ? "scale-105 transform bg-gray-800 text-white shadow-md"
                    : "bg-white/90 text-gray-600 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                }`}
              >
                {tab.icon}
                <span className="mt-1 leading-none tracking-wide md:mt-0">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ（作品一覧） */}
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:p-8">
        {/* コントロールバー（並び替え ＆ タグ解除） */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* タグ表示 */}
          <div className="flex min-h-[40px] w-full flex-1 items-center justify-start">
            {selectedTag && (
              <div className="animate-fade-in flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs font-bold text-pink-600 shadow-sm md:text-sm">
                <Hash size={14} />
                <span className="max-w-[200px] truncate break-all md:max-w-xs">
                  {selectedTag}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-1 rounded-full bg-pink-200 p-1 text-pink-700 transition hover:bg-pink-300"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* 並び順切り替えスイッチ */}
          <div className="flex shrink-0 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
            <button
              onClick={() => setSortOrder("latest")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                sortOrder === "latest"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Clock size={14} /> 新着順
            </button>
            <button
              onClick={() => setSortOrder("popular")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                sortOrder === "popular"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-pink-500"
              }`}
            >
              <Flame size={14} /> 人気順
            </button>
          </div>
        </div>

        {/* 作品一覧 */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white py-24 text-center text-sm font-bold text-gray-400 shadow-sm md:text-base">
            作品が見つかりませんでした。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link
                  href={`/posts/${post.id}`}
                  className="relative block h-40 w-full overflow-hidden bg-gray-100 md:h-48"
                >
                  {post.coverImageURL ? (
                    <img
                      src={post.coverImageURL}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xl font-black tracking-widest text-gray-300 md:text-2xl">
                      NO IMAGE
                    </div>
                  )}
                  {/* ラベル */}
                  <div className="absolute top-3 left-3 z-10 flex gap-1 md:gap-2">
                    {post.type === "GAMEBOOK" && (
                      <span className="flex items-center gap-1 rounded-full bg-purple-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm md:text-xs">
                        <Gamepad2 size={12} /> GAMEBOOK
                      </span>
                    )}
                    {post.type === "DREAM" && (
                      <span className="flex items-center gap-1 rounded-full bg-pink-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm md:text-xs">
                        <UserIcon size={12} /> DREAM
                      </span>
                    )}
                    {post.type === "NOVEL" && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm md:text-xs">
                        <Book size={12} /> NOVEL
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <Link
                    href={`/posts/${post.id}`}
                    className="mb-3 block flex-1"
                  >
                    <h2 className="mb-2 line-clamp-2 text-base leading-tight font-bold text-gray-800 transition group-hover:text-pink-500 md:text-lg">
                      {post.title}
                    </h2>
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {post.caption ? post.caption : "キャプションがありません"}
                    </p>
                  </Link>

                  <div className="mt-auto flex flex-col gap-3 border-t border-gray-50 pt-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((t) => (
                        <button
                          key={t.tag.id}
                          onClick={() => setSelectedTag(t.tag.name)}
                          className="flex items-center gap-0.5 rounded bg-gray-100/80 px-2 py-1 text-[10px] font-bold text-gray-500 transition hover:bg-pink-100 hover:text-pink-600"
                        >
                          <Hash size={10} /> {t.tag.name}
                        </button>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-1 py-1 text-[10px] font-bold text-gray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 md:text-xs">
                      <Link
                        href={`/users/${post.author.id}`}
                        className="group/author flex items-center gap-1.5 transition hover:text-pink-500"
                      >
                        <div className="rounded-full bg-gray-100 p-1 transition group-hover/author:bg-pink-100">
                          <PenTool
                            size={10}
                            className="text-gray-500 group-hover/author:text-pink-500"
                          />
                        </div>
                        <span className="max-w-[100px] truncate">
                          {post.author.name ||
                            post.author.email?.split("@")[0] ||
                            "名無し"}
                        </span>
                      </Link>

                      {/* いいね数を表示 */}
                      <div className="flex items-center gap-3">
                        {post._count !== undefined && (
                          <span className="flex items-center gap-1 text-pink-400">
                            <Heart
                              size={12}
                              className={
                                post._count.likes > 0 ? "fill-pink-400" : ""
                              }
                            />
                            {post._count.likes}
                          </span>
                        )}
                        <span className="font-medium">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
