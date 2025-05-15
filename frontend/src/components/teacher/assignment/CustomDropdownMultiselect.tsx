import React, { useState } from 'react';
import { ClassItem } from '../../../types/type';
import styles from './AddAssignmentForm.module.css';
import { useTranslation } from 'react-i18next';

interface CustomDropdownMultiselectProps {
  options: ClassItem[];
  selectedOptions: ClassItem[];
  onChange: (selected: ClassItem[]) => void;
}

/**
 * Custom multiselect dropdown component for selecting multiple classes
 * @param options - Array of available classes to select from
 * @param selectedOptions - Array of currently selected classes
 * @param onChange - Callback function when selection changes
 */
const CustomDropdownMultiselect = ({
  options,
  selectedOptions,
  onChange,
}: CustomDropdownMultiselectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = (option: ClassItem) => {
    const isSelected = selectedOptions.some((item) => item.id === option.id);
    const updatedSelection = isSelected
      ? selectedOptions.filter((item) => item.id !== option.id)
      : [...selectedOptions, option];
    onChange(updatedSelection);
  };
  const { t } = useTranslation();

  return (
    <div className={styles.customDropdown}>
      <div className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
        {selectedOptions.length === 0 ? (
          <span className={styles.placeholder}>
            {t('assignments_form.class.select')}
          </span>
        ) : (
          <div className={styles.selectedChips}>
            {selectedOptions.map((option) => (
              <span key={option.id} className={styles.chip}>
                {option.name}
                <span
                  className={styles.chipRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(option);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}
        <span className={styles.arrow}>▼</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div key={option.id} className={styles.dropdownOption}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.some(
                    (item) => item.id === option.id,
                  )}
                  onChange={() => handleOptionToggle(option)}
                />
                {option.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdownMultiselect;
