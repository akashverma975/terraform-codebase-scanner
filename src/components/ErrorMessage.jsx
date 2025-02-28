import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: rgba(255, 82, 82, 0.1);
  border-left: 4px solid ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.text};
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: 0 ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius} 0;
  display: flex;
  align-items: center;
`;

// Custom warning icon
const WarningIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 1rem;
  position: relative;
  
  &::before {
    content: '!';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.error};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
`;

const ErrorMessage = ({ message }) => {
  return (
    <ErrorContainer>
      <WarningIcon />
      <div>{message}</div>
    </ErrorContainer>
  );
};

export default ErrorMessage;
