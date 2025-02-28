
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

    // Filter out directories, keep only files
    const files = treeResponse.