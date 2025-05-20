import React, { MouseEvent, useEffect, useState } from 'react';
import { Link, useLocation, useSubmit } from 'react-router-dom';
import Container from '../shared/Container';
import styles from './Nav.module.css';
import NavButton from '../shared/NavButton';
import LanguageChooser from '../shared/LanguageChooser';
import { useTranslation } from 'react-i18next';

const Navstudent: React.FC = () => {
  const { t } = useTranslation();
  const submit = useSubmit();
  const location = useLocation();

  // mobile menu toggle
  const [menuOpen] = useState<boolean>(false);

  // lokale state voor firstName én role
  const [firstName, setFirstName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // bij elke route-wissel herladen we beide
  useEffect(() => {
    setFirstName(localStorage.getItem('firstName'));
    setRole(localStorage.getItem('role'));
  }, [location]);

  const handleLogout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(null, { action: '/student/logout', method: 'post' });
  };

  // alleen true als ingelogd én rol student
  const isStudent = firstName !== null && role === 'student';

  const routes = [
    { to: '/student', label: t('nav.home') },
    { to: '/student/klassen', label: t('nav.classes') },
    { to: '/student/assignments', label: t('nav.assignments') },
    { to: '/student/learning-paths', label: t('nav.learning_paths') },
    { to: '/student/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="py-2">
      <Container>
        <div className="flex text-sm lg:text-lg justify-between items-center">
          <div className="flex flex-row items-center justify-center">
            <Link to="/student">
              <img
                className="h-8 lg:h-12 xl:h-16 w-fit"
                src="/img/dwengo-groen-zwart.png"
              />
            </Link>

            {isStudent ? (
              <div className="flex space-x-4">
                {routes.map(({ to, label }) => (
                  <NavButton key={to} to={to} label={label} />
                ))}
              </div>
            ) : (
              <div
                className={`flex flex-row justify-end w-full ${styles.navLinks} ${
                  menuOpen ? styles.open : ''
                }`}
              >
                <NavButton to="/student/inloggen" label={t('nav.login')} />
                <NavButton
                  to="/student/registreren"
                  label={t('nav.register')}
                />
              </div>
            )}
          </div>

          {isStudent && (
            <div className="flex items-center space-x-4">
              <span>{t('nav.logged_in_as', { name: firstName })}</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:cursor-pointer hover:text-red-600"
                aria-label="Logout"
              >
                {/* logout-icon */}
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
                    d="M11 16l-4-4m0 0l4-4m-4 
                       4h14m-5 4v1a3 3 0 01-3 
                       3H6a3 3 0 01-3-3V7a3 
                       3 0 013-3h7a3 3 0 
                       013 3v1"
                  />
                </svg>
              </button>
              <LanguageChooser />
            </div>
          )}
        </div>
      </Container>
    </nav>
  );
};

export default Navstudent;
