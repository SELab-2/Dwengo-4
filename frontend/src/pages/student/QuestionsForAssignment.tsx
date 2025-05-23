import PrimaryButton from '@/components/shared/PrimaryButton';
import { fetchQuestionsForTeam } from '@/util/student/questions';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

const QuestionsForAssignment: React.FC = () => {
  const { assignmentId } = useParams<{
    assignmentId: string;
  }>();

  const {
    data: questions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['questionId', assignmentId],
    queryFn: () => fetchQuestionsForTeam(assignmentId!),
    enabled: !!assignmentId,
  });

  const { t } = useTranslation();

  // Log whenever the query results change
  React.useEffect(() => {
    console.log('Current query state:', {
      questions,
      isLoading,
      isError,
      error,
    });
  }, [questions, isLoading, isError, error]);

  return (
    <>
      <div>
        <div className="w-full flex flex-col items-center justify-center mt-8">
          <p className="text-3xl mb-2">
            {t('questions.assignment_questions')}
            <span className="text-dwengo-green font-bold">
              {' '}
              {questions?.teams?.teamAssignment?.assignment?.title ||
                t('loading.loading')}
            </span>
          </p>
          <Link to={`/student/question/new/${assignmentId}`}>
            <PrimaryButton>{t('questions.new_question_button')}</PrimaryButton>
          </Link>

          {isLoading && (
            <div className="mt-8 text-center">
              <p>{t('questions.loading')}</p>
            </div>
          )}

          {isError && (
            <div className="mt-8 text-center text-red-500">
              <p>{t('questions.error')}</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex flex-col mt-8 w-[40rem] gap-y-8 bg-dwengo">
              {questions?.questions?.length ? (
                questions.questions.map((question) => (
                  <div
                    key={question.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
                  >
                    <div className="p-5">
                      <div className="flex flex-row justify-between w-full">
                        <h2 className="text-2xl font-semibold mb-2 ">
                          {question.title}
                        </h2>
                        <div className="text-sm text-red-500">
                          {new Date(question.createdAt).toLocaleString(
                            'nl-BE',
                            {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            },
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row w-full justify-between">
                      <div className="bg-gray-50 pl-3 pb-3">
                        <Link
                          to={`/student/question/${question.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <PrimaryButton>
                            {t('questions.view_button')}
                          </PrimaryButton>
                        </Link>
                      </div>
                      <p className="text-gray-600 mr-2 translate-y-3">
                        {t('questions.asked_by')}{' '}
                        <span className="text-dwengo-green font-bold">
                          {question.creatorName}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4">
                  {t('questions.no_questions')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionsForAssignment;
