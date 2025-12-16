import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useAppSelector } from '../../../app/redux/hooks';
import './CustomButton.scss';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';

// type define
type CustomButtonType = {
  category: string;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  noLoad?: boolean;
  icon?: string;
  iconClassName?: string;
  variant?: 'text' | 'outlined' | 'contained' | undefined;
  size?: 'small' | 'medium' | 'large' | undefined;
};

// function for custom button
function CustomButton({
  category,
  className,
  iconClassName,
  loading = false,
  noLoad,
  onClick,
  icon,
  variant = 'contained',
  size = 'small',
  ...rest
}: CustomButtonType & LoadingButtonProps) {
  const theme = useAppSelector((state: any) => state.theme.theme);

  return (
    <LoadingButton
      className={`button ${className} ${theme}`}
      variant={variant}
      size={size}
      loading={noLoad === false ? noLoad : loading}
      onClick={onClick}
      {...rest}
    >
      {category}
      {icon && (
        <Box component={'span'} className={`icon-container ${iconClassName}`}>
          <Icon icon={icon} width={20} height={20} />
        </Box>
      )}
    </LoadingButton>
  );
}

export default CustomButton;
