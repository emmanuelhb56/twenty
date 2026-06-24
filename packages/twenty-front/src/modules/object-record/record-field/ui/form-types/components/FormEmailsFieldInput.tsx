import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EmailEntry = { id: string; value: string };

type FormEmailsFieldInputProps = {
  label?: string;
  defaultValue?: FieldEmailsValue;
  onChange: (value: FieldEmailsValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  required?: boolean;
};

const StyledEntryRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledAddButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const FormEmailsFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  required,
}: FormEmailsFieldInputProps) => {
  const { t } = useLingui();

  const nextIdRef = useRef(0);
  const newId = () => `email-${++nextIdRef.current}`;

  const [entries, setEntries] = useState<EmailEntry[]>(() => {
    const all: EmailEntry[] = [];
    let counter = 0;
    all.push({ id: `email-${counter++}`, value: defaultValue?.primaryEmail ?? '' });
    defaultValue?.additionalEmails?.forEach((email) => {
      all.push({ id: `email-${counter++}`, value: email });
    });
    nextIdRef.current = counter;
    return all;
  });

  const emitChange = (updated: EmailEntry[]) => {
    onChange({
      primaryEmail: updated[0]?.value ?? '',
      additionalEmails: updated.slice(1).map((e) => e.value),
    });
  };

  const handleChange = (id: string) => (value: string) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, value } : e));
    setEntries(updated);
    emitChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    emitChange(updated);
  };

  const handleAdd = () => {
    setEntries((prev) => [...prev, { id: newId(), value: '' }]);
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel required={required}>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        {entries.map((entry, index) => (
          <StyledEntryRow key={entry.id}>
            <StyledInputWrapper>
              <FormTextFieldInput
                label={index === 0 ? t`Primary Email` : t`Additional Email`}
                defaultValue={entry.value}
                onChange={handleChange(entry.id)}
                placeholder={t`Email`}
                readonly={readonly}
                VariablePicker={index === 0 ? VariablePicker : undefined}
              />
            </StyledInputWrapper>
            {!readonly && entries.length > 1 && (
              <LightIconButton
                Icon={IconTrash}
                onClick={() => handleDelete(entry.id)}
              />
            )}
          </StyledEntryRow>
        ))}
        {!readonly && (
          <StyledAddButton type="button" onClick={handleAdd}>
            <IconPlus size={12} />
            {t`Add email`}
          </StyledAddButton>
        )}
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
