import axios from 'axios';

// Determine if a URL is for GitHub or GitLab
const getRepoType = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname === 'github.com' || hostname.endsWith('.github.com')) {
      return { type: 'github', host: 'github.com' };
    } else if (hostname === 'gitlab.com' || hostname.endsWith('.gitlab.com')) {
      return { type: 'gitlab', host: 'gitlab.com' };
    } else if (hostname === 'gitlab.techops.com') {
      return { type: 'gitlab', host: 'gitlab.techops.com' };
    } else {
      throw new Error('Unsupported repository host. Only GitHub and GitLab are supported.');
    }
  } catch (error) {
    if (error.message.includes('Unsupported repository')) {
      throw error;
    }
    throw new Error('Invalid URL format');
  }
};

// Extract project info from URL
const extractProjectInfo = (url, repoInfo) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    
    if (pathParts.length < 2) {
      throw new Error(`Invalid ${repoInfo.type} repository URL`);
    }
    
    if (repoInfo.type === 'github') {
      const owner = pathParts[0];
      const repo = pathParts[1];
      return { owner, repo, path: `${owner}/${repo}` };
    } else if (repoInfo.type === 'gitlab') {
      const fullPath = pathParts.join('/');
      return { 
        path: fullPath,
        owner: pathParts[0],
        repo: pathParts[pathParts.length - 1]
      };
    }
    
    throw new Error('Unsupported repository type');
  } catch (error) {
    throw new Error(`Could not extract repository information: ${error.message}`);
  }
};

// Check if a file is a Terraform file (.tf or .tfvars)
const isTerraformFile = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  return extension === 'tf' || extension === 'tfvars';
};

// Fetch files from GitHub repository
const fetchGitHubFiles = async (repoInfo) => {
  try {
    const { owner, repo } = repoInfo;
    
    // First, get the repository tree
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`
    ).catch(() => {
      // If main branch doesn't exist, try master
      return axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`
      );
    });
    
    if (!treeResponse.data || !treeResponse.data.tree) {
      throw new Error('Invalid response from GitHub API');
    }
    
    // Filter for Terraform files only
    const terraformFiles = treeResponse.data.tree.filter(item => 
      item.type === 'blob' && isTerraformFile(item.path)
    );
    
    if (terraformFiles.length === 0) {
      throw new Error('No Terraform files (.tf or .tfvars) found in this repository');
    }
    
    // Fetch content for each Terraform file
    const fileContents = await Promise.all(
      terraformFiles.map(async (file) => {
        try {
          const fileResponse = await axios.get(file.url);
          
          if (fileResponse.data && fileResponse.data.content) {
            // GitHub returns base64 encoded content
            let content;
            try {
              content = window.atob(fileResponse.data.content.replace(/\n/g, ''));
            } catch (e) {
              content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
            }
            
            return {
              path: file.path,
              content,
              size: fileResponse.data.size || 0,
              type: 'blob'
            };
          }
          
          return {
            path: file.path,
            content: '# Could not load file content',
            type: 'blob'
          };
        } catch (error) {
          console.error(`Error fetching file ${file.path}:`, error);
          return {
            path: file.path,
            content: `# Error loading file: ${error.message}`,
            error: true,
            type: 'blob'
          };
        }
      })
    );
    
    return fileContents;
  } catch (error) {
    console.error("GitHub API Error:", error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Repository not found. Make sure the URL is correct and the repository is public.');
      } else if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`GitHub API error: ${error.response.data.message || error.response.statusText}`);
      }
    }
    throw error;
  }
};

// Fetch files from GitLab repository
const fetchGitLabFiles = async (repoInfo, host, token) => {
  try {
    const { path: projectPath } = repoInfo;
    const encodedProjectPath = encodeURIComponent(projectPath);
    
    // Set up API base URL based on host
    const apiBaseUrl = host === 'gitlab.com' 
      ? 'https://gitlab.com/api/v4'
      : `https://${host}/api/v4`;
    
    // Set up headers
    const headers = token ? { 'PRIVATE-TOKEN': token } : {};
    
    console.log(`Fetching GitLab repository: ${projectPath} from ${host}`);
    
    // Get the repository tree
    const treeResponse = await axios.get(
      `${apiBaseUrl}/projects/${encodedProjectPath}/repository/tree`,
      {
        params: {
          recursive: true,
          per_page: 100
        },
        headers
      }
    );

    if (!treeResponse.data || !Array.isArray(treeResponse.data)) {
      throw new Error(`Invalid response from ${host} API`);
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
              `${apiBaseUrl}/projects/${encodedProjectPath}/repository/files/${encodeURIComponent(file.path)}`,
              {
                params: { ref: branch },
                headers
              }
            );
            
            if (fileResponse.data && fileResponse.data.content) {
              // GitLab returns base64 encoded content
              let content;
              try {
                content = window.atob(fileResponse.data.content);
              } catch (e) {
                content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
              }
              
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
    console.error(`${host} API Error:`, error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Repository not found. Make sure the URL is correct and you have access to it.');
      } else if (error.response.status === 401) {
        throw new Error('Authentication failed. Please provide a valid access token.');
      } else {
        throw new Error(`${host} API error: ${error.response.data.message || error.response.statusText}`);
      }
    }
    throw error;
  }
};

// Main function to fetch repository files
export const fetchRepositoryFiles = async (repoUrl, token = null) => {
  try {
    const repoInfo = getRepoType(repoUrl);
    const projectInfo = extractProjectInfo(repoUrl, repoInfo);
    
    console.log(`Fetching ${repoInfo.type} repository from ${repoInfo.host}: ${projectInfo.path}`);
    
    if (repoInfo.type === 'github') {
      return await fetchGitHubFiles(projectInfo);
    } else if (repoInfo.type === 'gitlab') {
      if (repoInfo.host === 'gitlab.techops.com' && !token) {
        throw new Error('Access token is required for company GitLab repositories');
      }
      return await fetchGitLabFiles(projectInfo, repoInfo.host, token);
    } else {
      throw new Error('Unsupported repository type');
    }
  } catch (error) {
    console.error("Repository fetch error:", error);
    throw error;
  }
};

// Function to clear stored tokens
export const clearStoredTokens = () => {
  localStorage.removeItem('gitlab_techops_token');
  console.log('All stored tokens have been cleared');
};
