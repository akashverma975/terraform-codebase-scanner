import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchRepoStructure } from '../services/gitlabService';
import RepositoryTree from './RepositoryTree';
import LoadingSpinner from './LoadingSpinner';

const ExplorerContainer = styled.div`
  background-color: var(--background-alt);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow);
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(110, 73, 203, 0.2);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TreeContainer = styled.div`
  background-color: var(--background);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
`;

const RepoExplorer = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchRepoStructure(repoUrl);
      setRepoData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch repository data');
      setRepoData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExplorerContainer>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitLab repository URL (e.g., https://gitlab.com/username/repo)"
          aria-label="Repository URL"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !repoUrl.trim()}>
          {loading ? 'Loading...' : 'Explore'}
        </Button>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner />
      ) : repoData ? (
        <TreeContainer>
          <RepositoryTree data={repoData} />
        </TreeContainer>
      ) : (
        <EmptyState>
          <p>Enter a GitLab repository URL to view its structure</p>
        </EmptyState>
      )}
    </ExplorerContainer>
  );
};

export default RepoExplorer;
