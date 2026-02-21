"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Save,
  Trash2,
  Globe,
  Lock,
  Book,
  User as UserIcon,
  Gamepad2,
  Upload,
  Hash,
  Plus,
  X,
} from "lucide-react";

type Choice = { label: string; targetId: string };
type Scene = { id: string; text: string; bg: string; choices: Choice[] };

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [isLoading, setIsLoading] = useState(true);

  // ★ form に type（ジャンル）や coverImageURL（表紙）を追加
  const [form, setForm] = useState({
    title: "",
    caption: "",
    type: "NOVEL",
    coverImageURL: "",
    isPublished: true,
  });
  const [textContent, setTextContent] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([
    { id: "start", text: "", bg: "bg-white", choices: [] },
  ]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState("待機中...");

  // 認証チェック
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      alert("ログインが必要です");
      router.push("/api/auth/signin");
    }
  }, [sessionStatus, router]);

  // 元の作品データを取得
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !postId) return;

    fetch(`/api/posts/${postId}`)
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
          type: data.type || "NOVEL", // ジャンルを引き継ぐ
          coverImageURL: data.coverImageURL || "", // 表紙を引き継ぐ
          isPublished: data.isPublished,
        });

        // タグの引き継ぎ
        setTags(
          data.tags?.map((t: { tag: { name: string } }) => t.tag.name) || [],
        );

        // ★ ゲームブックならJSONを解析、そうじゃなければテキストにセット
        if (data.type === "GAMEBOOK") {
          try {
            setScenes(JSON.parse(data.content));
          } catch (e) {
            console.error("ゲームブックデータの解析に失敗しました", e);
            setScenes([
              { id: "start", text: data.content, bg: "bg-white", choices: [] },
            ]);
          }
        } else {
          setTextContent(data.content || "");
        }

        setIsLoading(false);
      });
  }, [sessionStatus, postId, router]);

  // タグ関連の処理
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (tagToRemove: string) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  // 画像アップロード処理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setStatus("❌ 未選択");
      return;
    }
    setStatus("⏳ 変換中...");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, coverImageURL: reader.result as string }));
      setStatus("✅ 表紙OK");
    };
    reader.readAsDataURL(file);
  };

  // ★ 更新処理（PUT）
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent =
      form.type === "GAMEBOOK" ? JSON.stringify(scenes) : textContent;

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, content: finalContent, tags }), // tags も一緒に送る
    });

    if (res.ok) {
      alert("作品を更新しました！");
      router.push(`/posts/${postId}`);
      router.refresh();
    } else {
      alert("更新に失敗しました。");
    }
  };

  // 削除処理（DELETE）
  const handleDelete = async () => {
    const confirmed = confirm(
      "本当にこの作品を削除しますか？\n（この操作は取り消せません）",
    );
    if (!confirmed) return;

    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      alert("作品を削除しました。");
      router.push("/mypage");
      router.refresh();
    } else {
      alert("削除に失敗しました。");
    }
  };

  // ゲームブック用の処理
  const addScene = () =>
    setScenes([
      ...scenes,
      {
        id: `scene_${scenes.length + 1}`,
        text: "",
        bg: "bg-white",
        choices: [],
      },
    ]);
  const updateScene = <K extends keyof Scene>(
    idx: number,
    field: K,
    val: Scene[K],
  ) => {
    const newS = [...scenes];
    newS[idx] = { ...newS[idx], [field]: val };
    setScenes(newS);
  };
  const addChoice = (sIdx: number) => {
    const newS = [...scenes];
    newS[sIdx].choices.push({
      label: "",
      targetId: newS[sIdx + 1]?.id || newS[sIdx].id,
    });
    setScenes(newS);
  };
  const updateChoice = (
    sIdx: number,
    cIdx: number,
    f: keyof Choice,
    v: string,
  ) => {
    const newS = [...scenes];
    newS[sIdx].choices[cIdx][f as "label" | "targetId"] = v;
    setScenes(newS);
  };
  const removeChoice = (sIdx: number, cIdx: number) => {
    const newS = [...scenes];
    newS[sIdx].choices.splice(cIdx, 1);
    setScenes(newS);
  };
  const insertTextTag = (tag: string) => setTextContent((prev) => prev + tag);

  if (isLoading)
    return (
      <div className="mt-20 text-center font-bold text-gray-500">
        データを読み込み中...
      </div>
    );

  return (
    <main className="mx-auto max-w-3xl p-4 py-24 md:p-8 md:pt-32">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        作品を編集する
      </h1>

      <form onSubmit={handleUpdate} className="flex flex-col gap-8">
        {/* ■■ 1. 基本設定エリア ■■ */}
        <div className="space-y-6">
          {/* 公開設定 */}
          <div className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm">
            <div>
              <p className="font-bold text-gray-800">公開設定</p>
              <p className="mt-1 text-xs text-gray-500">
                非公開にすると、他の人からは見えなくなります。
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, isPublished: !form.isPublished })
              }
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

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              タイトル
            </label>
            <input
              className="w-full border-b-2 border-gray-100 py-2 text-xl font-bold transition-colors focus:border-pink-300 focus:outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              キャプション（あらすじ・説明）
            </label>
            <textarea
              className="h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm transition-colors focus:border-pink-300 focus:bg-white focus:outline-none"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-bold text-gray-500">
              ジャンルを選択
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { id: "NOVEL", label: "小説" },
                { id: "DREAM", label: "夢小説" },
                { id: "GAMEBOOK", label: "ゲームブック" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`rounded-xl border px-4 py-4 text-center font-bold transition-all ${
                    form.type === t.id
                      ? "scale-[1.02] bg-gray-800 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-bold text-gray-500">
              タグ設定
            </label>
            <div className="mb-3 flex flex-col gap-2 md:flex-row">
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-pink-300 focus:bg-white focus:outline-none md:flex-1 md:py-2"
                placeholder="タグを入力 (Enterで追加)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <button
                type="button"
                onClick={addTag}
                className="flex w-full items-center justify-center rounded-xl bg-gray-800 px-4 py-3 text-white transition-colors hover:bg-black md:w-auto md:py-2"
              >
                <Plus size={18} />{" "}
                <span className="ml-1 text-sm font-bold md:hidden">追加</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600"
                >
                  <Hash size={12} /> {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full bg-pink-200 p-0.5 hover:text-pink-800"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-bold text-gray-500">
              表紙画像
            </label>
            <label className="group flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-pink-300 hover:bg-gray-100">
              {form.coverImageURL ? (
                <img
                  src={form.coverImageURL}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                />
              ) : (
                <>
                  <Upload
                    className="mb-2 text-gray-400 transition-colors group-hover:text-pink-400"
                    size={24}
                  />
                  <span className="text-sm font-bold text-gray-400 transition-colors group-hover:text-pink-500">
                    クリックして画像を選択
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <div className="mt-2 text-center text-xs font-bold text-blue-500">
              {status}
            </div>
          </div>
        </div>

        {/* ■■ 2. エディタエリア ■■ */}
        <div className="min-h-[500px] rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <label className="mb-4 block border-b pb-3 text-lg font-black text-gray-800">
            本文の編集
          </label>

          {form.type === "GAMEBOOK" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3 text-sm font-bold text-purple-700">
                <Gamepad2 size={18} /> ゲームブック専用エディタ
              </div>
              {scenes.map((scene, sIdx) => (
                <div
                  key={sIdx}
                  className="relative rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
                >
                  <textarea
                    className="mb-3 h-32 w-full resize-y rounded-xl border border-gray-200 p-4 text-sm transition-colors focus:border-purple-300 focus:ring-1 focus:ring-purple-300 focus:outline-none"
                    value={scene.text}
                    onChange={(e) => updateScene(sIdx, "text", e.target.value)}
                  />
                  <div className="mb-3 space-y-3 rounded-lg border border-gray-100 bg-white p-3 md:space-y-2">
                    <div className="text-xs font-bold text-gray-400">
                      読者の選択肢（ボタン）
                    </div>
                    {scene.choices.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-center md:border-none md:bg-transparent md:p-0"
                      >
                        <input
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:border-purple-300 focus:outline-none md:flex-1"
                          value={c.label}
                          onChange={(e) =>
                            updateChoice(sIdx, cIdx, "label", e.target.value)
                          }
                        />
                        <div className="flex w-full items-center gap-2 md:w-auto md:justify-end">
                          <span className="hidden text-xs font-bold text-gray-400 md:inline">
                            ▶︎
                          </span>
                          <select
                            className="flex-1 cursor-pointer rounded-lg border px-2 py-2 text-sm focus:border-purple-300 md:w-32 md:flex-none"
                            value={c.targetId}
                            onChange={(e) =>
                              updateChoice(
                                sIdx,
                                cIdx,
                                "targetId",
                                e.target.value,
                              )
                            }
                          >
                            {scenes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.id} へ
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeChoice(sIdx, cIdx)}
                            className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100 md:border-none md:bg-transparent md:text-gray-400 md:hover:bg-red-50 md:hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addChoice(sIdx)}
                      className="mt-2 flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
                    >
                      <Plus size={14} /> 選択肢を追加
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addScene}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 py-4 font-bold text-purple-600 transition-colors hover:bg-purple-100"
              >
                <Plus size={18} /> 新しいシーン（ページ）を追加
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col">
              <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2">
                {form.type === "DREAM" && (
                  <button
                    type="button"
                    onClick={() => insertTextTag("((name))")}
                    className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600 transition-colors hover:bg-pink-100"
                  >
                    名前変換
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => insertTextTag("((bg:color))")}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  背景色変更
                </button>
              </div>
              <textarea
                className="min-h-[400px] w-full flex-1 resize-y rounded-xl border border-gray-200 p-6 text-base leading-loose transition-colors focus:border-pink-300 focus:ring-1 focus:ring-pink-300 focus:outline-none md:text-lg"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ■■ 3. 送信＆削除ボタン ■■ */}
        <div className="sticky bottom-4 z-50 flex flex-col gap-4 pt-4 md:flex-row">
          {/* 削除ボタン */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-4 text-base font-bold text-red-500 shadow-sm transition-all hover:bg-red-50 md:w-1/3"
          >
            <Trash2 size={20} /> 作品を削除
          </button>

          {/* 保存ボタン */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-lg font-black text-white shadow-xl shadow-gray-900/20 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98] md:w-2/3"
          >
            <Save size={20} /> 変更を保存する
          </button>
        </div>
      </form>
    </main>
  );
}
