"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// ★ 「すべて」用のアイコンとして LayoutGrid を追加しています！
import {
  Book,
  Gamepad2,
  Hash,
  PenTool,
  User as UserIcon,
  X,
  Search,
  LayoutGrid,
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

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <main className="mx-auto w-full max-w-5xl overflow-hidden px-4 py-24 md:p-8 md:pt-28">
      {/* 絞り込みボタン（作品の種類） */}
      {/* ★ 変更：flex-wrapを外し、横幅いっぱいに4等分で広がるようにしました */}
      <div className="mb-8 flex w-full justify-between gap-1 md:mb-10 md:justify-center md:gap-4">
        {[
          // ★ 高さがズレないように「すべて」にもアイコンを追加！
          {
            id: "ALL",
            label: "すべて",
            icon: <LayoutGrid size={18} className="md:h-4 md:w-4" />,
          },
          {
            id: "NOVEL",
            label: "NOVEL",
            icon: <Book size={18} className="md:h-4 md:w-4" />,
          },
          {
            id: "DREAM",
            label: "DREAM",
            icon: <UserIcon size={18} className="md:h-4 md:w-4" />,
          },
          {
            id: "GAMEBOOK",
            label: "GAMEBOOK",
            icon: <Gamepad2 size={18} className="md:h-4 md:w-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTypeFilter(tab.id);
              setSelectedTag(null);
              setSearchInput("");
            }}
            // ★ 変更：スマホは縦並び(flex-col)で幅24%(w-[24%])、PCは横並び(md:flex-row)
            className={`flex w-[24%] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold shadow-sm transition-all min-[375px]:text-[10px] md:w-auto md:flex-row md:gap-2 md:rounded-full md:px-6 md:py-3 md:text-sm ${
              typeFilter === tab.id
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            <span className="mt-1 leading-none md:mt-0">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 予測変換つき検索バー */}
      <div className="relative z-20 mx-auto mb-8 flex w-full max-w-md justify-center md:mb-10">
        <div className="relative w-full">
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            size={16}
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
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full rounded-full border-2 border-transparent bg-gray-100 py-3 pr-4 pl-10 text-sm font-bold text-gray-700 shadow-sm transition-all focus:border-pink-300 focus:bg-white focus:outline-none md:text-base"
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
          {showSuggestions && searchInput && filteredTags.length === 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 rounded-xl border border-gray-100 bg-white p-4 text-center text-xs font-bold text-gray-400 shadow-xl md:text-sm">
              見つかりませんでした
            </div>
          )}
        </div>
      </div>

      {/* タグで検索中のときに表示する「解除バー」 */}
      {selectedTag && (
        <div className="mb-6 flex w-full justify-center md:mb-8">
          <div className="animate-fade-in flex flex-wrap items-center justify-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-center text-xs font-bold text-pink-600 shadow-sm md:px-6 md:py-3 md:text-sm">
            <Hash size={16} />
            <span className="break-all">「{selectedTag}」の作品を表示中</span>
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-1 rounded-full bg-pink-200 p-1 text-pink-700 transition hover:bg-pink-300"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* 作品一覧 */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white py-20 text-center text-sm font-bold text-gray-400 md:text-base">
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
                className="relative block h-40 w-full overflow-hidden bg-gray-100 md:h-48"
              >
                {post.coverImageURL ? (
                  <img
                    src={post.coverImageURL}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl font-black text-gray-300 md:text-2xl">
                    NO IMAGE
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 md:top-3 md:right-3 md:gap-2">
                  {post.type === "GAMEBOOK" && (
                    <span className="flex items-center gap-1 rounded bg-purple-600/90 px-2 py-1 text-[10px] font-bold text-white shadow md:text-xs">
                      <Gamepad2 size={10} /> GAMEBOOK
                    </span>
                  )}
                  {post.type === "DREAM" && (
                    <span className="flex items-center gap-1 rounded bg-pink-500/90 px-2 py-1 text-[10px] font-bold text-white shadow md:text-xs">
                      <UserIcon size={10} /> DREAM
                    </span>
                  )}
                  {post.type === "NOVEL" && (
                    <span className="flex items-center gap-1 rounded bg-blue-600/90 px-2 py-1 text-[10px] font-bold text-white shadow md:text-xs">
                      <Book size={10} /> NOVEL
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4 md:p-6">
                <Link
                  href={`/posts/${post.id}`}
                  className="mb-3 block flex-1 md:mb-4"
                >
                  <h2 className="mb-2 line-clamp-2 text-base leading-tight font-bold transition group-hover:text-blue-600 md:text-lg">
                    {post.title}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 opacity-80 md:line-clamp-3">
                    {post.caption ? post.caption : "キャプションがありません"}
                  </p>
                </Link>

                <div className="mt-auto border-t pt-3 md:pt-4">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-gray-400 md:mb-3 md:text-xs">
                    <Link
                      href={`/users/${post.author.id}`}
                      className="flex items-center gap-1 transition hover:text-blue-500"
                    >
                      <PenTool size={10} />{" "}
                      <span className="max-w-[100px] truncate">
                        {post.author.name ||
                          post.author.email?.split("@")[0] ||
                          "名無し"}
                      </span>
                    </Link>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {post.tags.map((t) => (
                      <button
                        key={t.tag.id}
                        onClick={() => setSelectedTag(t.tag.name)}
                        className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-500 transition hover:bg-pink-100 hover:text-pink-600 md:text-[10px]"
                      >
                        <Hash size={8} /> {t.tag.name}
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
