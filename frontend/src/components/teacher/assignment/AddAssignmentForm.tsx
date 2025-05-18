import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddAssignmentForm.module.css';
import TeamCreationModal from './TeamCreationModal';
import FormFields from './FormFields';
import AssignmentTypeSelection from './AssignmentTypeSelection';
import TeamsDisplay from './TeamsDisplay';
import { useQuery } from '@tanstack/react-query';
import {
  AssignmentPayload,
  ClassItem,
  LearningPath,
  StudentItem,
  Team,
} from '../../../types/type';
import { fetchLearningPaths } from '@/util/shared/learningPath';
import { postAssignment, updateAssignment } from '@/util/teacher/assignment';
import { useTranslation } from 'react-i18next';

/**
 * Builds assignment payload from form data
 */
const buildAssignmentPayload = ({
  title,
  description,
  date,
  selectedLearningPath,
  teams,
  assignmentType,
  teamSize,
  selectedClasses,
  individualStudents,
  assignmentId,
}: {
  title: string;
  description: string;
  date: string;
  selectedLearningPath?: LearningPath;
  teams: Record<string, Team[]>;
  assignmentType: string;
  teamSize: number;
  selectedClasses: ClassItem[];
  individualStudents: Record<string, StudentItem[]>;
  assignmentId?: string;
}) => {
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
    selectedClasses.forEach((classItem) => {
      const selectedStudents = individualStudents[classItem.id] || [];
      teamsWithNumberKeys[Number(classItem.id)] = selectedStudents.map(
        (student) => ({
          id: `individual-${student.id}`,
          teamName: `individual-${student.id}`,
          studentIds: [student.id as unknown as number],
          students: [student],
        }),
      );
    });
  }

  const payload = {
    title,
    description,
    pathLanguage: 'nl',
    isExternal: selectedLearningPath?.isExternal || false,
    deadline: date,
    pathRef: selectedLearningPath?.id || '',
    classTeams: teamsWithNumberKeys,
    teamSize: assignmentType === 'individual' ? 1 : teamSize,
  };

  return assignmentId ? { ...payload, id: Number(assignmentId) } : payload;
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
  const [teamSize, setTeamSize] = useState<number>(2);
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
    learningPath?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [individualStudents, setIndividualStudents] = useState<
    Record<string, StudentItem[]>
  >({});

  const navigate = useNavigate();
  const { t } = useTranslation();

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
    console.log('Assignment Datagfdsfg:', assignmentData);

    if (isEditing && assignmentData) {
      console.log('Assignment Datagfdsfg:', assignmentData);
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

      // Only set selected students from existing teams for individual assignments
      if (assignmentData.teamSize === 1) {
        const studentsPerClass: Record<string, StudentItem[]> = {};
        Object.entries(assignmentData.classTeams || {}).forEach(
          ([classId, teams]) => {
            // Only include students that were actually in teams
            const selectedStudents = teams.flatMap((team) => team.students);
            if (selectedStudents.length > 0) {
              studentsPerClass[classId] = selectedStudents;
            }
          },
        );
        setIndividualStudents(studentsPerClass);
      }
    }
  }, [isEditing, classesData, assignmentData]);

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

  // Add effect to initialize all students when switching to individual
  useEffect(() => {
    if (assignmentType === 'individual' && !isEditing) {
      const allStudents: Record<string, StudentItem[]> = {};
      selectedClasses.forEach((classItem) => {
        allStudents[classItem.id] = []; // Initialize empty array instead of all students
      });
      setIndividualStudents(allStudents);
    }
  }, [assignmentType, selectedClasses, isEditing]);

  // Add this useEffect before the return statement
  useEffect(() => {
    // Remove teams for classes that are no longer selected
    const updatedTeams = { ...teams };
    Object.keys(updatedTeams).forEach((classId) => {
      if (!selectedClasses.some((c) => c.id.toString() === classId)) {
        delete updatedTeams[classId];
      }
    });
    setTeams(updatedTeams);
  }, [selectedClasses]);

  const handleTeamClicks = () => {
    setIsTeamOpen(true);
  };

  const handleAssignmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setAssignmentType(e.target.value);
    if (e.target.value === 'group') {
      setTeamSize(2); // Set default team size to 2 when switching to group
    } else {
      setTeamSize(1); // Set team size to 1 for individual assignments
    }
  };

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    if (size > 1) {
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
    const errors: { classes?: string; teams?: string; learningPath?: string } = {};

    if (selectedClasses.length === 0) {
      errors.classes = 'Please select at least one class';
    }

    if (!selectedLearningPath) {
      errors.learningPath = t('assignments_form.learning_path.required');
    }

    if (assignmentType === 'group') {
      // Check if teams exist for each selected class
      const missingTeams = selectedClasses.some(
        (classItem) => !teams[classItem.id] || teams[classItem.id].length === 0,
      );
      if (missingTeams) {
        errors.teams = 'Please create teams for all selected classes';
      }
    } else if (assignmentType === 'individual') {
      const missingStudents = selectedClasses.some(
        (classItem) =>
          !individualStudents[classItem.id] ||
          individualStudents[classItem.id].length === 0,
      );
      if (missingStudents) {
        errors.teams = 'Please select at least one student for each class';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission for both create and edit modes
   * Processes team data and makes appropriate API calls
   * @param e - Form submission event
   */
  const handleSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = buildAssignmentPayload({
      title,
      description,
      date,
      selectedLearningPath,
      teams,
      assignmentType,
      teamSize,
      selectedClasses,
      individualStudents,
      assignmentId: assignmentData?.id?.toString(),
    });

    const action = isEditing ? updateAssignment : postAssignment;

    try {
      await action(payload);

      navigate(
        isEditing
          ? `/teacher/assignment/${assignmentData?.id}`
          : `/teacher/classes/${classId}`,
      );
    } catch (error: any) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} assignment:`,
        error,
      );
      setSubmitError(
        error.message ||
        `Failed to ${isEditing ? 'update' : 'create'} assignment`,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.header}>
        {isEditing ? t('assignments_form.edit') : t('assignments_form.assign')}
      </h2>

      <div className={styles.form}>
        <form onSubmit={handleSubmission}>
          <FormFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            selectedClasses={selectedClasses}
            setSelectedClasses={setSelectedClasses}
            classesData={classesData}
            isEditing={isEditing}
            formErrors={formErrors}
            learningPaths={learningPaths}
            selectedLearningPath={selectedLearningPath}
            handleLearningPathChange={handleLearningPathChange}
            isLearningPathsLoading={isLearningPathsLoading}
            isLearningPathsError={isLearningPathsError}
            learningPathsError={learningPathsError}
          />

          <div className={styles.middle}>
            <AssignmentTypeSelection
              assignmentType={assignmentType}
              teamSize={teamSize}
              onAssignmentTypeChange={handleAssignmentTypeChange}
              onTeamSizeChange={handleTeamSizeChange}
            />
            {assignmentType && (
              <TeamsDisplay
                assignmentType={assignmentType}
                teams={teams}
                selectedClasses={selectedClasses}
                individualStudents={individualStudents}
                onEditClick={() => handleTeamClicks()}
              />
            )}
          </div>
          {formErrors.teams && (
            <div className={styles.error}>{formErrors.teams}</div>
          )}
          {formErrors.learningPath && (
            <div className={styles.error}>{formErrors.learningPath}</div>
          )}

          <div>
            <label htmlFor="deadline">{t('assignments_form.deadline')}</label>
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
            <button
              type="button"
              className={styles.cancelButton}
              formNoValidate
              onClick={() => navigate(-1)}
            >
              {t('assignments_form.cancel')}
            </button>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting || isLearningPathsLoading}
            >
              {isSubmitting
                ? t('assignments_form.submitting')
                : t('assignments_form.submit')}
            </button>
          </div>
          {submitError && <div className={styles.error}>{submitError}</div>}
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
          isIndividual={assignmentType === 'individual'}
          individualStudents={individualStudents}
          setIndividualStudents={setIndividualStudents}
        />
      )}
    </section>
  );
};

export default AddAssignmentForm;
