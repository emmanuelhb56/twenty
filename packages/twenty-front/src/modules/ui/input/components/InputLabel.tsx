import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledAsterisk = styled.span`
  color: ${themeCssVariables.color.red};
  margin-left: ${themeCssVariables.spacing[1]};
`;

type InputLabelProps = React.ComponentProps<typeof StyledLabel> & {
  required?: boolean;
  children?: ReactNode;
};

export const InputLabel = ({ required, children, ...rest }: InputLabelProps) => (
  <StyledLabel {...rest}>
    {children}
    {required && <StyledAsterisk>*</StyledAsterisk>}
  </StyledLabel>
);
