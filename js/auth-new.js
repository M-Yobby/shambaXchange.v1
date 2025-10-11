// js/auth-new.js - Backend-integrated authentication system
import api from './api.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

window.onHeaderLoaded = async function() {
    await updateUserHeader();
    initializeUserFeatures();
    highlightCurrentPage();
    populateNavigationMenu();
};

async function initializeAuth() {
    try {
        // Check if user is logged in by verifying token
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                currentUser = await api.getMe();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } catch (error) {
                // Token invalid, clear it
                api.clearToken();
                localStorage.removeItem('currentUser');
            }
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
    }

    // If header is already loaded, update it immediately
    if (document.getElementById('user-display-name')) {
        await updateUserHeader();
        highlightCurrentPage();
        populateNavigationMenu();
    }
    
    enforceAuth();
        
    // Initialize appropriate components based on current page
    const path = window.location.pathname.toLowerCase();
    const page = path.substring(path.lastIndexOf('/') + 1);
    const authPages = ['index.html', 'login.html', 'register.html', '', '/'];
    
    if (authPages.includes(page) || path === '/' || path === '/index.html') {
        initializeAuthPages();
    } else {
        initializeUserFeatures();
        highlightCurrentPage();
        populateNavigationMenu();
    }
}

function populateNavigationMenu() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) {
        console.warn('navMenu element not found');
        return;
    }

    const user = getCurrentUser();
    const userRole = user ? user.role : 'guest';
    
    console.log('Populating navigation menu for user role:', userRole);
    navMenu.innerHTML = '';

    // Standard navigation menu for all users (logged in or not)
    const menuItems = [
        { href: '/dashboard', icon: 'fa-tachometer-alt', text: 'Farm Dashboard', page: 'dashboard' },
        { href: '/market', icon: 'fa-chart-bar', text: 'Market Intel', page: 'market' },
        { href: '/marketplace', icon: 'fa-shopping-cart', text: 'Marketplace', page: 'marketplace' },
        { href: '/social', icon: 'fa-users', text: 'Social', page: 'social' },
    ];
    
    menuItems.forEach(item => {
        const li = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'nav-link';
        link.setAttribute('data-page', item.page);
        link.innerHTML = `<i class="fas ${item.icon}"></i> ${item.text}`;
        
        li.appendChild(link);
        navMenu.appendChild(li);
    });
}

function initializeAuthPages() {
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const roleOptions = document.querySelectorAll('.role-option');
    
    let selectedRole = '';

    if (!loginContainer || !registerContainer) return;

    // Role selection
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            roleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedRole = this.getAttribute('data-role');
        });
    });

    // Switch forms
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
            hideNotification();
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
            hideNotification();
        });
    }

    // Login
    if (loginBtn) {
        loginBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('Please enter both username and password', 'error');
                return;
            }
            
            await handleLogin(username, password);
        });
    }

    // Register
    if (registerBtn) {
        registerBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            
            await handleRegister(fullName, email, username, password, selectedRole);
        });
    }
}

async function handleLogin(username, password) {
    try {
        const response = await api.login({ username, password });
        currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Login successful! Redirecting...', 'success');
        await updateUserHeader();
        
        setTimeout(() => {
            const redirectTo = getRedirectPath(currentUser.role);
            window.location.href = redirectTo;
        }, 1000);
    } catch (error) {
        showNotification(error.message || 'Invalid username or password', 'error');
    }
}

async function handleRegister(fullName, email, username, password, selectedRole) {
    if (!fullName || !email || !username || !password || !selectedRole) {
        showNotification('Please fill all fields and select a role', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        showNotification('Password must contain both letters and numbers', 'error');
        return;
    }
    
    try {
        console.log('Registering user:', { fullName, email, username, role: selectedRole });
        const response = await api.register({
            fullName,
            email,
            username,
            password,
            role: selectedRole
        });
        
        console.log('Registration response:', response);
        currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Registration successful! Redirecting...', 'success');
        await updateUserHeader();
        
        setTimeout(() => {
            const redirectTo = getRedirectPath(currentUser.role);
            window.location.href = redirectTo;
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed', 'error');
    }
}

function getRedirectPath(role) {
    const paths = {
        farmer: '/dashboard',
        trader: '/market',
        sponsor: '/sponsor-dashboard',
        admin: '/admin-dashboard',
    };
    return paths[role] || '/market';
}

async function updateUserHeader() {
    try {
        const user = getCurrentUser();
        const userDisplayName = document.getElementById('user-display-name');
        const userAvatar = document.getElementById('user-avatar');
        
        console.log('Updating user header with user:', user);
        
        if (user && userDisplayName) {
            const displayName = user.fullName || user.username || 'User';
            userDisplayName.textContent = displayName;
            console.log('User display name set to:', displayName);
            userDisplayName.title = `${displayName} (${user.role})`;
            
            if (userAvatar) {
                userAvatar.src = user.avatar || '../assets/images/default-avatar.jpg';
                userAvatar.alt = displayName;
            }
        } else {
            if (userDisplayName) {
                userDisplayName.textContent = 'Guest';
                userDisplayName.title = 'Guest User';
            }
            if (userAvatar) {
                userAvatar.src = '../assets/images/default-avatar.jpg';
                userAvatar.alt = 'Guest';
            }
        }
    } catch (error) {
        console.error('Error updating user header:', error);
    }
}

function initializeUserFeatures() {
    const userProfile = document.getElementById('user-profile');
    
    if (userProfile) {
        userProfile.style.cursor = 'pointer';
        userProfile.style.transition = 'all 0.3s ease';
        userProfile.style.padding = '5px 10px';
        userProfile.style.borderRadius = '4px';
        
        userProfile.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        userProfile.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            showLogoutDropdown(this);
        });
    }
    
    document.addEventListener('click', function() {
        hideLogoutDropdown();
    });
}

function showLogoutDropdown(userProfileElement) {
    hideLogoutDropdown();
    
    const dropdown = document.createElement('div');
    dropdown.id = 'logout-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 150px;
        margin-top: 5px;
        font-family: Arial, sans-serif;
    `;
    
    const user = getCurrentUser();
    dropdown.innerHTML = `
        <div style="padding: 10px; border-bottom: 1px solid #eee; background: #f8f9fa;">
            <div style="font-weight: bold; color: #333;">${user?.fullName || 'User'}</div>
            <div style="font-size: 12px; color: #666; text-transform: capitalize;">${user?.role || 'Member'}</div>
        </div>
        <div class="dropdown-item" id="logout-btn" style="padding: 10px; cursor: pointer; color: #e74c3c;">
            <i class="fas fa-sign-out-alt" style="margin-right: 8px; width: 16px; text-align: center;"></i>Logout
        </div>
    `;
    
    const rect = userProfileElement.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    
    document.body.appendChild(dropdown);
    
    dropdown.querySelector('#logout-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        logout();
    });
    
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        item.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function hideLogoutDropdown() {
    const existingDropdown = document.getElementById('logout-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
        notification.textContent = '';
    }
}

function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

function isLoggedIn() {
    return getCurrentUser() !== null && localStorage.getItem('authToken') !== null;
}

function logout() {
    api.logout();
    localStorage.removeItem('currentUser');
    
    // Redirect to home page
    window.location.href = '/';
}

function enforceAuth() {
    try {
        const path = window.location.pathname.toLowerCase();
        const page = path.substring(path.lastIndexOf('/') + 1);
        const publicPages = ['index.html', 'login.html', 'register.html', '', '/'];
        
        // Skip auth enforcement for public pages (including root and index)
        if (publicPages.includes(page) || path === '/' || path === '/index.html') return;
        
        const user = getCurrentUser();
        const token = localStorage.getItem('authToken');
        
        if (!user || !token) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/views/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = '/';
            }
            return;
        }

        const role = user.role;

        // Normalize page name (remove .html if present for comparison)
        const normalizedPage = page.replace('.html', '');

        // Allowed pages per role (without .html extension for clean URLs)
        const accessRules = {
            farmer: ['dashboard', 'market', 'marketplace', 'social'],
            trader: ['market', 'marketplace', 'social'],
            sponsor: ['sponsor-dashboard', 'marketplace', 'social'],
            admin: ['admin-dashboard', 'market', 'marketplace', 'social']
        };

        if (accessRules[role] && !accessRules[role].includes(normalizedPage)) {
            showNotification('You are not authorized to view this page', 'error');
            setTimeout(() => {
                window.location.href = getRedirectPath(role);
            }, 1000);
            return;
        }

    } catch (error) {
        console.error('Auth enforcement error:', error);
        window.location.href = '/';
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.color = type === 'success' ? '#27ae60' : '#e74c3c';
    notification.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    notification.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    notification.style.padding = '12px';
    notification.style.borderRadius = '4px';
    notification.style.margin = '15px 0';
    notification.style.display = 'block';
    notification.style.fontWeight = '500';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function highlightCurrentPage() {
    try {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            
            const linkHref = link.getAttribute('href');
            if (linkHref) {
                const linkPage = linkHref.split('/').pop();
                if (linkPage === currentPage) {
                    link.classList.add('active');
                }
            }
        });
    } catch (error) {
        console.error('Error highlighting current page:', error);
    }
}

// Initialize auth styles
document.addEventListener('DOMContentLoaded', addAuthStyles);

function addAuthStyles() {
    if (!document.getElementById('auth-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            .role-option {
                cursor: pointer;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                text-align: center;
                transition: all 0.3s ease;
            }
            
            .role-option:hover {
                border-color: #28a745;
            }
            
            .role-option.active {
                border-color: #28a745;
                background-color: #f8fff9;
            }
            
            .role-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .password-requirements {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                margin: 10px 0;
                font-size: 14px;
            }
            
            .password-requirements ul {
                margin: 5px 0;
                padding-left: 20px;
            }
            
            #logout-dropdown .dropdown-item:hover {
                background-color: #f8f9fa !important;
            }
            
            .nav-link.active {
                font-weight: bold;
                color: #f1f7f2ff !important;
            }
        `;
        document.head.appendChild(style);
    }
}
