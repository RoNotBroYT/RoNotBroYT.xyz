import { PostContent } from "@/components/BlogPostContent";
import prisma from "@/db/prisma";
import { UserData, blogPost } from "@/shared/types";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

async function getUserData(userId: string) {
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

async function getPostData(
  id: string
): Promise<{ post: blogPost; userData: UserData | null }> {
  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const userData = await getUserData(post.userId);

  const formattedPost: blogPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  return { post: formattedPost, userData };
}

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { post, userData } = await getPostData(params.id);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <PostContent post={post} userData={userData} />
      </main>
    </div>
  );
}
