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
    // Probeer rawHtml te parsen
    try {
      const parsed = JSON.parse(rawHtml);
      const isValid =
        parsed &&
        typeof parsed.prompt === 'string' &&
        Array.isArray(parsed.options);

      if (isValid) {
        if (isQuestionType(step1Data.contentType)) {
          // Zet de state voor vraag-type
          setQuestionState({
            prompt: parsed.prompt,
            options: parsed.options,
          });
        } else {
          // Reset rawHtml als het NIET meer een vraag-type is
          setRawHtml('');
        }
      }
    } catch {
      // parse-fout: negeren
    }
  }, [
    rawHtml,
    step1Data.contentType,
    isQuestionType,
    setQuestionState,
    setRawHtml,
  ]);

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
        </>
      )}
    </>
  );
};

export default HtmlOrQuestionStep;
