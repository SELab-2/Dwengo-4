// EditClassTeacher
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import PrimaryButton from '../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import { validateRequired, validateForm } from '../../util/shared/validation';
import NavButton from '../../components/shared/NavButton';
import { ClassItem } from '../../types/type';
import { fetchAssignments } from '@/util/teacher/assignment';
import { fetchClass, updateClass } from '@/util/teacher/class';
import { getClassById, updateClassName, deleteClass, regenerateJoinLink } from "../../util/teacher/httpTeacher";

// Import van de section components
import OverviewSection from '../../components/teacher/classes/OverviewSection';
import AssignmentsSection from '../../components/teacher/classes/AssignmentsSection';
import QuestionsSection from '../../components/teacher/classes/QuestionsSection';
import ManageSection from '../../components/teacher/classes/ManageSection';

interface ClassDetails {
  id: string;
  name: string;
  code: string;
}

type SidebarSection = 'overview' | 'assignments' | 'questions' | 'manage';

const EditClassTeacher: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');

  // Haal klasgegevens op via de httpTeacher functie
  const {
    data: classData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem>({
    queryKey: ['class', classId],
    queryFn: async () => fetchClass({ classId: Number(classId!) }),
  });
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorMessage,
  } = useQuery({
    queryKey: ['assignments', classId],
    queryFn: async () => fetchAssignments(classId!),
  });

  // Mutatie voor het bijwerken van de klasnaam
  const { mutate, isPending } = useMutation({
    mutationFn: (newName: string) => updateClassName({ classId: classId!, newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      navigate('/teacher/classes');
    },
  });

  const handleDeleteClass = async () => {
    if (window.confirm('Weet je zeker dat je deze klas wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        await deleteClass({ classId: classId! });
        queryClient.invalidateQueries({ queryKey: ['classes'] });
        navigate('/teacher/classes');
      } catch (error) {
        console.error('Fout bij het verwijderen van de klas:', error);
      }
    }
  };

  const handleRegenerateJoinLink = async () => {
    try {
      await regenerateJoinLink({ classId: classId! });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    } catch (error) {
      console.error('Fout bij het vernieuwen van de klascode:', error);
    }
  };

  // Sidebar component (in dit geval inline, maar kan ook verplaatst worden)
  const SidebarButton: React.FC<{
    section: SidebarSection;
    label: string;
    activeSection: SidebarSection;
    onClick: (section: SidebarSection) => void;
  }> = ({ section, label, activeSection, onClick }) => {
    const isActive = section === activeSection;
    return (
      <button
        onClick={() => onClick(section)}
        className={`px-7 h-10 font-bold rounded-md cursor-pointer ${isActive
          ? 'bg-dwengo-green-darker pt-1 text-white border-gray-600 border-3'
          : 'pt-1.5 bg-dwengo-green hover:bg-dwengo-green-dark text-white'}`}
      >
        {label}
      </button>
    );
  };

  const renderSidebarItem = (section: SidebarSection, label: string) => (
    <SidebarButton section={section} label={label} activeSection={activeSection} onClick={setActiveSection} />
  );

  const renderContent = () => {
    if (!classData) return null;
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            classData={classData}
            classId={classId!}
            onUpdateClassName={(newName: string) => mutate(newName)}
            isUpdating={isPending}
            onDeleteClass={handleDeleteClass}
            onRegenerateJoinLink={handleRegenerateJoinLink}
          />
        );
      case 'assignments':
        return (
          <Container>
            <BoxBorder extraClasses="mxw-700 m-a g-20">
              <div className="flex justify-between items-center mb-4">
                <h2>Opdrachten</h2>
                <Link to={`/teacher/classes/${classId}/add-assignment`}>
                  <PrimaryButton>Nieuwe Opdracht</PrimaryButton>
                </Link>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Zoek opdrachten..."
                  className="w-full p-2 mb-4 border rounded"
                  onChange={(e) => {
                    const searchQuery = e.target.value.toLowerCase();
                    const filtered = assignments?.filter((assignment: any) =>
                      assignment.title.toLowerCase().includes(searchQuery),
                    );
                    setFilteredAssignments(filtered || []);
                  }}
                />

                {assignmentsLoading ? (
                  <div>Opdrachten laden...</div>
                ) : assignmentsError ? (
                  <div className="text-red-500">
                    Error: {String(assignmentsErrorMessage)}
                  </div>
                ) : !filteredAssignments.length ? (
                  <div className="bg-gray-100 p-4 rounded">
                    <p className="text-gray-500">Geen opdrachten gevonden</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredAssignments.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        onClick={() =>
                          navigate(`/teacher/assignment/${assignment.id}`)
                        }
                        className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <h3 className="font-bold">{assignment.title}</h3>
                        <p className="text-gray-600">
                          {assignment.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          Deadline:{' '}
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </BoxBorder>
          </Container>
        );
      case 'questions':
        return <QuestionsSection />;
      case 'manage':
        return <ManageSection classId={classId!} className={classData.name} />;
      default:
        return null;
    }
  };

  if (isLoading) return <div>Laden...</div>;
  if (isError) return <div className="c-r">Fout: {(error as Error).message}</div>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard voor {classData ? classData.name : "Klas"}</h2>
        <div className="flex flex-col gap-2">
          {renderSidebarItem('overview', 'Overview')}
          {renderSidebarItem('assignments', 'Assignments')}
          {renderSidebarItem('questions', 'Questions')}
          {renderSidebarItem('manage', 'Manage')}
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default EditClassTeacher;
