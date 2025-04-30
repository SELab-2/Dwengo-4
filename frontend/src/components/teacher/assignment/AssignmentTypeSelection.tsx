import React from 'react';
import styles from './AddAssignmentForm.module.css';
import { useTranslation } from 'react-i18next';

interface AssignmentTypeSelectionProps {
  assignmentType: string;
  teamSize: number;
  onAssignmentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTeamSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AssignmentTypeSelection: React.FC<AssignmentTypeSelectionProps> = ({
  assignmentType,
  teamSize,
  onAssignmentTypeChange,
  onTeamSizeChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.leftSide}>
      <div>
        <label htmlFor="AssignmentPath">
          {t('assignments_form.type.label')}
        </label>
        <select
          required
          id="AssignmentPath"
          name="AssignmentPath"
          onChange={onAssignmentTypeChange}
          value={assignmentType}
        >
          <option value="">{t('assignments_form.type.select')}</option>
          <option value="group">{t('assignments_form.type.group')}</option>
          <option value="individual">
            {t('assignments_form.type.individual')}
          </option>
        </select>
      </div>
      {assignmentType === 'group' && (
        <div className={styles.inputTeam}>
          <h6>{t('assignments_form.teamsize')}</h6>
          <input
            type="number"
            id="teamSize"
            name="teamSize"
            min={1}
            value={teamSize}
            onChange={onTeamSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default AssignmentTypeSelection;
