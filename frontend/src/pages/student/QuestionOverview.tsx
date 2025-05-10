import {
  addMessageToQuestion,
  fetchQuestionConversation,
} from '@/util/student/questions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Updated interfaces to match the actual data structure
interface Author {
  firstName?: string;
}

interface Message {
  id: string;
  text: string;
  author?: Author;
  userId: number; // Added userId field
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

  // Set the first question as selected as soon as data loads
  useEffect(() => {
    console.log('Questions data:', question);
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
  const currentUserId = parseInt(localStorage.getItem('userId') || '0', 10);

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

          {question?.questionConversation?.map((message: Message) => {
            // Try to find the student that matches the message's userId

            console.log('question', question);

            // const student = question.teams.students?.find(
            //   (student) => student.userId === message.userId,
            // );
            const student = 'hobbes';

            // Determine if this is the current user's message
            const isCurrentUser = message.userId === currentUserId;

            // Determine the name to display
            let displayName = message.userId.toString();
            let firstInitial = '?';

            if (isCurrentUser && localName) {
              displayName = localName;
              firstInitial = localName.charAt(0).toUpperCase();
            } else if (student?.user?.firstName) {
              displayName = student.user.firstName;
              firstInitial = student.user.firstName.charAt(0).toUpperCase();
            }

            return (
              <div key={message.id} className={`p-4 rounded-lg `}>
                <div className="flex flex-row items-center gap-x-2">
                  <div className="flex flex-row justify-center items-center bg-dwengo-green w-12 h-12 aspect-square rounded-full">
                    <p className="text-2xl bg-dwengo-green">{firstInitial}</p>
                  </div>
                  <p className="text-2xl">
                    <span className="text-dwengo-green-dark font-bold">
                      {displayName}
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
      </div>
    </div>
  );
};

export default QuestionOverview;
