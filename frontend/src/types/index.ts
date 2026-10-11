export type RepStatus = 'Active' | 'In Visit' | 'On Route' | 'Idle' | 'Offline';

export interface SalesRep {
  id: string;
  name: string;
  code: string;
  avatar: string;
  phone: string;
  email: string;
  territory: string;
  region: string;
  status: RepStatus;
  batteryLevel: number;
  lastCheckIn: string;
  targetAmount: number;
  targetAchievedPct: number;
  visitsTodayCount: number;
  totalDistanceKm: number;
  salesClosedAmount: number;
  joinDate: string;
}

export interface Retailer {
  id: string;
  name: string;
  ownerName: string;
  code: string;
  type: 'Kirana' | 'Supermarket' | 'Pharmacy' | 'Wholesale' | 'Electronics';
  phone: string;
  address: string;
  territory: string;
  city: string;
  outstandingBalance: number;
  creditLimit: number;
  lastOrderDate: string;
  lastVisitDate: string;
  assignedRepName: string;
  assignedRepId: string;
  status: 'Active' | 'Lead' | 'Blocked';
  rating: number; // 1-5
}

export interface Distributor {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  region: string;
  territoryCoverage: string[];
  stockValue: number;
  currentWarehouseCapacityPct: number;
  creditLimit: number;
  outstandingBalance: number;
  status: 'Active' | 'Pending Review' | 'Inactive';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'FMCG' | 'Beverages' | 'Personal Care' | 'Snacks' | 'Dairy';
  unitPrice: number;
  mrp: number;
  casePackSize: number;
  stockInHandCases: number;
  reorderLevelCases: number;
  taxRatePct: number;
  imageUrl: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  distributorName: string;
  distributorId: string;
  casesAvailable: number;
  casesReserved: number;
  batchNumber: string;
  expiryDate: string;
  status: 'Optimal' | 'Near Expiry' | 'Low Stock';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantityCases: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  retailerId: string;
  retailerName: string;
  distributorId: string;
  distributorName: string;
  repId: string;
  repName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Credit';
  orderStatus: 'Approved' | 'Processing' | 'Delivered' | 'Cancelled';
  deliveryDateEstimated: string;
}

export interface BeatPlan {
  id: string;
  beatName: string;
  code: string;
  territory: string;
  repId: string;
  repName: string;
  retailersCount: number;
  scheduledDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  estimatedDistanceKm: number;
  estimatedVisitsDurationHours: number;
  completionPct: number;
  status: 'Active' | 'Draft' | 'Completed';
}

export interface Visit {
  id: string;
  visitCode: string;
  retailerId: string;
  retailerName: string;
  retailerAddress: string;
  repId: string;
  repName: string;
  beatName: string;
  plannedTime: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  visitType: 'Regular Order' | 'Audit' | 'Collection' | 'New Lead Pitch';
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Missed' | 'Cancelled';
  geofenceVerified: boolean;
  orderBookedAmount: number;
  photoProofUrl?: string;
  notes?: string;
  feedback?: string;
}

export interface AttendanceRecord {
  id: string;
  repId: string;
  repName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Present' | 'Late' | 'Half Day' | 'On Leave' | 'Absent';
  startLocation: string;
  endLocation?: string;
  workingHours: number;
  batteryPctAtCheckIn: number;
  geofenceVerified: boolean;
}

export interface Target {
  id: string;
  repId: string;
  repName: string;
  monthYear: string;
  salesTargetAmount: number;
  salesAchievedAmount: number;
  visitsTargetCount: number;
  visitsAchievedCount: number;
  newOutletsTargetCount: number;
  newOutletsAchievedCount: number;
  status: 'On Track' | 'At Risk' | 'Achieved' | 'Behind';
}

export interface AnalyticsSummary {
  totalRevenueThisMonth: number;
  revenueGrowthPct: number;
  activeRepsCount: number;
  totalVisitsCompletedToday: number;
  visitsTargetToday: number;
  totalOrdersBookedToday: number;
  avgOrderValue: number;
  overallTargetAchievementPct: number;
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'Sales' | 'Field Force' | 'Inventory' | 'Distributors' | 'Outlets';
  generatedDate: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  fileSize: string;
  downloadUrl: string;
}
