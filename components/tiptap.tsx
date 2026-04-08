"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Send } from "lucide-react";

const extensions = [StarterKit, TextStyle, Color];

interface TipTapProps {
  content: string;
  setContent: (content: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  submitLabel?: string;
}

const TipTap: React.FC<TipTapProps> = ({
  content,
  setContent,
  onSubmit,
  placeholder = "Write something...",
  submitLabel = "Submit",
}) => {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-hidden",
      },
    },
    placeholder,
  });

  if (!editor) {
    return null;
  }

  interface ControlButtonProps {
    onClick: () => void;
    isActive: boolean;
    icon: React.ElementType;
    label: string;
  }

  const ControlButton: React.FC<ControlButtonProps> = ({
    onClick,
    isActive,
    icon: Icon,
    label,
  }) => (
    <Button
      onClick={onClick}
      variant={isActive ? "secondary" : "outline"}
      size="icon"
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="mt-4 border p-4">
      <div className="mb-2 flex gap-2">
        <ControlButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          label="Bold"
        />
        <ControlButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          label="Italic"
        />
      </div>
      <EditorContent editor={editor} />
      {onSubmit && (
        <div className="mt-2 flex justify-end">
          <Button onClick={onSubmit} disabled={!content.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TipTap;
