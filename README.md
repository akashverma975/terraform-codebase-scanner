# Terraform File Viewer

A modern React application for viewing Terraform files (.tf and .tfvars) from GitHub, GitLab, and self-hosted GitLab repositories.

## Features

- Support for multiple Git platforms:
  - GitHub.com
  - GitLab.com
  - Self-hosted GitLab (gitlab.techops.com)
- Support for complex GitLab project paths (groups/subgroups)
- Elegant dark-themed UI
- Syntax highlighting for Terraform files
- Responsive design for all device sizes
- Secure token handling for private repositories

## Company GitLab Integration

This application supports your company's self-hosted GitLab instance at `gitlab.techops.com`. It works with complex project paths like:

```
https://gitlab.techops.com/nuveen/application
https://gitlab.techops.com/group/subgroup/project
```

When accessing company GitLab repositories:

1. You will be prompted to enter a personal access token
2. Create a personal access token in your GitLab instance:
   - Go to `gitlab.techops.com/-/profile/personal_access_tokens`
   - Create a token with `read_api` and `read_repository` scopes
   - Copy the generated token
3. Enter the token when prompted by the application
4. The token is used only for the current request and is not stored

## Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

See the deployment guides for instructions on deploying to:
- Amazon S3
- GitHub Pages
- Other static hosting services

## Security Considerations

- Access tokens for company GitLab are not stored and must be provided for each request
- No data is sent to any third-party servers
- All API requests are made directly from your browser to the Git providers
- The application does not track or store any usage data
