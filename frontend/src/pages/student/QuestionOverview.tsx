import {
  addMessageToQuestion,
  fetchQuestionConversation,
} from '@/util/student/questions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Updated interfaces to match the actual data structure
interface User {
  firstName: string;
  id: number;
}

interface Message {
  id: string;
  text: string;
  user: User;
  userId: number;
  createdAt: string;
  updatedAt: string;
  questionId: number;
}

const QuestionOverview: React.FC = () => {
  const { questionId } = useParams<{
    questionId: string;
  }>();

  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const {
    data: question,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['questionId', questionId],
    queryFn: () => fetchQuestionConversation(questionId!),
    enabled: !!questionId,
  });

  useEffect(() => {
    if (question) {
      console.log('Questions data:', question);
    }
  }, [question]);

  const addMessageMutation = useMutation({
    mutationFn: ({
      questionId,
      content,
    }: {
      questionId: string;
      content: string;
    }) => addMessageToQuestion(questionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionId', questionId] });
      setNewMessage(''); // Clear the input field
    },
  });

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      alert('Voer een bericht in');
      return;
    }

    addMessageMutation.mutate({
      questionId: questionId,
      content: newMessage,
    });
  };

  // Log whenever the query results change
  React.useEffect(() => {
    console.log('Current query state:', {
      question,
      isLoading,
      isError,
      error,
    });
  }, [question, isLoading, isError, error]);

  const localName = localStorage.getItem('firstName');

  if (isLoading) {
    return (
      <div className="pt-10 w-full flex flex-col items-center">
        <p className="text-xl">Laden...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-10 w-full flex flex-col items-center">
        <p className="text-xl text-red-500">
          Er is een fout opgetreden: {error?.message || 'Onbekende fout'}
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="pt-10 w-full flex flex-col items-center">
        <p className="text-xl">Geen vraag gevonden</p>
      </div>
    );
  }

  return (
    <div className="pt-10 w-full flex flex-col items-center">
      <h1 className="text-5xl">
        <span className="text-dwengo-green font-bold">{question.title}</span>
      </h1>

      {question.questionConversation &&
        question.questionConversation.length > 0 && (
          <>
            <h2 className="text-lg mt-2">
              Vraag gesteld door:{' '}
              <span className="text-dwengo-green font-bold">
                {question.questionConversation[0].user?.firstName || 'Onbekend'}
              </span>
            </h2>

            <div className="my-8 max-w-[35rem]">
              {question.questionConversation[0].text}
            </div>
          </>
        )}

      {question.questionConversation && (
        <div className="flex flex-col w-[40rem]">
          <h2 className="self-center text-3xl mt-8">Comments:</h2>
          <div className="flex flex-col space-y-1 mt-2">
            {question.questionConversation?.length <= 1 && (
              <div className="flex flex-row justify-center mb-8">
                <p>
                  Nog niemand heeft een comment achtergelaten voor deze vraag...
                </p>
              </div>
            )}

            {question.questionConversation.length > 1 &&
              question.questionConversation
                ?.slice(1)
                .map((message: Message) => {
                  return (
                    <div key={message.id} className="p-4 rounded-lg">
                      <div className="flex flex-row items-center gap-x-2">
                        <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
                          <p className="text-2xl bg-dwengo-green">
                            {message.user?.firstName?.charAt(0).toUpperCase() ||
                              '?'}
                          </p>
                        </div>
                        <p className="text-2xl">
                          <span className="text-dwengo-green-dark font-bold">
                            {message.user?.firstName || 'Onbekend'}
                          </span>{' '}
                          zegt:
                        </p>
                      </div>
                      <p className="ml-14">{message.text}</p>
                      <div className="border-b-1 border-gray-400 mt-2"></div>
                    </div>
                  );
                })}
          </div>
          <form onSubmit={handleSubmitMessage} className="mb-8 ml-4">
            <div className="flex flex-row items-center gap-x-2">
              <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
                <p className="text-2xl bg-dwengo-green">
                  {localName?.charAt(0).toUpperCase() || '?'}
                </p>
              </div>
              <p className="text-2xl">
                <span className="text-dwengo-green-dark font-bold">
                  {localName || 'Gebruiker'}
                </span>{' '}
                zegt:
              </p>
            </div>

            <div className="flex flex-col ml-12">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Stel hier je vraag:"
                className="w-96 rounded-2xl p-2 border border-gray-300"
                rows={4}
              ></textarea>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={addMessageMutation.isPending}
                  className="bg-dwengo-green hover:bg-dwengo-green-dark text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {addMessageMutation.isPending
                    ? 'Versturen...'
                    : 'Verstuur bericht'}
                </button>

                {addMessageMutation.isError && (
                  <p className="text-red-500 mt-2">
                    Er ging iets mis bij het versturen:{' '}
                    {addMessageMutation.error?.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuestionOverview;
