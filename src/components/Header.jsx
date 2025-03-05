import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

// Custom Terraform logo
const TerraformLogo = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  margin-right: 0.75rem;
  
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

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(90deg, #7B42BC, #5E4BB6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const PlatformIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  gap: 1.5rem;
`;

const PlatformIcon = styled.div`
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: ${({ theme }) => theme.transition};
  
  &:hover {
    opacity: 1;
  }
  
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.text};
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z'/%3E%3C/svg%3E");
  }
`;

const CompanyLabel = styled.span`
  font-size: 0.7rem;
  background-color: #0052CC;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
`;

const PlatformIconWrapper = styled.div`
  position: relative;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <TerraformLogo />
        <Title>Company Terraform Viewer</Title>
      </Logo>
      <Subtitle>
        Explore and view Terraform files (.tf and .tfvars) from your company's GitLab repositories
      </Subtitle>
      <PlatformIcons>
        <PlatformIconWrapper>
          <PlatformIcon title="Company GitLab" />
          <CompanyLabel>Company</CompanyLabel>
        </PlatformIconWrapper>
      </PlatformIcons>
    </HeaderContainer>
  );
};

export default Header;
