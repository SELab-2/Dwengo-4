import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageChooser: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex bg-dwengo-green rounded-xl">
      <select
        aria-label="Language selector"
        className="text-sm lg:text-lg hover:cursor-pointer rounded-xl bg-dwengo-green text-white border-none font-bold mr-1.5"
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
