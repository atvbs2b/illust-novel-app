import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );

    // すでにブクマしているかチェック
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
    } else {
      await prisma.bookmark.create({
        data: { postId: resolvedParams.id, userId: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      isBookmarked: !existingBookmark,
    });
  } catch (error) {
    console.error("ブクマエラー:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
