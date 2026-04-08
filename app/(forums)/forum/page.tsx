import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import prisma from "@/db/prisma";
import { formatDistanceToNow } from "date-fns";
import { Clock, Pin, Plus, User } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import React from "react";

interface ForumPost {
  pinned: boolean;
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
}
async function fetchUserData(userId: string) {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/userdata/${userId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
const PostCard: React.FC<{ post: ForumPost }> = async ({ post }) => {
  const userData = await fetchUserData(post.userId);

  return (
    <Link href={`/forum/post/${post.id}`}>
      <Card
        className={`w-full h-64 flex flex-col ${
          post.pinned ? "border-2 border-blue-500" : ""
        }`}
      >
        <CardHeader className="shrink-0 flex justify-between items-center">
          <h2 className="text-xl font-bold truncate">{post.title}</h2>
          {post.pinned && <Pin className="h-5 w-5 text-blue-500" />}
        </CardHeader>
        <CardContent className="grow overflow-hidden">
          <div
            className="text-sm line-clamp-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
        <CardFooter className="shrink-0 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center overflow-hidden">
            <span className="mr-2 truncate">
              By {userData.username || "Unknown User"}
            </span>
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage
                src={userData.image_url || undefined}
                alt={userData.username || "Unknown User"}
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

const Page = async () => {
  const posts = (await prisma.forumPost.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })) as ForumPost[];

  return (
    <>
      <div>
        <Nav />
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-center py-4 text-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-wrap">
            RoNotBroYT forums
          </h1>
          <Button asChild>
            <Link href="forum/create/">
              <Plus /> Create new post
            </Link>
          </Button>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {posts.map((post) => (
              <li key={post.id}>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <PostCard post={post} />
                </React.Suspense>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;
