import { NextResponse } from "next/server";
import prisma from "@/db/prisma"; // Adjust this import based on your Prisma client location
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const { userId, content, title } = await request.json();

    const post = await prisma.forumPost.create({
      data: {
        userId,
        content,
        title,
      },
    });

    return NextResponse.json(
      { message: "Post saved successfully", postId: post.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json({ message: "Error saving post" }, { status: 500 });
  }
}
