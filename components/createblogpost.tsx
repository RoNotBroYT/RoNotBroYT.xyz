"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

const BlogPostEditor = () => {
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Start writing your blog post here...",
      },
    ],
    uploadFile: async (file: File) => {
      try {
        const filename = encodeURIComponent(file.name);
        const response = await fetch(`/api/upload?filename=${filename}`, {
          method: "POST",
          body: file,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const blob = await response.json();
        return blob.url;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

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
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitStatus({ type: "loading", message: "Saving blog post..." });

    try {
      // Get HTML content from the editor
      const htmlContent = await editor.blocksToHTMLLossy(editor.topLevelBlocks);

      const response = await fetch("/api/blog-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: htmlContent,
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Blog post saved successfully!",
        });
        // Clear the editor and title
        clearEditor();
      } else if (response.status === 403) {
        setSubmitStatus({
          type: "error",
          message: "You do not have permission to create blog posts.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save blog post");
      }
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to save blog post. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearEditor = () => {
    editor.replaceBlocks(editor.topLevelBlocks, [
      {
        type: "paragraph",
        content: "Start writing your blog post here...",
      },
    ]);
    setTitle("");
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to create blog posts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Enter blog post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />
        <BlockNoteView editor={editor}  />
        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Blog Post"
            )}
          </Button>
        </div>
        {submitStatus.type && (
          <Alert
            variant={
              submitStatus.type === "success" ? "default" : "destructive"
            }
            className="mt-4"
          >
            <AlertTitle>
              {submitStatus.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogPostEditor;
