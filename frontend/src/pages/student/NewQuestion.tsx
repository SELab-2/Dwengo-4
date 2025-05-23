import PrimaryButton from '@/components/shared/PrimaryButton';
import { createNewQuestion } from '@/util/student/questions';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const NewQuestion = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const [error] = useState<string | null>(null);
  const [success] = useState(false);
  const [dwengoLanguage, setDwengoLanguage] = useState('en');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frontendresp = await createNewQuestion(
      assignmentId,
      title,
      text,
      dwengoLanguage,
    );
    console.log('frontendresp', await frontendresp);
    navigate(`/student/question/${frontendresp.questionGen.questionId}`);
  };
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-3xl mb-2">{t('questions.ask_question')}</p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {t('questions.form.success')}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-1 font-medium">
            {t('questions.form.title')}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="text" className="block mb-1 font-medium">
            {t('questions.form.question')}
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            required
          />
        </div>

        <div className="mb-6 space-y-2">
          <div className="mt-4">
            <label htmlFor="language" className="block mb-1 font-medium">
              {t('questions.form.languages.label')}
            </label>
            <select
              id="language"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="en"
              onChange={(e) => {
                setDwengoLanguage(e.target.value);
              }}
            >
              <option value="nl">{t('questions.form.languages.nl')}</option>
              <option value="en">{t('questions.form.languages.en')}</option>
              <option value="fr">{t('questions.form.languages.fr')}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border text-gray-700 hover:cursor-pointer rounded-md"
          >
            {t('questions.form.back')}
          </button>
          <PrimaryButton>{t('questions.form.submit')}</PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default NewQuestion;
