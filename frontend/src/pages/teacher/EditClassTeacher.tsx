import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import InputWithChecks from '../../components/shared/InputWithChecks';
import PrimaryButton from '../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import { validateForm, validateMaxLength, validateRequired } from '@/util/shared/validation';
import { ClassItem } from '@/types/type';
import { fetchAssignments } from '@/util/teacher/assignment';
import { fetchClass, updateClass } from '@/util/teacher/class';
import { fetchQuestionsByClass } from '@/util/teacher/questions';
import { t } from 'i18next';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

// Define sidebar navigation sections
type SidebarSection = 'overview' | 'assignments' | 'questions' | 'manage';

const EditClassTeacher: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [className, setClassName] = useState<string>('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const classNameRef = React.useRef<InputWithChecksRef | null>(null);

  // Add state for an active sidebar section
  const [activeSection, setActiveSection] =
    useState<SidebarSection>('overview');

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorMessage,
  } = useQuery({
    queryKey: ['assignments', classId],
    queryFn: async () => fetchAssignments(classId!),
  });

  useEffect(() => {
    if (assignments) {
      setFilteredAssignments(assignments);
    }
  }, [assignments]);

  // Fetch class details
  const {
    data: classData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem>({
    queryKey: ['class', classId],
    queryFn: async () => fetchClass({ classId: Number(classId!) }),
  });

  const { data: questions } = useQuery({
    queryKey: ['questions', classId],
    queryFn: async () => fetchQuestionsByClass(classId),
  });

  // Update class name mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (newName: string) => {
      return updateClass({ classId: Number(classId), name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] }).then();
      queryClient.invalidateQueries({ queryKey: ['class', classId] }).then();
      navigate(`/teacher/classes/${classId}`);
    },
  });

  useEffect(() => {
    if (classData) {
      setClassName(classData.name);
    }
  }, [classData]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (classNameRef.current && classNameRef.current.validateInput()) {
      const newName = classNameRef.current.getValue();
      mutate(newName);
    }
  };

  const handleDeleteClass = async () => {
    if (
      window.confirm(
        'Weet je zeker dat je deze klas wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      )
    ) {
      try {
        console.log(import.meta);
        console.log(import.meta.env);
        console.log(import.meta.env.VITE_API_URL);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/class/teacher/${classId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        console.log(response);

        if (!response.ok) {
          let errorMessage =
            'Er is iets misgegaan bij het verwijderen van de klas.';
          if (
            response.headers.get('Content-Type')?.includes('application/json')
          ) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
          throw new Error(errorMessage);
        }

        await queryClient.invalidateQueries({ queryKey: ['classes'] });
        navigate('/teacher/classes');
      } catch (error) {
        console.error('Fout bij het verwijderen van de klas:', error);
      }
    }
  };

  // Function to handle sidebar navigation
  const handleSectionChange = (section: SidebarSection) => {
    setActiveSection(section);
  };

  // Add this function to your EditClassTeacher component
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
        className={`px-7 h-10 font-bold rounded-md ${isActive
          ? 'bg-dwengo-green-darker pt-1 text-white border-gray-600 border-3'
          : 'pt-1.5 bg-dwengo-green hover:bg-dwengo-green-dark text-white '
          }`}
      >
        {label}
      </button>
    );
  };


  // Then replace the renderSidebarItem function with:
  const renderSidebarItem = (section: SidebarSection, label: string) => {
    return (
      <SidebarButton
        section={section}
        label={label}
        activeSection={activeSection}
        onClick={handleSectionChange}
      />
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Class Info Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    <span className="max-w-[400px] truncate inline-block align-bottom" title={className}>
                      {className}
                    </span>
                  </h2>
                  <p className="text-gray-500">Klas overzicht en instellingen</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">KLAS CODE</div>
                  <div className="text-2xl font-mono bg-gray-50 px-4 py-2 rounded-md">
                    {classData?.code}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => navigator.clipboard.writeText(classData?.code || '')}
                  className="flex-1 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm text-gray-500 mb-1">Deel code met leerlingen</div>
                  <div className="font-medium">Kopieer klas code</div>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/class/teacher/${classId}/join-link`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                          },
                        },
                      );
                      if (!response.ok) throw new Error('Kon de klascode niet vernieuwen');
                      await queryClient.invalidateQueries({ queryKey: ['class', classId] });
                    } catch (error) {
                      console.error('Fout bij het vernieuwen van de klascode:', error);
                    }
                  }}
                  className="flex-1 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm text-gray-500 mb-1">Vernieuw klas code</div>
                  <div className="font-medium">Genereer nieuwe code</div>
                </button>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">Klas instellingen</h3>
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klasnaam
                    </label>
                    <InputWithChecks
                      ref={classNameRef}
                      inputType="text"
                      validate={(value: string) => validateForm(value, [validateRequired, (value) => validateMaxLength(value, 50)])}
                      placeholder="Voer de naam van de klas in"
                      value={className}
                      max={50}
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleDeleteClass}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Verwijder klas
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <LoadingIndicatorButton /> Opslaan...
                        </span>
                      ) : (
                        'Wijzigingen opslaan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
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
                    const filtered = assignments?.filter((assignment) =>
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
                    {filteredAssignments.map((assignment) => (
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
        return (
          <Container>
            <BoxBorder extraClasses="mxw-700 m-a g-20">
              <h2>Vragen</h2>
              <p>Hier komen de vragen van leerlingen.</p>
              {questions.map((question) => (
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
                        {new Date(question.createdAt).toLocaleString('nl-BE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
              ))}
              {/* Placeholder for a question list */}
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="text-gray-500">Nog geen vragen beschikbaar.</p>
              </div>
            </BoxBorder>
          </Container>
        );
      case 'manage':
        return (
          <>
            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Beheer Leerlingen</h2>
                <Link to={`/teacher/classes/${classId}/students`}>
                  <PrimaryButton>Bekijk Leerlingen</PrimaryButton>
                </Link>
              </BoxBorder>
            </Container>

            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Beheer Uitnodigingen</h2>
                <div className="flex gap-4">
                  <Link to={`/teacher/classes/${classId}/teacher-invites`}>
                    <PrimaryButton>Leerkracht Uitnodigingen</PrimaryButton>
                  </Link>
                  <Link to={`/teacher/classes/${classId}/join-requests`}>
                    <PrimaryButton>Leerling Verzoeken</PrimaryButton>
                  </Link>
                </div>
              </BoxBorder>
            </Container>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (isError) {
    return <div className="c-r">Fout: {(error as Error).message}</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64  min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">
          Dashboard voor{' '}
          <span className="max-w-[180px] truncate inline-block align-bottom" title={classData?.name}>
            {classData?.name}
          </span>
        </h2>
        <div className="flex flex-col space-y-3 mb-2">
          <div className="border-b pb-2 mb-2"></div>
          <h3 className="text-gray-500 text-sm font-medium mb-2 pl-2">KLAS BEHEER</h3>
          {renderSidebarItem('overview', 'Overzicht')}
        </div>

        <div className="border-b pb-2 mb-2 flex flex-col space-y-3">
          <h3 className="text-gray-500 text-sm font-medium mb-2 pl-2">OPDRACHTEN</h3>
          {renderSidebarItem('assignments', 'Opdrachten')}
          {renderSidebarItem('questions', 'Vragen')}
        </div>

        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2 pl-2">ADMINISTRATIE</h3>
          {renderSidebarItem('manage', 'Beheer')}
        </div>

      </div>

      {/* Main content */}
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default EditClassTeacher;
