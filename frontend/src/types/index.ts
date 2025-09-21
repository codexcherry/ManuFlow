export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_price: number;
  is_raw_material: boolean;
  created_at: string;
}

export interface WorkCenter {
  id: number;
  name: string;
  description: string;
  cost_per_hour: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface BOMComponent {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
}

export interface BOM {
  id: number;
  product_id: number;
  product_name: string;
  name: string;
  description: string;
  quantity: number;
  production_time: number;
  components: BOMComponent[];
  created_at: string;
}

export interface ManufacturingOrder {
  id: number;
  reference: string;
  product_id: number;
  product_name: string;
  bom_id: number;
  bom_name: string;
  quantity_to_produce: number;
  quantity_produced: number;
  state: 'planned' | 'in_progress' | 'done' | 'cancelled';
  scheduled_date: string;
  assignee_id?: number;
  assignee_name?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkOrder {
  id: number;
  manufacturing_order_id: number;
  manufacturing_order_reference: string;
  work_center_id: number;
  work_center_name: string;
  operation_name: string;
  estimated_time: number;
  actual_time: number;
  state: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignee_id?: number;
  assignee_name?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  reference: string;
  movement_type: 'in' | 'out' | 'production' | 'consumption';
  quantity: number;
  unit_cost: number;
  manufacturing_order_id?: number;
  created_at: string;
  created_by?: string;
}

export interface DashboardStats {
  orders: {
    total: number;
    planned: number;
    in_progress: number;
    completed: number;
  };
  products: {
    total: number;
    low_stock: number;
  };
  work_centers: {
    active: number;
  };
  recent_activities: {
    stock_movements: number;
    work_orders: number;
  };
}

export interface ProductionReport {
  reference: string;
  product_name: string;
  quantity_to_produce: number;
  quantity_produced: number;
  state: string;
  total_time: number;
  efficiency: number;
  created_at: string;
  completed_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_price: number;
  is_raw_material: boolean;
}

export interface CreateWorkCenterData {
  name: string;
  description: string;
  cost_per_hour: number;
  capacity: number;
}

export interface CreateBOMData {
  product_id: number;
  name: string;
  description: string;
  quantity: number;
  production_time: number;
  components: {
    product_id: number;
    quantity: number;
  }[];
}

export interface CreateManufacturingOrderData {
  product_id: number;
  bom_id: number;
  quantity_to_produce: number;
  scheduled_date: string;
  assignee_id?: number;
}

export interface CreateStockMovementData {
  product_id: number;
  reference: string;
  movement_type: 'in' | 'out';
  quantity: number;
  unit_cost: number;
}
