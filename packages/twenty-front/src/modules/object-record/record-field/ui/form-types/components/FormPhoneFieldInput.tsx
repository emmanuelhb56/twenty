import {
  FormCallingCodeSelectInput,
  type FormCallingCodeSelectInputUpdatedValue,
} from '@/object-record/record-field/ui/form-types/components/FormCallingCodeSelectInput';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldPhonesValue, type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PhoneEntry = {
  id: string;
  countryCode: string;
  callingCode: string;
  number: string;
};

type FormPhoneFieldInputProps = {
  label?: string;
  defaultValue?: FieldPhonesValue;
  onChange: (value: FieldPhonesValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  required?: boolean;
};

const StyledEntryBlock = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[2]};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledEntryLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
  letter-spacing: 0.4px;
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

export const FormPhoneFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  required,
}: FormPhoneFieldInputProps) => {
  const nextIdRef = useRef(0);
  const newId = () => `phone-${++nextIdRef.current}`;

  const [entries, setEntries] = useState<PhoneEntry[]>(() => {
    let counter = 0;
    const all: PhoneEntry[] = [
      {
        id: `phone-${counter++}`,
        countryCode: defaultValue?.primaryPhoneCountryCode ?? '',
        callingCode: defaultValue?.primaryPhoneCallingCode ?? '',
        number: defaultValue?.primaryPhoneNumber ?? '',
      },
    ];
    defaultValue?.additionalPhones?.forEach((phone) => {
      all.push({
        id: `phone-${counter++}`,
        countryCode: phone.countryCode,
        callingCode: phone.callingCode,
        number: phone.number,
      });
    });
    nextIdRef.current = counter;
    return all;
  });

  const emitChange = (updated: PhoneEntry[]) => {
    const primary = updated[0];
    const additional: PhoneRecord[] = updated.slice(1).map((e) => ({
      countryCode: e.countryCode,
      callingCode: e.callingCode,
      number: e.number,
    }));
    onChange({
      primaryPhoneCountryCode: primary?.countryCode ?? '',
      primaryPhoneCallingCode: primary?.callingCode ?? '',
      primaryPhoneNumber: primary?.number ?? '',
      additionalPhones: additional.length > 0 ? additional : null,
    });
  };

  const handleCallingCodeChange =
    (id: string) => (newValue: FormCallingCodeSelectInputUpdatedValue) => {
      const updated = entries.map((e) =>
        e.id === id
          ? { ...e, countryCode: newValue.countryCode, callingCode: newValue.callingCode }
          : e,
      );
      setEntries(updated);
      emitChange(updated);
    };

  const handleNumberChange = (id: string) => (number: string | number | null) => {
    const updated = entries.map((e) =>
      e.id === id
        ? { ...e, number: isDefined(number) ? `${number}` : '' }
        : e,
    );
    setEntries(updated);
    emitChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    emitChange(updated);
  };

  const handleAdd = () => {
    setEntries((prev) => [
      ...prev,
      { id: newId(), countryCode: '', callingCode: '', number: '' },
    ]);
  };

  return (
    <FormFieldInputContainer>
      {label && <InputLabel required={required}>{label}</InputLabel>}
      <FormNestedFieldInputContainer>
        {entries.map((entry, index) => (
          <StyledEntryBlock key={entry.id}>
            <StyledEntryHeader>
              <StyledEntryLabel>
                {index === 0 ? t`Primary Phone` : t`Additional Phone`}
              </StyledEntryLabel>
              {!readonly && entries.length > 1 && (
                <LightIconButton
                  Icon={IconTrash}
                  onClick={() => handleDelete(entry.id)}
                />
              )}
            </StyledEntryHeader>
            <FormCallingCodeSelectInput
              label={t`Calling Code`}
              selectedCountryCode={entry.countryCode}
              selectedCallingCode={entry.callingCode}
              onChange={handleCallingCodeChange(entry.id)}
              readonly={readonly}
              VariablePicker={index === 0 ? VariablePicker : undefined}
            />
            <FormNumberFieldInput
              label={t`Phone Number`}
              defaultValue={entry.number}
              onChange={handleNumberChange(entry.id)}
              VariablePicker={index === 0 ? VariablePicker : undefined}
              placeholder={t`Enter phone number`}
              hint={t`Without calling code`}
              readonly={readonly}
            />
          </StyledEntryBlock>
        ))}
        {!readonly && (
          <StyledAddButton type="button" onClick={handleAdd}>
            <IconPlus size={12} />
            {t`Add phone`}
          </StyledAddButton>
        )}
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
