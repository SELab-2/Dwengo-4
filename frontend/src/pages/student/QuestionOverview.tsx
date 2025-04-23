import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchConversation,
  addMessageToQuestion,
} from '../../util/student/httpStudent';

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

  const [newMessage, setNewMessage] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();

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

  // Set the first question as selected as soon as data loads
  useEffect(() => {
    if (questions?.length) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions]);

  const addMessageMutation = useMutation({
    mutationFn: ({
      questionId,
      content,
    }: {
      questionId: string;
      content: string;
    }) => addMessageToQuestion(questionId, content),
    onSuccess: () => {
      // Refresh the questions data after successfully adding a message
      queryClient.invalidateQueries({ queryKey: ['questionId', assignmentId] });
      setNewMessage(''); // Clear the input field
    },
  });

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuestionId) {
      alert('Geen vraag beschikbaar om op te reageren');
      return;
    }

    if (!newMessage.trim()) {
      alert('Voer een bericht in');
      return;
    }

    addMessageMutation.mutate({
      questionId: selectedQuestionId,
      content: newMessage,
    });
  };

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
        {/* New Question Form */}
        <form onSubmit={handleSubmitMessage} className="mb-8">
          <div className="flex flex-row items-center gap-x-2">
            <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
              <p className="text-2xl bg-dwengo-green">
                {localName?.charAt(0).toUpperCase()}
              </p>
            </div>
            <p className="text-2xl">
              <span className="text-dwengo-green-dark font-bold">
                {localName}
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

        <div className="flex flex-col space-y-10 mt-10">
          {isLoading && <p>Laden...</p>}
          {isError && <p>Fout bij laden van vragen: {error?.message}</p>}
          {questions?.map((question: Question) =>
            question.questionConversation?.map((message: Message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${question.id === selectedQuestionId ? '' : ''}`}
              >
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
                    <p className="text-2xl bg-dwengo-green">
                      {message.author?.firstName
                        ? message.author.firstName.charAt(0).toUpperCase()
                        : '?'}
                    </p>
                  </div>
                  <p className="text-2xl">
                    <span className="text-dwengo-green-dark font-bold">
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
