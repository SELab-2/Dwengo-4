// src/components/learning-object/HtmlInput.tsx
import React from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';



interface HtmlInputProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  label?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image',
];

const HtmlInput: React.FC<HtmlInputProps> = ({
  value,
  onChange,
  error,
  label = 'Content',
}) => {
  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">{label}</label>
      <div className="border rounded">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          className="min-h-[200px] bg-white"
        />
      </div>
      {error && <p className="text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default HtmlInput;
