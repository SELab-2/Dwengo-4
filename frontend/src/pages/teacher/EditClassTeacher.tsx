import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/teacher/classes/Sidebar';
import OverviewSection from '../../components/teacher/classes/OverviewSection';
import AssignmentsSection from '../../components/teacher/classes/AssignmentsSection';
import ManageSection from '../../components/teacher/classes/ManageSection';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { ClassItem } from '@/types/type';
import { fetchAssignments } from '@/util/teacher/assignment';
import { fetchClass, updateClass } from '@/util/teacher/class';
import { fetchQuestionsByClass } from '@/util/teacher/questions';
import { t } from 'i18next';

type SidebarSectionType = 'overview' | 'assignments' | 'questions' | 'manage';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

const EditClassTeacher: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [className, setClassName] = useState<string>('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const classNameRef = useRef<InputWithChecksRef>(null);
  const [activeSection, setActiveSection] =
    useState<SidebarSectionType>('overview');

  // assignments
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorMsg,
  } = useQuery({
    queryKey: ['assignments', classId],
    queryFn: () => fetchAssignments(classId!),
  });

  useEffect(() => {
    if (assignments) setFilteredAssignments(assignments);
  }, [assignments]);

  // class data
  const {
    data: classData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem>({
    queryKey: ['class', classId],
    queryFn: () => fetchClass({ classId: Number(classId!) }),
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions', classId],
    queryFn: () => fetchQuestionsByClass(Number(classId)),
    enabled: !!classId,
  });
  // Update class name mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (newName: string) =>
      updateClass({ classId: Number(classId), name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      navigate(`/teacher/classes/${classId}`);
    },
  });

  useEffect(() => {
    if (classData) setClassName(classData.name);
  }, [classData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (classNameRef.current?.validateInput()) {
      mutate(classNameRef.current.getValue());
    }
  };

  const deleteClass = async () => {
    if (!window.confirm('Weet je zeker dat je deze klas wilt verwijderen?'))
      return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/class/teacher/${classId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!res.ok) throw new Error('Delete failed');
      await queryClient.invalidateQueries({ queryKey: ['classes'] });
      navigate('/teacher/classes');
    } catch (err) {
      console.error(err);
    }
  };

  const regenerateCode = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/class/teacher/${classId}/join-link`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!res.ok) throw new Error('Regenerate code failed');
      await queryClient.invalidateQueries({ queryKey: ['class', classId] });
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            classId={classId!}
            className={className}
            classCode={classData?.code?.toString()}
            classNameRef={classNameRef}
            isSaving={isPending}
            onSubmit={handleSubmit}
            onDelete={deleteClass}
            onRegenerateCode={regenerateCode}
          />
        );
      case 'assignments':
        return (
          <AssignmentsSection
            classId={classId!}
            assignments={assignments}
            loading={assignmentsLoading}
            error={assignmentsError}
            errorMessage={assignmentsErrorMsg}
            filtered={filteredAssignments}
            setFiltered={(arr) => setFilteredAssignments(arr)}
          />
        );
      case 'questions':
        return (
          <Container>
            <BoxBorder extraClasses="mxw-700 m-a g-20">
              <h2>Vragen</h2>
              <p>Hier komen de vragen van leerlingen.</p>
              {questions.length > 0 ? (
                questions.map((question) => (
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
                          to={`/teacher/question/${question.id}`}
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
                <div className="bg-gray-100 p-4 rounded mt-4">
                  <p className="text-gray-500">Nog geen vragen beschikbaar.</p>
                </div>
              )}
            </BoxBorder>
          </Container>
        );
      case 'manage':
        return <ManageSection className={className} classId={classId!} />;
      default:
        return null;
    }
  };

  if (isLoading) return <div>Laden...</div>;
  if (isError)
    return <div className="c-r">Fout: {(error as Error).message}</div>;

  return (
    <div className="flex">
      <Sidebar
        className={classData?.name}
        activeSection={activeSection}
        onChange={setActiveSection}
      />
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default EditClassTeacher;
