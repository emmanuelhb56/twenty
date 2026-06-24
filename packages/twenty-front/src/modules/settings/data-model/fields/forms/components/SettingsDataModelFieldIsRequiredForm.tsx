import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { canBeRequired } from '@/settings/data-model/fields/forms/utils/canBeRequired';
import { t } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';
import { IconAlertCircle } from 'twenty-ui/icon';
import { Toggle } from 'twenty-ui/input';

type SettingsDataModelFieldIsRequiredFormValues = {
  isRequired: boolean;
};

type SettingsDataModelFieldIsRequiredFormProps = {
  fieldType: FieldMetadataType;
  existingFieldMetadataId: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldIsRequiredForm = ({
  fieldType,
  existingFieldMetadataId,
  disabled = false,
}: SettingsDataModelFieldIsRequiredFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldIsRequiredFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  if (!canBeRequired({ type: fieldType })) {
    return null;
  }

  if (fieldMetadataItem?.isSystem) {
    return null;
  }

  return (
    <Controller
      name="isRequired"
      defaultValue={fieldMetadataItem?.isRequired ?? false}
      control={control}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconAlertCircle}
          title={t`Required`}
          description={t`Enforce that this field is filled before creating a record`}
        >
          <Toggle
            toggleSize="small"
            value={value ?? false}
            onChange={(v) => onChange(v)}
            disabled={disabled}
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
};
