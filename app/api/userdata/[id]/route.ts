import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
export const dynamic = 'force-dynamic';
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const clerkId = params.id;

  if (!clerkId) {
    return NextResponse.json(
      { message: "Missing required parameter: id" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
