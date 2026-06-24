import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const canBeRequired = (field: Pick<FieldMetadataItem, 'type'>) => {
  return ![
    FieldMetadataType.RELATION,
    FieldMetadataType.MORPH_RELATION,
  ].includes(field.type);
};
