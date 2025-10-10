# ShambaXchange - Agricultural Platform

## Project Overview
ShambaXchange is a comprehensive web-based agricultural platform designed to connect farmers, traders, and agricultural stakeholders. The platform provides tools for market intelligence, e-commerce, social networking, and farm management.

## Purpose and Goals
- **Market Intelligence**: Provide real-time market data and price trends for agricultural products
- **Marketplace**: Enable farmers to list and sell products directly to traders
- **Social Networking**: Foster community engagement through posts, comments, and media sharing
- **Farm Dashboard**: Help farmers track sales, costs, and financial metrics
- **Learning Hub**: Provide educational resources and best practices

## Current State
The application is a fully functional frontend-only web application, currently deployed and running in the Replit environment. It uses localStorage for data persistence and does not require a backend server.

## Recent Changes (October 10, 2025)
- Imported project from GitHub
- Installed http-server for serving static files
- Configured workflow to serve the application on port 5000 with CORS enabled
- Added .gitignore for Node.js environment
- Verified application is running correctly on Replit

## Technology Stack

### Frontend
- **HTML5**: Semantic markup for all pages
- **CSS3**: Custom styling with CSS variables for theming
- **Vanilla JavaScript**: All functionality implemented without frameworks
- **Chart.js**: Data visualization for market trends and financial charts
- **Font Awesome**: Icons throughout the application

### Data Storage
- **localStorage**: Client-side data persistence for:
  - User authentication and profiles
  - Sales and cost records
  - Product listings
  - Social posts and interactions

### Server
- **http-server**: Simple static file server for development
- Port 5000 with CORS enabled
- Cache disabled (-c-1) for development

## Project Architecture

### File Structure
```
/
├── index.html              # Login/Registration page
├── views/
│   ├── dashboard.html     # Farmer dashboard with sales tracking
│   ├── market.html        # Market intelligence and price trends
│   ├── marketplace.html   # Buy/sell marketplace
│   ├── social.html        # Social feed
│   └── partials/
│       ├── header.html    # Shared header component
│       └── footer.html    # Shared footer component
├── js/
│   ├── auth.js           # Authentication and user management
│   ├── dashboard.js      # Dashboard functionality
│   ├── market.js         # Market intelligence features
│   ├── marketplace.js    # Marketplace logic
│   ├── social.js         # Social feed functionality
│   ├── header-loader.js  # Dynamic header loading
│   └── app.js           # Global utilities
├── styles/
│   ├── main.css         # Global styles and variables
│   ├── dashboard.css    # Dashboard-specific styles
│   ├── market.css       # Market page styles
│   ├── marketplace.css  # Marketplace styles
│   ├── social.css       # Social feed styles
│   ├── header.css       # Header styles
│   └── responsive.css   # Mobile responsiveness
└── assets/
    └── images/          # Product images and avatars
```

### Key Features

#### Authentication System
- Role-based access control (Farmer, Trader, Expert, Admin)
- User registration with validation
- Login/logout functionality
- Protected routes based on user roles
- Session management via localStorage

#### Farmer Dashboard
- Sales tracking and management
- Input cost recording
- Financial summary with charts
- Yield calculator
- AI chatbot assistant
- Learning hub with educational content
- CSV export functionality

#### Market Intelligence
- Regional price filters
- Product price trends
- Analytics for high/low moving products
- Interactive charts for market data
- Kenya map integration

#### Marketplace
- Buy/Sell tabs
- Horizontal scrollable product cards
- Modal view for all listings
- Category-based organization
- Contact seller functionality

#### Social Feed
- Create posts with media upload
- Like and comment functionality
- Trending posts section
- Most engaged content

## User Preferences
- No specific user preferences documented yet

## Development Notes

### Running the Application
The application is configured to run automatically via the Replit workflow system:
```bash
npx http-server -p 5000 -a 0.0.0.0 --cors -c-1
```

### Testing
To test different user roles:
1. Register a new user and select a role
2. Each role has access to different pages:
   - **Farmer**: Dashboard, Market, Marketplace, Social
   - **Trader**: Market, Marketplace, Social
   - **Expert**: Expert Dashboard
   - **Admin**: Admin Dashboard

### Data Storage
All data is stored in localStorage with these keys:
- `sx_users`: User accounts
- `currentUser`: Currently logged-in user
- `sx_listings`: Marketplace listings
- `sales`: Sales records
- `costs`: Cost records
- `lastLogin`: Last login timestamp

### Known Issues
- Password fields not in forms (browser warning - cosmetic only)
- Some 404 errors for missing resources (non-critical)
- Images in Pestanol folder use .PNG extension (case-sensitive on some systems)

## Deployment Configuration

### Production Deployment
The application is configured for autoscale deployment on Replit:
- **Target**: Autoscale (stateless web application)
- **Command**: `npx http-server -p 5000 -a 0.0.0.0 --cors`
- **Port**: 5000
- **CORS**: Enabled for cross-origin requests

### Security Considerations
⚠️ **Important**: This is a demo/prototype application with the following security limitations:
- **Authentication**: Uses client-side localStorage only (not production-ready)
- **Password Storage**: Passwords stored in plaintext in localStorage (not secure)
- **No Backend**: All data stored in browser (lost on cache clear)

**For Production Use**: This application requires:
1. Backend API with secure authentication (JWT, OAuth, etc.)
2. Encrypted password storage with proper hashing (bcrypt, Argon2)
3. Server-side session management
4. HTTPS enforcement
5. Input validation and sanitization
6. CSRF protection
7. Rate limiting

The current implementation is suitable for:
- Local development and testing
- Proof of concept demonstrations
- Learning and educational purposes
- UI/UX prototyping

## Future Enhancements
- Backend API integration
- Real-time weather data
- Advanced analytics
- Payment processing
- Mobile app version
