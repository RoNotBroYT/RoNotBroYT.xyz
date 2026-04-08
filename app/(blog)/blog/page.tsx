import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import prisma from "@/db/prisma";
import { BlogPost } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Clock, Loader2, User } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import React from "react";

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
const PostCard: React.FC<{ post: BlogPost }> = async ({ post }) => {
  const userData = await fetchUserData(post.userId);
  return (
    <Link href={`/blog/post/${post.id}`}>
      <Card className="w-full h-64 flex flex-col">
        <CardHeader className="shrink-0">
          <h2 className="text-xl font-bold truncate">{post.title}</h2>
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
  const posts = (await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })) as BlogPost[];

  return (
    <>
      <div>
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-center py-4 text-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-wrap">
            Blog{" "}
          </h1>

          <ul className="grid grid-cols-3 gap-4 opacity-70">
            {posts.map((post) => (
              <li key={post.id}>
                <React.Suspense
                  fallback={
                    <div>
                      <Loader2 />
                    </div>
                  }
                >
                  <PostCard post={post} />
                </React.Suspense>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Page;
