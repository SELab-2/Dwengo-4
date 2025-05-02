import React from 'react';
import { ClassItem, LearningPath } from '../../../types/type';
import styles from './AddAssignmentForm.module.css';
import CustomDropdownMultiselect from './CustomDropdownMultiselect';

interface FormFieldsProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    selectedClasses: ClassItem[];
    setSelectedClasses: (classes: ClassItem[]) => void;
    classesData: ClassItem[];
    isEditing: boolean;
    formErrors: { classes?: string };
    learningPaths: LearningPath[];
    selectedLearningPath?: LearningPath;
    handleLearningPathChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isLearningPathsLoading: boolean;
    isLearningPathsError: boolean;
    learningPathsError?: Error;
}

const FormFields: React.FC<FormFieldsProps> = ({
    title,
    setTitle,
    description,
    setDescription,
    selectedClasses,
    setSelectedClasses,
    classesData,
    isEditing,
    formErrors,
    learningPaths,
    selectedLearningPath,
    handleLearningPathChange,
    isLearningPathsLoading,
    isLearningPathsError,
    learningPathsError,
}) => {
    return (
        <>
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
        </>
    );
};

export default FormFields;
