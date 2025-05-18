import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/teacher/classes/Sidebar';
import SidebarSection from '../../components/teacher/classes/SidebarButton'
import OverviewSection from '../../components/teacher/classes/OverviewSection';
import AssignmentsSection from '../../components/teacher/classes/AssignmentsSection';
import QuestionsSection from '../../components/teacher/classes/QuestionsSection';
import ManageSection from '../../components/teacher/classes/ManageSection';
import { fetchAssignments } from '@/util/teacher/assignment';
import { fetchClass, updateClass } from '@/util/teacher/class';
import { ClassItem } from '@/types/type';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

const EditClassTeacher: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [className, setClassName] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
  const classNameRef = React.useRef<InputWithChecksRef | null>(null);
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');

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

  // mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (newName: string) => updateClass({ classId: Number(classId), name: newName }),
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
    if (!window.confirm('Weet je zeker dat je deze klas wilt verwijderen?')) return;
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
            classCode={classData?.code}
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
            setFiltered={setFilteredAssignments}
          />
        );
      case 'questions':
        return <QuestionsSection />;
      case 'manage':
        return <ManageSection className={className} classId={classId!} />;
      default:
        return null;
    }
  };

  if (isLoading) return <div>Laden...</div>;
  if (isError) return <div className="c-r">Fout: {(error as Error).message}</div>;

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
