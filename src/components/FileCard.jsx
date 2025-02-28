import React, { useState } from 'react';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Card = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  transition: ${({ theme }) => theme.transition};
  box-shadow: ${({ theme }) => theme.cardShadow};
  height: ${({ viewMode }) => viewMode === 'list' ? 'auto' : '320px'};
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.surfaceHover};
`;

const FileIcon = styled.div`
  margin-right: 0.75rem;
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const FilePath = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardContent = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  
  pre {
    margin: 0 !important;
    border-radius: 0 !important;
    height: 100%;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  color: ${({ theme }) => theme.error};
  font-size: 0.9rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

// Custom Terraform icon
const TerraformIcon = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  
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

const getLanguage = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  if (extension === 'tf' || extension === 'tfvars') {
    return 'hcl'; // Terraform files use HCL (HashiCorp Configuration Language)
  }
  
  return 'plaintext';
};

const FileCard = ({ file, viewMode }) => {
  const fileName = file.path.split('/').pop();
  const language = getLanguage(fileName);
  const isTfvars = fileName.endsWith('.tfvars');
  
  const renderContent = () => {
    if (file.error) {
      return (
        <ErrorMessage>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <p>Error loading file</p>
        </ErrorMessage>
      );
    }
    
    return (
      <SyntaxHighlighter 
        language={language} 
        style={atomOneDark}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{ height: '100%' }}
      >
        {file.content || '# Empty file'}
      </SyntaxHighlighter>
    );
  };
  
  return (
    <Card viewMode={viewMode}>
      <CardHeader>
        <FileIcon>
          <TerraformIcon />
        </FileIcon>
        <FilePath title={file.path}>
          {file.path} {isTfvars && <span style={{ color: '#fc6d26', marginLeft: '4px' }}>(variables)</span>}
        </FilePath>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default FileCard;
