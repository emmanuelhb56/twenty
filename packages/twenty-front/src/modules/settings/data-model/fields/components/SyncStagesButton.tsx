import { t } from '@lingui/core/macro';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { useSyncOpportunityStages } from '@/object-metadata/hooks/useSyncOpportunityStages';

type SyncStagesButtonProps = {
  fieldMetadataId: string;
  objectMetadataId: string;
  disabled?: boolean;
};

// Botón "Sincronizar etapas". Reemplaza las opciones del campo Stage de
// Opportunity con las del catálogo externo. Vive en Ajustes > Modelo de datos
// porque la operación toca el FieldMetadata (permiso DATA_MODEL).
export const SyncStagesButton = ({
  fieldMetadataId,
  objectMetadataId,
  disabled = false,
}: SyncStagesButtonProps) => {
  const { syncStages, loading } = useSyncOpportunityStages();

  // El botón vive dentro del FormProvider del editor de campo; reseteamos el
  // form tras el sync para que las opciones nuevas se vean sin recargar.
  const formContext = useFormContext();

  const handleClick = async () => {
    const result = await syncStages({ fieldMetadataId, objectMetadataId });

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
      title={loading ? t`Syncing...` : t`Sync stages`}
      variant="secondary"
      size="small"
      isLoading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
    />
  );
};
