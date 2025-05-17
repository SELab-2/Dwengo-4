import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import InputWithChecks from '../../components/shared/InputWithChecks';
import PrimaryButton from '../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import { validateForm, validateRequired } from '@/util/shared/validation';
import { ClassItem } from '@/types/type';
import { fetchAssignments } from '@/util/teacher/assignment';
import { fetchClass, updateClass } from '@/util/teacher/class';

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
        className={`px-7 h-10 font-bold rounded-md ${
          isActive
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
          <>
            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Huidige klasnaam: {className}</h2>
              </BoxBorder>
              <BoxBorder>
                <h1>Klas Bewerken</h1>
                <form className="g-20" onSubmit={handleFormSubmit}>
                  <InputWithChecks
                    ref={classNameRef}
                    label="Klasnaam"
                    inputType="text"
                    validate={(value: string) =>
                      validateForm(value, [validateRequired])
                    }
                    placeholder="Voer de naam van de klas in"
                    value={className}
                  />
                  <div className="flex gap-4">
                    <PrimaryButton type="submit" disabled={isPending}>
                      Opslaan
                      {isPending && <LoadingIndicatorButton />}
                    </PrimaryButton>
                    <button
                      type="button"
                      className={`px-7 h-10 font-bold rounded-md  bg-red-500 text-white hover:bg-red-700 hover:cursor-pointer`}
                      onClick={handleDeleteClass}
                    >
                      Klas Verwijderen
                    </button>
                  </div>
                </form>
              </BoxBorder>
            </Container>

            <Container>
              <BoxBorder extraClasses="">
                <h2>Klas Code: {classData?.code}</h2>
                <p>
                  Deel deze code met leerlingen om ze uit te nodigen voor deze
                  klas.
                </p>
                <PrimaryButton
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${
                          import.meta.env.VITE_API_URL
                        }/class/teacher/${classId}/join-link`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem(
                              'token',
                            )}`,
                          },
                        },
                      );

                      if (!response.ok) {
                        throw new Error('Kon de klascode niet vernieuwen');
                      }

                      await queryClient.invalidateQueries({
                        queryKey: ['class', classId],
                      });
                    } catch (error) {
                      console.error(
                        'Fout bij het vernieuwen van de klascode:',
                        error,
                      );
                    }
                  }}
                >
                  Genereer Nieuwe Code // TODO BORKED
                </PrimaryButton>
              </BoxBorder>
            </Container>
          </>
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
          Dashboard voor {classData?.name}
        </h2>
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
