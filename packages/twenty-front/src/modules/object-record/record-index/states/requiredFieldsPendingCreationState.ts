import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type RequiredFieldsPendingCreation = {
  missingFields: FieldMetadataItem[];
  createRecord: () => Promise<void>;
};

export const requiredFieldsPendingCreationState =
  createAtomComponentState<RequiredFieldsPendingCreation | null>({
    key: 'requiredFieldsPendingCreationState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
