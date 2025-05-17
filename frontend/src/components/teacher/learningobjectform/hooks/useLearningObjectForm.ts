import { useState, useRef, useEffect, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ContentType,
  LearningObject,
  LocalLearningObjectData,
  fetchLocalLearningObjectHtml,
} from '../../../../util/teacher/localLearningObjects';
import { useLearningObjectMutation } from './useLearningObjectMutation';
import { FormContext, Step1Data, QuestionState } from '../types';

export const isQuestionType = (ct: ContentType) =>
  ct === ContentType.EVAL_OPEN_QUESTION || ct === ContentType.EVAL_MULTIPLE_CHOICE;

export function useLearningObjectForm(
  initialData: LearningObject | undefined,
  onSuccess: () => void
): FormContext {
  const isEdit = Boolean(initialData);
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [rawHtml, setRawHtml] = useState('');
  const [rawHtmlError, setRawHtmlError] = useState('');

  const [questionState, setQuestionState] = useState<QuestionState>(() => {
    try {
      return JSON.parse(fetchedHtml ?? '');
    } catch {
      return { prompt: '', options: [] };
    }
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

  // refs
  const titleRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);
  const contentTypeRef = useRef<HTMLSelectElement | null>(null);
  const keywordsRef = useRef<any>(null);
  const targetAgesRef = useRef<any>(null);
  const skosRef = useRef<any>(null);
  const licenceRef = useRef<any>(null);
  const copyrightRef = useRef<any>(null);
  const difficultyRef = useRef<any>(null);
  const estimatedTimeRef = useRef<any>(null);
  const contentLocationRef = useRef<any>(null);
  const teacherExclusiveRef = useRef<HTMLSelectElement | null>(null);
  const availableRef = useRef<HTMLSelectElement | null>(null);

  const { data: fetchedHtml, isLoading: isHtmlLoading, error: htmlFetchError } = useQuery<
    string,
    Error
  >({
    queryKey: ['learningObjectHtml', initialData?.id],
    queryFn: () => fetchLocalLearningObjectHtml(initialData!.id!),
    enabled: isEdit,
  });

  useEffect(() => {

    if (fetchedHtml !== undefined) {
      setRawHtml(fetchedHtml);
    }

    try {
      const parsed = JSON.parse(fetchedHtml);



      // alleen als parsed de juiste vorm heeft
      if (
        typeof parsed.prompt === 'string' &&
        Array.isArray(parsed.options)
      ) {
        setQuestionState({
          prompt: parsed.prompt,
          options: parsed.options,
        });
      }
    } catch {
      // bij parse-fout doen we niets (blijft oude state)
    }
  }, [fetchedHtml]);

  // mutations
  const { mutate, isLoading, isError, error } = useLearningObjectMutation(isEdit, onSuccess);

  const handleSubNext = () => setSubStep((p) => p + 1);
  const handleSubBack = () => setSubStep((p) => p - 1);

  const handleNext = () => {
    if (subStep === 1) {
      const valid = [titleRef, descriptionRef].every((ref) => ref.current?.validateInput());
      if (!valid) return;
      setStep1Data((d) => ({
        ...d,
        title: titleRef.current.getValue(),
        description: descriptionRef.current.getValue(),
      }));
      handleSubNext();
    } else if (subStep === 2) {
      setStep1Data((d) => ({
        ...d,
        contentType: contentTypeRef.current!.value as ContentType,
        keywords:
          keywordsRef.current?.getValue()?.split(',').map((k: string) => k.trim()) || [],
        targetAges:
          targetAgesRef
            .current?.getValue()
            ?.split(',')
            .map((a: string) => parseInt(a.trim(), 10)) || [],
        skosConcepts:
          skosRef.current?.getValue()?.split(',').map((s: string) => s.trim()) || [],
      }));
      handleSubNext();
    } else if (subStep === 3) {
      setStep1Data((d) => ({
        ...d,
        licence: licenceRef.current?.getValue() || '',
        copyright: copyrightRef.current?.getValue() || '',
        difficulty: parseInt(difficultyRef.current?.getValue(), 10) || 1,
        estimatedTime: parseInt(estimatedTimeRef.current?.getValue(), 10) || 0,
        contentLocation: contentLocationRef.current?.getValue() || '',
      }));
      handleSubNext();
    } else if (subStep === 4) {
      setStep1Data((d) => ({
        ...d,
        teacherExclusive: teacherExclusiveRef.current?.value === 'true',
        available: availableRef.current?.value === 'true',
      }));
      setStep(2);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isQuestionType(step1Data.contentType)) {
      const fullData: LocalLearningObjectData = {
        ...step1Data,
        rawHtml: JSON.stringify(questionState, null, 2),
      };
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

  return {
    step,
    setStep,
    subStep,
    setSubStep,
    step1Data,
    setStep1Data,
    rawHtml,
    setRawHtml,
    rawHtmlError,
    setRawHtmlError,
    questionState,
    setQuestionState,
    isEdit,
    isLoading,
    isError,
    error,
    isQuestionType,
    titleRef,
    descriptionRef,
    contentTypeRef,
    keywordsRef,
    targetAgesRef,
    skosRef,
    licenceRef,
    copyrightRef,
    difficultyRef,
    estimatedTimeRef,
    contentLocationRef,
    teacherExclusiveRef,
    availableRef,
    isHtmlLoading,
    htmlFetchError,
    handleNext,
    handleSubmit,
  } as FormContext;
}
