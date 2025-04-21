import React, { useRef, useState, useEffect } from 'react';
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

const LearningObjectForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const isEdit = Boolean(initialData);
  const [step, setStep] = useState<number>(1);
  const [rawHtml, setRawHtml] = useState<string>('');
  const [rawHtmlError, setRawHtmlError] = useState<string>('');

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

  const { mutate, isLoading, isError, error } = useMutation<
    LearningObject,
    Error,
    { id?: string; data: LocalLearningObjectData }
  >({
    mutationFn: ({ id, data }) =>
      isEdit && id
        ? updateLocalLearningObject(id, data)
        : createLocalLearningObject(data),
    onSuccess: onSuccess,
  });

  const {
    data: fetchedHtml,
    isLoading: isHtmlLoading,
    error: htmlFetchError,
  } = useQuery<string, Error>({
    queryKey: ['learningObjectHtml', initialData?.id],
    queryFn: () => fetchLocalLearningObjectHtml(initialData!.id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (fetchedHtml !== undefined) {
      setRawHtml(fetchedHtml);
    }
  }, [fetchedHtml]);

  const handleNext = () => {
    const valid = [titleRef, descriptionRef].every(ref => ref.current?.validateInput());
    if (!valid) return;

    setStep1Data({
      title: titleRef.current.getValue(),
      description: descriptionRef.current.getValue(),
      contentType: contentTypeRef.current!.value as ContentType,
      keywords: keywordsRef.current?.getValue()?.split(',').map((k: string) => k.trim()) || [],
      targetAges:
        targetAgesRef.current
          ?.getValue()
          ?.split(',')
          .map((a: string) => parseInt(a.trim(), 10)) || [],
      skosConcepts:
        skosRef.current
          ?.getValue()
          ?.split(',')
          .map((s: string) => s.trim()) || [],
      licence: licenceRef.current?.getValue() || '',
      copyright: copyrightRef.current?.getValue() || '',
      difficulty: parseInt(difficultyRef.current?.getValue(), 10) || 1,
      estimatedTime: parseInt(estimatedTimeRef.current?.getValue(), 10) || 0,
      contentLocation: contentLocationRef.current?.getValue() || '',
      teacherExclusive: teacherExclusiveRef.current?.value === 'true',
      available: availableRef.current?.value === 'true',
    });

    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawHtml.trim()) {
      setRawHtmlError('HTML content is required');
      return;
    }

    const fullData: LocalLearningObjectData = { ...step1Data, rawHtml };
    mutate({ id: initialData?.id, data: fullData });
  };

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="m-a mxw-800 p-20">
          <h2>{isEdit ? 'Edit Learning Object' : 'New Learning Object'}</h2>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="grid g-20">
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
                <div>
                  <label>Content Type</label>
                  <select ref={contentTypeRef} defaultValue={step1Data.contentType}>
                    {Object.values(ContentType).map(ct => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
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
                <InputWithChecks
                  ref={licenceRef}
                  label="Licence"
                  value={step1Data.licence}
                />
                <InputWithChecks
                  ref={copyrightRef}
                  label="Copyright"
                  value={step1Data.copyright}
                />
                <InputWithChecks
                  ref={difficultyRef}
                  label="Difficulty"
                  inputType="number"
                  value={step1Data.difficulty.toString()}
                />
                <InputWithChecks
                  ref={estimatedTimeRef}
                  label="Estimated Time (min)"
                  inputType="number"
                  value={step1Data.estimatedTime.toString()}
                />
                <InputWithChecks
                  ref={contentLocationRef}
                  label="Content Location"
                  value={step1Data.contentLocation}
                />
                <div>
                  <label className="block mb-1">Teacher Exclusive</label>
                  <select
                    ref={teacherExclusiveRef}
                    defaultValue={step1Data.teacherExclusive.toString()}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Available</label>
                  <select
                    ref={availableRef}
                    defaultValue={step1Data.available.toString()}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex j-end">
                  <PrimaryButton type="button" onClick={handleNext}>
                    Next
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                {isEdit && isHtmlLoading && <div>Content laden…</div>}
                {isEdit && htmlFetchError && (
                  <div className="text-red-600">
                    Kon HTML niet laden: {String(htmlFetchError)}
                  </div>
                )}
                {(!isEdit || (!isHtmlLoading && !htmlFetchError)) && (
                  <div className="grid g-20">
                    <HtmlInput
                      value={rawHtml}
                      onChange={setRawHtml}
                      error={rawHtmlError}
                    />
                    <div className="flex g-10">
                      <PrimaryButton type="button" onClick={handleBack}>
                        Back
                      </PrimaryButton>
                      <PrimaryButton type="submit" disabled={isLoading}>
                        {isEdit ? 'Update' : 'Create'}
                        {isLoading && <LoadingIndicatorButton />}
                      </PrimaryButton>
                    </div>
                    <div className="flex g-10 mt-10">
                      <SecondaryButton type="button" onClick={onCancel}>
                        Cancel
                      </SecondaryButton>
                    </div>
                    {isError && <div className="text-red-600">{error.message}</div>}
                  </div>
                )}
              </>
            )}
          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default LearningObjectForm;