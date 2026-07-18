export interface User {
  id: number;
  username: string;
  email: string;
  role: 'client' | 'admin';
  phone_number: string | null;
  address: string | null;
  avatar: string | null;
}

export interface ProductVariant {
  id: number;
  attribute_name: string;
  attribute_value: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  image: string | null;
  base_price: string;
  security_deposit_type: 'fixed' | 'percentage';
  security_deposit_value: string;
  stock_qty: number;
  available_qty: number;
  late_fee_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  late_fee_rate: string;
  grace_period_hours: number;
  variants: ProductVariant[];
  calculated_price: string;
  calculated_deposit: string;
}

export interface RentalItem {
  id: number;
  product: number;
  product_details: Product;
  quantity: number;
  unit_price: string;
  deposit_amount: string;
  selected_variants: Record<string, string>;
}

export interface DepositHistory {
  id: number;
  amount: string;
  transaction_type: 'collect' | 'refund' | 'deduct';
  created_at: string;
  notes: string | null;
}

export interface RentalInspection {
  id: number;
  inspector: number;
  inspector_details: User;
  inspection_date: string;
  condition_rating: 'good' | 'damaged' | 'needs_repair';
  damage_notes: string | null;
  missing_accessories: string | null;
  repair_initiated: boolean;
}

export interface RentalOrder {
  id: number;
  client: number;
  client_details: User;
  status: 'draft' | 'confirmed' | 'picked_up' | 'returned' | 'overdue' | 'settled' | 'cancelled';
  start_date: string;
  end_date: string;
  actual_return_date: string | null;
  fulfillment_type: 'delivery' | 'store_pickup';
  shipping_address: string | null;
  total_rent_amount: string;
  total_deposit_amount: string;
  amount_paid: string;
  deposit_paid: string;
  deposit_refunded: string;
  late_fee_charged: string;
  items: RentalItem[];
  deposit_history: DepositHistory[];
  inspections: RentalInspection[];
  created_at: string;
  updated_at: string;
}

export interface QuotationTemplate {
  id: number;
  name: string;
  header_text: string | null;
  footer_text: string | null;
}

export interface DashboardMetrics {
  active_rentals: number;
  overdue_rentals: number;
  rentals_due_today: number;
  upcoming_pickups: number;
  upcoming_returns: number;
  revenue: string;
  security_deposits_held: string;
  late_fee_collection: string;
}
