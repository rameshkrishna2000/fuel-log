import { keyframes } from '@emotion/react';

/** Fade In Animation */
export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

/** Skip Success Animation */
export const skipSuccessAnimation = keyframes`
  0% { 
    transform: scale(0.3) rotate(-45deg); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.1) rotate(0deg); 
    opacity: 1; 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1; 
  }
`;

/** Bounce In Animation */
export const bounceIn = keyframes`
  0% { 
    transform: scale(0.3); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.05); 
  }
  70% { 
    transform: scale(0.9); 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

/** Slide In Up Animation */
export const slideInUp = keyframes`
  0% { 
    transform: translateY(30px); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
`;
