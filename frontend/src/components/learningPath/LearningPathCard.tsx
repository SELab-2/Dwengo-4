import { APIError } from '@/types/api.types';
import { LearningPath } from '@/types/type';
import { getUserId } from '@/util/shared/auth';
import { deleteLearningPath } from '@/util/teacher/localLearningPaths';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Generates a background color based on the given ID.
 *
 * @param {string} id - The ID to generate the background color for.
 * @returns {string} The generated background color in HSL format.
 */
const generateBackgroundColor = (id: string) => {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

interface LearningPathCardProps {
  path: LearningPath;
}

/**
 * LearningPathCard component displays a single learning path card.
 *
 * @param {LearningPathCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered LearningPathCard component.
 */
export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const backgroundColor = useMemo(
    () => generateBackgroundColor(path.id),
    [path.id],
  );
  const isTeacherView = window.location.pathname.includes('/teacher');
  const linkPath = isTeacherView
    ? `/teacher/learning-paths/${path.id}`
    : `/student/learning-paths/${path.id}`;

  const deleteMutation = useMutation<
    void,
    APIError,
    string,
    { previousPaths?: LearningPath[] }
  >({
    mutationFn: deleteLearningPath,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['learningPaths'] });
      // snapshot the previous data
      const previousPaths = queryClient.getQueryData<LearningPath[]>([
        'learningPaths',
      ]);
      // optimistically update the learningPaths query to not have to wait on backend for visual update
      queryClient.setQueryData<LearningPath[]>(['learningPaths'], (old) =>
        old?.filter((path) => path.id !== id),
      );
      return { previousPaths };
    },
    onError: (err, id, context) => {
      // rollback to the previous state in case of error
      queryClient.setQueryData(['learningPaths'], context?.previousPaths);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedLearningPaths'] });
    },
  });

  const handleDelete = () => {
    if (window.confirm(t('edit_learning_path.deletion_confirm'))) {
      deleteMutation.mutate(path.id);
    }
  };

  // display edit icon if the user is the creator of the path
  const isCreator = path.creator ? path.creator.id === getUserId() : false;

  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-128">
      {/* edit and delete button if currently signed in user is path creator */}
      {isCreator && (
        <div className="absolute top-3 right-3 flex gap-2 bg-transparent">
          {/* edit button */}
          <div
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              navigate(`/teacher/learning-paths/${path.id}/edit`);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.25"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={`
                M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626
                1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164
                1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5
                4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25
                3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z
              `}
              />
            </svg>
          </div>

          {/* delete button */}
          <div
            className="bg-white p-2 rounded-full shadow-md hover:bg-dwengo-red-dark hover:text-white cursor-pointer"
            onClick={handleDelete}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={`
                    m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16
                    19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
                    0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0
                    0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32
                    0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0
                `}
              />
            </svg>
          </div>
        </div>
      )}

      <div className="w-full h-80 flex items-center justify-center">
        {path.image ? (
          <img
            src={`data:image/png;base64,${path.image}`}
            alt={`${path.title} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center object-fit-cover"
            style={{ backgroundColor }}
          >
            <span className="text-gray-700 text-xl font-semibold">
              {path.title}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex-grow h-40 border-t-2 border-gray-200">
        <Link to={linkPath} className="text-blue-600 hover:text-blue-800">
          <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
        </Link>
        <p className="text-gray-700 h-[77px] overflow-hidden line-clamp-3">
          {path.description}
        </p>

        {/* display creator information if available */}
        {path.creator && (
          <div className="flex items-center gap-1 mt-4 text-gray-500 hover:cursor-default">
            {/* creator icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={`
                  M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982
                  2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12
                  21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z
                `}
              />
            </svg>
            <span className="text-sm">{`${path.creator.firstName} ${path.creator.lastName}`}</span>
          </div>
        )}
      </div>
    </div>
  );
};
