import { CommentSection } from "@/components/CommentSection";
import { Nav } from "@/components/nav";
import { PostContent } from "@/components/PostContent";
import prisma from "@/db/prisma";
import { Post, UserData } from "@/shared/types";
import { headers } from "next/headers";
import { Suspense } from "react";

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

async function getPostData(id: string): Promise<{
  post: Post;
  userData: UserData | null;
  commentUserData: UserData[];
}> {
  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Fetch post author data
  const postAuthor = await fetchUserData(post.userId);

  // Convert Date objects to strings
  const formattedPost: Post = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  const userData: UserData | null = postAuthor
    ? {
        id: postAuthor.id,
        username: postAuthor.username,
        image_url: postAuthor.image_url,
        role: postAuthor.role,
      }
    : null;

  // Fetch comment authors data
  const commentUserData = await Promise.all(
    formattedPost.comments.map(async (comment) => {
      const user = await fetchUserData(comment.userId);
      return user
        ? {
            id: user.id,
            username: user.username,
            image_url: user.image_url,
            role: user.role,
          }
        : {
            id: comment.userId,
            username: "Unknown User",
            image_url: null,
            role: "USER" as const,
          };
    })
  );

  return { post: formattedPost, userData, commentUserData };
}

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { post, userData, commentUserData } = await getPostData(params.id);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading post content...</div>}>
          <PostContent post={post} userData={userData} />
        </Suspense>
        <Suspense fallback={<div>Loading comments...</div>}>
          <CommentSection
            postId={params.id}
            initialComments={post.comments}
            initialCommentUserData={commentUserData}
          />
        </Suspense>
      </main>
    </div>
  );
}
