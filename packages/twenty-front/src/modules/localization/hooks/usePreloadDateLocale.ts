import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';
import { enUS } from 'date-fns/locale';
import { type JotaiStore } from 'jotai/vanilla/store';
import { useEffect } from 'react';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isValidLocale, normalizeLocale } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

// Pre-loads the date-fns locale from localStorage before the user GraphQL query
// resolves, preventing relative dates (e.g. "hace 2 días") from briefly
// appearing in English on initial render.
export const usePreloadDateLocale = (store: JotaiStore) => {
  useEffect(() => {
    try {
      const storageLocale = localStorage.getItem('locale');
      if (storageLocale) {
        const normalized = normalizeLocale(storageLocale);
        if (isValidLocale(normalized)) {
          const locale = normalized as keyof typeof APP_LOCALES;
          getDateFnsLocale(locale).then((localeCatalog) => {
            const current = store.get(dateLocaleState.atom);
            if (!current.locale) {
              store.set(dateLocaleState.atom, {
                locale,
                localeCatalog: localeCatalog || enUS,
              });
            }
          });
        }
      }
    } catch {
      // localStorage not available
    }
  }, [store]);
};
