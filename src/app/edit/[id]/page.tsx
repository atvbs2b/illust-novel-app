"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Book, User, Gamepad2, Upload, Hash, Plus, X } from "lucide-react";

type Choice = { label: string; targetId: string };
type Scene = { id: string; text: string; bg: string; choices: Choice[] };

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      alert("ログインが必要です");
      router.push("/api/auth/signin");
    }
  }, [sessionStatus, router]);

  // ★ 既存のデータを取得してセットする
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title,
          caption: data.caption || "",
          type: data.type,
          coverImageURL: data.coverImageURL || "",
          isPublished: data.isPublished,
        });
        setTags(data.tags?.map((t: any) => t.tag.name) || []);

        // ゲームブックならJSONを解析、そうじゃなければそのままテキストへ
        if (data.type === "GAMEBOOK") {
          try {
            setScenes(JSON.parse(data.content));
          } catch (e) {
            console.error(e);
          }
        } else {
          setTextContent(data.content || "");
        }
        setIsLoading(false);
      });
  }, [postId]);

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (tagToRemove: string) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("⏳ 変換中...");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, coverImageURL: reader.result as string }));
      setStatus("✅ 表紙OK");
    };
    reader.readAsDataURL(file);
  };

  // ★ 更新処理（PUTメソッド）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent =
      form.type === "GAMEBOOK" ? JSON.stringify(scenes) : textContent;

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, content: finalContent, tags }),
    });

    if (res.ok) {
      router.push(`/posts/${postId}`);
      router.refresh();
    } else {
      alert("更新エラーが発生しました。");
    }
  };

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
    return <div className="py-20 text-center text-gray-500">読み込み中...</div>;

  return (
    <main className="mx-auto max-w-3xl p-4 py-24 md:p-8 md:pt-32">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        作品を編集する
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* 基本設定エリア */}
        <div className="space-y-6">
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

          {/* 公開設定 */}
          <div className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-bold text-gray-800">
                公開状態
              </label>
              <p className="text-xs text-gray-500">
                非公開にすると他の人からは見えなくなります
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-pink-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              キャプション
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
                { id: "NOVEL", label: "📖 小説" },
                { id: "DREAM", label: "🦄 夢小説" },
                { id: "GAMEBOOK", label: "🎮 ゲームブック" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`rounded-xl border px-4 py-4 text-center font-bold transition-all ${form.type === t.id ? "scale-[1.02] bg-gray-800 text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
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
            <div className="mb-3 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-pink-300 focus:bg-white focus:outline-none"
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
                className="rounded-xl bg-gray-800 px-4 text-white transition-colors hover:bg-black"
              >
                <Plus size={18} />
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

        {/* エディタエリア */}
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
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      ID: {scene.id}
                    </span>
                    <select
                      className="cursor-pointer rounded-lg border-gray-200 p-1 text-xs font-bold focus:ring-purple-300"
                      value={scene.bg}
                      onChange={(e) => updateScene(sIdx, "bg", e.target.value)}
                    >
                      <option value="bg-white">背景：白</option>
                      <option value="bg-gray-900 text-white">背景：黒</option>
                      <option value="bg-pink-50 text-gray-800">
                        背景：ピンク
                      </option>
                    </select>
                  </div>
                  <textarea
                    className="mb-3 h-32 w-full resize-y rounded-xl border border-gray-200 p-4 text-sm transition-colors focus:border-purple-300 focus:ring-1 focus:ring-purple-300 focus:outline-none"
                    value={scene.text}
                    onChange={(e) => updateScene(sIdx, "text", e.target.value)}
                  />
                  <div className="mb-3 space-y-2 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="mb-2 text-xs font-bold text-gray-400">
                      読者の選択肢（ボタン）
                    </div>

                    {/* ★ 編集画面にもスマホ対応の選択肢を適用済みです！ */}
                    {scene.choices.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex-nowrap md:border-none md:p-0"
                      >
                        <input
                          className="w-full flex-1 rounded-lg border px-3 py-2 text-sm focus:border-purple-300 focus:outline-none md:w-auto"
                          value={c.label}
                          onChange={(e) =>
                            updateChoice(sIdx, cIdx, "label", e.target.value)
                          }
                        />
                        <div className="flex w-full items-center justify-end gap-2 md:w-auto">
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
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
                    className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600 hover:bg-pink-100"
                  >
                    夢小説：名前変換
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => insertTextTag("((bg:color))")}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  背景色変更
                </button>
              </div>
              <textarea
                className="min-h-[400px] w-full flex-1 resize-y rounded-xl border border-gray-200 p-6 text-base leading-loose focus:border-pink-300 focus:ring-1 focus:ring-pink-300 focus:outline-none md:text-lg"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-4 z-50 pt-4">
          <button className="w-full rounded-2xl bg-gray-900 py-4 text-lg font-black text-white shadow-xl shadow-gray-900/20 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]">
            変更を保存する
          </button>
        </div>
      </form>
    </main>
  );
}
