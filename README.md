# Company Terraform Viewer

A modern React application for viewing Terraform files (.tf and .tfvars) from your company's GitLab repositories.

## Features

- Exclusive support for your company's GitLab instance (gitlab.techopscloud.com)
- Support for any project path within your GitLab instance
- Elegant dark-themed UI
- Syntax highlighting for Terraform files
- Responsive design for all device sizes
- Secure token handling for authentication

## GitLab Integration

This application is designed to work exclusively with your company's GitLab instance at `gitlab.techopscloud.com`. It supports any project path within this domain, such as:

```
https://gitlab.techopscloud.com/your-group/your-project
https://gitlab.techopscloud.com/team-a/subgroup/project
```

## Authentication

When accessing GitLab repositories:

1. You will be prompted to enter a personal access token
2. Create a personal access token in your GitLab instance:
   - Go to `gitlab.techopscloud.com/-/profile/personal_access_tokens`
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

See the deployment guides for instructions on deploying to your preferred hosting solution.

## Security Considerations

- Access tokens are not stored and must be provided for each request
- All API requests are made directly from the browser to your GitLab instance
- The application does not track or store any usage data
- Ensure the application is deployed on a secure (HTTPS) connection

## Customization

You may need to customize the following:

- GitLab instance URL in `src/services/gitlabService.js` (currently set to gitlab.techopscloud.com)
- Company-specific branding or colors in the theme
- Any company-specific GitLab API endpoints or parameters

## Support

For issues related to this application, please contact your IT department or the designated maintainer of this tool.
