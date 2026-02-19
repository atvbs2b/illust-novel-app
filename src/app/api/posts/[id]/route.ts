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
        comments: { orderBy: { createdAt: "desc" } },
        // ★ ここで作者の id, name, email を一緒に取得するようにします！
        author: { select: { id: true, name: true, email: true } },
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
