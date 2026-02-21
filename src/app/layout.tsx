import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import Header from "@/app/_components/Header";
import { AuthProvider } from "./Providers";

const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novelplus",
  description:
    "Novelplusはオリジナルの小説、夢小説、ゲームブックを投稿・閲覧できるサイトです。小説家志望の方も、気軽に楽しみたい方も大歓迎！タグやランキングで好みの作品を見つけてください。",
};

type Props = {
  children: React.ReactNode;
};

const RootLayout: React.FC<Props> = (props) => {
  const { children } = props;
  return (
    <html lang="ja">
      <body
        className={`${zenMaru.className} min-h-screen bg-pink-50 text-stone-500`}
      >
        <AuthProvider>
          <Header />
          <div className="mx-4 mt-2 max-w-2xl md:mx-auto">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
