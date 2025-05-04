// src/components/learning-object/HtmlInput.tsx

import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/skins/ui/oxide/skin.min.css';

interface HtmlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

const HtmlInput: React.FC<HtmlInputProps> = ({
  value,
  onChange,
  error,
  label = 'Content',
}) => {
  // Base64-upload handler
  const imagesUploadHandler = (blobInfo: any): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result is a data URL (<string>)
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blobInfo.blob());
    });
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">{label}</label>

      <Editor
        value={value}
        init={{
          height: 300,
          menubar: false,
          // toolbar-setup vergelijkbaar met CKEditor
          toolbar: [
            'formatselect |',
            'bold italic underline |',
            'link |',
            'bullist numlist blockquote |',
            'table |',
            'image |',
            'undo redo',
          ].join(' '),
          plugins: [
            'link',
            'lists',
            'table',
            'image',
            'paste',      // voor Base64-paste support
            'help',
          ],
          // Base64-image upload via custom handler
          images_upload_handler: async (blobInfo: any) => {
            const dataUrl = await imagesUploadHandler(blobInfo);
            return { location: dataUrl };
          },
          // Zorg dat pasted images ook als Base64 werken
          paste_data_images: true,
        }}
        onEditorChange={(content) => {
          onChange(content);
        }}
      />

      {error && <div className="text-red-600 mt-1">{error}</div>}
    </div>
  );
};

export default HtmlInput;
