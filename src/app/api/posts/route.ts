import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ■ GET: 記事一覧を取得（ここは今まで通り）
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
        tags: { include: { tag: true } },
        // ★ ここを修正！ `id: true` を追加します
        author: { select: { id: true, name: true, email: true } },
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
    // ★ 追加：今ログインしている人の情報を取得
    const session = await getServerSession(authOptions);

    // ログインしていなければ弾く（セキュリティ対策）
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const tagList: string[] = Array.isArray(body.tags) ? body.tags : [];

    const post = await prisma.post.create({
      data: {
        title: body.title,
        caption: body.caption,
        content: body.content,
        type: body.type,
        coverImageURL: body.coverImageURL,

        // @ts-expect-error NextAuthの型定義にidが含まれていないため無視
        authorId: session.user.id,

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
