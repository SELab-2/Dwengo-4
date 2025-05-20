/* MultipleChoiceQuestion.tsx */
import React, { useState } from 'react';

interface MultipleChoiceQuestionProps {
    prompt: string;
    options: string[];
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ prompt, options }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (option: string) => {
        if (!submitted) setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (selectedOption) {
            setSubmitted(true);
        }
    };

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <p className="font-semibold text-lg">{prompt}</p>
            <div className="flex flex-col space-y-2">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(opt)}
                        disabled={submitted}
                        className={`cursor-pointer 
              p-3 text-left border rounded-md transition-colors duration-200
              ${selectedOption === opt ? 'bg-dwengo-blue text-white' : 'bg-gray-50 hover:bg-gray-100'}
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
                        disabled={!selectedOption}
                        className="cursor-pointer  px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                    >
                        Indienen
                    </button>
                ) : (
                    <p className="text-green-700">Je antwoord: <strong>{selectedOption}</strong></p>
                )}
            </div>
        </div>
    );
};

export default MultipleChoiceQuestion;
