"use client";

import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDog } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; // ★追加

const Header: React.FC = () => {
  // ★追加：ログイン状態を取得
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
          {/* 左側：サイトロゴ（既存のまま） */}
          <Link href="/" className="transition-colors hover:text-slate-300">
            <FontAwesomeIcon icon={faDog} className="mr-1" />
            偽Pixiv
          </Link>

          {/* 右側：ナビゲーションとログインボタン */}
          <div className="flex items-center gap-4 text-sm md:text-base">
            {/* 既存のAboutリンク */}
            <Link
              href="/about"
              className="transition-colors hover:text-slate-300"
            >
              About
            </Link>

            {/* ★ここから追加：ログイン状態による表示の切り替え */}
            {status === "loading" ? (
              <span className="text-sm text-white/70">...</span>
            ) : session ? (
              // ログイン中
              <>
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
