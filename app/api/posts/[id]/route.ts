import prisma from "@/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    console.log('GET request params:', props.params);
    const postId = props.params.id;
    
    const post = await prisma.forumPost.findUnique({ 
      where: { id: postId },
      include: { comments: true }
    });

    if (!post) {
      console.error(`Post with id ${postId} not found`);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Error in GET method:', error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: Props
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = props.params.id;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && post.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.forumPost.delete({ where: { id: postId } });

    return NextResponse.json(
      { message: "Post and associated comments deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting post:", error);
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Unable to delete post due to existing relationships. Please try again or contact support.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}