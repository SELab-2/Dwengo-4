import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import PrimaryButton from '../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import {
  fetchLocalLearningObjects,
  deleteLocalLearningObject,
  LearningObject,
} from '../../util/teacher/httpTeacher';
import LearningObjectForm from '../../components/teacher/localLearningObjects/localLearningObjectsForm';
import SecondaryButton from '../../components/shared/SecondaryButton';

const LocalLearningObjectsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // gebruik van object‑syntax met queryFn
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<LearningObject[]>({
    queryKey: ['localLearningObjects'],
    queryFn: fetchLocalLearningObjects,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteLocalLearningObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localLearningObjects'] });
    },
  });

  const [editingObject, setEditingObject] = useState<LearningObject & { rawHtml: string } | null>(null);
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
    if (window.confirm('Weet je zeker dat je dit leerobject wilt verwijderen?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
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
    <section className="py-8">
      <Container>
        <BoxBorder extraClasses="mx-auto max-w-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Local Learning Objects</h2>
            <PrimaryButton onClick={handleCreate}>New Learning Object</PrimaryButton>
          </div>

          {isLoading && <LoadingIndicatorButton />}
          {isError && <div className="text-red-600">{(error as Error).message}</div>}

          {data && (
            <div className="overflow-x-auto">
              <table className="w-full mt-4 table-auto border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">Title</th>
                    <th className="px-4 py-2 text-left border-b">Type</th>
                    <th className="px-4 py-2 text-left border-b">Available</th>
                    <th className="px-4 py-2 text-left border-b">Actions</th>
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
                          Edit
                        </PrimaryButton>
                        <SecondaryButton
                          onClick={() => handleDelete(obj.id)}
                        >
                          Delete
                        </SecondaryButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BoxBorder>
      </Container>
    </section>
  );
};

export default LocalLearningObjectsPage;
