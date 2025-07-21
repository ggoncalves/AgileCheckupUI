'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('agileCheckupLanguage', langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <li className="nav-item dropdown language-switcher">
      <a
        className="nav-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        role="button"
        aria-expanded={isOpen}
      >
        <span className="mr-2">{currentLanguage.flag}</span>
        <span className="d-none d-sm-inline">{currentLanguage.name}</span>
      </a>
      <div className={`dropdown-menu dropdown-menu-right ${isOpen ? 'show' : ''}`}>
        {languages.map((lang) => (
          <a
            key={lang.code}
            className={`dropdown-item ${lang.code === i18n.language ? 'active' : ''}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeLanguage(lang.code);
            }}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </a>
        ))}
      </div>
    </li>
  );
};

export default LanguageSwitcher;