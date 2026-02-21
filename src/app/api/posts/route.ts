import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ■ GET: 記事一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const tagFilter = searchParams.get("tag");
    const sortFilter = searchParams.get("sort"); // ★ 追加：ソート順（latest または popular）

    // ★ 変更：並び順を決定する
    let orderByQuery: any = { createdAt: "desc" }; // デフォルトは新着順
    if (sortFilter === "popular") {
      orderByQuery = { likes: { _count: "desc" } }; // 人気順（いいね数が多い順）
    }

    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        ...(typeFilter && typeFilter !== "ALL"
          ? { type: typeFilter as any }
          : {}),
        ...(tagFilter ? { tags: { some: { tag: { name: tagFilter } } } } : {}),
      },
      orderBy: orderByQuery, // ★ ここに適用
      include: {
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } }, // ★ 追加：いいねの数も画面に送る
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("トップページ(GET /api/posts) エラー:", error);
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

// ■ POST: 記事を新規投稿（ここは変更なし）
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email)
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );

    const body = await request.json();
    const tagList: string[] = Array.isArray(body.tags) ? body.tags : [];
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );

    const post = await prisma.post.create({
      data: {
        title: body.title,
        caption: body.caption,
        content: body.content,
        type: body.type,
        coverImageURL: body.coverImageURL,
        isPublished: true,
        authorId: user.id,
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
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
