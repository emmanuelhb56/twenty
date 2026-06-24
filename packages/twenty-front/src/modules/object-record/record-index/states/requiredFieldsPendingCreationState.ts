import { atom } from 'jotai';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type RequiredFieldsPendingCreation = {
  missingFields: FieldMetadataItem[];
  createRecord: () => Promise<void>;
};

export const requiredFieldsPendingCreationState = atom<RequiredFieldsPendingCreation | null>(null);
