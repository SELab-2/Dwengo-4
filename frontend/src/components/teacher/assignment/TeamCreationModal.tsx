import React, { useState, useEffect } from "react";
import styles from "./TeamCreationModal.module.css";
import { FaTrash, FaMinus } from "react-icons/fa";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Team {
  id: string;
  members: Student[];
}

interface Props {
  students: Student[];
  onClose: () => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  teamSize: number;
}

const TeamCreationModal = ({
  students,
  onClose,
  teams,
  setTeams,
  teamSize,
}: Props) => {
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  useEffect(() => {
    const studentsInTeams = teams.flatMap((team) =>
      team.members.map((member) => member.id)
    );
    const availableStuds = students.filter(
      (student) => !studentsInTeams.includes(student.id)
    );
    setAvailableStudents(availableStuds);
  }, [students, teams]);

  const getNextTeamNumber = () => {
    if (teams.length === 0) return 1;
    const numbers = teams.map((team) => {
      const match = team.id.match(/\d+$/);
      return match ? parseInt(match[0]) : 0;
    });
    return Math.max(...numbers) + 1;
  };

  const handleStudentSelect = (student: Student) => {
    if (selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id));
    } else if (selectedStudents.length < teamSize) {
      setSelectedStudents((prev) => [...prev, student]);
    }
  };

  const createTeam = () => {
    if (selectedStudents.length === 0) return;
    if (selectedStudents.length > teamSize) return;
    console.log("Creating incomplete team");

    if (selectedStudents.length < teamSize) {
      if (!window.confirm("Create an incomplete team?")) return;
    }

    const newTeam: Team = {
      id: `${getNextTeamNumber()}`,
      members: selectedStudents,
    };

    setTeams([...teams, newTeam]);
    setAvailableStudents((prev) =>
      prev.filter(
        (student) =>
          !selectedStudents.find((selected) => selected.id === student.id)
      )
    );
    setSelectedStudents([]);
  };

  const deleteTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setAvailableStudents((prev) => [...prev, ...team.members]);
      setTeams(teams.filter((t) => t.id !== teamId));
    }
  };

  const removeFromTeam = (teamId: string, student: Student) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            members: team.members.filter((m) => m.id !== student.id),
          };
        }
        return team;
      })
    );
    setAvailableStudents((prev) => [...prev, student]);
  };

  const generateRandomTeams = () => {
    const shuffledStudents = [...availableStudents].sort(
      () => Math.random() - 0.5
    );
    const newTeams: Team[] = [];

    for (let i = 0; i < shuffledStudents.length; i += teamSize) {
      const teamMembers = shuffledStudents.slice(i, i + teamSize);
      if (teamMembers.length === teamSize) {
        const teamNumber = getNextTeamNumber() + Math.floor(i / teamSize);
        newTeams.push({
          id: `team-${teamNumber}`,
          members: teamMembers,
        });
      }
    }

    setTeams(newTeams);
    const remainingStudents = shuffledStudents.slice(
      Math.floor(shuffledStudents.length / teamSize) * teamSize
    );
    setAvailableStudents(remainingStudents);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h2>Team Creation</h2>
        <p>Create teams of {teamSize} students or generate random teams</p>

        <div className={styles.teamBuilder}>
          <div className={styles.studentsList}>
            <h3>Available Students</h3>
            {availableStudents.map((student) => (
              <div
                key={student.id}
                className={`${styles.student} ${
                  selectedStudents.find((s) => s.id === student.id)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleStudentSelect(student)}
              >
                {student.firstName} {student.lastName}
              </div>
            ))}
          </div>

          <div className={styles.teams}>
            <h3>Teams</h3>
            {teams.map((team) => (
              <div key={team.id} className={styles.team}>
                <div className={styles.teamHeader}>
                  <h4>Team-{team.id}</h4>
                  <button onClick={() => deleteTeam(team.id)}>
                    <FaTrash />
                  </button>
                </div>
                {team.members.map((member) => (
                  <div key={member.id} className={styles.teamMember}>
                    {member.firstName} {member.lastName}
                    <button onClick={() => removeFromTeam(team.id, member)}>
                      <FaMinus />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={generateRandomTeams}>Generate Random Teams</button>
          <button
            onClick={createTeam}
            //disabled={selectedStudents.length !== teamSize}
          >
            Create Team ({selectedStudents.length}/{teamSize})
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TeamCreationModal;
