"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import Tiptap from "@/components/tiptap";
import { UserButton } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CornerUpLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitStatus {
  type: "loading" | "success" | "error" | "";
  message: string;
}

interface ProfanityStatus {
  score?: number;
  error?: string;
}

const ForumPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const [profanityStatus, setProfanityStatus] =
    useState<ProfanityStatus | null>(null);
  const [isCheckingProfanity, setIsCheckingProfanity] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUserId(data.userId);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const checkProfanity = async (text: string): Promise<boolean> => {
    setIsCheckingProfanity(true);
    try {
      const res = await fetch("https://vector.profanity.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Failed to check profanity");
      }

      const data: ProfanityStatus = await res.json();
      setProfanityStatus(data);
      return data.score !== undefined && data.score < 1;
    } catch (error) {
      console.error("Error checking profanity:", error);
      setProfanityStatus({ error: "Failed to check profanity" });
      return false;
    } finally {
      setIsCheckingProfanity(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      console.error("User not found");
      return;
    }

    setSubmitStatus({ type: "loading", message: "Checking content..." });

    const titlePassed = await checkProfanity(values.title);
    const contentPassed = await checkProfanity(values.content);

    if (!titlePassed || !contentPassed) {
      setSubmitStatus({
        type: "error",
        message:
          "Your post contains inappropriate content. Please revise and try again.",
      });
      return;
    }

    setSubmitStatus({ type: "loading", message: "Submitting post..." });

    try {
      const response = await fetch("/api/save-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: values.title,
          content: values.content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Post saved successfully:", result);
        form.reset();
        setSubmitStatus({
          type: "success",
          message: "Post submitted successfully!",
        });
      } else {
        throw new Error("Failed to save post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit post. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>Please sign in to create a post.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Nav /> <ModeToggle />
      <UserButton />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-left">
            {" "}
            <Link href="/forum">
              <CornerUpLeft /> Back to Forum home{" "}
            </Link>
          </h2>
          <h1 className="text-2xl font-bold text-center">Create a New Post</h1>
          <div className="flex items-center space-x-4"></div>
        </div>

        <Card className="max-w-2xl mx-auto opacity-70">
          <CardHeader>
            <CardTitle className="text-center">New Forum Post</CardTitle>
          </CardHeader>
          <CardContent className="">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  {...form.register("title")}
                  placeholder="Enter post title"
                  className="w-full"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Tiptap
                  content={form.watch("content")}
                  setContent={(content) => form.setValue("content", content)}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  submitStatus.type === "loading" || isCheckingProfanity
                }
              >
                {submitStatus.type === "loading" || isCheckingProfanity ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingProfanity
                      ? "Checking content..."
                      : "Submitting..."}
                  </>
                ) : (
                  "Submit Post"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {submitStatus.type && (
          <Alert
            variant={
              submitStatus.type === "success" ? "default" : "destructive"
            }
            className="mt-4 max-w-2xl mx-auto"
          >
            <AlertTitle>
              {submitStatus.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        {profanityStatus &&
          profanityStatus.score !== undefined &&
          profanityStatus.score >= 1 && (
            <Alert variant="destructive" className="mt-4 max-w-2xl mx-auto">
              <AlertTitle>High Profanity Score</AlertTitle>
              <AlertDescription>
                Your content has a high profanity score (
                {profanityStatus.score.toFixed(2)}). Please revise before
                submitting.
              </AlertDescription>
            </Alert>
          )}
      </div>
      <Footer />
    </>
  );
};

export default ForumPage;
