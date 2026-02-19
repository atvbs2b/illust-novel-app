import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic"; // ◀ 〃

export async function GET(
  request: Request,
  // ★ 型定義を Promise に変更
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ★ ここが最新ルール！ params を使う前に await して中身を取り出す
    const resolvedParams = await params;

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id }, // ★ 取り出した resolvedParams を使う
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          include: {
            tags: { include: { tag: true } },
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

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
