import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    const { name } = await request.json();

    // 1. ユーザー自身の名前を更新する
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name },
    });

    // 2. この人が過去に書いたコメントの名前も、すべて一括で新しい名前に上書きする！
    const newPenName = name || updatedUser.email?.split("@")[0] || "名無し";
    await prisma.comment.updateMany({
      where: { userId: updatedUser.id },
      data: { authorName: newPenName },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
