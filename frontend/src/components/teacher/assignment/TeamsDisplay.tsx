import React from 'react';
import styles from './AddAssignmentForm.module.css';
import { ClassItem, StudentItem, Team } from '../../../types/type';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  if (assignmentType === 'group') {
    return (
      <div className={styles.rightSide}>
        <h6>{t('assignments_form.assign_team.teams')}:</h6>
        <div className={styles.teamsList}>
          {Object.entries(teams).map(([classId, classTeams]) => (
            <div key={classId}>
              <h6>
                {t('assignments_form.assign_team.class')}:{' '}
                <span className="max-w-[200px] truncate inline-block align-bottom" title={selectedClasses.find((c) => c.id == classId)?.name}>
                  {selectedClasses.find((c) => c.id == classId)?.name}
                </span>
              </h6>
              {classTeams.map((teamHead) => (
                <div key={teamHead.id} className={styles.teamPreview}>
                  <p>
                    {teamHead.team.teamname}:{' '}
                    {teamHead.team.students
                      .map((member) => `${member.user.firstName} ${member.user.lastName}`)
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
          onClick={onEditClick}
          disabled={selectedClasses.length === 0}
        >
          {t('assignments_form.assign_team.edit')}
        </button>
      </div >
    );
  }

  return (
    <div className={styles.rightSide}>
      <h6>{t('assignments_form.assign_team.students')}:</h6>
      <div className={styles.teamsList}>
        {selectedClasses.map((classItem) => (
          <div key={classItem.id}>
            <h6>
              {t('assignments_form.assign_team.class')}:
              <span className="max-w-[200px] truncate inline-block align-bottom" title={classItem.name}>
                {classItem.name}
              </span>
            </h6>
            <div className={styles.selectedCount}>
              {t('assignments_form.assign_team.selected')}:{' '}
              {individualStudents[classItem.id]?.length || 0} /{' '}
              {classItem.students.length}
            </div>
            {individualStudents[classItem.id]?.map((student) => (
              <div key={student.id} className={styles.teamPreview}>
                <div className="flex items-center gap-2 w-full">
                  <span className="truncate"
                    title={`${student.firstName} ${student.lastName}`}>
                    {`${student.firstName} ${student.lastName}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        className={styles.editButton}
        type="button"
        onClick={onEditClick}
        disabled={selectedClasses.length === 0}
      >
        {t('assignments_form.assign_team.edit')}
      </button>
    </div>
  );
};

export default TeamsDisplay;
