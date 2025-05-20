import React from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import './HtmlInput.css'; // <-- nieuw

interface HtmlInputProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
  label?: string;
}

// Compress and resize image to maxWidth, return base64 string
const compressImage = (
  file: File,
  maxWidth: number = 400,
  quality: number = 0.3
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const blobReader = new FileReader();
              blobReader.readAsDataURL(blob);
              blobReader.onloadend = () => {
                resolve(blobReader.result as string);
              };
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });

// Custom image handler for Quill
function imageHandler(this: any) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 400, 0.2);
      const quill = this.quill;
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', dataUrl, 'user');
      quill.setSelection(range.index + 1);
    } catch (error) {
      console.error('Image compression error:', error);
    }
  };
  input.click();
}

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {
      image: imageHandler,
    },
  },
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
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

      {/* Uitleg voor gebruikers hoe de editor te gebruiken */}
      <p className="text-sm text-gray-600 mb-2">
        Gebruik de toolbar bovenin om je tekst op te maken: selecteer <strong>Heading 1</strong> of <strong>Heading 2</strong> voor koppen,
        maak woorden <strong>vet</strong>, <em>schuin</em> of <u>onderstreept</u>, en maak ordered of bullet-lijsten.
        Met de link-knop voeg je eenvoudig URL’s toe, en de <em>Clean</em>-knop verwijdert alle opmaak in één keer.
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Klik op de afbeelding-knop om een bestand te kiezen. De editor comprimeert en schaalt je afbeelding automatisch
        naar maximaal 400px breedte en voegt het plaatje direct in als base64-URL. Zo maak je snel visueel rijke content!
      </p>

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
