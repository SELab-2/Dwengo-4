import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreateLPButton: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      className={`
        px-6 py-3 font-bold rounded-lg shadow-md hover:shadow-lg
        text-white bg-dwengo-green hover:bg-dwengo-green-dark
        max-w-xs hover:cursor-pointer
      `}
      onClick={() => {
        navigate('/teacher/learning-paths/create');
      }}
    >
      <div className="flex items-center gap-2 bg-transparent">
        {/* plus Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        {t('learning_paths.create_lp')}
      </div>
    </button>
  );
};

export default CreateLPButton;
