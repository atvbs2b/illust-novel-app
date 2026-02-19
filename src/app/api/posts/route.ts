import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 0;
export const dynamic = "force-dynamic"; // ★ 追加：常に最新のデータを取得する！

// ■ GET: 記事一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const tagFilter = searchParams.get("tag");

    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        ...(typeFilter && typeFilter !== "ALL"
          ? { type: typeFilter as never }
          : {}),
        ...(tagFilter ? { tags: { some: { tag: { name: tagFilter } } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

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
