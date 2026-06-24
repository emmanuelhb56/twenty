import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectRecord } from 'twenty-shared/types';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const EXCLUDED_TYPES: FieldMetadataType[] = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.BOOLEAN,
];

const isValueEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'object' && value !== null) {
    return Object.values(value as Record<string, unknown>).every(isValueEmpty);
  }
  return false;
};

export const assertRequiredFieldsPresent = (
  records: Partial<ObjectRecord>[],
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): void => {
  const fields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const requiredFields = fields.filter(
    (f) =>
      f.isRequired === true &&
      !f.isSystem &&
      !EXCLUDED_TYPES.includes(f.type),
  );

  if (requiredFields.length === 0) return;

  for (const record of records) {
    const missingFields = requiredFields.filter((f) =>
      isValueEmpty(record[f.name]),
    );

    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map((f) => f.label).join(', ');

      throw new CommonQueryRunnerException(
        `Required fields are missing: ${fieldLabels}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Required fields are missing: ${fieldLabels}`,
        },
      );
    }
  }
};
