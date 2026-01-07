import { useState, useEffect } from 'react';
import { getDefaultColorMode } from '../config/hostStyles';

export type Theme = 'light' | 'dark';

function detectThemeFromHTML(): Theme | null {
  const html = document.documentElement;

  const dataTheme = html.getAttribute('data-theme');
  if (dataTheme === 'light' || dataTheme === 'dark') {
    return dataTheme;
  }

  const dataBsTheme = html.getAttribute('data-bs-theme');
  if (dataBsTheme === 'light' || dataBsTheme === 'dark') {
    return dataBsTheme;
  }

  const classList = html.classList;
  if (classList.contains('dark')) {
    return 'dark';
  }
  if (classList.contains('light')) {
    return 'light';
  }

  return null;
}

function detectThemeFromBrowser(): Theme {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function detectTheme(): Theme {
  // First check host config for forced color mode
  const configColorMode = getDefaultColorMode();
  if (configColorMode === 'light' || configColorMode === 'dark') {
    return configColorMode;
  }

  // Then try to detect from HTML attributes
  const htmlTheme = detectThemeFromHTML();
  if (htmlTheme) {
    return htmlTheme;
  }

  // Fall back to browser preference
  return detectThemeFromBrowser();
}

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTheme(detectTheme());
    }, 500);

    // Only observe HTML changes if not using forced config color mode
    const configColorMode = getDefaultColorMode();
    if (configColorMode) {
      // Config forces color mode, no need to observe
      return () => clearTimeout(timer);
    }

    const observer = new MutationObserver(() => {
      setTheme(detectTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-bs-theme'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme(detectTheme());
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return theme;
}
