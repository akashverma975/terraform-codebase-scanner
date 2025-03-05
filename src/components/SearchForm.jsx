import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
  display: flex;
  margin-bottom: 2rem;
  position: relative;
  box-shadow: ${({ theme }) => theme.cardShadow};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  border: none;
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  transition: ${({ theme }) => theme.transition};
  
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.surfaceHover};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    border-radius: ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius} 0 0;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primaryHover};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1rem;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius};
  }
`;

// Custom search icon
const SearchIcon = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  position: relative;
  margin-right: 8px;
  
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 12px;
    width: 7px;
    height: 2px;
    background-color: currentColor;
    transform: rotate(45deg);
    transform-origin: 0 0;
  }
`;

// Custom loading spinner
const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ExampleLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  padding: 0;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
  margin-top: 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.primaryHover};
  }
`;

const SearchForm = ({ onSearch, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const handleExampleClick = () => {
    setUrl('https://gitlab.techopscloud.com/your-group/your-project');
  };

  return (
    <>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter GitLab repository URL (e.g., https://gitlab.techopscloud.com/your-group/your-project)"
          aria-label="Repository URL"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? (
            <>
              <LoadingSpinner /> Loading
            </>
          ) : (
            <>
              <SearchIcon /> Search
            </>
          )}
        </Button>
      </FormContainer>
      <ExampleLink onClick={handleExampleClick}>
        Use example: https://gitlab.techopscloud.com/your-group/your-project
      </ExampleLink>
    </>
  );
};

export default SearchForm;
