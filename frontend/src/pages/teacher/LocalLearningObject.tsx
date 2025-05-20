import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PrimaryButton from '../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import {
  fetchLocalLearningObjects,
  deleteLocalLearningObject,
  LearningObject,
} from '../../util/teacher/localLearningObjects';
import LearningObjectForm from '../../components/teacher/learningobjectform/LearningObjectForm';
import SecondaryButton from '../../components/shared/SecondaryButton';
import { useTranslation } from 'react-i18next';

const LocalLearningObjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // gebruik van object‑syntax met queryFn
  const { data, isLoading, isError, error } = useQuery<LearningObject[]>({
    queryKey: ['localLearningObjects'],
    queryFn: fetchLocalLearningObjects,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteLocalLearningObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localLearningObjects'] });
    },
  });

  const [editingObject, setEditingObject] = useState<
    (LearningObject & { rawHtml: string }) | null
  >(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleCreate = () => {
    setEditingObject(null);
    setShowForm(true);
  };

  const handleEdit = (obj: LearningObject) => {
    setEditingObject(obj as LearningObject & { rawHtml: string });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('learning_objects.deletion_confirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    console.log('HANDLESUCESSS');
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['localLearningObjects'] });
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <LearningObjectForm
        initialData={editingObject ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          className={`
                px-6 py-3 font-bold rounded-lg shadow-md hover:shadow-lg
                text-white bg-dwengo-green hover:bg-dwengo-green-dark
                max-w-xs hover:cursor-pointer
              `}
          onClick={handleCreate}
        >
          <div className="flex items-center gap-2 bg-transparent">
            {/* plus Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {t('learning_objects.create')}
          </div>
        </button>
      </div>

      {isLoading && <LoadingIndicatorButton />}
      {isError && (
        <div className="text-red-600">{(error as Error).message}</div>
      )}

      {data && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-b">
                  {t('learning_objects.title')}
                </th>
                <th className="px-4 py-2 text-left border-b">
                  {t('learning_objects.type')}
                </th>
                <th className="px-4 py-2 text-left border-b">
                  {t('learning_objects.available')}
                </th>
                <th className="px-4 py-2 text-left border-b">
                  {t('learning_objects.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{obj.title}</td>
                  <td className="px-4 py-2 border-b">{obj.contentType}</td>
                  <td className="px-4 py-2 border-b">
                    {obj.available ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-2 border-b flex gap-2">
                    <PrimaryButton onClick={() => handleEdit(obj)}>
                      {t('learning_objects.edit')}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => handleDelete(obj.id)}>
                      {t('learning_objects.delete')}
                    </SecondaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocalLearningObjectsPage;
