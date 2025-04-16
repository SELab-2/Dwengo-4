import React, { MouseEvent, useState } from 'react';
import { useSubmit } from 'react-router-dom';
import Container from '../shared/Container';
import styles from './Nav.module.css';
import NavButton from '../shared/NavButton';
import { useTranslation } from 'react-i18next';

const NavTeacher: React.FC = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [firstName] = useState<string | null>(
    localStorage.getItem('firstName'),
  );
  const submit = useSubmit();

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(null, { action: '/teacher/logout', method: 'post' });
  };

  return (
    <nav className="bg-gray-200 py-2">
      <Container>
        <div className="flex text-sm lg:text-lg justify-between items-center">
          <div className="flex flex-row items-center justify-center">
            <img
              className="h-8 lg:h-12 xl:h-16 w-fit"
              src="/img/dwengo-groen-zwart.png"
              onClick={() => (window.location.href = '/teacher')}
            />
            {firstName ? (
              <div className="flex space-x-4">
                <NavButton to="/teacher" label={t('nav.home')} />
                <NavButton to="/teacher/classes" label={t('nav.classes')} />
                <NavButton
                  to="/learning-paths"
                  label={t('nav.learning_paths')}
                />
              </div>
            ) : (
              <div
                className={`flex flex-row justify-end w-full ${
                  styles.navLinks
                } ${menuOpen ? styles.open : ''}`}
              >
                <NavButton to="/teacher/inloggen" label={t('nav.login')} />
                <NavButton
                  to="/teacher/registreren"
                  label={t('nav.register')}
                />
              </div>
            )}
          </div>

          {/* Right side icons */}
          {firstName && (
            <div className="flex items-center space-x-4">
              <span>{t('nav.logged_in_as', { name: firstName })}</span>
              <button
                className="text-gray-700 hover:cursor-pointer hover:text-gray-600"
                aria-label="Notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button
                className="text-gray-700 hover:cursor-pointer hover:text-gray-600"
                aria-label="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:cursor-pointer hover:text-red-600"
                aria-label="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Container>
    </nav>
  );
};

export default NavTeacher;
