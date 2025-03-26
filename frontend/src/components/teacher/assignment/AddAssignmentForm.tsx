import React, { use, useEffect, useState } from "react";
import styles from "./AddAssignmentForm.module.css";
import TeamCreationModal from "./TeamCreationModal";
import {
  fetchLearningPaths,
  fetchClasses,
} from "../../../util/teacher/httpTeacher";
import { useQuery } from "@tanstack/react-query";
import { MultiSelect } from "primereact/multiselect";

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LearningPath {
  id: string;
  title: string;
}

interface formData {
  name: string;
  students: StudentItem[];
}

interface Team {
  id: string;
  members: StudentItem[];
}

interface ClassItem {
  id: string;
  name: string;
}

const AddAssignmentForm = ({ formData }: { formData: formData }) => {
  const [isTeamOpen, setIsTeamOpen] = useState<boolean>(false);
  const [assignmentType, setAssignmentType] = useState<string>("");
  const [Teams, setTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);
  const [selectedLearningPath, setSelectedLearningPath] =
    useState<LearningPath>();

  const {
    data: classes,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const {
    data: learningPathsData,
    isLoading: isLearningPathsLoading,
    isError: isLearningPathsError,
    error: learningPathsError,
  } = useQuery<LearningPath[]>({
    queryKey: ["learningPaths"],
    queryFn: fetchLearningPaths,
  });

  useEffect(() => {
    setLearningPaths(
      learningPathsData?.map((data: any) => ({
        id: data.id,
        title: data.title,
      })) || []
    );
  }, [learningPathsData]);

  //TODO: handle loading and error states
  if (isLearningPathsLoading) {
    return <div>Loading...</div>;
  }

  if (isLearningPathsError) {
    return <div>Error: {learningPathsError?.message}</div>;
  }

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
    console.log(path);
  };

  //datum voor morgen instellen zodat mensen alleen deadlines kunnen kiezen vanaf morgen
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const formattedDate = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  const handleSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.header}>
        Assign Learning path to Classes: {formData.name}
      </h2>

      <div className={styles.form}>
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="class" className={styles.label}>
              Choose Class:
            </label>
            <MultiSelect
              id="class"
              value={selectedClasses}
              onChange={(e) => setSelectedClasses(e.value)}
              options={classes || []}
              optionLabel="name"
              display="chip"
              placeholder="Select classes"
              maxSelectedLabels={5}
              className={`${styles.multiselect} w-full md:w-20rem`}
              disabled={isLoading}
            />
            {isLoading && (
              <p className={styles.loadingText}>Loading classes...</p>
            )}
            {isError && (
              <p className={styles.errorText}>
                Error loading classes: {error?.message}
              </p>
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
                  {Teams.map((team: any) => (
                    <div key={team.id} className={styles.teamPreview}>
                      <p>
                        Team-{team.id}:{" "}
                        {team.members
                          .map(
                            (member: any) =>
                              `${member.firstName} ${member.lastName}`
                          )
                          .join(", ")}
                      </p>
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
          students={formData.students}
          onClose={() => setIsTeamOpen(false)}
          teams={Teams}
          setTeams={setTeams}
          teamSize={teamSize}
        />
      )}
    </section>
  );
};

export default AddAssignmentForm;
