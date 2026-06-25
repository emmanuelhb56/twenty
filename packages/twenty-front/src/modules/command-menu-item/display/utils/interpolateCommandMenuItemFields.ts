import { i18n } from '@lingui/core';
import { type CommandMenuContextApi, type Nullable } from 'twenty-shared/types';
import { interpolateCommandMenuItemTemplate } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type InterpolatedCommandMenuItemFields = {
  iconKey: Nullable<string>;
  label: string;
  shortLabel: Nullable<string>;
};

const GO_TO_PREFIX = 'Go to ';
const GO_TO_TRANSLATIONS: Record<string, string> = {
  es: 'Ir a ',
};

const localizeGoToLabel = (label: string): string => {
  if (!label.startsWith(GO_TO_PREFIX)) return label;
  const objectName = label.slice(GO_TO_PREFIX.length);
  const langCode = i18n.locale?.split('-')[0] ?? 'en';
  const localizedPrefix = GO_TO_TRANSLATIONS[langCode] ?? GO_TO_PREFIX;
  return localizedPrefix + objectName;
};

export const interpolateCommandMenuItemFields = (
  item: CommandMenuItemFieldsFragment,
  commandMenuContextApi: CommandMenuContextApi,
): InterpolatedCommandMenuItemFields => {
  const iconKey = interpolateCommandMenuItemTemplate({
    label: item.icon,
    context: commandMenuContextApi,
  });

  const rawLabel =
    interpolateCommandMenuItemTemplate({
      label: item.label,
      context: commandMenuContextApi,
    }) ?? item.label;

  const label = localizeGoToLabel(rawLabel);

  const shortLabel = interpolateCommandMenuItemTemplate({
    label: item.shortLabel,
    context: commandMenuContextApi,
  });

  return { iconKey, label, shortLabel };
};
