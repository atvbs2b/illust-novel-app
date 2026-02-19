import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // データベースから、タグの名前だけを全部取得する（アルファベット・五十音順）
    const tags = await prisma.tag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // ["ファンタジー", "ホラー", "恋愛"] のような、名前だけのシンプルなリストに変換
    const tagNames = tags.map((t) => t.name);

    return NextResponse.json(tagNames);
  } catch (error) {
    console.error("タグ取得エラー:", error);
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}
