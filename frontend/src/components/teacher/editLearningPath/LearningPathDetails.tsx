import React, { useImperativeHandle, useState } from 'react';
import { useLPEditContext } from '../../../context/LearningPathEditContext';
import { useTranslation } from 'react-i18next';

// note how language isn't in here, this is because it gets automatically deduced from the learning objects
// LearningPathEditContext.tsx contains the logic to set the language
export interface LearningPathDetailsRef {
  title: string;
  description: string;
  image: string | null;
  validateInput: () => boolean;
}

interface LearningPathDetailsProps {
  pathDetailsRef: React.RefObject<LearningPathDetailsRef | null>;
  initialTitle?: string;
  initialDescription?: string;
  initialImage?: string | null;
}

export const LearningPathDetails: React.FC<LearningPathDetailsProps> = ({
  pathDetailsRef,
  initialTitle,
  initialDescription,
  initialImage,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState<string>(initialTitle || '');
  const [description, setDescription] = useState<string>(
    initialDescription || '',
  );
  const [image, setImage] = useState<string | null>(initialImage || null); // TODO
  const [isValid, setIsValid] = useState<boolean>(true);
  const { language } = useLPEditContext();

  useImperativeHandle(
    pathDetailsRef,
    () => ({
      title,
      description,
      image,
      validateInput: () => {
        const valid = !!title;
        setIsValid(valid);
        return valid;
      },
    }),
    [title, description, image],
  );

  return (
    <div className="pl-1 space-y-1">
      {/* LP title*/}
      <input
        placeholder={t('edit_learning_path.lp_details.add_title')}
        value={title}
        onChange={(e) => setTitle(e.target.value.trimStart())}
        className={`
            w-full hover:bg-gray-50 focus:bg-white transition-all text-2xl p-1 focus:outline-none
            ${!title ? 'bg-white' : 'bg-transparent'}
            ${
              !title && !isValid
                ? 'border-red-500 border-2 placeholder-red-300'
                : `border-gray-300 focus:ring-1 focus:ring-gray-200 hover:border-gray-300 
                  ${title ? 'border-transparent focus:border-gray-300' : 'border-gray-300'}`
            }
          `}
      />

      {/* LP description */}
      <textarea
        id="description"
        name="description"
        onChange={(e) => setDescription(e.target.value.trimStart())}
        value={description}
        placeholder={t('edit_learning_path.lp_details.add_description')}
        spellCheck="false"
        className={`
            w-full hover:bg-gray-50 focus:bg-white transition-all
            focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm p-1 hover:border-gray-300
            ${description ? 'border-transparent focus:hover:border-gray-300 bg-transparent' : 'border-gray-300 bg-white'}
          `}
      ></textarea>

      {/* language information with explanation */}
      <div className="mt-2 pt-1 border-t border-gray-100 cursor-default">
        <div className="flex items-center text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span className="font-medium">
            {t('edit_learning_path.lp_details.language')}
          </span>
          {language ? (
            <span className="ml-1 bg-blue-50 text-dwengo-blue-dark px-1.5 py-0.5 rounded text-xs font-medium">
              {language}
            </span>
          ) : (
            <span className="ml-1 bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-xs">
              {t('edit_learning_path.lp_details.language_not_set')}
            </span>
          )}
        </div>

        {!language && (
          <p className="text-xs text-gray-400 mt-1 italic">
            {t('edit_learning_path.lp_details.language_info')}
          </p>
        )}
      </div>
    </div>
  );
};
