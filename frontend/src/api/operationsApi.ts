import apiClient from './client';

export interface Customer {
  id: number;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  credit_limit: number;
  is_active: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  source: 'website' | 'referral' | 'social' | 'cold_call' | 'other';
  estimated_value: number | null;
  probability: number;
  expected_close_date: string | null;
  notes: string;
  assigned_to: number | null;
  assigned_to_email: string | null;
  converted_to_customer: boolean;
  customer: number | null;
  customer_name: string | null;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  description: string;
  unit_price: number;
  cost_price: number | null;
  sku: string;
  barcode: string;
  is_active: boolean;
  reorder_level: number;
  category: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  location: string;
  last_count_date: string | null;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  inventory_item: number;
  product_name: string;
  movement_type: 'receipt' | 'issue' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  reference: string;
  notes: string;
  movement_date: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  customer_name: string;
  order_date: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  shipping_address: string;
  expected_delivery_date: string | null;
  lines: OrderLine[];
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface OrderLine {
  id: number;
  order: number;
  product: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  customer: number | null;
  customer_name: string | null;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  progress: number;
  assigned_to: number | null;
  assigned_to_email: string | null;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const operationsApi = {
  customers: {
    list: async (params?: { is_active?: string }) => {
      const response = await apiClient.get<Customer[]>('/operations/customers/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Customer>(`/operations/customers/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Customer>) => {
      const response = await apiClient.post<Customer>('/operations/customers/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Customer>) => {
      const response = await apiClient.patch<Customer>(`/operations/customers/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/operations/customers/${id}/`);
    },
  },

  leads: {
    list: async (params?: { status?: string; assigned_to?: string }) => {
      const response = await apiClient.get<Lead[]>('/operations/leads/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Lead>(`/operations/leads/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Lead>) => {
      const response = await apiClient.post<Lead>('/operations/leads/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Lead>) => {
      const response = await apiClient.patch<Lead>(`/operations/leads/${id}/`, data);
      return response.data;
    },
    convertToCustomer: async (id: number) => {
      const response = await apiClient.post(`/operations/leads/${id}/convert_to_customer/`);
      return response.data;
    },
  },

  products: {
    list: async (params?: { is_active?: string; category?: string }) => {
      const response = await apiClient.get<Product[]>('/operations/products/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Product>(`/operations/products/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Product>) => {
      const response = await apiClient.post<Product>('/operations/products/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Product>) => {
      const response = await apiClient.patch<Product>(`/operations/products/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/operations/products/${id}/`);
    },
    lowStock: async () => {
      const response = await apiClient.get<Product[]>('/operations/products/low_stock/');
      return response.data;
    },
  },

  inventoryStock: {
    list: async (params?: { product?: string }) => {
      const response = await apiClient.get<InventoryItem[]>('/inventory/stock/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<InventoryItem>(`/inventory/stock/${id}/`);
      return response.data;
    },
  },

  inventoryAdjustments: {
    create: async (data: { inventory_item: number; quantity: number; movement_type?: string; reference?: string; notes?: string }) => {
      const response = await apiClient.post('/inventory/adjustments/', data);
      return response.data;
    },
  },

  inventory: {
    list: async () => {
      const response = await apiClient.get<InventoryItem[]>('/operations/inventory/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<InventoryItem>(`/operations/inventory/${id}/`);
      return response.data;
    },
    adjust: async (id: number, data: { quantity: number; movement_type?: string; reference?: string; notes?: string }) => {
      const response = await apiClient.post(`/operations/inventory/${id}/adjust/`, data);
      return response.data;
    },
  },

  inventoryMovements: {
    list: async (params?: { inventory_item?: string; movement_type?: string }) => {
      const response = await apiClient.get<InventoryMovement[]>('/operations/inventory-movements/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<InventoryMovement>(`/operations/inventory-movements/${id}/`);
      return response.data;
    },
  },

  orders: {
    list: async (params?: { status?: string; customer?: string }) => {
      const response = await apiClient.get<Order[]>('/operations/orders/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Order>(`/operations/orders/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Order>) => {
      const response = await apiClient.post<Order>('/operations/orders/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Order>) => {
      const response = await apiClient.patch<Order>(`/operations/orders/${id}/`, data);
      return response.data;
    },
    confirm: async (id: number) => {
      const response = await apiClient.post(`/operations/orders/${id}/confirm/`);
      return response.data;
    },
    calculateTotals: async (id: number) => {
      const response = await apiClient.post(`/operations/orders/${id}/calculate_totals/`);
      return response.data;
    },
  },

  projects: {
    list: async (params?: { status?: string; assigned_to?: string }) => {
      const response = await apiClient.get<Project[]>('/operations/projects/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Project>(`/operations/projects/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Project>) => {
      const response = await apiClient.post<Project>('/operations/projects/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Project>) => {
      const response = await apiClient.patch<Project>(`/operations/projects/${id}/`, data);
      return response.data;
    },
  },
};
