import type { Metadata } from "next";
import sytles from "@/app/bg.module.css";
export const metadata: Metadata = {
  title: "RoNotBroYT",
  description: "My official website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={sytles.backgroundImage} id="forum">
      {" "}
      {children}{" "}
    </div>
  );
}
