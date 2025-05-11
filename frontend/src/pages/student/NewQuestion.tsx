import PrimaryButton from '@/components/shared/PrimaryButton';
import { createNewQuestion } from '@/util/student/questions';
import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-3xl mb-2">Stel een vraag</p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          Question created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-1 font-medium">
            Titel
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
            Vraag
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
              Taal
            </label>
            <select
              id="language"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="en"
              onChange={(e) => {
                setDwengoLanguage(e.target.value);
              }}
            >
              <option value="nl">Nederlands</option>
              <option value="en">Engels</option>
              <option value="fr">Frans</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border text-gray-700 hover:cursor-pointer rounded-md"
          >
            Ga terug
          </button>
          <PrimaryButton>Stel Vraag</PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default NewQuestion;
