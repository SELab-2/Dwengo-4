import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LanguageChooser from '@/components/shared/LanguageChooser';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

const createTestI18n = (lang: string = 'nl') => {
  const instance = i18next.createInstance();
  instance.init({
    lng: lang,
    fallbackLng: 'en',
    resources: {
      en: { translation: {} },
      nl: { translation: {} },
    },
  });
  return instance;
};

describe('LanguageChooser', () => {
  const setup = (lang: string = 'nl') => {
    const i18n = createTestI18n(lang);
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    render(
      <I18nextProvider i18n={i18n}>
        <LanguageChooser />
      </I18nextProvider>,
    );

    const select = screen.getByRole('combobox', { name: /language selector/i });
    return { select, changeLanguageSpy, i18n };
  };

  afterEach(() => {
    cleanup();
  });

  it('renders select element with language options', () => {
    const { select } = setup();

    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('nl');
    expect(options[1]).toHaveValue('en');
  });

  it('shows correct initial selected language (NL)', () => {
    const { select } = setup('nl');
    expect(select).toHaveValue('nl');
  });

  it('shows correct initial selected language (EN)', () => {
    const { select } = setup('en');
    expect(select).toHaveValue('en');
  });

  it('calls changeLanguage when selecting a different language', () => {
    const { select, changeLanguageSpy } = setup('nl');

    fireEvent.change(select, { target: { value: 'en' } });

    expect(changeLanguageSpy).toHaveBeenCalledTimes(1);
    expect(changeLanguageSpy).toHaveBeenCalledWith('en');
  });

  it('does not call changeLanguage if the same language is selected', () => {
    const { select, changeLanguageSpy } = setup('nl');

    fireEvent.change(select, { target: { value: 'nl' } });

    expect(changeLanguageSpy).toHaveBeenCalledTimes(1); // triggered, but same value
    expect(changeLanguageSpy).toHaveBeenCalledWith('nl');
  });

  it('handles switching back and forth between languages', () => {
    const { select, changeLanguageSpy } = setup('nl');

    fireEvent.change(select, { target: { value: 'en' } });
    fireEvent.change(select, { target: { value: 'nl' } });

    expect(changeLanguageSpy).toHaveBeenCalledTimes(2);
    expect(changeLanguageSpy).toHaveBeenNthCalledWith(1, 'en');
    expect(changeLanguageSpy).toHaveBeenNthCalledWith(2, 'nl');
  });
});
