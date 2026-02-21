import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // ★ Promise対応
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

    // 確実にユーザーIDを取得する
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );

    // すでに「いいね」しているかチェック
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: resolvedParams.id,
        userId: user.id,
      },
    });

    if (existingLike) {
      // すでにある場合は削除（いいね解除）
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      // ない場合は作成（いいね追加）
      await prisma.like.create({
        data: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      });
    }

    // 最新のいいね数を数え直して返す
    const likeCount = await prisma.like.count({
      where: { postId: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      likeCount,
      hasLiked: !existingLike,
    });
  } catch (error) {
    console.error("いいねエラー:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
