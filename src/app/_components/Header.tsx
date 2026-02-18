"use client";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDog } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header>
      <div className="bg-pink-200 py-2">
        <div
          className={twMerge(
            "mx-4 max-w-2xl md:mx-auto",
            "flex items-center justify-between",
            "text-lg font-bold text-white",
          )}
        >
          <Link href="/" className="hover:text-slate-300">
            <FontAwesomeIcon icon={faDog} className="mr-1" />
            偽Pixiv
          </Link>

          <Link href="/about" className="hover:text-slate-300">
            About
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
