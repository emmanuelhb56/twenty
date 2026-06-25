import { InformationBannerComponentInstanceContext } from '@/information-banner/states/contexts/InformationBannerComponentInstanceContext';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  Banner,
  type BannerColor,
  type BannerVariant,
} from 'twenty-ui/feedback';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledInvertedIconButton = styled(IconButton)`
  color: ${themeCssVariables.font.color.inverted} !important;
`;

const StyledContent = styled.div<{ hasCloseButton: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  margin-left: ${({ hasCloseButton }) => (hasCloseButton ? '24px' : '0')};
`;

const StyledMessageIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  opacity: 0.85;
`;

const StyledAmberButton = styled.span`
  flex-shrink: 0;
  button {
    background-color: rgba(146, 64, 14, 0.15) !important;
    border-color: rgba(146, 64, 14, 0.3) !important;
    color: #92400e !important;
    font-weight: 600 !important;
  }
  button svg {
    color: #92400e !important;
    stroke: currentColor !important;
  }
  button:hover:not(:disabled) {
    background-color: rgba(146, 64, 14, 0.25) !important;
  }
`;

export const InformationBanner = ({
  message,
  color = 'blue',
  variant = 'primary',
  messageIcon: MessageIcon,
  buttonTitle,
  buttonIcon,
  buttonOnClick,
  isButtonDisabled = false,
  onClose,
  componentInstanceId,
}: {
  message: string;
  color?: BannerColor;
  variant?: BannerVariant;
  messageIcon?: IconComponent;
  buttonTitle?: string;
  buttonIcon?: IconComponent;
  buttonOnClick?: () => void;
  isButtonDisabled?: boolean;
  onClose?: () => void;
  componentInstanceId: string;
}) => {
  const informationBannerIsOpen = useAtomComponentStateValue(
    informationBannerIsOpenComponentState,
    componentInstanceId,
  );

  const isPrimary = variant === 'primary';
  const buttonAccent = color === 'danger' ? 'danger' : 'blue';
  const isAmber = color === 'amber';

  return (
    <InformationBannerComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      {informationBannerIsOpen && (
        <Banner color={color} variant={variant}>
          <StyledContent hasCloseButton={!!onClose}>
            {MessageIcon && (
              <StyledMessageIcon>
                <MessageIcon size={16} />
              </StyledMessageIcon>
            )}
            <StyledText>{message}</StyledText>
            {buttonTitle && buttonOnClick && (
              isAmber ? (
                <StyledAmberButton>
                  <Button
                    variant="secondary"
                    accent="default"
                    title={buttonTitle}
                    Icon={buttonIcon}
                    size="small"
                    onClick={buttonOnClick}
                    disabled={isButtonDisabled}
                  />
                </StyledAmberButton>
              ) : (
                <Button
                  variant="secondary"
                  accent={buttonAccent}
                  title={buttonTitle}
                  Icon={buttonIcon}
                  size="small"
                  inverted={isPrimary}
                  onClick={buttonOnClick}
                  disabled={isButtonDisabled}
                />
              )
            )}
          </StyledContent>
          {onClose &&
            (isPrimary && !isAmber ? (
              <StyledInvertedIconButton
                Icon={IconX}
                size="small"
                variant="tertiary"
                onClick={onClose}
                ariaLabel={t`Close banner`}
              />
            ) : (
              <IconButton
                Icon={IconX}
                size="small"
                variant="tertiary"
                accent={isAmber ? 'default' : buttonAccent}
                onClick={onClose}
                ariaLabel={t`Close banner`}
              />
            ))}
        </Banner>
      )}
    </InformationBannerComponentInstanceContext.Provider>
  );
};
