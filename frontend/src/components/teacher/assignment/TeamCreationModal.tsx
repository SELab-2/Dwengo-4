import React, { useEffect, useState } from 'react';
import styles from './TeamCreationModal.module.css';
import { FaMinus, FaTrash } from 'react-icons/fa';
import { ClassItem, StudentItem } from '../../../types/type';
import { useTranslation } from 'react-i18next';

interface TeamUser {
  user: StudentItem;
}

interface TeamDetail {
  id: string;
  teamname: string;
  classId: string;
  students: TeamUser[];
}

interface TeamHead {
  assignmentId: number;
  teamId: string;
  team: TeamDetail;
}

interface Props {
  classes: ClassItem[];
  onClose: () => void;
  teams: Record<string, TeamHead[]>;
  setTeams: (teams: Record<string, TeamHead[]>) => void;
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
    if (!selectedClass) {
      setAvailableStudents([]);
      setSelectedStudents([]);
      return;
    }

    const classTeams = teams[selectedClass.id] || [];

    const studentsInTeams = classTeams.flatMap((teamHead) =>
      teamHead.team.students.map((member) => member.user.id),
    );

    const availableStuds = selectedClass.students.filter(
      (student) => !studentsInTeams.includes(student.id),
    );

    setAvailableStudents(availableStuds);
    setSelectedStudents([]);
  }, [teams, selectedClass]);


  const handleChangeClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    const classItem = classes.find((c) => Number(c.id) === Number(classId)) || null;
    console.log('Selected class:', classItem);
    console.log(classes)
    setSelectedClass(classItem);
  };

  const getNextTeamNumber = (classTeams: TeamHead[]) => {
    if (classTeams.length === 0) return 1;
    const numbers = classTeams.map((teamHead) => {
      const match = teamHead.team.id.match(/\d+$/);
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
    const nextTeamNumber = getNextTeamNumber(classTeams);

    const newTeamDetail: TeamDetail = {
      id: `team-${nextTeamNumber}`,
      teamname: `team-${nextTeamNumber}`,
      classId: selectedClass.id,
      students: selectedStudents.map((student) => ({ user: student })),
    };

    const newTeamHead: TeamHead = {
      assignmentId: 0, // pas aan indien nodig
      teamId: newTeamDetail.id,
      team: newTeamDetail,
    };

    setTeams({
      ...teams,
      [selectedClass.id]: [...classTeams, newTeamHead],
    });

    setSelectedStudents([]);
  };

  const deleteTeam = (classId: string, teamId: string) => {
    const classTeams = teams[classId] || [];
    setTeams({
      ...teams,
      [classId]: classTeams.filter((teamHead) => teamHead.team.id !== teamId),
    });
  };

  const removeFromTeam = (
    classId: string,
    teamId: string,
    student: StudentItem,
  ) => {
    const classTeams = teams[classId] || [];
    const updatedTeams = classTeams
      .map((teamHead) => {
        if (teamHead.team.id === teamId) {
          const newStudents = teamHead.team.students.filter(
            (member) => member.user.id !== student.id,
          );
          if (newStudents.length === 0) return null; // verwijder leeg team
          return {
            ...teamHead,
            team: {
              ...teamHead.team,
              students: newStudents,
            },
          };
        }
        return teamHead;
      })
      .filter((t): t is TeamHead => t !== null);

    setTeams({
      ...teams,
      [classId]: updatedTeams,
    });
  };

  const generateRandomTeams = () => {
    if (!selectedClass) return;

    const classTeams = teams[selectedClass.id] || [];

    const studentsInTeams = classTeams.flatMap((teamHead) =>
      teamHead.team.students.map((member) => member.user.id),
    );

    const availableStudents = selectedClass.students.filter(
      (student) => !studentsInTeams.includes(student.id),
    );

    const shuffledStudents = [...availableStudents].sort(() => Math.random() - 0.5);
    const newTeams: TeamHead[] = [];

    for (let i = 0; i < shuffledStudents.length; i += teamSize) {
      const teamMembers = shuffledStudents.slice(i, i + teamSize);
      if (teamMembers.length === teamSize) {
        const teamNumber = getNextTeamNumber(classTeams) + Math.floor(i / teamSize);

        const newTeamDetail: TeamDetail = {
          id: `team-${teamNumber}`,
          teamname: `team-${teamNumber}`,
          classId: selectedClass.id,
          students: teamMembers.map((student) => ({ user: student })),
        };

        newTeams.push({
          assignmentId: 0, // pas aan indien nodig
          teamId: newTeamDetail.id,
          team: newTeamDetail,
        });
      }
    }

    setTeams({
      ...teams,
      [selectedClass.id]: newTeams,
    });
  };

  const addToExistingTeam = (teamHead: TeamHead) => {
    if (!selectedClass || selectedStudents.length === 0) return;

    const classTeams = teams[selectedClass.id] || [];
    const updatedTeams = classTeams.map(th => {
      if (th.team.id === teamHead.team.id) {
        return {
          ...th,
          team: {
            ...th.team,
            students: [
              ...th.team.students,
              ...selectedStudents.map(student => ({ user: student }))
            ]
          }
        };
      }
      return th;
    });

    setTeams({
      ...teams,
      [selectedClass.id]: updatedTeams
    });
    setSelectedStudents([]);
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
          <p>{t('assignments_form.assign_team.team_help', { size: teamSize })}</p>
        )}

        <select onChange={handleChangeClass} value={selectedClass?.id || ''}>
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
                  teams[selectedClass.id]?.map((teamHead) => (
                    <div
                      key={teamHead.team.id}
                      className={`${styles.team} ${selectedStudents.length > 0 ? styles.clickableTeam : ''}`}
                      onClick={() => selectedStudents.length > 0 && addToExistingTeam(teamHead)}
                    >
                      <div className={styles.teamHeader}>
                        <h4>{teamHead.team.teamname}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent team click when deleting
                            deleteTeam(selectedClass.id, teamHead.team.id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      {teamHead.team.students.map((member) => (
                        <div key={member.user.id} className={styles.teamMember}>
                          {member.user.firstName} {member.user.lastName}
                          <button
                            onClick={() =>
                              removeFromTeam(selectedClass.id, teamHead.team.id, member.user)
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
            <button onClick={() => {
              if (!selectedClass || !setIndividualStudents) return;
              const classId = selectedClass.id;
              const allSelected =
                individualStudents[classId]?.length === selectedClass.students.length;
              setIndividualStudents({
                ...individualStudents,
                [classId]: allSelected ? [] : [...selectedClass.students],
              });
            }}>
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
