/* MultipleChoiceQuestion.tsx */
import React, { useState, useEffect } from 'react';

interface MultipleChoiceQuestionProps {
  prompt: string;
  options: string[];
  /** Geef de index (0-based) van het gekozen antwoord terug aan de parent */
  onSubmit: (choiceIndex: number) => void;
  /** Optioneel: eerder gemaakte keuze voor deze nodeId */
  initialSelectedIdx?: number;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  prompt,
  options,
  onSubmit,
  initialSelectedIdx,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Bij wijziging van prompt/options én/of initialSelectedIdx:
  useEffect(() => {
    if (initialSelectedIdx !== undefined) {
      // Er is al gekozen voor deze node
      setSelectedIdx(initialSelectedIdx);
      setSubmitted(true);
    } else {
      // Nieuwe vraag, geen keuze
      setSelectedIdx(null);
      setSubmitted(false);
    }
  }, [prompt, options.join('|'), initialSelectedIdx]);

  const handleSelect = (idx: number) => {
    if (!submitted) setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx !== null) {
      setSubmitted(true);
      onSubmit(selectedIdx);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <p className="font-semibold text-lg">{prompt}</p>

      <div className="flex flex-col space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={submitted}
            className={`
              cursor-pointer p-3 text-left border rounded-md transition-colors duration-200
              ${selectedIdx === idx ? 'bg-dwengo-blue text-white' : 'bg-gray-50 hover:bg-gray-100'}
              ${submitted ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedIdx === null}
            className="cursor-pointer px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            Indienen
          </button>
        ) : (
          <p className="text-green-700">
            Je antwoord:&nbsp;
            <strong>{options[selectedIdx!]}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
