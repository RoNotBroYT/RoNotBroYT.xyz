import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";
import { House } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Button asChild variant="outline" className="right-18 fixed top-3">
        <Link href="/">
          <House />
        </Link>
      </Button>
      <Button asChild className="top-3 fixed right-5">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
      <div className="top-3 fixed left-5">
        <ModeToggle />
      </div>
      <SignIn />
    </>
  );
}
