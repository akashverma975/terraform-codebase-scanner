import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FileGrid from './components/FileGrid';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import TokenModal from './components/TokenModal';
import { fetchRepositoryFiles } from './services/gitlabService';

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
  background-color: rgba(0, 82, 204, 0.8);
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
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z'/%3E%3C/svg%3E");
  }
`;

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempRepoUrl, setTempRepoUrl] = useState('');

  const handleSearch = (url) => {
    setRepoUrl(url);
    setTempRepoUrl(url);
    setShowTokenModal(true);
  };

  const handleTokenSubmit = async (token) => {
    setShowTokenModal(false);
    setLoading(true);
    setError(null);
    
    try {
      const fileData = await fetchRepositoryFiles(tempRepoUrl, token);
      console.log('GitLab Terraform files fetched:', fileData);
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
            <RepoSourceBadge>
              Company GitLab Repository
            </RepoSourceBadge>
            <FileGrid files={files} />
          </>
        ) : (
          <EmptyState>
            <TerraformLogo />
            <h3>No Terraform Files to Display</h3>
            <p>Enter a GitLab repository URL to view its Terraform files (.tf and .tfvars)</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Example: <code>https://gitlab.techopscloud.com/your-group/your-project</code>
            </p>
          </EmptyState>
        )}
      </ContentContainer>
      
      {showTokenModal && (
        <TokenModal 
          onSubmit={handleTokenSubmit}
          onCancel={() => setShowTokenModal(false)}
        />
      )}
    </AppContainer>
  );
}

export default App;
