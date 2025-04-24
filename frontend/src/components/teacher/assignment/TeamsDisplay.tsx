import React from 'react';
import styles from './AddAssignmentForm.module.css';
import { ClassItem, Team, StudentItem } from '../../../types/type';

interface TeamsDisplayProps {
    assignmentType: string;
    teams: Record<string, Team[]>;
    selectedClasses: ClassItem[];
    individualStudents: Record<string, StudentItem[]>;
    onEditClick: () => void;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
    assignmentType,
    teams,
    selectedClasses,
    individualStudents,
    onEditClick,
}) => {
    if (assignmentType === 'group') {
        return (
            <div className={styles.rightSide}>
                <h6>Teams:</h6>
                <div className={styles.teamsList}>
                    {Object.entries(teams).map(([classId, classTeams]) => (
                        <div key={classId}>
                            <h6>
                                CLASS: {selectedClasses.find((c) => c.id == classId)?.name}
                            </h6>
                            {classTeams.map((team) => (
                                <div key={team.id} className={styles.teamPreview}>
                                    <p>
                                        {team.id}:{' '}
                                        {team.students
                                            .map((member) => `${member.firstName} ${member.lastName}`)
                                            .join(', ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <button className={styles.editButton} type="button" onClick={onEditClick}>
                    Edit Teams
                </button>
            </div>
        );
    }

    return (
        <div className={styles.rightSide}>
            <h6>Select Students:</h6>
            <div className={styles.teamsList}>
                {selectedClasses.map((classItem) => (
                    <div key={classItem.id}>
                        <h6>CLASS: {classItem.name}</h6>
                        <div className={styles.selectedCount}>
                            Selected: {individualStudents[classItem.id]?.length || 0} /{' '}
                            {classItem.students.length}
                        </div>
                        {individualStudents[classItem.id]?.map((student) => (
                            <div key={student.id} className={styles.teamPreview}>
                                <p>{`${student.firstName} ${student.lastName}`}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <button className={styles.editButton} type="button" onClick={onEditClick}>
                Edit Students
            </button>
        </div>
    );
};

export default TeamsDisplay;
