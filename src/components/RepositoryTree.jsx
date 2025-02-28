import React, { useState } from 'react';
import styled from 'styled-components';

const TreeWrapper = styled.div`
  font-size: 0.95rem;
`;

const TreeNode = styled.div`
  margin: 0.25rem 0;
`;

const NodeContent = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background-color: var(--background-alt);
  }
`;

const ToggleIcon = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
  justify-content: center;
  align-items: center;
  margin-right: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.isFolder ? 'var(--folder-color)' : 'transparent'};
`;

const NodeIcon = styled.span`
  margin-right: 0.5rem;
  color: ${props => props.isFolder ? 'var(--folder-color)' : 'var(--file-color)'};
`;

const NodeName = styled.span`
  color: ${props => props.isFolder ? 'var(--text-color)' : 'var(--text-light)'};
  font-weight: ${props => props.isFolder ? '500' : '400'};
`;

const ChildrenContainer = styled.div`
  padding-left: 1.5rem;
  overflow: hidden;
  max-height: ${props => props.isOpen ? '1000vh' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: max-height 0.3s ease, opacity 0.3s ease;
`;

const TreeNodeComponent = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'tree' || item.type === 'dir';
  const hasChildren = isFolder && item.children && item.children.length > 0;

  const toggleOpen = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <TreeNode>
      <NodeContent onClick={toggleOpen}>
        <ToggleIcon isFolder={hasChildren}>
          {hasChildren && (isOpen ? '−' : '+')}
        </ToggleIcon>
        <NodeIcon isFolder={isFolder}>
          {isFolder ? '📁' : '📄'}
        </NodeIcon>
        <NodeName isFolder={isFolder}>{item.name}</NodeName>
      </NodeContent>
      
      {hasChildren && (
        <ChildrenContainer isOpen={isOpen}>
          {item.children.map((child, index) => (
            <TreeNodeComponent key={index} item={child} />
          ))}
        </ChildrenContainer>
      )}
    </TreeNode>
  );
};

const RepositoryTree = ({ data }) => {
  return (
    <TreeWrapper>
      {data.map((item, index) => (
        <TreeNodeComponent key={index} item={item} />
      ))}
    </TreeWrapper>
  );
};

export default RepositoryTree;
