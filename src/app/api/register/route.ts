import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 既に登録されていないかチェック
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return NextResponse.json({ error: "登録済みです" }, { status: 400 });

    // パスワードを暗号化（ハッシュ化）
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "エラー" }, { status: 500 });
  }
}
