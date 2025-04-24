import React from 'react';
import styles from './AddAssignmentForm.module.css';

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
    return (
        <div className={styles.leftSide}>
            <div>
                <label htmlFor="AssignmentPath">Assignment Type:</label>
                <select
                    required
                    id="AssignmentPath"
                    name="AssignmentPath"
                    onChange={onAssignmentTypeChange}
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
                        onChange={onTeamSizeChange}
                    />
                </div>
            )}
        </div>
    );
};

export default AssignmentTypeSelection;
