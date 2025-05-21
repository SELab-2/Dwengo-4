
/* OpenPrompt.tsx */
import React, { useState } from 'react';

interface OpenPromptProps {
  prompt: string;
  answer: string;
}

const OpenPrompt: React.FC<OpenPromptProps> = ({ prompt, answer }) => {
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <p className="font-semibold text-lg">{prompt}</p>
      
      <input
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        disabled={showAnswer}
        className="w-full p-2 border rounded"
      />
      <div className="flex justify-end space-x-2">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="cursor-pointer  px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Show answer
          </button>
        ) : (
          <div className="p-3 bg-green-100 border border-green-400 rounded">
            <p className="text-green-800 font-medium">Correct answer: {answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenPrompt;