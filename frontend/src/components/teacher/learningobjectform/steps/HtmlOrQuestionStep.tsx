import React, { useEffect } from 'react';
import HtmlInput from './HtmlInput';
import { FormStepProps } from '../types';
import { ContentType } from '../../../../util/teacher/localLearningObjects';

const HtmlOrQuestionStep: React.FC<FormStepProps> = ({
  isEdit,
  isHtmlLoading,
  htmlFetchError,
  isQuestionType,
  step1Data,
  rawHtml,
  setRawHtml,
  rawHtmlError,
  questionState,
  setQuestionState,
}) => {
  useEffect(() => {
    try {
      const parsed = JSON.parse(rawHtml);
      if (parsed && typeof parsed.prompt === 'string') {
        if (Array.isArray(parsed.options) && isQuestionType(step1Data.contentType)) {
          // Multiple choice vraag
          setQuestionState({
            prompt: parsed.prompt,
            options: parsed.options,
            answer: parsed.answer || ""
          });
        } else if (typeof parsed.answer === 'string' && isQuestionType(step1Data.contentType)) {
          // Open prompt vraag
          setQuestionState({
            prompt: parsed.prompt,
            answer: parsed.answer || "",
            options: [],
          });
        } else {
          // Niet langer een vraag-type
          setRawHtml('');
        }
      }
    } catch {
      // parse-fout negeren
    }
  }, [rawHtml, step1Data.contentType, isQuestionType, setQuestionState, setRawHtml]);

  return (
    <>
      <h3 className="text-xl font-medium">
        {isQuestionType(step1Data.contentType)
          ? 'Question Content'
          : 'HTML Content'}
      </h3>

      {isEdit && isHtmlLoading && <div>Content loading…</div>}
      {isEdit && htmlFetchError && (
        <div className="text-red-600">
          Could not load HTML: {String(htmlFetchError)}
        </div>
      )}

      {!isQuestionType(step1Data.contentType) ? (
        <HtmlInput value={rawHtml} onChange={setRawHtml} error={rawHtmlError} />
      ) : (
        <>
          {/* Vraag prompt */}
          <div>
            <label className="block mb-1 font-medium">Question Prompt</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={questionState.prompt}
              onChange={(e) =>
                setQuestionState((s) => ({ ...s, prompt: e.target.value }))
              }
              placeholder="Enter your question prompt"
            />
          </div>

          {/* Multiple choice opties */}
          {step1Data.contentType === ContentType.EVAL_MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <label className="block mb-1 font-medium">Question Answers</label>

              {questionState.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 border rounded p-2"
                    value={opt}
                    onChange={(e) => {
                      const opts = [...questionState.options];
                      opts[i] = e.target.value;
                      setQuestionState((s) => ({ ...s, options: opts }));
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => {
                      const opts = questionState.options.filter(
                        (_, idx) => idx !== i
                      );
                      setQuestionState((s) => ({ ...s, options: opts }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600"
                onClick={() =>
                  setQuestionState((s) => ({
                    ...s,
                    options: [...s.options, ''],
                  }))
                }
              >
                + Add Option
              </button>

              {(questionState.options.filter((o) => o.trim()).length < 2 ||
                questionState.options.some((o) => !o.trim())) && (
                  <div className="text-red-600">
                    Please provide at least two non-empty options.
                  </div>
                )}
            </div>
          )}

          {/* Open prompt antwoord */}
          {step1Data.contentType === ContentType.EVAL_OPEN_QUESTION && (
            <div className="mt-4">
              <label className="block mb-1 font-medium">Correct Answer</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={questionState.answer || ''}
                onChange={(e) =>
                  setQuestionState((s) => ({
                    ...s,
                    answer: e.target.value,
                  }))
                }
                placeholder="Enter the correct answer"
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HtmlOrQuestionStep;
