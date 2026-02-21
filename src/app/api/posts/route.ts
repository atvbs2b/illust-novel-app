import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// ★ 修正3: Prismaが生成した型「PostType」をインポートする
import { PostType } from "@prisma/client";

export const dynamic = "force-dynamic";

type OrderByOption = { createdAt: "desc" } | { likes: { _count: "desc" } };

// ■ GET: 記事一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const tagFilter = searchParams.get("tag");
    const sortFilter = searchParams.get("sort");

    let orderByQuery: OrderByOption = { createdAt: "desc" };
    if (sortFilter === "popular") {
      orderByQuery = { likes: { _count: "desc" } };
    }

    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        // ★ 修正4：as string を as PostType に変更！
        ...(typeFilter && typeFilter !== "ALL"
          ? { type: typeFilter as PostType }
          : {}),
        ...(tagFilter ? { tags: { some: { tag: { name: tagFilter } } } } : {}),
      },
      orderBy: orderByQuery,
      include: {
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
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
        // ★ POST側も一応 as PostType をつけておくと安全です
        type: body.type as PostType,
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
