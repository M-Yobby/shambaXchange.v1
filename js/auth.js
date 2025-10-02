// js/auth.js - Complete authentication system for ShambaXchange

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeAuth();
});

window.onHeaderLoaded = function() {
    console.log('Header loaded callback called');
    updateUserHeader();
    initializeUserFeatures();
    highlightCurrentPage();
};

// Modify initializeAuth to handle both cases
function initializeAuth() {
    console.log('initializeAuth called');
    
    // If header is already loaded, update it immediately
    if (document.getElementById('user-display-name')) {
        updateUserHeader();
        highlightCurrentPage();
    }
    enforceAuth();
        
    // Initialize appropriate components based on current page
    const path = window.location.pathname.toLowerCase();
    const page = path.substring(path.lastIndexOf('/') + 1);
    const authPages = ['index.html', 'login.html', 'register.html', ''];
    
    if (authPages.includes(page)) {
        initializeAuthPages();
    } else {
        // User is on a protected page - initialize user features
        initializeUserFeatures();
        highlightCurrentPage();
    }
}

function initializeAuthPages() {
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const notification = document.getElementById('notification');
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
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('Please enter both username and password', 'error');
                return;
            }
            
            handleLogin(username, password);
        });
    }

    // Register
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            
            handleRegister(fullName, email, username, password, selectedRole);
        });
    }

    // Enter key
    const loginForm = document.querySelector('#loginContainer form');
    const registerForm = document.querySelector('#registerContainer form');
    
    if (loginForm) {
        loginForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                registerBtn.click();
            }
        });
    }
}

function handleLogin(username, password) {
    const users = JSON.parse(localStorage.getItem('sx_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        showNotification('Login successful! Redirecting...', 'success');
        
        // Update user's last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('sx_users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        // Update header immediately
        updateUserHeader();
        
        setTimeout(() => {
            const redirectTo = localStorage.getItem('redirectAfterLogin') || 'views/dashboard.html';
            window.location.href = redirectTo;
        }, 1500);
    } else {
        showNotification('Invalid username or password', 'error');
    }
}

function handleRegister(fullName, email, username, password, selectedRole) {
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
    
    const users = JSON.parse(localStorage.getItem('sx_users') || '[]');
    if (users.find(u => u.username === username)) {
        showNotification('Username already exists', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const avatarPath = getDefaultAvatar(selectedRole);
    const newUser = {
        id: generateUserId(),
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password: password,
        role: selectedRole,
        avatar: avatarPath,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('sx_users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    showNotification('Registration successful! Redirecting...', 'success');
    
    // Update header immediately
    updateUserHeader();
    
    setTimeout(() => {
        window.location.href = 'views/dashboard.html';
    }, 1500);
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getDefaultAvatar(role) {
    const avatars = {
        'farmer': '../assets/images/farmer-avatar.jpg',
        'trader': '../assets/images/trader-avatar.jpg',
        'expert': '../assets/images/expert-avatar.jpg',
        'admin': '../assets/images/admin-avatar.jpg'
    };
    return avatars[role] || '../assets/images/default-avatar.jpg';
}

function updateUserHeader() {
    try {
        const currentUser = getCurrentUser();
        const userDisplayName = document.getElementById('user-display-name');
        const userAvatar = document.getElementById('user-avatar');
        
        if (currentUser && userDisplayName) {
            const displayName = currentUser.fullName || currentUser.username || 'User';
            userDisplayName.textContent = displayName;
            userDisplayName.title = `${displayName} (${currentUser.role})`;
            
            // Update avatar with correct path
            if (userAvatar) {
                let avatarPath = currentUser.avatar;
                if (!avatarPath || avatarPath.includes('default-avatar')) {
                    avatarPath = getDefaultAvatar(currentUser.role);
                }
                userAvatar.src = avatarPath;
                userAvatar.alt = displayName;
            }
        } else {
            // User is not logged in, show Guest
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
    
    const currentUser = getCurrentUser();
    dropdown.innerHTML = `
        <div style="padding: 10px; border-bottom: 1px solid #eee; background: #f8f9fa;">
            <div style="font-weight: bold; color: #333;">${currentUser?.fullName || 'User'}</div>
            <div style="font-size: 12px; color: #666; text-transform: capitalize;">${currentUser?.role || 'Member'}</div>
        </div>
        <div class="dropdown-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; color: #333;">
            <i class="fas fa-user" style="margin-right: 8px; width: 16px; text-align: center;"></i>Profile
        </div>
        <div class="dropdown-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; color: #333;">
            <i class="fas fa-cog" style="margin-right: 8px; width: 16px; text-align: center;"></i>Settings
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
    return getCurrentUser() !== null;
}

function logout() {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('index.html') && !currentPath.includes('login.html')) {
        localStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastLogin');
    
    // Handle logout from different locations
    const currentPage = window.location.pathname;
    if (currentPage.includes('/views/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// ✅ Updated enforceAuth with role-based access and proper path handling
function enforceAuth() {
    try {
        const path = window.location.pathname.toLowerCase();
        const page = path.substring(path.lastIndexOf('/') + 1);
        const publicPages = ['index.html', 'login.html', 'register.html', ''];
        
        if (publicPages.includes(page)) return;
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
            
            // Handle redirect based on current location
            const currentPath = window.location.pathname;
            if (currentPath.includes('/views/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        const role = currentUser.role;

        // Allowed pages per role
        const accessRules = {
            farmer: ['dashboard.html', 'market.html', 'marketplace.html', 'social.html'],
            trader: ['market.html', 'marketplace.html', 'social.html'],
            expert: ['expert-dashboard.html'],
            admin: ['admin-dashboard.html']
        };

        if (accessRules[role] && !accessRules[role].includes(page)) {
            showNotification('You are not authorized to view this page', 'error');
            setTimeout(() => {
                // Handle redirects based on current location
                const basePath = window.location.pathname.includes('/views/') ? '' : 'views/';
                if (role === 'farmer') window.location.href = basePath + 'dashboard.html';
                else if (role === 'trader') window.location.href = basePath + 'market.html';
                else if (role === 'expert') window.location.href = basePath + 'expert-dashboard.html';
                else if (role === 'admin') window.location.href = basePath + 'admin-dashboard.html';
            }, 1000);
            return;
        }

        localStorage.setItem('lastActive', new Date().toISOString());

    } catch (error) {
        console.error('Auth enforcement error:', error);
        window.location.href = 'index.html';
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
            
            #logout-dropdown {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

function highlightCurrentPage() {
    try {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            // Remove active class from all links
            link.classList.remove('active');
            
            // Get the page from href attribute
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

// Debug helper (optional - remove in production)
function debugAuth() {
    console.log('Current User:', getCurrentUser());
    console.log('Users in localStorage:', JSON.parse(localStorage.getItem('sx_users') || '[]'));
    console.log('Last Login:', localStorage.getItem('lastLogin'));
    console.log('Current Path:', window.location.pathname);
}