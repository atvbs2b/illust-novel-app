import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        // ① 自分が投稿した作品
        posts: {
          orderBy: { createdAt: "desc" },
          include: {
            tags: { include: { tag: true } },
            _count: {
              select: { likes: true, comments: true, bookmarks: true },
            },
          },
        },
        // ② 自分がブックマークした作品
        bookmarks: {
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              include: {
                tags: { include: { tag: true } },
                author: { select: { id: true, name: true, email: true } },
                _count: {
                  select: { likes: true, comments: true, bookmarks: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    // ブックマークデータから「作品(post)」だけを綺麗に抜き出す
    const bookmarkedPosts = user.bookmarks.map((b) => b.post);

    // 自分の作品とブクマした作品をセットにして返す
    return NextResponse.json({
      myPosts: user.posts,
      bookmarkedPosts: bookmarkedPosts,
    });
  } catch (error) {
    console.error("マイページ取得エラー:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
