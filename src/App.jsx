import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FileGrid from './components/FileGrid';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import { fetchRepositoryFiles } from './services/repoService';

const AppContainer = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  margin-top: 2rem;
  background-color: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.textSecondary};
  flex: 1;

  h3 {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.text};
  }
`;

// Custom Terraform logo for empty state
const TerraformLogo = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #7B42BC, #5E4BB6);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
`;

// Repository source indicator
const RepoSourceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme, source }) => 
    source === 'github' ? 'rgba(36, 41, 46, 0.8)' : 
    source === 'gitlab' ? 'rgba(226, 67, 41, 0.8)' : 
    theme.surfaceHover};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 0.5rem;
    background-color: white;
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-image: ${({ source }) => 
      source === 'github' 
        ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z\'/%3E%3C/svg%3E")'
        : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z\'/%3E%3C/svg%3E")'};
  }
`;

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repoSource, setRepoSource] = useState(null); // 'github' or 'gitlab'

  const handleSearch = async (url) => {
    setRepoUrl(url);
    setLoading(true);
    setError(null);
    
    try {
      // Determine repo source from URL
      const repoType = url.toLowerCase().includes('github.com') ? 'github' : 'gitlab';
      setRepoSource(repoType);
      
      const fileData = await fetchRepositoryFiles(url);
      console.log(`${repoType} Terraform files fetched:`, fileData);
      setFiles(fileData);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err.message || 'Failed to fetch repository files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header />
      <SearchForm onSearch={handleSearch} isLoading={loading} />
      
      <ContentContainer>
        {error && <ErrorMessage message={error} />}
        
        {loading ? (
          <LoadingIndicator />
        ) : files.length > 0 ? (
          <>
            {repoSource && (
              <RepoSourceBadge source={repoSource}>
                {repoSource === 'github' ? 'GitHub' : 'GitLab'} Repository
              </RepoSourceBadge>
            )}
            <FileGrid files={files} />
          </>
        ) : (
          <EmptyState>
            <TerraformLogo />
            <h3>No Terraform Files to Display</h3>
            <p>Enter a GitHub or GitLab repository URL to view its Terraform files (.tf and .tfvars)</p>
          </EmptyState>
        )}
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
