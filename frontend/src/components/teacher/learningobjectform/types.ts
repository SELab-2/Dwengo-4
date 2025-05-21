import { MutableRefObject, Dispatch, SetStateAction, FormEvent } from 'react';
import { ContentType, LearningObject } from '../../../util/teacher/localLearningObjects';

export interface Props {
  initialData?: LearningObject;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface Step1Data {
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

export interface QuestionState {
  prompt: string;
  options: string[];
  answer: string
}

export interface FormContext {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  subStep: number;
  setSubStep: Dispatch<SetStateAction<number>>;

  step1Data: Step1Data;
  setStep1Data: Dispatch<SetStateAction<Step1Data>>;

  rawHtml: string;
  setRawHtml: Dispatch<SetStateAction<string>>;
  rawHtmlError: string;
  setRawHtmlError: Dispatch<SetStateAction<string>>;

  questionState: QuestionState;
  setQuestionState: Dispatch<SetStateAction<QuestionState>>;

  isEdit: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: Error;

  isQuestionType: (ct: ContentType) => boolean;

  // Refs
  titleRef: MutableRefObject<any>;
  descriptionRef: MutableRefObject<any>;
  contentTypeRef: MutableRefObject<HTMLSelectElement | null>;
  keywordsRef: MutableRefObject<any>;
  targetAgesRef: MutableRefObject<any>;
  skosRef: MutableRefObject<any>;
  licenceRef: MutableRefObject<any>;
  copyrightRef: MutableRefObject<any>;
  difficultyRef: MutableRefObject<any>;
  estimatedTimeRef: MutableRefObject<any>;
  contentLocationRef: MutableRefObject<any>;
  teacherExclusiveRef: MutableRefObject<HTMLSelectElement | null>;
  availableRef: MutableRefObject<HTMLSelectElement | null>;

  // Queries
  isHtmlLoading: boolean;
  htmlFetchError?: Error;

  handleNext: () => void;
  handleSubmit: (e: FormEvent) => void;
}

export interface FormStepProps extends FormContext {}

export interface StepNavProps extends FormContext {
  onCancel: () => void;
}
