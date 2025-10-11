// API Client for ShambaXchange
// API_URL is determined dynamically to support different deployment scenarios

// Priority 1: Use global config if loaded from config.js
// Priority 2: Fetch from API config endpoint
// Priority 3: Fall back to window.location.origin
let API_URL = window.SHAMBAXCHANGE_CONFIG?.apiUrl || window.location.origin;
let API_URL_INITIALIZED = !!window.SHAMBAXCHANGE_CONFIG; // Already initialized if config exists

// Try to get the correct API URL from the backend (handles cross-origin scenarios)
async function ensureApiUrl() {
  if (API_URL_INITIALIZED) return;
  
  try {
    const response = await fetch(`${window.location.origin}/api/config/api-url`);
    if (response.ok) {
      const data = await response.json();
      if (data.apiUrl) {
        API_URL = data.apiUrl;
        console.log('API URL configured from server:', API_URL);
      }
    }
  } catch (error) {
    console.warn('Could not fetch API URL config, using origin:', window.location.origin);
    // If config fetch fails, stick with window.location.origin
  }
  API_URL_INITIALIZED = true;
}

class API {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    // Ensure API URL is configured before making request
    await ensureApiUrl();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const fullUrl = `${API_URL}${endpoint}`;

    try {
      console.log('API Request:', fullUrl, config);
      console.log('Current origin:', window.location.origin);
      console.log('API_URL:', API_URL);
      
      const response = await fetch(fullUrl, config);
      console.log('API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Request failed');
        } catch (e) {
          throw new Error(errorText || 'Request failed');
        }
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      console.error('Failed URL:', fullUrl);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Auth
  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true,
    });
    this.setToken(response.token);
    return response;
  }

  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
    this.setToken(response.token);
    return response;
  }

  async getMe() {
    return await this.request('/api/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Sales
  async getSales() {
    return await this.request('/api/sales');
  }

  async createSale(saleData) {
    return await this.request('/api/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  // Costs
  async getCosts() {
    return await this.request('/api/costs');
  }

  async createCost(costData) {
    return await this.request('/api/costs', {
      method: 'POST',
      body: JSON.stringify(costData),
    });
  }

  // Crops
  async getCrops() {
    return await this.request('/api/crops');
  }

  async createCrop(cropData) {
    return await this.request('/api/crops', {
      method: 'POST',
      body: JSON.stringify(cropData),
    });
  }

  // AI Chat
  async chatWithAI(message) {
    return await this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Listings
  async getListings() {
    return await this.request('/api/listings');
  }

  async createListing(listingData) {
    return await this.request('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  // Posts
  async getPosts() {
    return await this.request('/api/posts');
  }

  async createPost(formData) {
    // For file uploads, don't set Content-Type
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return await response.json();
  }

  async likePost(postId) {
    return await this.request(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async getComments(postId) {
    return await this.request(`/api/posts/${postId}/comments`);
  }

  async createComment(postId, text) {
    return await this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Learning Hub Content
  async getLearningHubContent() {
    return await this.request('/api/learning-hub/content');
  }

  // Sponsor endpoints
  async getSponsorContent() {
    return await this.request('/api/sponsor/content');
  }

  async createSponsorContent(formData) {
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/api/sponsor/content`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create sponsor content');
    }

    return await response.json();
  }

  // Admin endpoints
  async getAllPosts() {
    return await this.request('/api/admin/posts');
  }

  async deletePost(postId) {
    return await this.request(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async getAllSponsorContent() {
    return await this.request('/api/admin/sponsor-content');
  }

  async approveSponsorContent(contentId) {
    return await this.request(`/api/admin/sponsor-content/${contentId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectSponsorContent(contentId) {
    return await this.request(`/api/admin/sponsor-content/${contentId}/reject`, {
      method: 'PATCH',
    });
  }

  async getAllUsers() {
    return await this.request('/api/admin/users');
  }
}

// Export singleton instance
const api = new API();
export default api;
