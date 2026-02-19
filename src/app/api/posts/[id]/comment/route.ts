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

    const body = await request.json();

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        // 名前が設定されていなければメールアドレスを入れる
        authorName: session.user.name || session.user.email || "名無しさん",
        // @ts-expect-error NextAuthの型定義にidが含まれていないため無視
        userId: session.user.id, // ★ 誰がコメントしたか記録！
        postId: params.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
