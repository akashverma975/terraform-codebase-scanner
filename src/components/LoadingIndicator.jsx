import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  flex: 1;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(110, 73, 203, 0.2);
  border-left: 4px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: ${spin} 1.2s linear infinite;
  margin-bottom: 1.5rem;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.1rem;
  text-align: center;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingIndicator = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Fetching repository files...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingIndicator;
