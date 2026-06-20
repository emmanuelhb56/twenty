import { t } from '@lingui/core/macro';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { useSyncPersonCargos } from '@/object-metadata/hooks/useSyncPersonCargos';

type SyncCargosButtonProps = {
  fieldMetadataId: string;
  objectMetadataId: string;
  disabled?: boolean;
};

export const SyncCargosButton = ({
  fieldMetadataId,
  objectMetadataId,
  disabled = false,
}: SyncCargosButtonProps) => {
  const { syncCargos, loading } = useSyncPersonCargos();
  const formContext = useFormContext();

  const handleClick = async () => {
    const result = await syncCargos({ fieldMetadataId, objectMetadataId });

    if (!isDefined(result) || !result.success || result.options.length === 0) {
      return;
    }

    const firstValue = result.options[0].value;
    formContext?.setValue?.('options', result.options, { shouldDirty: false });
    formContext?.setValue?.('defaultValue', `'${firstValue}'`, {
      shouldDirty: false,
    });
  };

  return (
    <Button
      Icon={IconRefresh}
      title={loading ? t`Syncing...` : t`Sync cargos`}
      variant="secondary"
      size="small"
      isLoading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
    />
  );
};
