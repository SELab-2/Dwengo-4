// src/components/learning-object/HtmlInput.tsx

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// import de Base64‑adapter
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';

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
}) => (
  <div className="mb-6">
    <label className="block mb-2 font-medium">{label}</label>

    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_, editor) => {
        onChange(editor.getData());
      }}
      config={{
        // voeg de Base64UploadAdapter toe
        extraPlugins: [ Base64UploadAdapter ],
        toolbar: [
          'heading', '|',
          'bold','italic','underline','link',
          'bulletedList','numberedList','blockQuote','|',
          'insertTable','imageUpload','undo','redo',
        ],
        // voor Base64-adapter is verder geen uploadUrl nodig
      }}
    />

    {error && <div className="text-red-600 mt-1">{error}</div>}
  </div>
);

export default HtmlInput;
