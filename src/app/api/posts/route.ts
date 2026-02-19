import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ■ GET: 記事一覧を取得
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");

  try {
    const posts = await prisma.post.findMany({
      where:
        typeFilter && typeFilter !== "ALL"
          ? { type: typeFilter as "NOVEL" | "DREAM" | "GAMEBOOK" }
          : {},
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } }, // タグ情報も一緒に取得
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

// ■ POST: 記事を新規投稿
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tagList: string[] = Array.isArray(body.tags) ? body.tags : [];

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        type: body.type, // NOVEL, DREAM, GAMEBOOK
        coverImageURL: body.coverImageURL,

        // タグの保存処理（なければ作り、あれば繋ぐ）
        tags: {
          create: tagList.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
