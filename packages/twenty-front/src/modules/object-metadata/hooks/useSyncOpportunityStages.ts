import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { SYNC_OPPORTUNITY_STAGES } from '@/object-metadata/graphql/mutations';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type SyncOpportunityStagesResult = {
  success: boolean;
  message: string;
  options: FieldMetadataItemOption[];
};

type SyncOpportunityStagesMutation = {
  syncOpportunityStages: SyncOpportunityStagesResult;
};

export const useSyncOpportunityStages = () => {
  const [syncOpportunityStagesMutation, { loading }] =
    useMutation<SyncOpportunityStagesMutation>(SYNC_OPPORTUNITY_STAGES);

  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  // fieldMetadataId / objectMetadataId del campo "stage" que se está editando:
  // se usan para refrescar las opciones en el store de metadata (merge por id),
  // así el select se actualiza sin recargar la página.
  const syncStages = async ({
    fieldMetadataId,
    objectMetadataId,
  }: {
    fieldMetadataId: string;
    objectMetadataId: string;
  }): Promise<SyncOpportunityStagesResult | undefined> => {
    try {
      const response = await syncOpportunityStagesMutation();

      const result = response.data?.syncOpportunityStages;

      if (!isDefined(result) || !result.success) {
        enqueueErrorSnackBar({
          message: result?.message ?? t`Could not sync stages.`,
        });

        return result ?? undefined;
      }

      const firstOption = result.options[0];

      updateInDraft('fieldMetadataItems', [
        {
          id: fieldMetadataId,
          objectMetadataId,
          options: result.options,
          defaultValue: isDefined(firstOption)
            ? `'${firstOption.value}'`
            : null,
        } as FlatFieldMetadataItem,
      ]);
      applyChanges();

      enqueueSuccessSnackBar({ message: result.message });

      return result;
    } catch {
      enqueueErrorSnackBar({ message: t`Could not sync stages.` });

      return undefined;
    }
  };

  return {
    syncStages,
    loading,
  };
};
