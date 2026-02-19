import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // ★ ログイン状態をチェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    // 自分の userId も一緒に保存するように変更
    await prisma.like.create({
      data: {
        postId: params.id,
        // @ts-expect-error NextAuthの型定義にidが含まれていないため無視
        userId: session.user.id, // ★ 誰がいいねしたか記録！
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
