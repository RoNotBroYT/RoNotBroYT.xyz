import prisma from "./prisma";

export async function createUser(user: {
  clerkId: string;
  email: string;
  username: string | null;
  image_url: string;
}) {
  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        image_url: user.image_url,
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUser(
  clerkId: string,
  user: {
    username: string | null;
    image_url: string;
  },
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        username: user.username,
        image_url: user.image_url,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { clerkId },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
}
