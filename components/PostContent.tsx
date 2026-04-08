"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Clock, CornerUpLeft, MessageSquare, UserIcon } from "lucide-react";
import { Post, UserData } from "@/shared/types";
import { DeleteMenu } from "@/components/DeleteMenu";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface PostContentProps {
  post: Post;
  userData: UserData | null;
}

export function PostContent({ post, userData }: PostContentProps) {
  const { user } = useUser();
  const router = useRouter();

  const canDelete =
    user && (user.id === post.userId || userData?.role === "ADMIN");

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      router.push("/forum"); // Redirect to forum home after successful deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <>
      <h2 className="text-left">
        <Link href="/forum">
          <CornerUpLeft /> Back to Forum home
        </Link>
      </h2>
      <Card className="w-full max-w-2xl mx-auto mb-8 opacity-70">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            {canDelete && <DeleteMenu onDelete={handleDeletePost} />}
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={userData?.image_url || ""}
                alt={userData?.username || "Unknown User"}
              />
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {userData?.username || "Unknown User"}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-left"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{post.comments.length} comments</span>
          </div>
          <span className="text-sm text-gray-500">
            Last updated:{" "}
            {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
          </span>
        </CardFooter>
      </Card>
    </>
  );
}
