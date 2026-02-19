import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        tags: { include: { tag: true } },
        comments: { orderBy: { createdAt: "desc" } }, // コメントも新しい順で取得
      },
    });

    if (!post) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 },
    );
  }
}
