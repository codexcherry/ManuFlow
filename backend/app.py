from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import sqlite3
import os
import random
import string
from functools import wraps
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'manuflow-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///manuflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='operator')  # admin, manager, operator
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    unit = db.Column(db.String(20), default='Units')
    current_stock = db.Column(db.Float, default=0.0)
    min_stock = db.Column(db.Float, default=0.0)
    cost_price = db.Column(db.Float, default=0.0)
    is_raw_material = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class WorkCenter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    cost_per_hour = db.Column(db.Float, default=0.0)
    capacity = db.Column(db.Integer, default=1)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BOM(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    product = db.relationship('Product', backref='boms')

class BOMLine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bom_id = db.Column(db.Integer, db.ForeignKey('bom.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    operation_time = db.Column(db.Float, default=0.0)  # in minutes
    
    bom = db.relationship('BOM', backref='components')
    product = db.relationship('Product')

class ManufacturingOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(50), unique=True, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    bom_id = db.Column(db.Integer, db.ForeignKey('bom.id'), nullable=False)
    quantity_to_produce = db.Column(db.Float, nullable=False)
    quantity_produced = db.Column(db.Float, default=0.0)
    state = db.Column(db.String(20), default='planned')  # planned, in_progress, done, cancelled
    scheduled_date = db.Column(db.DateTime, nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    product = db.relationship('Product')
    bom = db.relationship('BOM')
    assignee = db.relationship('User')

class WorkOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    manufacturing_order_id = db.Column(db.Integer, db.ForeignKey('manufacturing_order.id'), nullable=False)
    work_center_id = db.Column(db.Integer, db.ForeignKey('work_center.id'), nullable=False)
    operation_name = db.Column(db.String(100), nullable=False)
    estimated_time = db.Column(db.Float, default=0.0)  # in minutes
    actual_time = db.Column(db.Float, default=0.0)
    state = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    manufacturing_order = db.relationship('ManufacturingOrder', backref='work_orders')
    work_center = db.relationship('WorkCenter')
    assignee = db.relationship('User')

class StockMovement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    reference = db.Column(db.String(100))
    movement_type = db.Column(db.String(20), nullable=False)  # in, out, production, consumption
    quantity = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float, default=0.0)
    manufacturing_order_id = db.Column(db.Integer, db.ForeignKey('manufacturing_order.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    product = db.relationship('Product')
    manufacturing_order = db.relationship('ManufacturingOrder')
    created_by = db.relationship('User')

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Helper Functions
def generate_reference(prefix):
    timestamp = datetime.now().strftime('%y%m%d')
    random_part = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}{timestamp}{random_part}"

def update_product_stock(product_id, quantity, movement_type):
    product = Product.query.get(product_id)
    if product:
        if movement_type in ['in', 'production']:
            product.current_stock += quantity
        elif movement_type in ['out', 'consumption']:
            product.current_stock -= quantity
        db.session.commit()

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password')),
        role=data.get('role', 'operator')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    })

# Product Routes
@app.route('/api/products', methods=['GET'])
@login_required
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'unit': p.unit,
        'current_stock': p.current_stock,
        'min_stock': p.min_stock,
        'cost_price': p.cost_price,
        'is_raw_material': p.is_raw_material,
        'created_at': p.created_at.isoformat()
    } for p in products])

@app.route('/api/products', methods=['POST'])
@login_required
def create_product():
    data = request.get_json()
    product = Product(
        name=data.get('name'),
        description=data.get('description', ''),
        unit=data.get('unit', 'Units'),
        current_stock=data.get('current_stock', 0.0),
        min_stock=data.get('min_stock', 0.0),
        cost_price=data.get('cost_price', 0.0),
        is_raw_material=data.get('is_raw_material', False)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product created successfully', 'id': product.id}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.unit = data.get('unit', product.unit)
    product.min_stock = data.get('min_stock', product.min_stock)
    product.cost_price = data.get('cost_price', product.cost_price)
    product.is_raw_material = data.get('is_raw_material', product.is_raw_material)
    
    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

# Work Center Routes
@app.route('/api/work-centers', methods=['GET'])
@login_required
def get_work_centers():
    centers = WorkCenter.query.all()
    return jsonify([{
        'id': wc.id,
        'name': wc.name,
        'description': wc.description,
        'cost_per_hour': wc.cost_per_hour,
        'capacity': wc.capacity,
        'is_active': wc.is_active,
        'created_at': wc.created_at.isoformat()
    } for wc in centers])

@app.route('/api/work-centers', methods=['POST'])
@login_required
def create_work_center():
    data = request.get_json()
    center = WorkCenter(
        name=data.get('name'),
        description=data.get('description', ''),
        cost_per_hour=data.get('cost_per_hour', 0.0),
        capacity=data.get('capacity', 1)
    )
    
    db.session.add(center)
    db.session.commit()
    
    return jsonify({'message': 'Work center created successfully', 'id': center.id}), 201

# BOM Routes
@app.route('/api/boms', methods=['GET'])
@login_required
def get_boms():
    boms = BOM.query.all()
    result = []
    
    for bom in boms:
        components = []
        for line in bom.components:
            components.append({
                'id': line.id,
                'product_id': line.product_id,
                'product_name': line.product.name,
                'quantity': line.quantity,
                'operation_time': line.operation_time
            })
        
        result.append({
            'id': bom.id,
            'product_id': bom.product_id,
            'product_name': bom.product.name,
            'name': bom.name,
            'description': bom.description,
            'quantity': bom.quantity,
            'components': components,
            'created_at': bom.created_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/api/boms', methods=['POST'])
@login_required
def create_bom():
    data = request.get_json()
    
    bom = BOM(
        product_id=data.get('product_id'),
        name=data.get('name'),
        description=data.get('description', ''),
        quantity=data.get('quantity', 1.0)
    )
    
    db.session.add(bom)
    db.session.flush()
    
    # Add components
    for component in data.get('components', []):
        bom_line = BOMLine(
            bom_id=bom.id,
            product_id=component.get('product_id'),
            quantity=component.get('quantity'),
            operation_time=component.get('operation_time', 0.0)
        )
        db.session.add(bom_line)
    
    db.session.commit()
    return jsonify({'message': 'BOM created successfully', 'id': bom.id}), 201

# Manufacturing Order Routes
@app.route('/api/manufacturing-orders', methods=['GET'])
@login_required
def get_manufacturing_orders():
    state_filter = request.args.get('state')
    query = ManufacturingOrder.query
    
    if state_filter:
        query = query.filter(ManufacturingOrder.state == state_filter)
    
    orders = query.order_by(ManufacturingOrder.created_at.desc()).all()
    
    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'reference': order.reference,
            'product_id': order.product_id,
            'product_name': order.product.name,
            'bom_id': order.bom_id,
            'bom_name': order.bom.name,
            'quantity_to_produce': order.quantity_to_produce,
            'quantity_produced': order.quantity_produced,
            'state': order.state,
            'scheduled_date': order.scheduled_date.isoformat(),
            'assignee_id': order.assignee_id,
            'assignee_name': order.assignee.username if order.assignee else None,
            'created_at': order.created_at.isoformat(),
            'started_at': order.started_at.isoformat() if order.started_at else None,
            'completed_at': order.completed_at.isoformat() if order.completed_at else None
        })
    
    return jsonify(result)

@app.route('/api/manufacturing-orders', methods=['POST'])
@login_required
def create_manufacturing_order():
    data = request.get_json()
    
    reference = generate_reference('MO')
    
    order = ManufacturingOrder(
        reference=reference,
        product_id=data.get('product_id'),
        bom_id=data.get('bom_id'),
        quantity_to_produce=data.get('quantity_to_produce'),
        scheduled_date=datetime.fromisoformat(data.get('scheduled_date')),
        assignee_id=data.get('assignee_id')
    )
    
    db.session.add(order)
    db.session.flush()
    
    # Create work orders based on BOM operations
    bom = BOM.query.get(data.get('bom_id'))
    if bom:
        for component in bom.components:
            if component.operation_time > 0:
                work_order = WorkOrder(
                    manufacturing_order_id=order.id,
                    work_center_id=1,  # Default work center, should be configurable
                    operation_name=f"Process {component.product.name}",
                    estimated_time=component.operation_time * data.get('quantity_to_produce'),
                    assignee_id=data.get('assignee_id')
                )
                db.session.add(work_order)
    
    db.session.commit()
    return jsonify({'message': 'Manufacturing order created successfully', 'id': order.id, 'reference': reference}), 201

@app.route('/api/manufacturing-orders/<int:order_id>/confirm', methods=['POST'])
@login_required
def confirm_manufacturing_order(order_id):
    order = ManufacturingOrder.query.get_or_404(order_id)
    order.state = 'in_progress'
    order.started_at = datetime.utcnow()
    
    # Create stock consumption entries
    bom = order.bom
    for component in bom.components:
        required_qty = component.quantity * order.quantity_to_produce
        
        # Check if enough stock available
        if component.product.current_stock < required_qty:
            return jsonify({'error': f'Insufficient stock for {component.product.name}'}), 400
        
        # Create consumption movement
        movement = StockMovement(
            product_id=component.product_id,
            reference=order.reference,
            movement_type='consumption',
            quantity=required_qty,
            manufacturing_order_id=order.id,
            created_by_id=session['user_id']
        )
        db.session.add(movement)
        update_product_stock(component.product_id, required_qty, 'consumption')
    
    db.session.commit()
    return jsonify({'message': 'Manufacturing order confirmed successfully'})

@app.route('/api/manufacturing-orders/<int:order_id>/complete', methods=['POST'])
@login_required
def complete_manufacturing_order(order_id):
    order = ManufacturingOrder.query.get_or_404(order_id)
    data = request.get_json()
    
    quantity_produced = data.get('quantity_produced', order.quantity_to_produce)
    
    order.state = 'done'
    order.quantity_produced = quantity_produced
    order.completed_at = datetime.utcnow()
    
    # Create production movement
    movement = StockMovement(
        product_id=order.product_id,
        reference=order.reference,
        movement_type='production',
        quantity=quantity_produced,
        manufacturing_order_id=order.id,
        created_by_id=session['user_id']
    )
    db.session.add(movement)
    update_product_stock(order.product_id, quantity_produced, 'production')
    
    db.session.commit()
    return jsonify({'message': 'Manufacturing order completed successfully'})

# Work Order Routes
@app.route('/api/work-orders', methods=['GET'])
@login_required
def get_work_orders():
    mo_id = request.args.get('manufacturing_order_id')
    query = WorkOrder.query
    
    if mo_id:
        query = query.filter(WorkOrder.manufacturing_order_id == mo_id)
    
    orders = query.order_by(WorkOrder.id).all()
    
    result = []
    for wo in orders:
        result.append({
            'id': wo.id,
            'manufacturing_order_id': wo.manufacturing_order_id,
            'manufacturing_order_reference': wo.manufacturing_order.reference,
            'work_center_id': wo.work_center_id,
            'work_center_name': wo.work_center.name,
            'operation_name': wo.operation_name,
            'estimated_time': wo.estimated_time,
            'actual_time': wo.actual_time,
            'state': wo.state,
            'assignee_id': wo.assignee_id,
            'assignee_name': wo.assignee.username if wo.assignee else None,
            'started_at': wo.started_at.isoformat() if wo.started_at else None,
            'completed_at': wo.completed_at.isoformat() if wo.completed_at else None,
            'notes': wo.notes
        })
    
    return jsonify(result)

@app.route('/api/work-orders/<int:wo_id>/start', methods=['POST'])
@login_required
def start_work_order(wo_id):
    work_order = WorkOrder.query.get_or_404(wo_id)
    work_order.state = 'in_progress'
    work_order.started_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Work order started successfully'})

@app.route('/api/work-orders/<int:wo_id>/complete', methods=['POST'])
@login_required
def complete_work_order(wo_id):
    work_order = WorkOrder.query.get_or_404(wo_id)
    data = request.get_json()
    
    work_order.state = 'completed'
    work_order.completed_at = datetime.utcnow()
    work_order.actual_time = data.get('actual_time', work_order.estimated_time)
    work_order.notes = data.get('notes', '')
    
    # Calculate actual time if started_at exists
    if work_order.started_at:
        time_diff = work_order.completed_at - work_order.started_at
        work_order.actual_time = time_diff.total_seconds() / 60  # in minutes
    
    db.session.commit()
    return jsonify({'message': 'Work order completed successfully'})

# Stock Movement Routes
@app.route('/api/stock-movements', methods=['GET'])
@login_required
def get_stock_movements():
    product_id = request.args.get('product_id')
    query = StockMovement.query
    
    if product_id:
        query = query.filter(StockMovement.product_id == product_id)
    
    movements = query.order_by(StockMovement.created_at.desc()).all()
    
    result = []
    for movement in movements:
        result.append({
            'id': movement.id,
            'product_id': movement.product_id,
            'product_name': movement.product.name,
            'reference': movement.reference,
            'movement_type': movement.movement_type,
            'quantity': movement.quantity,
            'unit_cost': movement.unit_cost,
            'manufacturing_order_id': movement.manufacturing_order_id,
            'created_at': movement.created_at.isoformat(),
            'created_by': movement.created_by.username if movement.created_by else None
        })
    
    return jsonify(result)

@app.route('/api/stock-movements', methods=['POST'])
@login_required
def create_stock_movement():
    data = request.get_json()
    
    movement = StockMovement(
        product_id=data.get('product_id'),
        reference=data.get('reference', ''),
        movement_type=data.get('movement_type'),
        quantity=data.get('quantity'),
        unit_cost=data.get('unit_cost', 0.0),
        created_by_id=session['user_id']
    )
    
    db.session.add(movement)
    update_product_stock(data.get('product_id'), data.get('quantity'), data.get('movement_type'))
    
    db.session.commit()
    return jsonify({'message': 'Stock movement created successfully', 'id': movement.id}), 201

# Dashboard Routes
@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    total_orders = ManufacturingOrder.query.count()
    planned_orders = ManufacturingOrder.query.filter_by(state='planned').count()
    in_progress_orders = ManufacturingOrder.query.filter_by(state='in_progress').count()
    completed_orders = ManufacturingOrder.query.filter_by(state='done').count()
    
    total_products = Product.query.count()
    low_stock_products = Product.query.filter(Product.current_stock <= Product.min_stock).count()
    
    active_work_centers = WorkCenter.query.filter_by(is_active=True).count()
    
    # Recent activities
    recent_movements = StockMovement.query.order_by(StockMovement.created_at.desc()).limit(10).all()
    recent_work_orders = WorkOrder.query.order_by(WorkOrder.id.desc()).limit(10).all()
    
    return jsonify({
        'orders': {
            'total': total_orders,
            'planned': planned_orders,
            'in_progress': in_progress_orders,
            'completed': completed_orders
        },
        'products': {
            'total': total_products,
            'low_stock': low_stock_products
        },
        'work_centers': {
            'active': active_work_centers
        },
        'recent_activities': {
            'stock_movements': len(recent_movements),
            'work_orders': len(recent_work_orders)
        }
    })

# Users Routes (for assignee selection)
@app.route('/api/users', methods=['GET'])
@login_required
def get_users():
    users = User.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role
    } for u in users])

# Reports Routes
@app.route('/api/reports/production', methods=['GET'])
@login_required
def get_production_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = ManufacturingOrder.query
    
    if start_date:
        query = query.filter(ManufacturingOrder.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(ManufacturingOrder.created_at <= datetime.fromisoformat(end_date))
    
    orders = query.all()
    
    result = []
    for order in orders:
        total_time = sum([wo.actual_time or wo.estimated_time for wo in order.work_orders])
        
        result.append({
            'reference': order.reference,
            'product_name': order.product.name,
            'quantity_to_produce': order.quantity_to_produce,
            'quantity_produced': order.quantity_produced,
            'state': order.state,
            'total_time': total_time,
            'efficiency': (order.quantity_produced / order.quantity_to_produce * 100) if order.quantity_to_produce > 0 else 0,
            'created_at': order.created_at.isoformat(),
            'completed_at': order.completed_at.isoformat() if order.completed_at else None
        })
    
    return jsonify(result)

# Initialize Database
def create_tables():
    db.create_all()
    
    # Create default admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@manuflow.com',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
    
    # Create default work center if not exists
    if not WorkCenter.query.first():
        default_center = WorkCenter(
            name='Main Assembly Line',
            description='Primary assembly line for manufacturing',
            cost_per_hour=50.0,
            capacity=1
        )
        db.session.add(default_center)
    
    # Add sample products if none exist
    if not Product.query.first():
        # Raw materials
        wood_legs = Product(name='Wooden Legs', unit='Pieces', is_raw_material=True, current_stock=100, min_stock=20, cost_price=5.0)
        wood_top = Product(name='Wooden Top', unit='Pieces', is_raw_material=True, current_stock=50, min_stock=10, cost_price=25.0)
        screws = Product(name='Screws', unit='Pieces', is_raw_material=True, current_stock=1000, min_stock=100, cost_price=0.1)
        varnish = Product(name='Varnish Bottle', unit='Bottles', is_raw_material=True, current_stock=30, min_stock=5, cost_price=8.0)
        
        # Finished products
        wooden_table = Product(name='Wooden Table', unit='Units', is_raw_material=False, current_stock=0, min_stock=5, cost_price=100.0)
        
        for product in [wood_legs, wood_top, screws, varnish, wooden_table]:
            db.session.add(product)
    
    db.session.commit()

# Register a function to run before first request (compatible with Flask 2.x)
with app.app_context():
    create_tables()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@manuflow.com',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin)
        
        # Create default work center if not exists
        if not WorkCenter.query.first():
            default_center = WorkCenter(
                name='Main Assembly Line',
                description='Primary assembly line for manufacturing',
                cost_per_hour=50.0,
                capacity=1
            )
            db.session.add(default_center)
        
        # Add sample products if none exist
        if not Product.query.first():
            # Raw materials
            wood_legs = Product(name='Wooden Legs', unit='Pieces', is_raw_material=True, current_stock=100, min_stock=20, cost_price=5.0)
            wood_top = Product(name='Wooden Top', unit='Pieces', is_raw_material=True, current_stock=50, min_stock=10, cost_price=25.0)
            screws = Product(name='Screws', unit='Pieces', is_raw_material=True, current_stock=1000, min_stock=100, cost_price=0.1)
            varnish = Product(name='Varnish Bottle', unit='Bottles', is_raw_material=True, current_stock=30, min_stock=5, cost_price=8.0)
            
            # Finished products
            wooden_table = Product(name='Wooden Table', unit='Units', is_raw_material=False, current_stock=0, min_stock=5, cost_price=100.0)
            
            for product in [wood_legs, wood_top, screws, varnish, wooden_table]:
                db.session.add(product)
        
        db.session.commit()
    
    app.run(debug=True, port=5000)
