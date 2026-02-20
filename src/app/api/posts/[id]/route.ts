import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// ■ GET: 作品を1つ取得する
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        tags: { include: { tag: true } },
        comments: { orderBy: { createdAt: "desc" } },
        author: { select: { id: true, name: true, email: true } },
        likes: { include: { user: { select: { email: true } } } },
        // ★ 追加：ブックマークした人のデータも一緒に画面へ送る！
        bookmarks: { include: { user: { select: { email: true } } } },
      },
    });

    if (!post)
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });

    let currentUserPenName = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user)
        currentUserPenName = user.name || user.email?.split("@")[0] || "名無し";
    }

    return NextResponse.json({ ...post, currentUserPenName });
  } catch (error) {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}

// ■ PUT: 作品を更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email)
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    const resolvedParams = await params;
    const body = await request.json();
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: { author: true },
    });
    if (!post || post.author?.email !== session.user.email)
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    const updatedPost = await prisma.post.update({
      where: { id: resolvedParams.id },
      data: {
        title: body.title,
        caption: body.caption,
        content: body.content,
        isPublished: body.isPublished,
      },
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

// ■ DELETE: 作品を削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email)
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    const resolvedParams = await params;
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: { author: true },
    });
    if (!post || post.author?.email !== session.user.email)
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    await prisma.post.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
