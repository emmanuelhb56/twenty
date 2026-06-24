import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isEmpty = (value: unknown): boolean => {
  if (!isDefined(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'object' && value !== null) {
    // Composite fields (ADDRESS, FULL_NAME, etc.) are objects
    // Consider them empty if all string leaves are empty
    return Object.values(value as Record<string, unknown>).every(isEmpty);
  }
  return false;
};

export const validateRequiredFields = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}) => {
  const EXCLUDED_TYPES = [
    FieldMetadataType.RELATION,
    FieldMetadataType.MORPH_RELATION,
    FieldMetadataType.BOOLEAN,
  ];

  const missingFields = objectMetadataItem.fields.filter(
    (field: FieldMetadataItem) =>
      field.isRequired === true &&
      !EXCLUDED_TYPES.includes(field.type) &&
      isEmpty(recordInput[field.name]),
  );

  return {
    missingFields,
    isValid: missingFields.length === 0,
  };
};

export const useRequiredFieldsValidation = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}) => {
  return validateRequiredFields({
    objectMetadataItem,
    recordInput,
  });
};
