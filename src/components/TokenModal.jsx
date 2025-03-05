import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const ModalDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.surfaceHover};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  
  &:hover {
    background-color: ${({ theme }) => theme.surfaceHover};
    color: ${({ theme }) => theme.text};
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  border: none;
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const HelpText = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const TokenModal = ({ onSubmit, onCancel }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      onSubmit(token.trim());
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>GitLab Access Token Required</ModalTitle>
          <ModalDescription>
            To access repositories on your company's GitLab instance, please enter a personal access token.
          </ModalDescription>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your GitLab access token"
            autoFocus
          />
          
          <ButtonGroup>
            <CancelButton type="button" onClick={onCancel}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={!token.trim()}>
              Submit
            </SubmitButton>
          </ButtonGroup>
        </Form>
        
        <HelpText>
          <p>To create a personal access token:</p>
          <ol>
            <li>Go to <code>gitlab.techops.com/-/profile/personal_access_tokens</code></li>
            <li>Create a token with <code>read_api</code> and <code>read_repository</code> scopes</li>
            <li>Copy and paste the token above</li>
          </ol>
          <p>This token will be used only for this request and will not be stored.</p>
        </HelpText>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TokenModal;
