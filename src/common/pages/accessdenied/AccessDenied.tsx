import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.scss';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('status');
    navigate('/login');
  };

  return (
    <Box className='access-denied'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='error-code'
      >
        403
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className='lock-icon-wrapper'
      >
        <LockOutlinedIcon className='lock-icon' />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Typography variant='h4' className='title'>
          Access Denied
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Typography variant='body1' sx={{ color: '#6b7280', maxWidth: '420px', mb: 3 }}>
          {' '}
          This page is restricted and cannot be accessed with your current permissions.
          Please verify your access rights before proceeding.{' '}
        </Typography>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Button variant='contained' className='back-button' onClick={handleRedirect}>
          Go Back
        </Button>
      </motion.div>
    </Box>
  );
};

export default AccessDenied;
