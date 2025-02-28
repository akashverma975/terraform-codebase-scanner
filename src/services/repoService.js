import axios from 'axios';

// Determine if a URL is for GitHub or GitLab
const getRepoType = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname === 'github.com' || hostname.endsWith('.github.com')) {
      return 'github';
    } else if (hostname === 'gitlab.com' || hostname.endsWith('.gitlab.com')) {
      return 'gitlab';
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
const extractProjectInfo = (url, type) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    
    if (pathParts.length < 2) {
      throw new Error(`Invalid ${type} repository URL`);
    }
    
    // For both GitHub and GitLab, we need owner/repo
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    return { owner, repo };
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
const fetchGitHubFiles = async (owner, repo) => {
  try {
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
const fetchGitLabFiles = async (owner, repo) => {
  try {
    const projectPath = `${owner}/${repo}`;
    const encodedProjectPath = encodeURIComponent(projectPath);
    
    // Get the repository tree
    const treeResponse = await axios.get(
      `https://gitlab.com/api/v4/projects/${encodedProjectPath}/repository/tree`,
      {
        params: {
          recursive: true,
          per_page: 100
        }
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

    // Fetch content for each Terraform file
    const fileContents = await Promise.all(
      terraformFiles.map(async (file) => {
        try {
          const fileResponse = await axios.get(
            `https://gitlab.com/api/v4/projects/${encodedProjectPath}/repository/files/${encodeURIComponent(file.path)}`,
            {
              params: {
                ref: 'main' // Try main first
              }
            }
          ).catch(() => {
            // If main branch doesn't exist, try master
            return axios.get(
              `https://gitlab.com/api/v4/projects/${encodedProjectPath}/repository/files/${encodeURIComponent(file.path)}`,
              {
                params: {
                  ref: 'master'
                }
              }
            );
          });
          
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
          
          return file;
        } catch (error) {
          console.error(`Error fetching file ${file.path}:`, error);
          return {
            ...file,
            content: `# Error loading file: ${error.message}`,
            error: true
          };
        }
      })
    );
    
    return fileContents;
  } catch (error) {
    console.error("GitLab API Error:", error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Repository not found. Make sure the URL is correct and the repository is public.');
      } else if (error.response.status === 401) {
        throw new Error('Authentication required. This repository might be private.');
      } else {
        throw new Error(`GitLab API error: ${error.response.data.message || error.response.statusText}`);
      }
    }
    throw error;
  }
};

// Main function to fetch repository files
export const fetchRepositoryFiles = async (repoUrl) => {
  try {
    const repoType = getRepoType(repoUrl);
    const { owner, repo } = extractProjectInfo(repoUrl, repoType);
    
    console.log(`Fetching ${repoType} repository: ${owner}/${repo}`);
    
    if (repoType === 'github') {
      return await fetchGitHubFiles(owner, repo);
    } else if (repoType === 'gitlab') {
      return await fetchGitLabFiles(owner, repo);
    } else {
      throw new Error('Unsupported repository type');
    }
  } catch (error) {
    console.error("Repository fetch error:", error);
    throw error;
  }
};
