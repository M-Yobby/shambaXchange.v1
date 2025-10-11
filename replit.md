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
- **Hugging Face API**: AI assistant integration for farmer support and contextual agricultural advice.
- **Mapbox GL JS**: Interactive mapping for regional market overviews.
- **Chart.js**: JavaScript library for data visualization and interactive charts.
- **Font Awesome**: Icon library for UI elements.
- **Multer**: Node.js middleware for handling multipart/form-data, primarily used for file uploads.
- **bcrypt**: Library for hashing passwords.
- **jsonwebtoken (JWT)**: For secure token-based authentication.