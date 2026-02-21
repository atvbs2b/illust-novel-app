"use client";

import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookMedical } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Header: React.FC = () => {
  // ログイン状態を取得
  const { data: session, status } = useSession();

  return (
    <header>
      <div className="bg-pink-200 py-2 shadow-sm">
        <div
          className={twMerge(
            "mx-4 max-w-2xl md:mx-auto",
            "flex items-center justify-between",
            "text-lg font-bold text-white",
          )}
        >
          {/* 左側：サイトロゴ */}
          <Link href="/" className="transition-colors hover:text-slate-300">
            <FontAwesomeIcon icon={faBookMedical} className="mr-1" />
            Novelplus
          </Link>

          {/* 右側：ナビゲーションとログインボタン */}
          <div className="flex items-center gap-4 text-sm md:text-base">
            {/* ログイン状態による表示の切り替え */}
            {status === "loading" ? (
              <span className="text-sm text-white/70">...</span>
            ) : session ? (
              // ログイン中
              <>
                <Link
                  href="/mypage"
                  className="text-xs font-bold text-white transition-colors hover:text-pink-200 md:text-sm"
                >
                  マイページ
                </Link>
                <Link
                  href="/settings"
                  className="rounded bg-white/30 px-2 py-1 text-xs transition-colors hover:bg-white/50 md:text-sm"
                >
                  {session.user?.name || session.user?.email?.split("@")[0]}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="transition-colors hover:text-slate-300"
                >
                  ログアウト
                </button>
              </>
            ) : (
              // 未ログイン
              <>
                <Link
                  href="/register"
                  className="transition-colors hover:text-slate-300"
                >
                  新規登録
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="rounded bg-white/20 px-3 py-1 transition-colors hover:bg-white/30"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
