// src/components/learning-object/HtmlInput.tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';  // <-- import

interface HtmlInputProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  label?: string;
}

const HtmlInput: React.FC<HtmlInputProps> = ({
  value,
  onChange,
  error,
  label = 'Content',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,                          // <-- hier toevoegen
      Image.configure({ allowBase64: true }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const handleSelectImage = async () => {
    if (!editor) return;
    const file = await new Promise<File | undefined>((res) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => res(input.files?.[0]);
      input.click();
    });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">{label}</label>

      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()} 
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          onClick={handleSelectImage}
        >
          Image
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="border rounded p-2 min-h-[200px]"
      />

      {error && <div className="text-red-600 mt-1">{error}</div>}
    </div>
  );
};

export default HtmlInput;
