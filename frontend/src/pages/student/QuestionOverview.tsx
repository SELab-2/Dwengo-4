import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import { fetchConversation } from '../../util/student/httpStudent';

// Define proper interfaces
interface Author {
  firstName?: string;
}

interface Message {
  id: string;
  text: string;
  author?: Author;
}

interface Question {
  id: string;
  questionConversation?: Message[];
}

const QuestionOverview: React.FC = () => {
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
    queryFn: () => fetchConversation(assignmentId!),
    enabled: !!assignmentId,
  });

  // Log whenever the query results change
  React.useEffect(() => {
    console.log('Current query state:', {
      questions,
      isLoading,
      isError,
      error,
    });
  }, [questions, isLoading, isError, error]);

  const localName = localStorage.getItem('firstName');

  return (
    <div className="pt-10 w-full flex flex-col items-center">
      <h1 className="text-5xl mb-14">
        Vragen voor Assignment{' '}
        <span className="text-dwengo-green font-bold">Test</span>
      </h1>
      <div className="flex flex-col w-[40rem]">
        <div className="flex flex-row items-center gap-x-2">
          <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
            <p className="text-2xl bg-dwengo-green">
              {localName?.charAt(0).toUpperCase()}
            </p>
          </div>
          <p className="text-2xl">
            <span className=" text-dwengo-green-dark font-bold">
              {localName}
            </span>{' '}
            zegt:
          </p>
        </div>
        <textarea
          placeholder="Stel hier je vraag:"
          className="w-96 rounded-2xl ml-12"
        ></textarea>

        <div className="flex flex-col space-y-10 mt-10">
          {isLoading && <p>Laden...</p>}
          {isError && <p>Fout bij laden van vragen: {error?.message}</p>}
          {questions?.map((question: Question) =>
            question.questionConversation?.map((message: Message) => (
              <div key={message.id}>
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
                    <p className="text-2xl bg-dwengo-green">
                      {message.author?.firstName
                        ? message.author.firstName.charAt(0).toUpperCase()
                        : '?'}
                    </p>
                  </div>
                  <p className="text-2xl">
                    <span className=" text-dwengo-green-dark font-bold">
                      {message.author?.firstName ?? 'Onbekend'}
                    </span>{' '}
                    zegt:
                  </p>
                </div>
                <p className="ml-14">{message.text}</p>
                <div className="border-b-1 border-gray-400 mt-2"></div>
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionOverview;
