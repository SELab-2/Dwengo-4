import React from 'react';
import { ClassItem, LearningPath } from '../../../types/type';
import styles from './AddAssignmentForm.module.css';
import CustomDropdownMultiselect from './CustomDropdownMultiselect';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="class" className={styles.label}>
          {t('assignments_form.class.choose')}
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
        <label htmlFor="title">{t('assignments_form.title')}</label>
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
        <label htmlFor="learningPath">
          {t('assignments_form.learning_path.choose')}
        </label>
        {isLearningPathsLoading ? (
          <div> {t('assignments_form.learning_path.loading')}</div>
        ) : isLearningPathsError ? (
          <div>
            {' '}
            {t('assignments_form.learning_path.error')}:{' '}
            {learningPathsError?.message}
          </div>
        ) : (
          <select
            required
            id="learningPath"
            name="learningPath"
            onChange={handleLearningPathChange}
            value={selectedLearningPath?.id || ''}
          >
            <option value="">
              {t('assignments_form.learning_path.select')}
            </option>
            {learningPaths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="description">{t('assignments_form.description')}</label>
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
