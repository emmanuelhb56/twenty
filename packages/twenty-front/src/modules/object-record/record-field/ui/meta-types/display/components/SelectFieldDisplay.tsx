import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { useSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useSelectFieldDisplay';
import { SelectDisplay } from '@/ui/field/display/components/SelectDisplay';

const StyledEmptyStateMessage = styled.span`
  font-style: italic;
`;

export const SelectFieldDisplay = () => {
  const { theme } = useContext(ThemeContext);
  const { fieldValue, fieldDefinition } = useSelectFieldDisplay();

  const { options, fieldName, objectMetadataNameSingular } =
    fieldDefinition.metadata;

  // Estado vacío específico del campo "stage" de Opportunity: si todavía no hay
  // etapas configuradas, mostramos un mensaje en lugar de un select vacío/roto.
  const isOpportunityStage =
    objectMetadataNameSingular === 'opportunity' && fieldName === 'stage';
  const hasNoOptions = !isDefined(options) || options.length === 0;

  if (isOpportunityStage && hasNoOptions) {
    return (
      <StyledEmptyStateMessage style={{ color: theme.font.color.tertiary }}>
        {t`No stages configured. An admin can load them from Settings > Data model > Opportunity > Stage.`}
      </StyledEmptyStateMessage>
    );
  }

  const selectedOption = options?.find((option) => option.value === fieldValue);

  if (!isDefined(selectedOption)) {
    return <></>;
  }

  return (
    <SelectDisplay color={selectedOption.color} label={selectedOption.label} />
  );
};
