"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book, User, Gamepad2, Upload, Hash, Plus, X } from "lucide-react";

type Choice = { label: string; targetId: string };
type Scene = { id: string; text: string; bg: string; choices: Choice[] };

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    type: "NOVEL",
    coverImageURL: "",
  });

  const [textContent, setTextContent] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([
    { id: "start", text: "", bg: "bg-white", choices: [] },
  ]);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState("待機中...");

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalContent =
      form.type === "GAMEBOOK" ? JSON.stringify(scenes) : textContent;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, content: finalContent, tags }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("投稿エラーが発生しました。");
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

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">作品を投稿する</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* 左カラム：設定系 */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-bold text-gray-500">
              タイトル
            </label>
            <input
              className="w-full border-b text-lg font-bold focus:outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="タイトルを入力"
              required
            />
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              ジャンル
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "NOVEL", label: "📖 小説" },
                { id: "DREAM", label: "🦄 夢小説" },
                { id: "GAMEBOOK", label: "🎮 ゲームブック" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`rounded-lg border px-4 py-3 text-left font-bold transition-all ${form.type === t.id ? "bg-black text-white shadow-lg" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              タグ設定
            </label>
            <div className="mb-2 flex gap-2">
              <input
                className="flex-1 rounded border bg-gray-50 px-2 py-1 text-sm"
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
                className="rounded bg-black px-3 text-white"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-xs"
                >
                  <Hash size={10} /> {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-gray-400">タグなし</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-gray-500">
              表紙画像
            </label>
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition hover:bg-gray-100">
              {form.coverImageURL ? (
                <img
                  src={form.coverImageURL}
                  alt="表紙画像"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <Upload className="mb-1 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    クリックして選択
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
            <div className="mt-1 text-center text-xs font-bold text-blue-500">
              {status}
            </div>
          </div>

          <button className="w-full rounded-xl bg-black py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.05]">
            投稿する
          </button>
        </div>

        {/* 右カラム：エディタエリア */}
        <div className="min-h-125 rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          {form.type === "GAMEBOOK" ? (
            <div className="space-y-6">
              <div className="mb-4 flex items-center gap-2 border-b pb-2 font-bold text-purple-700">
                <Gamepad2 /> ゲームブックエディタ
              </div>
              {scenes.map((scene, sIdx) => (
                <div
                  key={sIdx}
                  className="relative rounded-lg border bg-gray-50 p-4"
                >
                  <div className="mb-2 flex justify-between">
                    <span className="rounded bg-black px-2 py-1 text-xs text-white">
                      ID: {scene.id}
                    </span>
                    <select
                      className="rounded border text-xs"
                      value={scene.bg}
                      onChange={(e) => updateScene(sIdx, "bg", e.target.value)}
                    >
                      <option value="bg-white">白</option>
                      <option value="bg-gray-900 text-white">黒</option>
                      <option value="bg-pink-50 text-gray-800">ピンク</option>
                    </select>
                  </div>
                  <textarea
                    className="mb-2 h-20 w-full rounded border p-2 text-sm"
                    placeholder="本文..."
                    value={scene.text}
                    onChange={(e) => updateScene(sIdx, "text", e.target.value)}
                  />
                  {scene.choices.map((c, cIdx) => (
                    <div key={cIdx} className="mb-1 flex gap-1">
                      <input
                        className="flex-1 rounded border px-2 py-1 text-xs"
                        placeholder="ボタン名"
                        value={c.label}
                        onChange={(e) =>
                          updateChoice(sIdx, cIdx, "label", e.target.value)
                        }
                      />
                      <select
                        className="w-24 rounded border px-2 py-1 text-xs"
                        value={c.targetId}
                        onChange={(e) =>
                          updateChoice(sIdx, cIdx, "targetId", e.target.value)
                        }
                      >
                        {scenes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id}へ
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeChoice(sIdx, cIdx)}
                        className="px-1 text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addChoice(sIdx)}
                    className="text-xs font-bold text-blue-500"
                  >
                    + 選択肢追加
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScene}
                className="w-full rounded border-2 border-dashed border-gray-300 py-2 font-bold text-gray-400 hover:bg-gray-50"
              >
                ＋ ページ追加
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="mb-4 flex gap-2 rounded-lg bg-gray-50 p-2">
                <button
                  type="button"
                  onClick={() => insertTextTag("((name))")}
                  className="rounded border bg-white px-2 py-1 text-xs font-bold text-pink-500"
                >
                  名前変換
                </button>
                <button
                  type="button"
                  onClick={() => insertTextTag("((bg:color))")}
                  className="rounded border bg-white px-2 py-1 text-xs text-gray-700"
                >
                  背景色変更
                </button>
                <button
                  type="button"
                  onClick={() => insertTextTag("((next:ID|次へ))")}
                  className="rounded border bg-white px-2 py-1 text-xs text-blue-500"
                >
                  分岐
                </button>
              </div>
              <textarea
                className="w-full flex-1 resize-none rounded-xl border p-4 text-lg leading-loose focus:outline-none"
                placeholder={
                  form.type === "DREAM"
                    ? "ここに夢小説を書いてください...\n((name)) で読者の名前に変換されます。"
                    : "ここに小説を書いてください..."
                }
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
