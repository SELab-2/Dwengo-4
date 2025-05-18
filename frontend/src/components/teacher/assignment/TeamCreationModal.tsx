import React, { useEffect, useState } from 'react';
import styles from './TeamCreationModal.module.css';
import { FaMinus, FaTrash } from 'react-icons/fa';
import { ClassItem, StudentItem, Team } from '../../../types/type';
import { useTranslation } from 'react-i18next';

interface Props {
  classes: ClassItem[];
  onClose: () => void;
  teams: Record<string, Team[]>;
  setTeams: (teams: Record<string, Team[]>) => void;
  teamSize: number;
  selectedClasses: ClassItem[];
  isIndividual?: boolean;
  individualStudents?: Record<string, StudentItem[]>;
  setIndividualStudents?: (students: Record<string, StudentItem[]>) => void;
}

const TeamCreationModal = ({
  classes,
  onClose,
  teams,
  setTeams,
  teamSize,
  selectedClasses,
  isIndividual = false,
  individualStudents = {},
  setIndividualStudents,
}: Props) => {
  const [selectedStudents, setSelectedStudents] = useState<StudentItem[]>([]);
  const [availableStudents, setAvailableStudents] = useState<StudentItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(
    classes[0] || null,
  );
  const { t } = useTranslation();

  useEffect(() => {
    const studentsInTeams = selectedClass
      ? (teams[selectedClass.id]?.flatMap((team) =>
        team.students.map((member) => member.id),
      ) ?? [])
      : [];

    const availableStuds =
      selectedClass?.students?.filter(
        (student: StudentItem) => !studentsInTeams.includes(student.id),
      ) ?? [];
    setAvailableStudents(availableStuds);

    // Clear selected students when switching classes
    setSelectedStudents([]);
  }, [teams, selectedClass]);

  const handleChangeClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = Number(e.target.value);
    const classItem = classes.find((c) => Number(c.id) === classId);
    setSelectedClass(classItem || null);
  };

  const getNextTeamNumber = (classTeams: Team[]) => {
    if (!classTeams || classTeams.length === 0) return 1;
    const numbers = classTeams.map((team) => {
      const match = team.id.match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    });
    return Math.max(...numbers) + 1;
  };

  const handleStudentSelect = (student: StudentItem) => {
    if (selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id));
    } else if (selectedStudents.length < teamSize) {
      setSelectedStudents((prev) => [...prev, student]);
    }
  };

  const handleIndividualStudentSelect = (student: StudentItem) => {
    if (!selectedClass || !setIndividualStudents) return;

    const classId = selectedClass.id;
    setIndividualStudents({
      ...individualStudents,
      [classId]: individualStudents[classId]?.some((s) => s.id === student.id)
        ? individualStudents[classId].filter((s) => s.id !== student.id)
        : [...(individualStudents[classId] || []), student],
    });
  };

  const handleSelectAll = () => {
    if (!selectedClass || !setIndividualStudents) return;
    const classId = selectedClass.id;
    const allSelected = individualStudents[classId]?.length === selectedClass.students.length;

    setIndividualStudents({
      ...individualStudents,
      [classId]: allSelected ? [] : [...selectedClass.students],
    });
  };

  const createTeam = () => {
    if (!selectedClass || selectedStudents.length === 0) return;
    if (selectedStudents.length > teamSize) return;

    if (selectedStudents.length < teamSize) {
      if (
        !window.confirm(
          t('assignments_form.assign_team.incomplete_team_warning'),
        )
      )
        return;
    }

    const classTeams = teams[selectedClass.id] || [];
    const newTeam: Team = {
      id: `team-${getNextTeamNumber(classTeams)}`,
      students: selectedStudents,
    };

    setTeams({
      ...teams,
      [selectedClass.id]: [...classTeams, newTeam],
    });
    setSelectedStudents([]);
  };

  const deleteTeam = (classId: string, teamId: string) => {
    const classTeams = teams[classId] || [];
    const team = classTeams.find((t) => t.id === teamId);
    if (team) {
      setTeams({
        ...teams,
        [classId]: classTeams.filter((t) => t.id !== teamId),
      });
    }
  };

  const removeFromTeam = (
    classId: string,
    teamId: string,
    student: StudentItem,
  ) => {
    const classTeams = teams[classId] || [];
    setTeams({
      ...teams,
      [classId]: classTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            students: team.students.filter((m) => m.id !== student.id),
          };
        }
        return team;
      }),
    });
  };

  const generateRandomTeams = () => {
    if (!selectedClass) return;

    const shuffledStudents = [...availableStudents].sort(
      () => Math.random() - 0.5,
    );
    const newTeams: Team[] = [];

    for (let i = 0; i < shuffledStudents.length; i += teamSize) {
      const teamMembers = shuffledStudents.slice(i, i + teamSize);
      if (teamMembers.length === teamSize) {
        const teamNumber =
          getNextTeamNumber(teams[selectedClass.id] || []) +
          Math.floor(i / teamSize);
        newTeams.push({
          id: `team-${teamNumber}`,
          students: teamMembers,
        });
      }
    }

    setTeams({
      ...teams,
      [selectedClass.id]: newTeams,
    });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h2>
          {isIndividual
            ? t('assignments_form.assign_team.select_student')
            : t('assignments_form.assign_team.select_team')}
        </h2>
        {isIndividual ? (
          <p>{t('assignments_form.assign_team.student_help')}</p>
        ) : (
          <p>
            {t('assignments_form.assign_team.team_help', { size: teamSize })}
          </p>
        )}

        <select onChange={handleChangeClass}>
          {selectedClasses.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>

        <div className={styles.teamBuilder}>
          {isIndividual ? (
            <div className={styles.studentsList}>
              <h3>{t('assignments_form.assign_team.students')}</h3>
              <div className={styles.selectedCount}>
                {t('assignments_form.assign_team.selected')}:{' '}
                {individualStudents[selectedClass?.id || '']?.length || 0} /{' '}
                {selectedClass?.students.length || 0}
              </div>
              <div className={styles.students}>
                {selectedClass?.students.map((student) => (
                  <div
                    key={student.id}
                    className={`${styles.student} ${individualStudents[selectedClass.id]?.some(
                      (s) => s.id === student.id,
                    )
                      ? styles.selected
                      : ''
                      }`}
                    onClick={() => handleIndividualStudentSelect(student)}
                  >
                    {student.firstName} {student.lastName}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.studentsList}>
                <h3>{t('assignments_form.assign_team.available_students')}</h3>
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`${styles.student} ${selectedStudents.find((s) => s.id === student.id)
                      ? styles.selected
                      : ''
                      }`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    {student.firstName} {student.lastName}
                  </div>
                ))}
              </div>

              <div className={styles.teams}>
                <h3>{t('assignments_form.assign_team.teams')}</h3>
                {selectedClass &&
                  teams[selectedClass.id]?.map((team) => (
                    <div key={team.id} className={styles.team}>
                      <div className={styles.teamHeader}>
                        <h4>{team.id}</h4>
                        <button
                          onClick={() => deleteTeam(selectedClass.id, team.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      {team.students.map((member) => (
                        <div key={member.id} className={styles.teamMember}>
                          {member.firstName} {member.lastName}
                          <button
                            onClick={() =>
                              removeFromTeam(selectedClass.id, team.id, member)
                            }
                          >
                            <FaMinus />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          {!isIndividual ? (
            <>
              <button onClick={generateRandomTeams} disabled={!selectedClass}>
                {t('assignments_form.assign_team.generate_random_teams')}
              </button>
              <button
                onClick={createTeam}
                disabled={!selectedClass || selectedStudents.length === 0}
              >
                {t('assignments_form.assign_team.create_team')} (
                {selectedStudents.length}/{teamSize})
              </button>
            </>
          ) : (
            <button onClick={handleSelectAll}>
              {individualStudents[selectedClass?.id || '']?.length === selectedClass?.students.length
                ? t('assignments_form.assign_team.deselect_all')
                : t('assignments_form.assign_team.select_all')}
            </button>
          )}
          <button onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
};

export default TeamCreationModal;
