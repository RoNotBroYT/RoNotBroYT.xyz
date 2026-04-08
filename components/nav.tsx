"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Menu, Youtube, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 mx-4">
      <div className="container flex h-14 items-center justify-between rounded-full border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-mono font-bold text-lg">RoNotBroYT</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="hidden md:flex md:gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/game"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Game
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/blog"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Blog
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/forum"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Forum
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="https://discord.gg/8cYecPmJ2N"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Discord
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="https://www.youtube.com/@RoNotBroYT"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    YouTube
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <SignedOut>
              <Link href="/sign-in">
                <Button size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full">
                  Sign Up
                </Button>
              </Link>
                      </SignedOut>
                      <SignedIn>
                    <UserButton />
                  </SignedIn>
          </div>
          <ModeToggle />

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-full"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link
                  href="/game"
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-1 text-lg"
                >
                  Game
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-1 text-lg"
                >
                  Blog
                </Link>
                <Link
                  href="/forum"
                  onClick={() => setIsOpen(false)}
                  className="block px-2 py-1 text-lg"
                >
                  Forum
                </Link>
                <Link
                  href="https://discord.gg/8cYecPmJ2N"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-2 py-1 text-lg"
                >
                  <MessageSquare className="h-5 w-5" />
                  Discord
                </Link>
                <Link
                  href="https://www.youtube.com/@RoNotBroYT"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-2 py-1 text-lg"
                >
                  <Youtube className="h-5 w-5" />
                  YouTube
                </Link>
                <div className="mt-4 flex flex-col gap-2">
                  <SignedOut>
                    <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                      <Button className="w-full rounded-full">Sign Up</Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
