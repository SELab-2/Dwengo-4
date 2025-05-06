import React, { useImperativeHandle, useState } from 'react';

export interface LearningPathDetailsRef {
  title: string;
  description: string;
  language: string;
  image: string | null;
  validateInput: () => boolean;
}

interface LearningPathDetailsProps {
  pathDetailsRef: React.RefObject<LearningPathDetailsRef | null>;
  initialTitle?: string;
  initialDescription?: string;
  initialLanguage?: string;
  initialImage?: string | null;
}

export const LearningPathDetails: React.FC<LearningPathDetailsProps> = ({
  pathDetailsRef,
  initialTitle,
  initialDescription,
  initialLanguage,
  initialImage,
}) => {
  const [title, setTitle] = useState<string>(initialTitle || '');
  const [language, setLanguage] = useState<string>(initialLanguage || 'nl'); // todo: default to currently selected language
  const [description, setDescription] = useState<string>(
    initialDescription || '',
  );
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isValid, setIsValid] = useState<boolean>(true);

  useImperativeHandle(
    pathDetailsRef,
    () => ({
      title,
      language,
      description,
      image,
      validateInput: () => {
        setIsValid(!!title && !!language);
        return isValid;
      },
    }),
    [title, language, description, image],
  );

  return (
    <div className="pl-1 space-y-1">
      <input
        placeholder="Add learning path title"
        value={title}
        onChange={(e) => setTitle(e.target.value.trimStart())}
        className={`
            w-full bg-gray-50 hover:bg-gray-50 focus:bg-white transition-all text-xl p-1 focus:outline-none
            ${
              !title && !isValid
                ? 'border-red-500 border-2 placeholder-red-300'
                : `border-gray-300 focus:ring-1 focus:ring-gray-200 hover:border-gray-300 
                  ${title ? 'border-transparent focus:border-gray-300' : 'border-gray-300'}`
            }
          `}
      />
      <textarea
        id="description"
        name="description"
        onChange={(e) => setDescription(e.target.value.trimStart())}
        value={description}
        placeholder="Add a description (optional)"
        className={`
            w-full bg-gray-50 hover:bg-gray-50 focus:bg-white transition-all
            focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm p-1 hover:border-gray-300
            ${description ? 'border-transparent focus:hover:border-gray-300' : 'border-gray-300'}
          `}
      ></textarea>
    </div>
  );
};
