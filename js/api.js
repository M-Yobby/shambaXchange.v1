// API Client for ShambaXchange
// Both frontend and backend are served from the same origin now
const API_URL = window.location.origin;

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

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
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
