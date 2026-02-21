"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  RotateCcw,
  ArrowRight,
  User as UserIcon,
  Book,
  Gamepad2,
  Hash,
  PenTool,
  Lock,
  Bookmark,
} from "lucide-react";
import { useSession } from "next-auth/react";

type Choice = { label: string; targetId: string };
type GameScene = { id: string; text: string; bg: string; choices: Choice[] };
type NovelSegment = {
  id: string;
  text: string;
  bgColor: string;
  nextLink?: { id: string; label: string };
};
type Post = {
  id: string;
  title: string;
  content: string;
  caption?: string;
  type: string;
  createdAt: string;
  coverImageURL?: string;
  comments: {
    id: string;
    content: string;
    authorName: string;
    createdAt: string;
  }[];
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  authorId?: string; // 追加
  author?: { id: string; name: string | null; email: string | null } | null; // 追加
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [dreamName, setDreamName] = useState("夢主");
  const [currentBg, setCurrentBg] = useState("bg-white");

  const [gameScenes, setGameScenes] = useState<GameScene[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState("start");
  const [novelSegments, setNovelSegments] = useState<NovelSegment[]>([]);

  const [gameHistory, setGameHistory] = useState<string[]>([]);

  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [myPenName, setMyPenName] = useState("");

  const [bookmarks, setBookmarks] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    if (!session) {
      alert("ブックマークするにはログインが必要です！");
      return;
    }
    const res = await fetch(`/api/posts/${params.id}/bookmark`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setIsBookmarked(data.isBookmarked);
      setBookmarks((prev) => (data.isBookmarked ? prev + 1 : prev - 1));
    }
  };

  // データの読み込み
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPost(data);
        setLikes(data.likes?.length || 0);
        setBookmarks(data.bookmarks?.length || 0);

        if (data.currentUserPenName) {
          setMyPenName(data.currentUserPenName);
        }

        if (session?.user?.email) {
          // 自分が「いいね」しているかチェック
          if (data.likes) {
            const userHasLiked = data.likes.some(
              (like: { user: { email: string | null | undefined } }) =>
                like.user?.email === session.user?.email,
            );
            setHasLiked(userHasLiked);
          }
          // 自分が「ブックマーク」しているかチェックして緑色にする
          if (data.bookmarks) {
            const userHasBookmarked = data.bookmarks.some(
              (bm: { user: { email: string | null | undefined } }) =>
                bm.user?.email === session.user?.email,
            );
            setIsBookmarked(userHasBookmarked);
          }
        }

        if (data.type === "GAMEBOOK") {
          try {
            const parsed = JSON.parse(data.content);
            setGameScenes(parsed);
            setGameHistory(["start"]); // 履歴の初期化
            const firstScene =
              parsed.find((s: GameScene) => s.id === "start") || parsed[0];
            if (firstScene) setCurrentBg(firstScene.bg);
          } catch (e) {
            console.error(e);
          }
        } else {
          setNovelSegments(parseNovelContent(data.content || ""));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session !== undefined) fetchPost();

    const savedName = localStorage.getItem("dreamName");
    if (savedName) setDreamName(savedName);
  }, [params.id, session]);

  useEffect(() => {
    if (novelSegments.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const color = entry.target.getAttribute("data-color");
            if (color) setCurrentBg(color);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    const elements = document.querySelectorAll(".novel-segment");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [novelSegments]);

  // ゲームブックの選択肢を押した時の処理
  const handleGameChoice = (targetId: string) => {
    setCurrentSceneId(targetId);
    setGameHistory((prev) => [...prev, targetId]);
    const nextScene = gameScenes.find((s) => s.id === targetId);
    if (nextScene) setCurrentBg(nextScene.bg);

    // 選んだら少し下にスクロールする
    setTimeout(() => {
      window.scrollBy({ top: 400, behavior: "smooth" });
    }, 100);
  };

  const handleGameReset = () => {
    setCurrentSceneId("start");
    setGameHistory(["start"]); // 履歴をリセット
    const startScene =
      gameScenes.find((s) => s.id === "start") || gameScenes[0];
    if (startScene) setCurrentBg(startScene.bg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const parseNovelContent = (fullText: string) => {
    const parts = fullText.split(/\(\(bg:(.*?)\)\)/);
    const result: NovelSegment[] = [];
    let currentColor = "bg-white";
    parts.forEach((part, i) => {
      if (i % 2 === 1) {
        if (part === "black") currentColor = "bg-gray-900 text-white";
        else if (part === "pink") currentColor = "bg-pink-50 text-gray-800";
        else if (part === "sunset")
          currentColor = "bg-orange-100 text-gray-800";
        else if (part === "night")
          currentColor = "bg-indigo-950 text-indigo-100";
        else if (part === "sepia") currentColor = "bg-amber-50 text-amber-900";
        else if (part === "green") currentColor = "bg-green-50 text-gray-800";
        else if (part === "horror") currentColor = "bg-red-950 text-red-100";
        else if (part === "purple") currentColor = "bg-purple-50 text-gray-800";
        else currentColor = "bg-white text-gray-800";
      } else {
        if (!part.trim()) return;
        const nextRegex = /\(\(next:(.*?)\|(.*?)\)\)/;
        const match = nextRegex.exec(part);
        let nextLink = undefined;
        let cleanText = part;
        if (match) {
          nextLink = { id: match[1], label: match[2] };
          cleanText = part.replace(nextRegex, "");
        }
        result.push({
          id: `seg-${i}`,
          text: cleanText,
          bgColor: currentColor,
          nextLink,
        });
      }
    });
    return result;
  };

  const handleLike = async () => {
    if (!session) {
      alert("いいねするにはログインが必要です！");
      return;
    }
    const res = await fetch(`/api/posts/${params.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLikes(data.likeCount);
      setHasLiked(data.hasLiked);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !session) return;
    await fetch(`/api/posts/${params.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    setCommentText("");
    alert("コメントを送信しました！リロードすると表示されます。");
  };

  if (loading || !post)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black"></div>
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-1000 ease-in-out ${currentBg}`}
    >
      <nav className="pointer-events-none fixed top-8 z-10 w-full p-4">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-800 shadow-sm backdrop-blur transition hover:bg-white"
        >
          ← 一覧へ
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-24">
        {/* ヘッダー部分 */}
        <div className="animate-fade-in mb-12 overflow-hidden rounded-2xl bg-white/90 shadow-xl backdrop-blur">
          {post.coverImageURL && (
            <div className="relative h-64 w-full sm:h-80">
              <img
                src={post.coverImageURL}
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
            </div>
          )}
          <div className="p-8">
            <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900">
              {post.title}
            </h1>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.author ? (
                  <Link
                    href={`/users/${post.authorId}`}
                    className="flex items-center gap-1 font-bold text-gray-600 transition hover:text-blue-500"
                  >
                    <PenTool size={14} />{" "}
                    {post.author.name ||
                      post.author.email?.split("@")[0] ||
                      "名無し作者"}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <PenTool size={14} /> 作者不明
                  </span>
                )}
              </div>
            </div>
            {post.caption && (
              <div className="mb-8 rounded-lg border bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
                {post.caption}
              </div>
            )}

            {(post.type === "DREAM" || post.type === "GAMEBOOK") && (
              <div className="flex items-center gap-4 rounded-xl border border-pink-100 bg-pink-50 p-4">
                <div className="rounded-full bg-pink-200 p-2 text-pink-600">
                  <UserIcon size={20} />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-pink-500">
                    主人公の名前
                  </label>
                  <input
                    type="text"
                    value={dreamName}
                    onChange={(e) => {
                      setDreamName(e.target.value);
                      localStorage.setItem("dreamName", e.target.value);
                    }}
                    className="w-full rounded border border-pink-200 bg-white px-3 py-1 text-gray-800 focus:outline-pink-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 本文エリア */}
        <div className="min-h-[50vh]">
          {/*　ゲームブックの表示 */}
          {post.type === "GAMEBOOK" && gameHistory.length > 0 && (
            <div className="space-y-8 pb-20">
              {gameHistory.map((sceneId, index) => {
                const scene = gameScenes.find((s) => s.id === sceneId);
                if (!scene) return null;
                const isLast = index === gameHistory.length - 1; // 一番最後のシーンかどうか

                return (
                  <div
                    key={`${sceneId}-${index}`}
                    className="animate-fade-in rounded-2xl border border-white/20 bg-white/80 p-8 shadow-sm backdrop-blur-md"
                  >
                    <div className="prose prose-lg max-w-none leading-loose font-medium whitespace-pre-wrap">
                      {scene.text.replaceAll("((name))", dreamName)}
                    </div>
                    {/* 一番最後のシーンにだけ選択肢を表示する */}
                    {isLast && (
                      <div className="mt-12 space-y-4 border-t border-gray-200/50 pt-8">
                        {scene.choices.length > 0 ? (
                          scene.choices.map((choice, i) => (
                            <button
                              key={i}
                              onClick={() => handleGameChoice(choice.targetId)}
                              className="group flex w-full transform items-center justify-between rounded-xl border-2 border-black/10 bg-white p-5 text-left text-lg font-bold text-gray-800 shadow-sm transition-all hover:-translate-y-1 hover:bg-black hover:text-white"
                            >
                              <span>
                                {choice.label.replaceAll("((name))", dreamName)}
                              </span>
                              <ArrowRight className="opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                          ))
                        ) : (
                          <div className="rounded-xl bg-gray-50/50 py-10 text-center">
                            <p className="mb-6 text-2xl font-black text-gray-400">
                              THE END
                            </p>
                            <button
                              onClick={handleGameReset}
                              className="inline-flex items-center gap-2 font-bold text-blue-600 hover:underline"
                            >
                              <RotateCcw size={18} /> 最初から読み直す
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 小説・夢小説の表示 */}
          {(post.type === "NOVEL" || post.type === "DREAM") && (
            <div className="space-y-0">
              {novelSegments.map((seg) => (
                <div
                  key={seg.id}
                  className="novel-segment px-4 py-12 md:px-8"
                  data-color={seg.bgColor}
                >
                  <div className="prose prose-xl max-w-none font-serif leading-loose whitespace-pre-wrap">
                    {seg.text.replaceAll("((name))", dreamName)}
                  </div>
                  {seg.nextLink && (
                    <div className="mt-12 flex justify-center">
                      <button
                        onClick={() =>
                          router.push(`/posts/${seg.nextLink!.id}`)
                        }
                        className="group flex items-center gap-3 rounded-full bg-black px-8 py-4 text-lg font-bold text-white shadow-xl transition-transform hover:scale-105"
                      >
                        {seg.nextLink.label.replaceAll("((name))", dreamName)}
                        <ArrowRight className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* いいね＆ブクマ＆コメントエリア */}
        <div className="mx-auto mt-24 max-w-2xl">
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {/* いいねボタン */}
            <button
              onClick={handleLike}
              className={`group flex items-center gap-3 rounded-full px-8 py-4 text-lg font-black shadow-lg transition-all hover:shadow-xl ${hasLiked ? "scale-105 bg-pink-500 text-white" : "bg-white text-gray-600 hover:scale-105"}`}
            >
              <Heart
                className={`transition-transform group-hover:scale-125 ${hasLiked ? "fill-current" : ""}`}
                size={24}
              />
              <span>{likes} LOVE</span>
            </button>

            {/* ブックマークボタン */}
            <button
              onClick={handleBookmark}
              className={`group flex items-center gap-3 rounded-full px-8 py-4 text-lg font-black shadow-lg transition-all hover:shadow-xl ${isBookmarked ? "scale-105 bg-green-500 text-white" : "bg-white text-gray-600 hover:scale-105"}`}
            >
              <Bookmark
                className={`transition-transform group-hover:scale-125 ${isBookmarked ? "fill-current" : ""}`}
                size={24}
              />
              <span>{isBookmarked ? "保存済み" : "保存する"}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white/90 p-8 shadow-lg backdrop-blur">
            <h3 className="mb-6 flex items-center gap-2 border-b pb-4 text-lg font-bold">
              <MessageCircle size={20} /> コメント ({post.comments?.length || 0}
              )
            </h3>
            <div className="mb-8 max-h-80 space-y-6 overflow-y-auto pr-2">
              {post.comments?.map((c) => (
                <div key={c.id} className="rounded-xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      {c.authorName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {c.content}
                  </p>
                </div>
              ))}
              {post.comments?.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-400">
                  まだコメントはありません。
                </p>
              )}
            </div>

            {session ? (
              <form onSubmit={handleCommentSubmit} className="relative">
                <div className="mb-2 flex items-center gap-1 text-xs font-bold text-gray-500">
                  <PenTool size={12} />{" "}
                  {myPenName ||
                    session.user?.name ||
                    session.user?.email?.split("@")[0] ||
                    "名無し"}{" "}
                  としてコメントします
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="感想を伝えよう... "
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-3 bottom-3 rounded-full bg-black p-2 text-white shadow-md transition hover:bg-gray-800"
                >
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-6 text-center">
                <Lock className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="mb-4 text-sm font-bold text-gray-500">
                  コメントを投稿するにはログインが必要です
                </p>
                <Link
                  href="/api/auth/signin"
                  className="inline-block rounded-full bg-black px-6 py-2 text-sm font-bold text-white transition hover:scale-105"
                >
                  ログインする
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
