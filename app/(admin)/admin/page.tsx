"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";
import BlogPostEditor from "@/components/createblogpost";
export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userResponse = await fetch("/api/user");
        const userData = await userResponse.json();

        if (userData.error) {
          throw new Error(userData.error);
        }

        const userDataResponse = await fetch(
          `/api/userdata/${userData.userId}`,
        );
        const userDataJson = await userDataResponse.json();

        setIsAdmin(userDataJson.role === "ADMIN");
        // setIsAdmin(true);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Admin Panel <ModeToggle />
      </h1>
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="blogposts">Blog Posts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <h2 className="text-xl font-semibold">Not Implemted </h2>
        </TabsContent>
        <TabsContent value="blogposts">
          <h2 className="text-xl font-semibold">Blog Posts Content</h2>
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create a New Blog Post</h1>
            <BlogPostEditor />
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <h2 className="text-xl font-semibold">Not Implemted </h2>
        </TabsContent>
      </Tabs>
    </div>
  );
}
