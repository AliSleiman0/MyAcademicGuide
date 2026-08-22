import { useEffect, useRef } from 'react';
import { useAppSelector } from './reduxHooks';
import { ConfigProvider } from 'antd';
import { themeObject } from '@app/styles/themes/themeVariables';

export const useThemeWatcher = (): void => {
  const theme = useAppSelector((state) => state.theme.theme);
  const root = useRef(document.querySelector(':root'));

  useEffect(() => {
    const html = root.current;
    if (html) {
      html.setAttribute('data-no-transition', '');
      html.setAttribute('data-theme', "light");
      // remove transition after layout update
      requestAnimationFrame(() => {
        html.removeAttribute('data-no-transition');
      });
    }

    ConfigProvider.config({
      theme: {
            primaryColor: themeObject["light"].primary,
            infoColor: themeObject["light"].primary,
            successColor: themeObject["light"].success,
            errorColor: themeObject["light"].error,
            warningColor: themeObject["light"].warning,
      },
    });
  }, [theme]);
};
