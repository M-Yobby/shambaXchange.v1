// js/header-loader.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - loading header');
    loadHeader();
});

function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    
    if (!headerContainer) {
        console.error('Header container not found');
        return;
    }

    const headerPaths = [
        '../views/partials/header.html',
        'views/partials/header.html',
        './views/partials/header.html',
        '/views/partials/header.html'
    ];

    let currentAttempt = 0;

    function tryLoadHeader() {
        if (currentAttempt >= headerPaths.length) {
            console.error('Could not load header from any path');
            headerContainer.innerHTML = '<div>Error loading header</div>';
            return;
        }

        const currentPath = headerPaths[currentAttempt];
        console.log('Attempting to load header from:', currentPath);

        fetch(currentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Header not found at ' + currentPath);
                }
                return response.text();
            })
            .then(html => {
                headerContainer.innerHTML = html;
                console.log('Header loaded successfully from:', currentPath);
                
                // Fix navigation links BEFORE calling onHeaderLoaded
                fixNavigationLinks();
                
                // Let auth.js handle the initialization
                if (typeof window.onHeaderLoaded === 'function') {
                    window.onHeaderLoaded();
                }
            })
            .catch(error => {
                console.warn('Failed to load header from', currentPath, error);
                currentAttempt++;
                tryLoadHeader();
            });
    }

    tryLoadHeader();
}

function fixNavigationLinks() {
    try {
        const navLinks = document.querySelectorAll('.nav-menu .nav-link');
        console.log('Found nav links:', navLinks.length);
        
        if (navLinks.length === 0) return;
        
        // Check if we're in views folder or root
        const inViewsFolder = window.location.pathname.toLowerCase().includes('/views/');
        console.log('In views folder:', inViewsFolder);
        
        navLinks.forEach((link, index) => {
            const originalHref = link.getAttribute('href');
            console.log(`Link ${index}:`, {
                text: link.textContent.trim(),
                originalHref: originalHref,
                dataPage: link.getAttribute('data-page')
            });
            
            // If link already has a proper href, keep it
            if (originalHref && originalHref !== '#' && !originalHref.includes('data-page')) {
                console.log('Keeping existing href:', originalHref);
                return;
            }
            
            // Determine the correct target based on data-page attribute
            const page = link.getAttribute('data-page');
            if (!page) {
                console.warn('No data-page attribute found for link:', link.textContent);
                return;
            }
            
            // Set the correct href based on current location
            let targetHref;
            if (inViewsFolder) {
                // We're in views/ folder - links should be to same directory
                targetHref = `${page}.html`;
            } else {
                // We're in root - links should go to views/ folder
                targetHref = `views/${page}.html`;
            }
            
            console.log('Setting href to:', targetHref);
            link.setAttribute('href', targetHref);
            
            // Remove any existing click listeners to prevent conflicts
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });
        
    } catch (err) {
        console.error('Error fixing navigation links:', err);
    }
}

// Expose fixNavigationLinks globally for manual invocation if needed
window.fixNavigationLinks = fixNavigationLinks; 