# ManuFlow Backend

A comprehensive manufacturing management backend built with Flask and SQLAlchemy.

## Features

- **Authentication System**: User registration, login, logout with session management
- **Manufacturing Orders**: Complete order lifecycle management (planned → in_progress → done)
- **Work Orders**: Task-level operations with time tracking and status updates
- **Work Centers**: Machine/location management with cost tracking
- **Bill of Materials (BOM)**: Recipe management for products with components and operations
- **Stock Ledger**: Real-time inventory tracking with production and consumption movements
- **Product Management**: Raw materials and finished goods with stock levels
- **Dashboard**: KPIs and analytics for production monitoring
- **Reports**: Production reports with efficiency metrics

## Database Schema

### Core Models
- **User**: Authentication and role management (admin, manager, operator)
- **Product**: Materials and finished goods with stock tracking
- **WorkCenter**: Manufacturing locations with capacity and costing
- **BOM**: Bill of Materials with components and operation times
- **ManufacturingOrder**: Production orders with quantity and scheduling
- **WorkOrder**: Individual operations within manufacturing orders
- **StockMovement**: All inventory transactions with traceability

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/<id>` - Update product
- `DELETE /api/products/<id>` - Delete product

### Work Centers
- `GET /api/work-centers` - List work centers
- `POST /api/work-centers` - Create work center

### Bill of Materials
- `GET /api/boms` - List BOMs with components
- `POST /api/boms` - Create BOM with components

### Manufacturing Orders
- `GET /api/manufacturing-orders` - List orders (filterable by state)
- `POST /api/manufacturing-orders` - Create manufacturing order
- `POST /api/manufacturing-orders/<id>/confirm` - Confirm order (consumes materials)
- `POST /api/manufacturing-orders/<id>/complete` - Complete order (produces goods)

### Work Orders
- `GET /api/work-orders` - List work orders
- `POST /api/work-orders/<id>/start` - Start work order
- `POST /api/work-orders/<id>/complete` - Complete work order

### Stock Management
- `GET /api/stock-movements` - List stock movements
- `POST /api/stock-movements` - Create stock movement

### Dashboard & Reports
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/production` - Production reports
- `GET /api/users` - List users for assignee selection

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

## Default Data

The application creates default data on first run:
- Admin user: `admin` / `admin123`
- Sample work center: Main Assembly Line
- Sample products: Wooden legs, tops, screws, varnish, and wooden table

## Database

Uses SQLite database (`manuflow.db`) for simplicity and portability. The database is automatically created on first run.

## Manufacturing Flow

1. **Setup**: Create products (raw materials and finished goods)
2. **BOM Creation**: Define recipes with components and operation times
3. **Work Centers**: Set up manufacturing locations with costs
4. **Manufacturing Order**: Create production orders with BOMs
5. **Confirmation**: Confirm orders to consume raw materials
6. **Work Orders**: Execute individual operations with time tracking
7. **Completion**: Complete orders to produce finished goods

## Security

- Session-based authentication
- Password hashing with Werkzeug
- Login required decorators for protected endpoints
- CORS enabled for frontend integration

## Error Handling

- Comprehensive error messages
- Stock validation before consumption
- Data integrity checks
- Graceful failure handling

## Architecture

- **Models**: SQLAlchemy ORM for database operations
- **Controllers**: Flask routes for API endpoints  
- **Services**: Business logic for stock updates and calculations
- **Utilities**: Helper functions for reference generation and stock tracking
