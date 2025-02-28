import React, { useState } from 'react';
import styled from 'styled-components';
import FileCard from './FileCard';

const GridContainer = styled.div`
  margin-bottom: 2rem;
`;

const ViewControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FileCount = styled.div`
  color: ${({ theme }) => theme.textSecondary};
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  background-color: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.textSecondary};
  border: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  
  &:hover {
    background-color: ${({ active, theme }) => active ? theme.primary : theme.surfaceHover};
  }
`;

// Custom icon components using CSS
const GridIcon = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 4px);
  grid-template-rows: repeat(2, 4px);
  grid-gap: 2px;
  width: 12px;
  height: 12px;
  
  &::before, &::after {
    content: "";
    grid-column: span 1;
    grid-row: span 1;
    background-color: currentColor;
  }
  
  &::before {
    grid-column: 1;
    grid-row: 1;
  }
  
  &::after {
    grid-column: 2;
    grid-row: 1;
  }
  
  span {
    grid-column: span 1;
    grid-row: span 1;
    background-color: currentColor;
  }
`;

const ListIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 12px;
  height: 12px;
  
  span {
    display: block;
    height: 2px;
    width: 100%;
    background-color: currentColor;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  ${({ viewMode }) => viewMode === 'list' && `
    grid-template-columns: 1fr;
  `}
`;

const FileGrid = ({ files }) => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <GridContainer>
      <ViewControls>
        <FileCount>{files.length} file{files.length !== 1 ? 's' : ''} found</FileCount>
        <ViewToggle>
          <ToggleButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <GridIcon>
              <span></span>
              <span></span>
            </GridIcon>
          </ToggleButton>
          <ToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <ListIcon>
              <span></span>
              <span></span>
              <span></span>
            </ListIcon>
          </ToggleButton>
        </ViewToggle>
      </ViewControls>
      
      <Grid viewMode={viewMode}>
        {files.map((file, index) => (
          <FileCard key={index} file={file} viewMode={viewMode} />
        ))}
      </Grid>
    </GridContainer>
  );
};

export default FileGrid;
