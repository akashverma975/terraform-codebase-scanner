import axios from 'axios';

// Extract project ID from GitLab URL
const extractProjectInfo = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Remove gitlab.com from the pathname
    const path = urlObj.pathname.startsWith('/') 
      ? urlObj.pathname.substring(1) 
      : urlObj.pathname;
    
    // Project path with namespace (username/repo)
    return path;
  } catch (error) {
    throw new Error('Invalid GitLab URL format');
  }
};

// Check if a file is a Terraform file (.tf or .tfvars)
const isTerraformFile = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  return extension === 'tf' || extension === 'tfvars';
};

// Fetch repository files from GitLab API
export const fetchRepositoryFiles = async (repoUrl) => {
  try {
    const projectPath = extractProjectInfo(repoUrl);
    
    if (!projectPath) {
      throw new Error('Could not extract project information from URL');
    }
    
    // URL encode the project path
    const encodedProjectPath = encodeURIComponent(projectPath);
    
    // First, get the repository tree to find all files
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

    // Filter out directories and keep only Terraform files (.tf and .tfvars)
    const files = treeResponse.data.filter(item => 
      item.type === 'blob' && isTerraformFile(item.path)
    );
    
    if (files.length === 0) {
      throw new Error('No Terraform files (.tf or .tfvars) found in this repository');
    }

    // Fetch content for each Terraform file
    const fileContents = await Promise.all(
      files.map(async (file) => {
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
              // Use window.atob for browser environments
              content = window.atob(fileResponse.data.content);
            } catch (e) {
              // Fallback to Buffer for Node.js environments or if atob fails
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
            content: `// Error loading file: ${error.message}`,
            error: true
          };
        }
      })
    );
    
    return fileContents;
  } catch (error) {
    console.error("API Error:", error);
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

// Check if a file is likely binary based on extension
const isBinaryFile = (filePath) => {
  const binaryExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'webp', 'tiff',
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'zip', 'rar', 'tar', 'gz', '7z', 'bz2',
    'exe', 'dll', 'so', 'dylib', 'bin', 'dat',
    'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'wav', 'ogg',
    'ttf', 'otf', 'woff', 'woff2', 'eot'
  ];
  
  const extension = filePath.split('.').pop().toLowerCase();
  return binaryExtensions.includes(extension);
};
