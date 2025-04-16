import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageChooser: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex">
      <select
        className="text-sm lg:text-lg hover:cursor-pointer"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="nl">NL</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
};

export default LanguageChooser;
