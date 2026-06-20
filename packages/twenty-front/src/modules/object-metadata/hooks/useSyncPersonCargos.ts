import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { SYNC_PERSON_CARGOS } from '@/object-metadata/graphql/mutations';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type SyncPersonCargosResult = {
  success: boolean;
  message: string;
  options: FieldMetadataItemOption[];
};

type SyncPersonCargosMutation = {
  syncPersonCargos: SyncPersonCargosResult;
};

export const useSyncPersonCargos = () => {
  const [syncPersonCargosMutation, { loading }] =
    useMutation<SyncPersonCargosMutation>(SYNC_PERSON_CARGOS);

  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const syncCargos = async ({
    fieldMetadataId,
    objectMetadataId,
  }: {
    fieldMetadataId: string;
    objectMetadataId: string;
  }): Promise<SyncPersonCargosResult | undefined> => {
    try {
      const response = await syncPersonCargosMutation();
      const result = response.data?.syncPersonCargos;

      if (!isDefined(result) || !result.success) {
        enqueueErrorSnackBar({
          message: result?.message ?? t`Could not sync cargos.`,
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
      enqueueErrorSnackBar({ message: t`Could not sync cargos.` });
      return undefined;
    }
  };

  return { syncCargos, loading };
};
