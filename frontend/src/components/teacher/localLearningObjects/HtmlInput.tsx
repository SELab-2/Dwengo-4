// src/components/learning-object/HtmlInput.tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
// hernoem de Image-extension
import ImageExtension from '@tiptap/extension-image';

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
      Underline,
      ImageExtension.configure({ allowBase64: true }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // compressie met de globale Image-constructor
  const compressImage = (
    file: File,
    quality = 0.4,
    maxWidth = 600,
    maxHeight = 600
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      // gebruik expliciet de browser-Image
      const img = new window.Image();
      const reader = new FileReader();

      reader.onerror = reject;
      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context error'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/webp',
          quality
        );
      };

      reader.readAsDataURL(file);
    });

  const handleSelectImage = async () => {
    if (!editor) return;
    const file = await new Promise<File | undefined>(res => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => res(input.files?.[0]);
      input.click();
    });
    if (file) {
      try {
        const compressedBlob = await compressImage(file);
        const reader2 = new FileReader();
        reader2.onload = () => {
          editor
            .chain()
            .focus()
            .setImage({ src: reader2.result as string })
            .run();
        };
        reader2.readAsDataURL(compressedBlob);
      } catch (err) {
        console.error('Image compression error:', err);
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">{label}</label>

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
