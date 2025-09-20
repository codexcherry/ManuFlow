# ManuFlow - Manufacturing Management System

A comprehensive manufacturing management application that enables businesses to create, track, and manage their end-to-end production process digitally. Built with Flask backend and React frontend.

**Problem Statement - 1**  
**codexcoders - 36 (Team Number oodo x nmit)**

## 🚀 Features

### Core Manufacturing Management
- **Manufacturing Orders**: Complete order lifecycle from planning to completion
- **Work Orders**: Task-level operations with time tracking and status updates
- **Work Centers**: Manufacturing location and resource management
- **Bill of Materials (BOM)**: Recipe management with components and operations
- **Stock Ledger**: Real-time inventory tracking with automatic updates
- **Product Management**: Raw materials and finished goods with stock levels

### Advanced Features
- **Dashboard Analytics**: Real-time KPIs and production metrics
- **User Management**: Role-based access (Admin, Manager, Operator)
- **Reports & Analytics**: Production efficiency, export functionality
- **Real-time Updates**: Live inventory and production status
- **Modern UI/UX**: Responsive design with intuitive workflow

## 🏗️ Architecture

### Backend (Flask)
- **SQLite Database** for simplicity and portability
- **RESTful API** with comprehensive endpoints
- **Session-based Authentication** with role management
- **Automatic Stock Management** with transaction tracking
- **Data Validation** and error handling

### Frontend (React TypeScript)
- **Modern React 18** with hooks and functional components
- **TypeScript** for type-safe development
- **Tailwind CSS** for responsive, modern UI
- **React Router** for client-side routing
- **Context API** for state management

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask application:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🔑 Default Login

Use these credentials to access the application:
- **Username**: admin
- **Password**: admin123
- **Role**: Administrator

## 📊 Manufacturing Flow

### 1. Setup Phase
- Create **Products** (raw materials and finished goods)
- Set up **Work Centers** with capacity and costing
- Define **Bill of Materials** with components and operations

### 2. Production Phase
- Create **Manufacturing Orders** with quantity and scheduling
- **Confirm Orders** to consume raw materials
- Execute **Work Orders** with time tracking
- **Complete Orders** to produce finished goods

### 3. Monitoring Phase
- View **Dashboard** for real-time KPIs
- Track **Stock Movements** and inventory levels
- Generate **Reports** for performance analysis

## 🗂️ Project Structure

```
ManuFlow-v2/
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── README.md          # Backend documentation
│   └── manuflow.db        # SQLite database (auto-created)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API integration
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Helper functions
│   ├── package.json       # Node.js dependencies
│   ├── README.md         # Frontend documentation
│   └── tailwind.config.js # Tailwind CSS configuration
├── blueprint.excalidraw   # Project design blueprint
└── README.md             # Main documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Manufacturing Orders
- `GET /api/manufacturing-orders` - List orders (with filtering)
- `POST /api/manufacturing-orders` - Create order
- `POST /api/manufacturing-orders/{id}/confirm` - Confirm order
- `POST /api/manufacturing-orders/{id}/complete` - Complete order

### Work Orders
- `GET /api/work-orders` - List work orders
- `POST /api/work-orders/{id}/start` - Start work order
- `POST /api/work-orders/{id}/complete` - Complete work order

### Products & Inventory
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/stock-movements` - List stock movements
- `POST /api/stock-movements` - Create stock movement

### Reports & Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/production` - Production reports

## 🎯 Key Concepts

### Bill of Materials (BOM)
Defines how a product is built with components and operations:
```
Product: Wooden Table (1 Unit)
Components:
- 4 × Wooden Legs
- 1 × Wooden Top  
- 12 × Screws
- 1 × Varnish Bottle
Operations:
- Assembly (60 minutes)
- Painting (30 minutes) 
- Packing (20 minutes)
```

### Manufacturing Order
Production order containing:
- Finished product and quantity
- Associated BOM
- Schedule and assignee
- Raw material requirements

### Work Orders
Individual operations within a manufacturing order:
- Assembly operation
- Painting operation
- Packing operation

### Stock Management
Automatic inventory updates:
- **Stock Out**: Raw material consumption
- **Stock In**: Finished goods production

## 🔒 Security Features

- **Password hashing** with Werkzeug
- **Session-based authentication**
- **Role-based access control**
- **Input validation** and sanitization
- **CORS protection** for API access

## 📈 Performance Features

- **Efficient database queries** with SQLAlchemy
- **Code splitting** in React frontend
- **Responsive design** for mobile devices
- **Real-time updates** without page refresh

## 🛠️ Customization

### Adding New Modules
1. Create new API endpoints in `backend/app.py`
2. Add database models as needed
3. Create frontend pages in `frontend/src/pages/`
4. Update navigation in `Layout.tsx`

### Modifying Workflows
- Update state transitions in manufacturing orders
- Add custom fields to existing models
- Implement approval workflows

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**
   - Run the backend once to auto-create the database

2. **CORS errors**
   - Ensure both frontend and backend are running
   - Check the proxy setting in `package.json`

3. **Authentication issues**
   - Clear browser session/cookies
   - Restart both frontend and backend

### Development Mode
- Backend runs with debug mode enabled
- Frontend has hot reload for development
- Database recreates sample data on startup

## 🚀 Production Deployment

### Backend
1. Set production environment variables
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure secure session keys
4. Set up proper database (PostgreSQL recommended)

### Frontend
1. Run `npm run build` to create production build
2. Serve static files with nginx or similar
3. Configure API URL for production backend

## 📋 Sample Data

The application comes with sample data:
- **Products**: Wooden legs, tops, screws, varnish, wooden table
- **Work Center**: Main Assembly Line
- **Admin User**: admin/admin123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For questions or issues:
1. Check the documentation in README files
2. Review the API endpoints
3. Check console logs for errors
4. Ensure all dependencies are installed correctly

---

**ManuFlow** - Streamlining manufacturing operations from order to output! 🏭
