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
The application is now a **full-stack web application** with PostgreSQL database backend, Express API server, and dynamic frontend. It features secure JWT authentication, role-based access control, and real-time data integration. The system supports four user roles: farmers, traders, sponsors, and admins.

## Recent Changes (October 10, 2025)
- **Backend Infrastructure**: Set up Express server (port 3000) with PostgreSQL database
- **Database Schema**: Created comprehensive schema with Drizzle ORM for users, sales, costs, listings, posts, comments, and sponsor content
- **Authentication**: Implemented JWT-based authentication with bcrypt password hashing
- **Role-Based Access**: Four user roles (farmer, trader, sponsor, admin) with specific page access controls
- **API Integration**: Created API client for frontend-backend communication
- **Hugging Face AI**: Integrated AI assistant using Hugging Face API for farmer support
- **New Dashboards**: Built Sponsor Dashboard (content upload) and Admin Dashboard (moderation)
- **Workflows**: Configured dual workflows - Backend (port 3000) and Frontend (port 5000)
- **Deployment**: Set up autoscale deployment for production with both servers running in parallel

## Technology Stack

### Frontend
- **HTML5**: Semantic markup for all pages
- **CSS3**: Custom styling with CSS variables for green theming
- **Vanilla JavaScript (ES6 Modules)**: Modern JavaScript with imports/exports
- **Chart.js**: Data visualization for market trends and financial charts
- **Font Awesome**: Icons throughout the application
- **http-server**: Static file server on port 5000

### Backend
- **Express.js**: RESTful API server on port 3000
- **PostgreSQL (Neon)**: Production-grade database with Drizzle ORM
- **JWT Authentication**: Secure token-based authentication
- **bcrypt**: Password hashing for security
- **Multer**: File upload handling for images/videos
- **CORS**: Cross-origin resource sharing enabled
- **Hugging Face API**: AI assistant integration

### Data Storage
- **PostgreSQL Database**: Server-side data persistence with tables for:
  - `users`: User accounts with roles and authentication
  - `sales`: Farmer sales records
  - `costs`: Farm input costs tracking
  - `listings`: Marketplace product listings
  - `posts`: Social feed posts with media
  - `comments`: Post comments
  - `sponsor_content`: Sponsor carousel content with approval system

## Project Architecture

### File Structure
```
/
├── index.html              # Login/Registration page
├── views/
│   ├── dashboard.html          # Farmer dashboard with sales tracking
│   ├── sponsor-dashboard.html  # Sponsor content upload dashboard
│   ├── admin-dashboard.html    # Admin moderation dashboard
│   ├── market.html             # Market intelligence and price trends
│   ├── marketplace.html        # Buy/sell marketplace
│   ├── social.html             # Social feed
│   └── partials/
│       ├── header.html         # Shared header component
│       └── footer.html         # Shared footer component
├── server/
│   ├── index.js         # Express API server entry point
│   └── storage.ts       # Database connection and queries
├── shared/
│   └── schema.js        # Drizzle ORM database schema
├── js/
│   ├── api.js              # API client for backend communication
│   ├── auth-new.js         # Authentication with backend API
│   ├── dashboard-new.js    # Dashboard with API integration
│   ├── market.js           # Market intelligence features
│   ├── marketplace.js      # Marketplace logic
│   ├── social.js           # Social feed functionality
│   ├── header-loader.js    # Dynamic header loading
│   └── app.js              # Global utilities
├── styles/
│   ├── main.css         # Global styles with green theme
│   ├── dashboard.css    # Dashboard-specific styles
│   ├── market.css       # Market page styles
│   ├── marketplace.css  # Marketplace styles
│   ├── social.css       # Social feed styles
│   ├── header.css       # Header styles
│   └── responsive.css   # Mobile responsiveness
├── assets/
│   └── images/          # Product images and avatars
├── drizzle.config.js    # Drizzle ORM configuration
└── package.json         # Dependencies and scripts
```

### Key Features

#### Authentication System
- JWT-based secure authentication
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (Farmer, Trader, Sponsor, Admin)
- User registration with validation
- Login/logout functionality
- Protected routes based on user roles
- Token-based session management

#### User Roles and Access Control
- **Farmer**: Dashboard, Market Intel, Marketplace, Social Feed
- **Trader**: Market Intel, Marketplace, Social Feed (no Dashboard)
- **Sponsor**: Sponsor Dashboard, Marketplace, Social Feed
- **Admin**: Admin Dashboard, Market Intel, Marketplace, Social Feed

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

#### Sponsor Dashboard
- Upload carousel content (images/videos)
- Add learning resources with links
- Track content approval status
- View content statistics

#### Admin Dashboard
- Moderate sponsor content (approve/reject)
- Manage social posts (delete inappropriate content)
- View all users and their activity
- System-wide content management

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Dashboard (Farmer)
- `GET /api/sales` - Get user's sales records
- `POST /api/sales` - Create new sale record
- `GET /api/costs` - Get user's cost records
- `POST /api/costs` - Create new cost record
- `POST /api/ai/chat` - Chat with AI assistant (Hugging Face)

#### Marketplace
- `GET /api/listings` - Get all product listings
- `POST /api/listings` - Create new listing

#### Social Feed
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (with media upload)
- `POST /api/posts/:id/like` - Like a post
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment

#### Learning Hub
- `GET /api/learning-hub/content` - Get approved sponsor content

#### Sponsor
- `GET /api/sponsor/content` - Get sponsor's content
- `POST /api/sponsor/content` - Upload new content (with media)

#### Admin
- `GET /api/admin/posts` - Get all posts for moderation
- `DELETE /api/admin/posts/:id` - Delete a post
- `GET /api/admin/sponsor-content` - Get all sponsor content
- `PATCH /api/admin/sponsor-content/:id/approve` - Approve content
- `PATCH /api/admin/sponsor-content/:id/reject` - Reject content
- `GET /api/admin/users` - Get all users

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
