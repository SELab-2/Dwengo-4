import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddAssignmentForm.module.css';
import TeamCreationModal from './TeamCreationModal';
import {
  fetchLearningPaths,
  postAssignment,
  updateAssignment,
} from '../../../util/teacher/httpTeacher';
import { useQuery } from '@tanstack/react-query';
import {
  AssignmentPayload,
  ClassItem,
  LearningPath,
  Team,
} from '../../../types/type';

/**
 * Custom multiselect dropdown component for selecting multiple classes
 * @param options - Array of available classes to select from
 * @param selectedOptions - Array of currently selected classes
 * @param onChange - Callback function when selection changes
 */
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
                    (item) => item.id === option.id,
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

/**
 * Form component for creating or editing assignments
 * Handles both individual and group assignments with features including:
 * - Class selection
 * - Assignment details (title, description)
 * - Learning path selection
 * - Team creation for group assignments
 * - Deadline setting
 * 
 * @param classesData - Array of available classes
 * @param classId - Optional ID of pre-selected class
 * @param isEditing - Boolean indicating if form is in edit mode
 * @param assignmentData - Existing assignment data when editing
 */
const AddAssignmentForm = ({
  classesData,
  classId,
  isEditing = false,
  assignmentData,
}: {
  classesData: ClassItem[];
  classId?: string;
  isEditing?: boolean;
  assignmentData?: AssignmentPayload;
}) => {
  // State declarations for form management
  const [isTeamOpen, setIsTeamOpen] = useState<boolean>(false);
  const [assignmentType, setAssignmentType] = useState<string>('');
  const [teams, setTeams] = useState<Record<string, Team[]>>({});
  const [teamSize, setTeamSize] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);
  const [selectedLearningPath, setSelectedLearningPath] =
    useState<LearningPath>();
  const [formErrors, setFormErrors] = useState<{
    classes?: string;
    teams?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();

  /**
   * Fetches learning paths data using React Query
   * Automatically handles loading, error states, and caching
   */
  const {
    data: learningPathsData,
    isLoading: isLearningPathsLoading,
    isError: isLearningPathsError,
    error: learningPathsError,
  } = useQuery<LearningPath[], Error>({
    queryKey: ['learningPaths'],
    queryFn: fetchLearningPaths,
  });

  /**
   * Populates form with existing assignment data when in edit mode
   */
  useEffect(() => {
    if (isEditing && assignmentData) {
      setTitle(assignmentData.title);
      setDescription(assignmentData.description);
      setDate(new Date(assignmentData.deadline).toISOString().split('T')[0]);
      setSelectedClasses(
        classesData.filter(
          (c) =>
            assignmentData.classAssignments &&
            assignmentData.classAssignments.some((ca) => ca.class.id === c.id),
        ) ?? [],
      );
      setTeamSize(Number(assignmentData.teamSize));
      if (assignmentData.teamSize > 1) {
        setAssignmentType('group');
      } else {
        setAssignmentType('individual');
      }
      setTeams(assignmentData.classTeams!);
    }
  }, [isEditing, classesData]);

  // Add this useEffect to handle the selection after classesData is loaded
  useEffect(() => {
    if (classId && classesData?.length) {
      const filtered = classesData.filter((c) => c.id.toString() === classId);
      setSelectedClasses(filtered);
    }
  }, [classId, classesData]);

  useEffect(() => {
    setLearningPaths(learningPathsData || []);
    if (isEditing && assignmentData) {
      setSelectedLearningPath(
        learningPathsData?.find((path) => path.id === assignmentData.pathRef),
      );
    }
  }, [learningPathsData, isEditing]);

  const handleTeamClicks = () => {
    setIsTeamOpen(true);
  };

  const handleAssignmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
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
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const pathId = e.target.value;
    const path = learningPaths.find((path) => path.id === pathId);
    setSelectedLearningPath(path);
  };

  //datum voor morgen instellen zodat mensen alleen deadlines kunnen kiezen vanaf morgen
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  /**
   * Validates form data before submission
   * Checks for required fields and team creation for group assignments
   * @returns boolean indicating if form is valid
   */
  const validateForm = () => {
    const errors: { classes?: string; teams?: string } = {};

    if (selectedClasses.length === 0) {
      errors.classes = 'Please select at least one class';
    }

    if (assignmentType === 'group' && Object.keys(teams).length === 0) {
      errors.teams = 'Please create teams before submitting';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission for both create and edit modes
   * Processes team data and makes appropriate API calls
   * @param e - Form submission event
   */
  const handleSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Convert teams object keys from string to number
    const teamsWithNumberKeys: Record<number, Team[]> = {};

    if (assignmentType === 'group') {
      Object.entries(teams).forEach(([key, team]) => {
        teamsWithNumberKeys[Number(key)] = team.map((team) => ({
          ...team,
          teamName: team.id,
          studentIds: team.students.map(
            (member) => member.id as unknown as number,
          ),
        }));
      });
    } else {
      // Create individual teams for non-group assignments
      selectedClasses.forEach((classItem: ClassItem) => {
        const individualTeams = classItem.students.map((student) => ({
          id: 'null',
          teamName: `individual-${student.id}`,
          studentIds: [student.id],
          students: [student], // Add members to team for easier access
        }));
        teamsWithNumberKeys[Number(classItem.id)] = individualTeams;
      });
    }

    if (isEditing) {
      updateAssignment({
        id: assignmentData?.id,
        title,
        description,
        pathLanguage: 'nl',
        isExternal: selectedLearningPath?.isExternal || false,
        deadline: date,
        pathRef: selectedLearningPath?.id || '',
        classTeams: teamsWithNumberKeys,
        teamSize: teamSize,
      })
        .then(() => {
          console.log('Assignment updated successfully');
          navigate(`/teacher/assignments/${assignmentData?.id}`);
        })
        .catch((error) => {
          console.error('Error updating assignment:', error);
          setSubmitError(error.message || 'Failed to update assignment');
          setIsSubmitting(false);
        });
    } else {
      postAssignment({
        title,
        description,
        pathLanguage: 'nl',
        isExternal: selectedLearningPath?.isExternal || false,
        deadline: date,
        pathRef: selectedLearningPath?.id || '',
        classTeams: teamsWithNumberKeys,
        teamSize: teamSize,
      })
        .then(() => {
          console.log('Assignment created successfully');
          navigate('/teacher');
        })
        .catch((error) => {
          console.error('Error creating assignment:', error);
          setSubmitError(error.message || 'Failed to create assignment');
          setIsSubmitting(false);
        });
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.header}>
        {isEditing ? 'Edit' : 'Assign'} Assignment to Classes:
      </h2>

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
            <label htmlFor="title">
              {' '}
              {isEditing ? 'Edit Title:' : 'Add Title:'}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="learningPath">Choose Learning Path:</label>
            {isLearningPathsLoading ? (
              <div>Loading learning paths...</div>
            ) : isLearningPathsError ? (
              <div>
                Error loading learning paths: {learningPathsError?.message}
              </div>
            ) : (
              <select
                required
                id="learningPath"
                name="learningPath"
                onChange={handleLearningPathChange}
                value={selectedLearningPath?.id || ''}
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
            <label htmlFor="description">
              {isEditing ? 'Edit Description:' : 'Add Description:'}
            </label>
            <textarea
              id="description"
              name="description"
              required
              onChange={(e) => setDescription(e.target.value)}
              value={description}
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
              {assignmentType === 'group' && (
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
            {assignmentType === 'group' && teamSize > 0 && (
              <div className={styles.rightSide}>
                <h6>Teams:</h6>
                <div className={styles.teamsList}>
                  {Object.entries(teams).map(([classId, classTeams]) => (
                    <div key={classId}>
                      <h6>
                        KLAS:{' '}
                        {selectedClasses.find((c) => c.id == classId)?.name}
                      </h6>
                      {classTeams.map((team) => (
                        <div key={team.id} className={styles.teamPreview}>
                          <p>
                            {team.id}:{' '}
                            {team.students
                              .map(
                                (member) =>
                                  `${member.firstName} ${member.lastName}`,
                              )
                              .join(', ')}
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
          {assignmentType === 'group' && formErrors.teams && (
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
              value={date}
            />
          </div>

          <div className={styles.buttonFooter}>
            <button className={styles.cancelButton} formNoValidate>
              Cancel
            </button>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
          {submitError && (
            <div className={styles.error}>
              {submitError}
            </div>
          )}
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
