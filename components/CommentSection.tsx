"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Tiptap from "@/components/tiptap";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { DeleteMenu } from "@/components/DeleteMenu";
import { Comment, UserData } from "@/shared/types";

const commentSchema = z.object({
  content: z.string().min(20, { message: "Comment cannot be empty" }),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  initialCommentUserData: UserData[];
}

interface SubmitStatus {
  type: "loading" | "success" | "error" | "";
  message: string;
}

interface ProfanityStatus {
  score?: number;
  error?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialComments,
  initialCommentUserData,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentUserData, setCommentUserData] = useState<UserData[]>(
    initialCommentUserData,
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const [profanityStatus, setProfanityStatus] =
    useState<ProfanityStatus | null>(null);
  const [isCheckingProfanity, setIsCheckingProfanity] = useState(false);
  const { user } = useUser();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

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

  const onSubmit = async (values: CommentFormValues) => {
    if (!user) {
      setSubmitStatus({
        type: "error",
        message: "You must be logged in to comment.",
      });
      return;
    }

    setSubmitStatus({ type: "loading", message: "Checking content..." });

    const contentPassed = await checkProfanity(values.content);

    if (!contentPassed) {
      setSubmitStatus({
        type: "error",
        message:
          "Your comment contains inappropriate content. Please revise and try again.",
      });
      return;
    }

    setSubmitStatus({ type: "loading", message: "Submitting comment..." });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: values.content,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const newCommentData: Comment = await response.json();

      setComments((prevComments) => [newCommentData, ...prevComments]);
      setCommentUserData((prevUserData) => [
        {
          id: user.id,
          username: user.username || "Unknown User",
          image_url: user.imageUrl,
          role: "USER",
        },
        ...prevUserData,
      ]);

      form.reset();
      setSubmitStatus({
        type: "success",
        message: "Comment submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit comment. Please try again.",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId),
      );
      setSubmitStatus({
        type: "success",
        message: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to delete comment. Please try again.",
      });
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <Card className="opacity-70">
        <CardHeader>
          <CardTitle>Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Your Comment
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
              disabled={submitStatus.type === "loading" || isCheckingProfanity}
            >
              {submitStatus.type === "loading" || isCheckingProfanity ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCheckingProfanity
                    ? "Checking content..."
                    : "Submitting..."}
                </>
              ) : (
                "Submit Comment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {submitStatus.type && (
        <Alert
          variant={submitStatus.type === "success" ? "default" : "destructive"}
          className="mt-4"
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
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>High Profanity Score</AlertTitle>
            <AlertDescription>
              Your content has a high profanity score (
              {profanityStatus.score.toFixed(2)}). Please revise before
              submitting.
            </AlertDescription>
          </Alert>
        )}

      <Card className="opacity-70">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {comments.map((comment, index) => {
            const userData = commentUserData[index];
            const canDelete =
              user &&
              (user.id === comment.userId || userData?.role === "ADMIN");

            return (
              <div key={comment.id} className="flex space-x-4">
                <Avatar>
                  <AvatarImage
                    src={userData?.image_url}
                    alt={userData?.username}
                  />
                  <AvatarFallback>
                    {userData?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {userData?.username || "Unknown User"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    {canDelete && (
                      <DeleteMenu
                        onDelete={() => handleDeleteComment(comment.id)}
                      />
                    )}
                  </div>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
