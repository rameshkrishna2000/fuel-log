import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress
} from '@mui/material';
import { ReactNode } from 'react';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import CustomCheckBox from './CustomCheckBox';

interface CustomNotificationProps {
  name?: string;
  title: string;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children?: ReactNode; // Allow children to be passed
}

const CustomMultiCard = ({
  name,
  title,
  className = '',
  isLoading = false,
  icon,
  onClick = () => {},
  children // Accept children as a prop
}: CustomNotificationProps) => {
  let displayIcon: ReactNode = icon;

  return (
    <Accordion
      id={title}
      className={className}
      sx={{
        mb: 5,
        mt: {
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#f1f2f5',
          padding: '10px'
        }
      }}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -12,
            marginTop: -12
          }}
        />
      )}

      <AccordionSummary
        expandIcon={<GridExpandMoreIcon />}
        aria-controls='panel1-content'
        id='panel1-header'
      >
        {!isLoading && displayIcon}
        <Box>{title}</Box>
      </AccordionSummary>
      <AccordionDetails onClick={onClick} sx={{ borderColor: 'grey', display: 'block' }}>
        {children} {/* Render children inside AccordionDetails */}
      </AccordionDetails>
    </Accordion>
  );
};

export default CustomMultiCard;
