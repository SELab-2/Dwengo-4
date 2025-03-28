import React, { use, useEffect, useState } from "react";
import styles from "./AddAssignmentForm.module.css";
import TeamCreationModal from "./TeamCreationModal";
import {
  fetchLearningPaths,
  postAssignment,
} from "../../../util/teacher/httpTeacher";
import { useQuery } from "@tanstack/react-query";
import { ClassItem, LearningPath, Team } from "../../../types/type";

const CustomDropdownMultiselect = ({
  options,
  selectedOptions,
  onChange,
}: {
  options: ClassItem[];
  selectedOptions: ClassItem[];
  onChange: (selected: ClassItem[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = (option: ClassItem) => {
    const isSelected = selectedOptions.some((item) => item.id === option.id);
    const updatedSelection = isSelected
      ? selectedOptions.filter((item) => item.id !== option.id)
      : [...selectedOptions, option];
    onChange(updatedSelection);
  };

  return (
    <div className={styles.customDropdown}>
      <div className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
        {selectedOptions.length === 0 ? (
          <span className={styles.placeholder}>Select classes</span>
        ) : (
          <div className={styles.selectedChips}>
            {selectedOptions.map((option) => (
              <span key={option.id} className={styles.chip}>
                {option.name}
                <span
                  className={styles.chipRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(option);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}
        <span className={styles.arrow}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div key={option.id} className={styles.dropdownOption}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.some(
                    (item) => item.id === option.id
                  )}
                  onChange={() => handleOptionToggle(option)}
                />
                {option.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddAssignmentForm = ({ classesData }: { classesData: ClassItem[] }) => {
  const [isTeamOpen, setIsTeamOpen] = useState<boolean>(false);
  const [assignmentType, setAssignmentType] = useState<string>("");
  const [teams, setTeams] = useState<Record<string, Team[]>>({});
  const [teamSize, setTeamSize] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);
  const [selectedLearningPath, setSelectedLearningPath] =
    useState<LearningPath>();
  const [formErrors, setFormErrors] = useState<{
    classes?: string;
    teams?: string;
  }>({});

  const {
    data: learningPathsData,
    isLoading: isLearningPathsLoading,
    isError: isLearningPathsError,
    error: learningPathsError,
  } = useQuery<LearningPath[], Error>({
    queryKey: ["learningPaths"],
    queryFn: fetchLearningPaths,
  });

  useEffect(() => {
    setLearningPaths(learningPathsData || []
    );
  }, [learningPathsData]);

  const handleTeamClicks = () => {
    setIsTeamOpen(true);
  };

  const handleAssignmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAssignmentType(e.target.value);
  };

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    if (size > 0) {
      setTeamSize(size);
    }
  };

  const handleLearningPathChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const pathId = e.target.value;
    const path = learningPaths.find((path) => path.id === pathId);
    setSelectedLearningPath(path);
  };

  //datum voor morgen instellen zodat mensen alleen deadlines kunnen kiezen vanaf morgen
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const formattedDate = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  const validateForm = () => {
    const errors: { classes?: string; teams?: string } = {};

    if (selectedClasses.length === 0) {
      errors.classes = "Please select at least one class";
    }

    if (assignmentType === "group" && Object.keys(teams).length === 0) {
      errors.teams = "Please create teams before submitting";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Convert teams object keys from string to number
    const teamsWithNumberKeys: Record<number, Team[]> = {};

    if (assignmentType === "group") {
      Object.entries(teams).forEach(([key, team]) => {
        teamsWithNumberKeys[Number(key)] = team.map(team => ({
          ...team,
          teamName: team.id,
          studentIds: team.members.map(member => member.id as unknown as number)
        }));
      });
    } else {
      // Create individual teams for non-group assignments
      selectedClasses.forEach((classItem: ClassItem) => {
        const individualTeams = classItem.students.map((student) => ({
          id: 'null',
          teamName: `individual-${student.id}`,
          studentIds: [student.id],
          members: [student], // Add members to team for easier access
        }));
        teamsWithNumberKeys[Number(classItem.id)] = individualTeams;
      });
    }

    console.log("Submitting form with data:", {
      title,
      description,
      pathLanguage: "nl", // default to English
      isExternal: selectedLearningPath?.isExternal || false,
      deadline: date,
      learningPathId: selectedLearningPath?.id || "",
      classTeams: teamsWithNumberKeys,
    });


    postAssignment({
      title,
      description,
      pathLanguage: "nl", // default to English
      isExternal: selectedLearningPath?.isExternal || false,
      deadline: date,
      learningPathId: selectedLearningPath?.id || "",
      classTeams: teamsWithNumberKeys,
    })
      .then(() => {
        // Handle success (e.g., show message, redirect)
        console.log("Assignment created successfully");
      })
      .catch((error) => {
        console.error("Error creating assignment:", error);
        // Handle error (e.g., show error message)
      });


  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.header}>Assign Learning path to Classes:</h2>

      <div className={styles.form}>
        <form onSubmit={handleSubmission}>
          <div className={styles.formGroup}>
            <label htmlFor="class" className={styles.label}>
              Choose Class:
            </label>
            <CustomDropdownMultiselect
              options={classesData || []}
              selectedOptions={selectedClasses}
              onChange={setSelectedClasses}
            />
            {formErrors.classes && (
              <span className={styles.error}>{formErrors.classes}</span>
            )}
          </div>
          <div>
            <label htmlFor="title">Add Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="learningPath">Choose Learning Path:</label>
            {isLearningPathsLoading ? (
              <div>Loading learning paths...</div>
            ) : isLearningPathsError ? (
              <div>Error loading learning paths: {learningPathsError?.message}</div>
            ) : (
              <select
                required
                id="learningPath"
                name="learningPath"
                onChange={handleLearningPathChange}
                value={selectedLearningPath?.id || ""}
              >
                <option value="">-Select a Path-</option>
                {learningPaths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="description">Add Description:</label>
            <textarea
              id="description"
              name="description"
              required
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              cols={50}
            ></textarea>
          </div>

          <div className={styles.middle}>
            <div className={styles.leftSide}>
              <div>
                <label htmlFor="AssignmentPath">Assignment Type:</label>
                <select
                  required
                  id="AssignmentPath"
                  name="AssignmentPath"
                  onChange={handleAssignmentTypeChange}
                  value={assignmentType}
                >
                  <option value="">Select a type</option>
                  <option value="group">Group</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              {assignmentType === "group" && (
                <div className={styles.inputTeam}>
                  <h6>Choose Team Size: </h6>
                  <input
                    type="number"
                    id="teamSize"
                    name="teamSize"
                    min={1}
                    value={teamSize}
                    onChange={handleTeamSizeChange}
                  />
                </div>
              )}
            </div>
            {assignmentType === "group" && teamSize > 0 && (
              <div className={styles.rightSide}>
                <h6>Teams:</h6>
                <div className={styles.teamsList}>
                  {Object.entries(teams).map(([classId, classTeams]) => (
                    <div key={classId}>
                      <h6>KLAS: {selectedClasses.find(c => c.id == classId)?.name}</h6>
                      {classTeams.map((team) => (
                        <div key={team.id} className={styles.teamPreview}>
                          <p>
                            {team.id}: {team.members.map(member =>
                              `${member.firstName} ${member.lastName}`
                            ).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <button
                  className={styles.editButton}
                  type="button"
                  onClick={() => handleTeamClicks()}
                >
                  Edit Teams
                </button>
              </div>
            )}
          </div>
          {assignmentType === "group" && formErrors.teams && (
            <div className={styles.error}>{formErrors.teams}</div>
          )}

          <div>
            <label htmlFor="deadline">Choose Deadline:</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              required
              min={formattedDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={styles.buttonFooter}>
            <button className={styles.cancelButton} formNoValidate>
              Cancel
            </button>
            <button className={styles.submitButton} type="submit">
              Confirm
            </button>
          </div>
        </form>
      </div>

      {isTeamOpen && (
        <TeamCreationModal
          classes={selectedClasses}
          onClose={() => setIsTeamOpen(false)}
          teams={teams}
          setTeams={setTeams}
          teamSize={teamSize}
          selectedClasses={selectedClasses}
        />
      )}
    </section>
  );
};

export default AddAssignmentForm;
