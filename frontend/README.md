# ManuFlow Frontend

A modern React TypeScript application for manufacturing management with comprehensive UI/UX design.

## Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Authentication**: Complete login/register system with session management
- **Dashboard**: Real-time KPIs and manufacturing metrics
- **Manufacturing Orders**: Create, track, and manage production orders
- **Work Orders**: Execute operations with time tracking
- **Work Centers**: Manage manufacturing locations and resources
- **Products**: Raw materials and finished goods management
- **Bill of Materials**: Recipe management with components and operations
- **Stock Ledger**: Real-time inventory tracking with movements
- **Reports**: Production analytics with export functionality
- **Profile Management**: User profile and activity tracking

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form management
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icon library
- **Date-fns** - Date manipulation utilities

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will start on `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main application layout
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ManufacturingOrders.tsx
│   ├── WorkOrders.tsx
│   ├── WorkCenters.tsx
│   ├── Products.tsx
│   ├── BillOfMaterials.tsx
│   ├── StockLedger.tsx
│   ├── Reports.tsx
│   └── Profile.tsx
├── services/           # API service layer
│   └── api.ts         # API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts       # Shared interfaces
├── utils/              # Utility functions
│   └── helpers.ts     # Common helper functions
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles and Tailwind imports
```

## Key Components

### Authentication System
- Session-based authentication
- Protected and public routes
- User role management (admin, manager, operator)
- Automatic logout on session expiry

### Dashboard
- Real-time statistics and KPIs
- Manufacturing order overview with filtering
- Quick action buttons
- Status indicators and progress tracking

### Manufacturing Orders
- Create orders with BOM selection
- Confirm orders (material consumption)
- Complete orders (finished goods production)
- Track progress and efficiency

### Work Orders
- View operations by manufacturing order
- Start/complete work orders
- Time tracking and efficiency calculation
- Status management

### Stock Management
- Real-time inventory levels
- Stock movements tracking
- Low stock alerts
- Product creation and management

### Reports
- Production efficiency reports
- Date range filtering
- CSV export functionality
- Visual analytics and charts

## API Integration

The frontend communicates with the Flask backend through:
- RESTful API endpoints
- Session-based authentication
- Automatic error handling
- Request/response interceptors

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for component patterns
- **Responsive design** for mobile and desktop
- **Dark/light theme ready** color system
- **Consistent spacing** and typography

## State Management

- **React Context** for global state (authentication)
- **Local state** for component-specific data
- **Session storage** for authentication persistence
- **API caching** through React hooks

## Form Handling

- **React Hook Form** for form validation
- **TypeScript interfaces** for type safety
- **Custom validation** rules
- **Error handling** and user feedback

## Notifications

- **React Hot Toast** for user notifications
- **Success/error** message handling
- **Auto-dismiss** functionality
- **Custom styling** to match app theme

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Code Style

- **TypeScript strict mode** enabled
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Consistent naming conventions**

## Production Build

1. Build the application:
```bash
npm run build
```

2. The build folder contains optimized files ready for deployment

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- Responsive design for mobile devices

## Performance

- **Code splitting** for reduced bundle size
- **Lazy loading** for route-based components
- **Optimized images** and assets
- **Efficient re-rendering** with React hooks

## Security

- **XSS protection** through React's built-in escaping
- **CSRF protection** via API session management
- **Input validation** on both client and server
- **Secure authentication** flow

## Accessibility

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Color contrast** compliance
- **Semantic HTML** structure
