import prisma from "@/db/prisma";
import { Comment, UserData } from "@/shared/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const comments = await prisma.forumComment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: "desc" },
    });

    const userData: UserData[] = await Promise.all(
      comments.map(async (comment: { userId: any }) => {
        const user = await prisma.user.findUnique({
          where: { id: comment.userId },
        });
        return user
          ? {
              id: user.id,
              username: user.username,
              image_url: user.image_url,
              role: user.role as UserData["role"],
            }
          : {
              id: comment.userId,
              username: null,
              image_url: null,
              role: "USER" as const,
            };
      })
    );

    return NextResponse.json({ comments, userData });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, postId } = await req.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: "Content and postId are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.forumComment.create({
      data: {
        content,
        userId,
        postId: postId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
