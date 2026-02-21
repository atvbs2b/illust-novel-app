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
    const body = await request.json();

    // 最新のユーザー情報をDBから直接取得する
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );

    // 設定された名前がない場合は、メアドの一部を名前にする
    const penName = user.name || user.email?.split("@")[0] || "名無し";

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        authorName: penName, // 最新のペンネームをセット
        userId: user.id,
        postId: resolvedParams.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("コメントエラー:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
