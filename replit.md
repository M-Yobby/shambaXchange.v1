# ShambaXchange - Agricultural Platform

## Overview
ShambaXchange is a comprehensive web-based agricultural platform connecting farmers, traders, and agricultural stakeholders. Its primary purpose is to provide market intelligence, facilitate e-commerce, foster social networking, and offer farm management tools. The platform aims to revolutionize the agricultural sector by providing real-time data, direct sales channels, community engagement, and educational resources, ultimately enhancing efficiency and profitability for its users. It is a full-stack web application with a PostgreSQL database, an Express API server, and a dynamic frontend, featuring secure JWT authentication and role-based access control for farmers, traders, sponsors, and admins.

## User Preferences
- No specific user preferences documented yet

## System Architecture

### UI/UX Decisions
- **Green Theming**: Custom CSS variables are used to maintain a consistent green theme across the application.
- **Iconography**: Font Awesome is used extensively for intuitive navigation and feature representation.
- **Dynamic Content**: Data is dynamically loaded and displayed from the backend, including product listings, social posts, and market data.
- **Interactive Maps**: Mapbox GL JS is integrated for regional market overviews, allowing users to filter data based on geographical regions in Kenya.
- **Data Visualization**: Chart.js is used for interactive graphs showing market trends, financial summaries, and commodity price fluctuations.

### Technical Implementations
- **Frontend**: Utilizes HTML5, CSS3, and Vanilla JavaScript (ES6 Modules) for a lightweight and performant client-side experience.
- **Backend**: Built with Express.js, providing a RESTful API.
- **Database**: PostgreSQL with Drizzle ORM for robust data management, hosted on Neon.
- **Authentication**: JWT-based authentication with bcrypt for password hashing ensures secure user access and role-based permissions.
- **Role-Based Access Control**: Four distinct user roles (Farmer, Trader, Sponsor, Admin) govern access to specific functionalities and content.
- **Unified Server**: A single Express server serves both the API and static frontend files, simplifying deployment and managing CORS.

### Feature Specifications
- **Authentication System**: Secure JWT-based authentication with bcrypt hashing and role-based access control.
- **Farmer Dashboard**: Tools for sales tracking, cost recording, financial summaries, yield calculation, and an AI chatbot assistant.
- **Market Intelligence**: Real-time market data, price trends, analytics for high/low moving products, and an interactive map of Kenya's agricultural regions.
- **Marketplace**: Buy/Sell functionality, product listings with categories, and direct contact options for sellers.
- **Social Feed**: Users can create posts with media, like, comment, and view trending content based on engagement.
- **Sponsor Dashboard**: Allows sponsors to upload content (images/videos) and learning resources, with content approval tracking.
- **Admin Dashboard**: Provides tools for moderating sponsor content, managing social posts, and overseeing user activity.
- **Crop Tracking System**: Farmers can track crops with planting and harvest dates, with progress bars.

### System Design Choices
- **Modular File Structure**: Organizes frontend views, backend logic, shared schema, and static assets for maintainability.
- **API-First Approach**: Clear separation between frontend and backend via RESTful API endpoints.
- **Scalability**: Designed for autoscale deployment on platforms like Replit, with a stateless web application architecture.
- **Security Focus**: Implements robust security measures including JWT, bcrypt, and environment variable management.

## External Dependencies
- **PostgreSQL (Neon)**: Production-grade relational database for data persistence.
- **Hugging Face API**: AI assistant integration using Mistral 7B model for farmer support and contextual agricultural advice.
- **Open-Meteo API**: Free weather API for location-based real-time weather data (no API key required).
- **Mapbox GL JS**: Interactive mapping for regional market overviews.
- **Chart.js**: JavaScript library for data visualization and interactive charts.
- **Font Awesome**: Icon library for UI elements.
- **Multer**: Node.js middleware for handling multipart/form-data, primarily used for file uploads.
- **bcrypt**: Library for hashing passwords.
- **jsonwebtoken (JWT)**: For secure token-based authentication.

## Recent Changes (October 11, 2025)

### Farmer Dashboard Enhancements
- **Product Tracking System**: Renamed "Crop Progress" to "Product Tracking" with comprehensive support
  - Now supports crops, livestock, and poultry tracking
  - Added productType field to database schema with safe defaults
  - Updated modal forms with product type dropdown selection
  - Changed labels to be more inclusive (Start Date, Expected Ready/Harvest Date)
- **Dynamic AI Recommendations**: AI recommendations now based on farmer's actual products
  - Analyzes farmer's sales history and tracked products in real-time
  - Provides specific recommendations for maize, beans, potatoes, livestock, and poultry
  - Updates automatically when new products or sales are added
  - Context-aware advice based on product types
- **Fixed AI Chatbot (AgriBot)**: Improved reliability and error handling
  - Changed from Llama 3.2 to Mistral 7B model for better performance and stability
  - Added comprehensive error handling for API failures
  - Better response parsing with fallback messages
  - Graceful degradation when AI service is unavailable
- **Location-Based Weather Integration**: Real-time weather based on farmer's location
  - Uses Open-Meteo API (no API key required) for weather data
  - Gets user's location via browser geolocation with permission
  - Displays temperature, city/town, and weather conditions
  - Includes refresh button for manual weather updates
  - Falls back to Nairobi weather if location permission is denied
  - Uses OpenStreetMap for reverse geocoding to show city names
- **Navigation Icons**: Verified and harmonized across all pages via dynamic menu system
- **Registration CORS**: Analyzed and confirmed CORS is correctly configured for all origins

### Interactive Mapbox Map & Regional Analytics
- Integrated Mapbox GL JS for Regional Market Overview
- Shows Kenya's 8 main agricultural regions with interactive markers
- Click regions to filter Highest/Lowest Moving Products
- Complete county-to-region mapping for all 47 Kenyan counties
- Region-based analytics with proper normalization

### Social Feed & Marketplace
- Removed placeholder posts - starts with clean slate
- Added 10MB file size limit for media uploads with error messaging
- User-to-user messaging feature with "Message" buttons
- Fixed Buy/Sell toggle buttons with proper active states

### Navigation System Restructuring (October 11, 2025)
- **Two-Line Header Structure**: Implemented strict two-line layout across all pages
  - Top line: ONLY shambaXchange logo (centered)
  - Second line: ONLY navigation pages (centered)
  - User actions (notifications, profile) removed from header for cleaner layout
- **Unified Navigation Menu**: All users see the same four navigation pages
  - "Farm Dashboard", "Market Intel", "Marketplace", "Social"
  - Consistent for all roles (farmer, trader, sponsor, admin) and even unauthenticated users
  - Access control handled by enforceAuth() function, not by hiding menu items
- **Clean URL Routing**: Implemented clean URLs for all main pages
  - `/dashboard` for Farm Dashboard
  - `/market` for Market Intel
  - `/marketplace` for Marketplace
  - `/social` for Social Feed
  - Legacy .html paths still work for backward compatibility
- **API Configuration System**: Added dynamic API URL configuration
  - `/config.js` endpoint provides API_URL to frontend
  - Supports cross-origin deployments and different environments
  - Improved CORS handling with explicit origin logging
- **Shared Header Partial**: Single header template (views/partials/header.html) ensures consistency
  - All pages include the same header structure
  - Dynamic menu population via auth-new.js
  - Green theme maintained across all navigation elements
- **Fixed Header Loading Issues**:
  - Removed conflicting app.js from marketplace, market, and social pages
  - Fixed timing issue where enforceAuth() was running before header loaded
  - Header now loads successfully via header-loader.js
  - Authentication check deferred until after header is fully loaded
- **Fixed Login/Registration (Mixed Content Error)**:
  - Fixed "Failed to fetch" error preventing login and registration
  - Updated /config.js endpoint to detect HTTPS via X-Forwarded-Proto header
  - Resolves mixed content security issue (HTTP requests from HTTPS pages)
  - API URL now correctly uses HTTPS when accessed via Replit's proxy