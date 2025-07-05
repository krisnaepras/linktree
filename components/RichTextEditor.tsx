"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useCallback } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "Mulai menulis artikel..."
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline hover:text-blue-800"
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg"
                }
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            Color.configure({ types: [TextStyle.name] }),
            TextStyle,
            Highlight.configure({
                multicolor: true
            }),
            Underline,
            Subscript,
            Superscript
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900"
            }
        }
    });

    const addImage = useCallback(() => {
        const url = window.prompt("Masukkan URL gambar:");
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes("link").href;
        const url = window.prompt("Masukkan URL:", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor
            ?.chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Text Formatting Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Format
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                            disabled={
                                !editor.can().chain().focus().toggleBold().run()
                            }
                            className={`px-2 py-1 text-sm font-bold transition-colors ${
                                editor.isActive("bold")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Bold (Ctrl+B)"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleItalic()
                                    .run()
                            }
                            className={`px-2 py-1 text-sm italic transition-colors ${
                                editor.isActive("italic")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Italic (Ctrl+I)"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                            className={`px-2 py-1 text-sm underline transition-colors ${
                                editor.isActive("underline")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Underline (Ctrl+U)"
                        >
                            U
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleStrike()
                                    .run()
                            }
                            className={`px-2 py-1 text-sm line-through transition-colors ${
                                editor.isActive("strike")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Strikethrough"
                        >
                            S
                        </button>
                    </div>

                    {/* Headings Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Heading
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run()
                            }
                            className={`px-2 py-1 text-sm font-bold transition-colors ${
                                editor.isActive("heading", { level: 1 })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Heading 1"
                        >
                            H1
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                            className={`px-2 py-1 text-sm font-bold transition-colors ${
                                editor.isActive("heading", { level: 2 })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Heading 2"
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                            className={`px-2 py-1 text-sm font-bold transition-colors ${
                                editor.isActive("heading", { level: 3 })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Heading 3"
                        >
                            H3
                        </button>
                    </div>

                    {/* Lists Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Lists
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive("bulletList")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Bullet List"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive("orderedList")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Numbered List"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                <circle cx="1.5" cy="4" r="1.5" />
                                <circle cx="1.5" cy="10" r="1.5" />
                                <circle cx="1.5" cy="16" r="1.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Text Alignment Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Align
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("left")
                                    .run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive({ textAlign: "left" })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Align Left"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("center")
                                    .run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive({ textAlign: "center" })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Align Center"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 16a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("right")
                                    .run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive({ textAlign: "right" })
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Align Right"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 8a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM11 16a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" />
                            </svg>
                        </button>
                    </div>

                    {/* Insert Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Insert
                        </div>
                        <button
                            type="button"
                            onClick={setLink}
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive("link")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Add Link"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={addImage}
                            className="px-2 py-1 text-sm transition-colors text-gray-700 hover:bg-gray-100"
                            title="Add Image"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Special Group */}
                    <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-l-md border-r border-gray-200">
                            Special
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleHighlight().run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive("highlight")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Highlight"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path
                                    fillRule="evenodd"
                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                            className={`px-2 py-1 text-sm transition-colors ${
                                editor.isActive("blockquote")
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Quote"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                            className="px-2 py-1 text-sm transition-colors text-gray-700 hover:bg-gray-100"
                            title="Horizontal Rule"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="bg-white">
                <EditorContent
                    editor={editor}
                    className="rich-text-editor min-h-[400px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900"
                />
            </div>
        </div>
    );
}
