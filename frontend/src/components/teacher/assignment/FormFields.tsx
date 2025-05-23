import React from 'react';
import { ClassItem, LearningPath } from '../../../types/type';
import styles from './AddAssignmentForm.module.css';
import CustomDropdownMultiselect from './CustomDropdownMultiselect';
import InputWithChecks from '../../shared/InputWithChecks';
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
  formErrors: { classes?: string; learningPath?: string };
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
          options={classesData.map(c => ({
            ...c,
            name: (
              <div className="max-w-[200px] truncate" title={c.name}>
                {c.name}
              </div>
            )
          })) || []}
          selectedOptions={selectedClasses.map(c => ({
            ...c,
            name: (
              <div className="max-w-[200px] truncate" title={c.name}>
                {c.name}
              </div>
            )
          }))}
          onChange={setSelectedClasses}
        />
        {formErrors.classes && (
          <span className={styles.error}>{formErrors.classes}</span>
        )}
      </div>

      <div>
        <InputWithChecks
          label={t('assignments_form.title')}
          value={title}
          required
          max={100}
          onChange={e => {
            setTitle(e.target.value);
          }}
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
            className="w-full"
          >
            <option value="" className="truncate">
              {t('assignments_form.learning_path.select')}
            </option>
            {learningPaths.map((path) => (
              <option key={path.id} value={path.id} className="truncate" title={path.title}>
                {path.title}
              </option>
            ))}
          </select>
        )}
        {formErrors.learningPath && (
          <div className={styles.error}>{formErrors.learningPath}</div>
        )}
      </div>

      <div>
        <InputWithChecks
          label={t('assignments_form.description')}
          value={description}
          required
          max={500}
          inputType="textarea"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </>
  );
};

export default FormFields;
