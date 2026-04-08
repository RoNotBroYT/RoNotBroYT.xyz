import { Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className=" p-6 md:py-12  bg-background border-t-2 border-t-gray-950 dark:border-t-slate-200  bottom-0 left-0 max-h-24">
      <div className="container max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <span className="text-lg font-semibold object-bottom">
            {" "}
            RoNotBroYT
          </span>
        </Link>
        <p className="text-[0.00000001rem] text-gray-500 dark:text-gray-400">
          <Link href="https://github.com/brrock/ronotbroyt.xyz">
            <Github />{" "}
          </Link>
        </p>
      </div>
    </footer>
  );
}
