import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import InputWithChecks from '../../shared/InputWithChecks';
import PrimaryButton from '../../shared/PrimaryButton';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import SecondaryButton from '../../shared/SecondaryButton';
import HtmlInput from './HtmlInput';
import {
  createLocalLearningObject,
  updateLocalLearningObject,
  fetchLocalLearningObjectHtml,
  LocalLearningObjectData,
  LearningObject,
  ContentType,
} from '../../../util/teacher/httpTeacher';

interface Props {
  initialData?: LearningObject;
  onSuccess: () => void;
  onCancel: () => void;
}



interface Step1Data {
  title: string;
  description: string;
  contentType: ContentType;
  keywords: string[];
  targetAges: number[];
  skosConcepts: string[];
  licence: string;
  copyright: string;
  difficulty: number;
  estimatedTime: number;
  contentLocation: string;
  teacherExclusive: boolean;
  available: boolean;
}

const isQuestionType = (ct: ContentType) =>
  ct === ContentType.EVAL_OPEN_QUESTION ||
  ct === ContentType.EVAL_MULTIPLE_CHOICE;


const LearningObjectForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const isEdit = Boolean(initialData);
  const [step, setStep] = useState<number>(1);
  const [subStep, setSubStep] = useState<number>(1);
  const [rawHtml, setRawHtml] = useState<string>('');
  const [rawHtmlError, setRawHtmlError] = useState<string>('');
  // direct na je useState hooks
  const [questionState, setQuestionState] = useState<{ prompt: string; options: string[] }>(() => {
    try { return JSON.parse(rawHtml) }
    catch { return { prompt: '', options: [] } }
  });

  const [step1Data, setStep1Data] = useState<Step1Data>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    contentType: initialData?.contentType || ContentType.TEXT_MARKDOWN,
    keywords: initialData?.keywords || [],
    targetAges: initialData?.targetAges || [],
    skosConcepts: initialData?.skosConcepts || [],
    licence: initialData?.licence || '',
    copyright: initialData?.copyright || '',
    difficulty: initialData?.difficulty ?? 1,
    estimatedTime: initialData?.estimatedTime ?? 0,
    contentLocation: initialData?.contentLocation || '',
    teacherExclusive: initialData?.teacherExclusive ?? false,
    available: initialData?.available ?? true,
  });

  // refs for inputs
  const titleRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);
  const contentTypeRef = useRef<HTMLSelectElement>(null);
  const keywordsRef = useRef<any>(null);
  const targetAgesRef = useRef<any>(null);
  const skosRef = useRef<any>(null);
  const licenceRef = useRef<any>(null);
  const copyrightRef = useRef<any>(null);
  const difficultyRef = useRef<any>(null);
  const estimatedTimeRef = useRef<any>(null);
  const contentLocationRef = useRef<any>(null);
  const teacherExclusiveRef = useRef<HTMLSelectElement>(null);
  const availableRef = useRef<HTMLSelectElement>(null);

  // mutations & fetch
  const { mutate, isLoading, isError, error } = useMutation<LearningObject, Error, { id?: string; data: LocalLearningObjectData }>({
    mutationFn: ({ id, data }) =>
      isEdit && id
        ? updateLocalLearningObject(id, data)
        : createLocalLearningObject(data),
    onSuccess: onSuccess,
  });

  const { data: fetchedHtml, isLoading: isHtmlLoading, error: htmlFetchError } = useQuery<string, Error>({
    queryKey: ['learningObjectHtml', initialData?.id],
    queryFn: () => fetchLocalLearningObjectHtml(initialData!.id!),
    enabled: isEdit && !isQuestionType(step1Data.contentType),
  });


  useEffect(() => {
    if (fetchedHtml !== undefined) {
      setRawHtml(fetchedHtml);
    }
  }, [fetchedHtml]);

  // handle moving between sub-steps
  const handleSubNext = () => setSubStep(prev => prev + 1);
  const handleSubBack = () => setSubStep(prev => prev - 1);

  const handleNext = () => {
    // validate required fields in first sub-step
    if (subStep === 1) {
      const valid = [titleRef, descriptionRef].every(ref => ref.current?.validateInput());
      if (!valid) return;
      // save title & desc
      setStep1Data(d => ({
        ...d,
        title: titleRef.current.getValue(),
        description: descriptionRef.current.getValue(),
      }));
      handleSubNext();
    } else if (subStep === 2) {
      setStep1Data(d => ({
        ...d,
        contentType: contentTypeRef.current!.value as ContentType,
        keywords: keywordsRef.current?.getValue()?.split(',').map((k: string) => k.trim()) || [],
        targetAges: targetAgesRef.current?.getValue()?.split(',').map((a: string) => parseInt(a.trim(), 10)) || [],
        skosConcepts: skosRef.current?.getValue()?.split(',').map((s: string) => s.trim()) || [],
      }));
      handleSubNext();
    } else if (subStep === 3) {
      setStep1Data(d => ({
        ...d,
        licence: licenceRef.current?.getValue() || '',
        copyright: copyrightRef.current?.getValue() || '',
        difficulty: parseInt(difficultyRef.current?.getValue(), 10) || 1,
        estimatedTime: parseInt(estimatedTimeRef.current?.getValue(), 10) || 0,
        contentLocation: contentLocationRef.current?.getValue() || '',
      }));
      handleSubNext();
    } else if (subStep === 4) {
      setStep1Data(d => ({
        ...d,
        teacherExclusive: teacherExclusiveRef.current?.value === 'true',
        available: availableRef.current?.value === 'true',
      }));
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Voor vraag-types: zorg dat rawHtml de JSON-string van questionState is
    if (isQuestionType(step1Data.contentType)) {
      const fullData: LocalLearningObjectData = { ...step1Data, rawHtml: JSON.stringify(questionState, null, 2) };
      mutate({ id: initialData?.id, data: fullData });
    } else {
      if (!rawHtml.trim()) {
        setRawHtmlError('HTML content is required');
        return;
      }
      const fullData: LocalLearningObjectData = { ...step1Data, rawHtml };
      mutate({ id: initialData?.id, data: fullData });
    }
  };


  return (
    <section>
      <Container>
        <BoxBorder extraClasses="m-a mxw-800 p-20">
          <h2 className="text-2xl font-semibold mb-4">
            {isEdit ? 'Edit Learning Object' : 'New Learning Object'}
          </h2>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                key={`step1-${subStep}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6"
              >
                <h3 className="text-xl font-medium">
                  {subStep === 1 && 'Basic Info'}
                  {subStep === 2 && 'Content Details'}
                  {subStep === 3 && 'Usage Settings'}
                  {subStep === 4 && 'Availability'}
                </h3>

                {subStep === 1 && (
                  <>
                    <InputWithChecks
                      ref={titleRef}
                      label="Title"
                      value={step1Data.title}
                      validate={v => (!v.trim() ? 'Title is required' : null)}
                    />
                    <InputWithChecks
                      ref={descriptionRef}
                      label="Description"
                      inputType="textarea"
                      value={step1Data.description}
                      validate={v => (!v.trim() ? 'Description is required' : null)}
                    />
                  </>
                )}

                {subStep === 2 && (
                  <>
                    <div>
                      <label className="block mb-1">Content Type</label>
                      <select ref={contentTypeRef} defaultValue={step1Data.contentType} className="w-full border rounded p-2">
                        {Object.values(ContentType).map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                    <InputWithChecks
                      ref={keywordsRef}
                      label="Keywords (comma-separated)"
                      value={step1Data.keywords.join(',')}
                    />
                    <InputWithChecks
                      ref={targetAgesRef}
                      label="Target Ages (comma-separated)"
                      value={step1Data.targetAges.join(',')}
                    />
                    <InputWithChecks
                      ref={skosRef}
                      label="SKOS Concepts (comma-separated)"
                      value={step1Data.skosConcepts.join(',')}
                    />
                  </>
                )}

                {subStep === 3 && (
                  <>
                    <InputWithChecks ref={licenceRef} label="Licence" value={step1Data.licence} />
                    <InputWithChecks ref={copyrightRef} label="Copyright" value={step1Data.copyright} />
                    <InputWithChecks ref={difficultyRef} label="Difficulty (1-5)" inputType="number" value={step1Data.difficulty.toString()} />
                    <InputWithChecks ref={estimatedTimeRef} label="Estimated Time (min)" inputType="number" value={step1Data.estimatedTime.toString()} />
                    <InputWithChecks ref={contentLocationRef} label="Content Location" value={step1Data.contentLocation} />
                  </>
                )}

                {subStep === 4 && (
                  <>
                    <div>
                      <label className="block mb-1">Teacher Exclusive</label>
                      <select ref={teacherExclusiveRef} defaultValue={step1Data.teacherExclusive.toString()} className="w-full border rounded p-2">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Available</label>
                      <select ref={availableRef} defaultValue={step1Data.available.toString()} className="w-full border rounded p-2">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-4">
                  {subStep > 1 ? (
                    <SecondaryButton type="button" onClick={handleSubBack}>
                      Back
                    </SecondaryButton>
                  ) : <div />}
                  <PrimaryButton type="button" onClick={handleNext}>
                    {subStep < 4 ? 'Next' : 'Continue'}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6"
              >
                {isEdit && isHtmlLoading && <div>Content loading…</div>}
                {isEdit && htmlFetchError && (
                  <div className="text-red-600">
                    Could not load HTML: {String(htmlFetchError)}
                  </div>
                )}

                {!isQuestionType(step1Data.contentType) ? (
                  <HtmlInput
                    value={rawHtml}
                    onChange={setRawHtml}
                    error={rawHtmlError}
                  />
                ) : (
                  <>
                    {/* vraag prompt */}
                    <div>
                      <label className="block mb-1 font-medium">Question Prompt</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={questionState.prompt}
                        onChange={(e) => {
                          setQuestionState(s => ({ ...s, prompt: e.target.value }))
                        }
                        }
                        placeholder="Enter your question prompt"
                      />
                    </div>

                    {step1Data.contentType === ContentType.EVAL_MULTIPLE_CHOICE && (
                      <div className="space-y-2">
                        {questionState.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              className="flex-1 border rounded p-2"
                              value={opt}
                              onChange={e => {
                                const opts = [...questionState.options];
                                opts[i] = e.target.value;
                                setQuestionState(s => ({ ...s, options: opts }));
                              }}
                            />
                            <button
                              type="button"
                              className="text-red-600"
                              onClick={() => {
                                const opts = questionState.options.filter((_, idx) => idx !== i);
                                setQuestionState(s => ({ ...s, options: opts }));
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-blue-600"
                          onClick={() => {
                            setQuestionState(s => ({ ...s, options: [...s.options, ''] }));
                          }}
                        >
                          + Add Option
                        </button>

                        {/* Validatie: minstens twee niet-lege opties */}
                        {(
                          questionState.options.filter(o => o.trim()).length < 2 ||
                          questionState.options.some(o => !o.trim())
                        ) && (
                            <div className="text-red-600">
                              Please provide at least two non-empty options.
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-4">
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSubStep(4);
                    }}
                  >
                    Back
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={
                      (isQuestionType(step1Data.contentType) && (
                        !questionState.prompt.trim() ||
                        (step1Data.contentType === ContentType.EVAL_MULTIPLE_CHOICE &&
                          (questionState.options.filter(o => o.trim()).length < 2 ||
                            questionState.options.some(o => !o.trim())))
                      ))
                    }
                  >
                    {isEdit ? 'Update' : 'Create'}
                    {isLoading && <LoadingIndicatorButton />}
                  </PrimaryButton>
                </div>

                <div className="flex gap-4 mt-6">
                  <SecondaryButton type="button" onClick={onCancel}>
                    Cancel
                  </SecondaryButton>
                </div>

                {isError && <div className="text-red-600">{error.message}</div>}
              </motion.div>
            )}

          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default LearningObjectForm;
