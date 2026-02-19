import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request) {
  try {
    // ログインしているかチェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    // 送られてきた新しい名前を受け取る
    const { name } = await request.json();

    // データベースの User を更新する
    // @ts-expect-error NextAuthの型定義にidが含まれていないため無視
    const userId = session.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
