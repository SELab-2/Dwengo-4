import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Container from "../../components/shared/Container";
import BoxBorder from "../../components/shared/BoxBorder";
import InputWithChecks from "../../components/shared/InputWithChecks";
import PrimaryButton from "../../components/shared/PrimaryButton";
import LoadingIndicatorButton from "../../components/shared/LoadingIndicatorButton";
import { validateRequired, validateForm } from "../../util/shared/validation";
import NavButton from "../../components/shared/NavButton";

interface ClassDetails {
  id: string;
  name: string;
  code: string;
}

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

// Define sidebar navigation sections
type SidebarSection = "overview" | "assignments" | "questions" | "manage";

const EditClassTeacher: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [className, setClassName] = useState("");
  const classNameRef = React.useRef<InputWithChecksRef | null>(null);

  // Add state for active sidebar section
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("overview");

  // Fetch class details
  const {
    data: classData,
    isLoading,
    isError,
    error,
  } = useQuery<ClassDetails>({
    queryKey: ["class", classId],
    queryFn: async () => {
      try {
        console.log("Fetching class with ID:", classId);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/teacher/classes`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(
            `Er is iets misgegaan bij het ophalen van de klasgegevens. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("All classes data:", data);

        const classes = data || [];
        console.log("Classes array:", classes);

        // Convert classId to string for comparison if needed
        const targetClassId = classId;
        console.log("Looking for class with ID:", targetClassId);

        const targetClass = classes.find(
          (c: any) => String(c.id) === String(targetClassId)
        );
        console.log("Found class:", targetClass);

        if (!targetClass) {
          console.error("Class not found in the list of classes");
          throw new Error(`Klas met ID ${targetClassId} niet gevonden`);
        }

        return targetClass;
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
  });

  // Update class name mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/teacher/classes/${classId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Er is iets misgegaan bij het bijwerken van de klasnaam."
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      navigate("/teacher/classes");
    },
  });

  useEffect(() => {
    if (classData) {
      console.log("Setting class name from data:", classData.name);
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
        "Weet je zeker dat je deze klas wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
      )
    ) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/teacher/classes/${classId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "Er is iets misgegaan bij het verwijderen van de klas."
          );
        }

        queryClient.invalidateQueries({ queryKey: ["classes"] });
        navigate("/teacher/classes");
      } catch (error) {
        console.error("Fout bij het verwijderen van de klas:", error);
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
            ? "bg-green-700 pt-1 text-white border-gray-600 border-3"
            : "pt-1.5 bg-lime-500 text-white hover:bg-lime-600"
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
      case "overview":
        return (
          <>
            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
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
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      onClick={handleDeleteClass}
                    >
                      Klas Verwijderen
                    </button>
                  </div>
                </form>
              </BoxBorder>
            </Container>

            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Klas Code: {classData?.code}</h2>
                <p>
                  Deel deze code met leerlingen om ze uit te nodigen voor deze
                  klas.
                </p>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${
                          import.meta.env.VITE_API_URL
                        }/teacher/classes/${classId}/regenerate-join-link`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Kon de klascode niet vernieuwen");
                      }

                      queryClient.invalidateQueries({
                        queryKey: ["class", classId],
                      });
                    } catch (error) {
                      console.error(
                        "Fout bij het vernieuwen van de klascode:",
                        error
                      );
                    }
                  }}
                >
                  Genereer Nieuwe Code
                </button>
              </BoxBorder>
            </Container>
          </>
        );
      case "assignments":
        return (
          <Container>
            <BoxBorder extraClasses="mxw-700 m-a g-20">
              <div className="flex justify-between items-center mb-4">
                <h2>Opdrachten</h2>
                <PrimaryButton
                  onClick={() =>
                    navigate(`/teacher/classes/${classId}/assignments/new`)
                  }
                >
                  Nieuwe Opdracht
                </PrimaryButton>
              </div>
              <p>Hier komen de opdrachten voor deze klas.</p>
              {/* Placeholder for assignments list */}
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="text-gray-500">
                  Nog geen opdrachten beschikbaar.
                </p>
              </div>
            </BoxBorder>
          </Container>
        );
      case "questions":
        return (
          <Container>
            <BoxBorder extraClasses="mxw-700 m-a g-20">
              <h2>Vragen</h2>
              <p>Hier komen de vragen van leerlingen.</p>
              {/* Placeholder for questions list */}
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="text-gray-500">Nog geen vragen beschikbaar.</p>
              </div>
            </BoxBorder>
          </Container>
        );
      case "manage":
        return (
          <>
            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Beheer Leerlingen</h2>
                <PrimaryButton
                  onClick={() =>
                    navigate(`/teacher/classes/${classId}/students`)
                  }
                >
                  Bekijk Leerlingen
                </PrimaryButton>
              </BoxBorder>
            </Container>

            <Container>
              <BoxBorder extraClasses="mxw-700 m-a g-20">
                <h2>Beheer Uitnodigingen</h2>
                <div className="flex gap-4">
                  <PrimaryButton
                    onClick={() =>
                      navigate(`/teacher/classes/${classId}/teacher-invites`)
                    }
                  >
                    Leerkracht Uitnodigingen
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={() =>
                      navigate(`/teacher/classes/${classId}/join-requests`)
                    }
                  >
                    Leerling Verzoeken
                  </PrimaryButton>
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
      <div className="w-64 bg-gray-100 min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">
          Dashboard voor {classData?.name}
        </h2>
        <div className="flex flex-col gap-2">
          {renderSidebarItem("overview", "Overview")}
          {renderSidebarItem("assignments", "Assignments")}
          {renderSidebarItem("questions", "Questions")}
          {renderSidebarItem("manage", "Manage")}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default EditClassTeacher;
