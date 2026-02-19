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
};

export default function Home() {
  const [posts, setPosts] = useState<PostWithAuthorAndTags[]>([]);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // ★ 予測変換（サジェスト）用の新しい箱
  const [allTags, setAllTags] = useState<string[]>([]); // すべてのタグのリスト
  const [searchInput, setSearchInput] = useState(""); // 検索バーに打ち込んだ文字
  const [showSuggestions, setShowSuggestions] = useState(false); // 予測リストを表示するかどうか

  // ① ページを開いたときに、すべてのタグのリストを取得しておく
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data);
      });
  }, []);

  // ② 作品一覧を取得する処理（ここは前回と同じです）
  useEffect(() => {
    let url = `/api/posts?type=${typeFilter}`;
    if (selectedTag) {
      url += `&tag=${encodeURIComponent(selectedTag)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setPosts([]);
      });
  }, [typeFilter, selectedTag]);

  // ★ 打ち込んだ文字が含まれるタグだけを絞り込む計算
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-5xl p-8 pt-24">
      {/* 絞り込みボタン（作品の種類） */}
      <div className="mb-8 flex justify-center gap-4">
        {[
          { id: "ALL", label: "すべて", icon: null },
          { id: "NOVEL", label: "NOVEL", icon: <Book size={16} /> },
          { id: "DREAM", label: "DREAM", icon: <UserIcon size={16} /> },
          { id: "GAMEBOOK", label: "GAMEBOOK", icon: <Gamepad2 size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTypeFilter(tab.id);
              setSelectedTag(null);
              setSearchInput(""); // タブを変えたら検索文字もリセット
            }}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-all hover:scale-105 ${
              typeFilter === tab.id
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ★ ここに追加：予測変換つき検索バー！ */}
      <div className="relative z-20 mx-auto mb-10 flex max-w-md justify-center">
        <div className="relative w-full">
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="タグで検索..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            // 枠外をクリックしたときに少し遅らせてリストを消す（クリック判定を残すため）
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full rounded-full border-2 border-transparent bg-gray-100 py-3 pr-4 pl-12 font-bold text-gray-700 shadow-sm transition-all focus:border-pink-300 focus:bg-white focus:outline-none"
          />

          {/* 予測変換リストの表示 */}
          {showSuggestions && searchInput && filteredTags.length > 0 && (
            <div className="animate-fade-in absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="max-h-60 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag); // タグを選択状態にする
                      setSearchInput(""); // バーの文字を空にする
                      setShowSuggestions(false); // リストを閉じる
                    }}
                    className="flex w-full items-center gap-2 border-b border-gray-50 px-5 py-3 text-left text-sm font-bold text-gray-600 transition-colors last:border-0 hover:bg-pink-50 hover:text-pink-600"
                  >
                    <Hash size={14} /> {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showSuggestions && searchInput && filteredTags.length === 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 rounded-xl border border-gray-100 bg-white p-4 text-center text-sm font-bold text-gray-400 shadow-xl">
              見つかりませんでした
            </div>
          )}
        </div>
      </div>

      {/* タグで検索中のときに表示する「解除バー」 */}
      {selectedTag && (
        <div className="mb-8 flex justify-center">
          <div className="animate-fade-in flex items-center gap-3 rounded-full border border-pink-100 bg-pink-50 px-6 py-3 font-bold text-pink-600 shadow-sm">
            <Hash size={18} />
            <span>「{selectedTag}」の作品を表示中</span>
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-2 rounded-full bg-pink-200 p-1 text-pink-700 transition hover:bg-pink-300"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 作品一覧 */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white py-20 text-center font-bold text-gray-400">
          作品が見つかりませんでした。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Link
                href={`/posts/${post.id}`}
                className="relative block h-48 w-full overflow-hidden bg-gray-100"
              >
                {post.coverImageURL ? (
                  <img
                    src={post.coverImageURL}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-black text-gray-300">
                    NO IMAGE
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {post.type === "GAMEBOOK" && (
                    <span className="flex gap-1 rounded bg-purple-600/90 px-2 py-1 text-xs font-bold text-white shadow">
                      <Gamepad2 size={12} /> GAMEBOOK
                    </span>
                  )}
                  {post.type === "DREAM" && (
                    <span className="flex gap-1 rounded bg-pink-500/90 px-2 py-1 text-xs font-bold text-white shadow">
                      <UserIcon size={12} /> DREAM
                    </span>
                  )}
                  {post.type === "NOVEL" && (
                    <span className="flex gap-1 rounded bg-blue-600/90 px-2 py-1 text-xs font-bold text-white shadow">
                      <Book size={12} /> NOVEL
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <Link href={`/posts/${post.id}`} className="mb-4 block flex-1">
                  <h2 className="mb-2 line-clamp-2 text-lg leading-tight font-bold transition group-hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 text-xs leading-relaxed text-gray-500 opacity-80">
                    {post.caption ? post.caption : "キャプションがありません"}
                  </p>
                </Link>

                <div className="mt-auto border-t pt-4">
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-gray-400">
                    <Link
                      href={`/users/${post.author.id}`}
                      className="flex items-center gap-1 transition hover:text-blue-500"
                    >
                      <PenTool size={12} />{" "}
                      {post.author.name ||
                        post.author.email?.split("@")[0] ||
                        "名無し"}
                    </Link>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <button
                        key={t.tag.id}
                        onClick={() => setSelectedTag(t.tag.name)}
                        className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 transition hover:bg-pink-100 hover:text-pink-600"
                      >
                        <Hash size={10} /> {t.tag.name}
                      </button>
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
