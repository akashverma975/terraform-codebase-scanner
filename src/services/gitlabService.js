import axios from 'axios';

const GITLAB_BASE_URL = 'https://gitlab.techopscloud.com/api/v4';

// Check if a file is a Terraform file (.tf or .tfvars)
const isTerraformFile = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  return extension === 'tf' || extension === 'tfvars';
};

// Extract project path from URL
const extractProjectPath = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'gitlab.techopscloud.com') {
      throw new Error('Invalid GitLab URL. Only gitlab.techopscloud.com is supported.');
    }
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitLab project URL');
    }
    return pathParts.join('/');
  } catch (error) {
    throw new Error(`Could not extract project path: ${error.message}`);
  }
};

// Fetch files from GitLab repository
export const fetchRepositoryFiles = async (repoUrl, token) => {
  if (!token) {
    throw new Error('Access token is required for GitLab repositories');
  }

  try {
    const projectPath = extractProjectPath(repoUrl);
    const encodedProjectPath = encodeURIComponent(projectPath);
    
    console.log(`Fetching GitLab repository: ${projectPath}`);
    
    // Set up headers
    const headers = { 'PRIVATE-TOKEN': token };
    
    // Get the repository tree
    const treeResponse = await axios.get(
      `${GITLAB_BASE_URL}/projects/${encodedProjectPath}/repository/tree`,
      {
        params: {
          recursive: true,
          per_page: 100
        },
        headers
      }
    );

    if (!treeResponse.data || !Array.isArray(treeResponse.data)) {
      throw new Error('Invalid response from GitLab API');
    }

    // Filter for Terraform files only
    const terraformFiles = treeResponse.data.filter(item => 
      item.type === 'blob' && isTerraformFile(item.path)
    );
    
    if (terraformFiles.length === 0) {
      throw new Error('No Terraform files (.tf or .tfvars) found in this repository');
    }

    // Try different branches
    const tryBranches = ['main', 'master', 'develop', 'development'];
    
    // Fetch content for each Terraform file
    const fileContents = await Promise.all(
      terraformFiles.map(async (file) => {
        // Try each branch until we get a successful response
        for (const branch of tryBranches) {
          try {
            const fileResponse = await axios.get(
              `${GITLAB_BASE_URL}/projects/${encodedProjectPath}/repository/files/${encodeURIComponent(file.path)}`,
              {
                params: { ref: branch },
                headers
              }
            );
            
            if (fileResponse.data && fileResponse.data.content) {
              // GitLab returns base64 encoded content
              const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
              
              return {
                ...file,
                content,
                size: fileResponse.data.size || 0,
                encoding: fileResponse.data.encoding
              };
            }
            
            // If we got here, we found the file but couldn't get content
            return file;
          } catch (error) {
            // If this is the last branch to try, and we still have an error
            if (branch === tryBranches[tryBranches.length - 1]) {
              console.error(`Error fetching file ${file.path}:`, error);
              return {
                ...file,
                content: `# Error loading file: ${error.message}`,
                error: true
              };
            }
            // Otherwise continue to the next branch
          }
        }
        
        // If we get here, all branches failed
        return {
          ...file,
          content: `# Could not find file in any branch`,
          error: true
        };
      })
    );
    
    return fileContents;
  } catch (error) {
    console.error('GitLab API Error:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Repository not found. Make sure the URL is correct and you have access to it.');
      } else if (error.response.status === 401) {
        throw new Error('Authentication failed. Please provide a valid access token.');
      } else {
        throw new Error(`GitLab API error: ${error.response.data.message || error.response.statusText}`);
      }
    }
    throw error;
  }
};
