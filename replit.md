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

### Latest Updates (Evening)
- **Database Driver Fix**: Switched from @neondatabase/serverless to standard postgres driver for better Drizzle ORM compatibility
- **Registration Fixed**: Added email uniqueness validation and improved error handling for duplicate users
- **Header Navigation Fixed**: Corrected ES6 module loading for auth-new.js across all pages
- **User Display Fixed**: User's actual name now displays in header instead of "Guest"
- **Trader Access Control**: Traders can see Dashboard link but get "only available to farmers" alert when clicked
- **Hugging Face AI Enhanced**: Improved prompt engineering and response parsing for contextual, Kenya-focused agricultural advice
- **Navigation Menu**: All user roles now see appropriate navigation links based on their permissions

### Earlier Today
- **Backend Infrastructure**: Set up Express server with PostgreSQL database
- **Database Schema**: Created comprehensive schema with Drizzle ORM for users, sales, costs, listings, posts, comments, and sponsor content
- **Authentication**: Implemented JWT-based authentication with bcrypt password hashing
- **Role-Based Access**: Four user roles (farmer, trader, sponsor, admin) with specific page access controls
- **API Integration**: Created API client for frontend-backend communication
- **Hugging Face AI**: Integrated AI assistant using Hugging Face API for farmer support
- **New Dashboards**: Built Sponsor Dashboard (content upload) and Admin Dashboard (moderation)
- **Unified Server**: Single Express server on port 5000 serves both API and static frontend files
- **Deployment**: Configured autoscale deployment for production with simplified single-server architecture

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

### Security Notes
⚠️ **Production-Ready Security**: The application now includes:
- JWT authentication with secure token management
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control
- Protected API endpoints
- Environment variable management for sensitive data
- CORS configuration for secure cross-origin requests

For production deployment, ensure:
1. HTTPS is enabled
2. Environment variables are properly configured
3. Database connection is secure
4. API rate limiting is implemented (future enhancement)

## Deployment Configuration

### Production Deployment
The application is configured for autoscale deployment on Replit:
- **Target**: Autoscale (stateless web application)
- **Port**: 5000 (single unified server)
- **Server**: Express.js serving both REST API and static files
- **Database**: PostgreSQL (Neon) with automatic backups
- **Architecture**: Simplified single-server setup eliminates CORS issues

### Running the Application
The application runs automatically via the Replit workflow system:
```bash
# Single server on port 5000 (serves both API and static files)
node server/index.js
```

The Express backend now serves both the REST API endpoints and the static frontend files, simplifying deployment and avoiding CORS issues.

### Database Management
```bash
# Push schema changes to database
npm run db:push

# Force push (if data loss warning)
npm run db:push --force
```

## Future Enhancements
- Real-time weather data integration
- Advanced analytics and reporting
- Payment processing for marketplace transactions
- Mobile app version (React Native/Flutter)
- Real-time notifications (WebSockets)
- Multi-language support (i18n)
- API rate limiting
- Advanced search and filtering
- Export/import data functionality
- Integration with external agricultural APIs
