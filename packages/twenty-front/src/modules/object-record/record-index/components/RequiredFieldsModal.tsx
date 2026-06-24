import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { REQUIRED_FIELDS_MODAL_ID } from '@/object-record/record-index/constants/RequiredFieldsModalId';
import { requiredFieldsPendingCreationState } from '@/object-record/record-index/states/requiredFieldsPendingCreationState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { isDefined } from 'twenty-shared/utils';

const StyledFieldList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledFieldItem = styled.li`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]} 0;
  &::before {
    content: '• ';
  }
`;

const StyledButtonContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const RequiredFieldsModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [pendingCreation, setPendingCreation] = useAtomComponentState(
    requiredFieldsPendingCreationState,
  );

  const handleCancel = () => {
    closeModal(REQUIRED_FIELDS_MODAL_ID);
    setPendingCreation(null);
  };

  const handleCreate = async () => {
    if (!isDefined(pendingCreation)) return;
    closeModal(REQUIRED_FIELDS_MODAL_ID);
    try {
      await pendingCreation.createRecord();
    } finally {
      setPendingCreation(null);
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={REQUIRED_FIELDS_MODAL_ID}
      isClosable={true}
      onClose={handleCancel}
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <H1Title
        title={t`Required Fields Missing`}
        fontColor={H1TitleFontColor.Primary}
      />
      <Section
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {t`Please fill in the following fields before creating the record:`}
      </Section>
      <StyledFieldList>
        {pendingCreation?.missingFields.map((field) => (
          <StyledFieldItem key={field.id}>{field.label}</StyledFieldItem>
        ))}
      </StyledFieldList>
      <StyledButtonContainer>
        <Button
          onClick={handleCancel}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
          justify="center"
        />
      </StyledButtonContainer>
      <StyledButtonContainer>
        <Button
          onClick={handleCreate}
          variant="secondary"
          accent="default"
          title={t`Create & Fill in Side Panel`}
          fullWidth
          justify="center"
        />
      </StyledButtonContainer>
    </ModalStatefulWrapper>
  );
};
