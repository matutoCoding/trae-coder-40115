export interface Station {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  tools: string[];
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  type: 'basic' | 'intermediate' | 'advanced' | 'exam';
  instructor: string;
  date: string;
  startTime: string;
  endTime: string;
  stationId: string;
  stationName: string;
  students: string[];
  maxStudents: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  isGenerated: boolean;
  ruleId?: string;
  notes?: string;
}

export interface CycleRule {
  id: string;
  name: string;
  courseTitle: string;
  courseType: Course['type'];
  instructor: string;
  stationId: string;
  stationName: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  maxStudents: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  totalGenerated: number;
}

export type LiquorCategory = 'base' | 'syrup' | 'liqueur' | 'juice' | 'other';

export interface Batch {
  id: string;
  liquorId: string;
  liquorName: string;
  category: LiquorCategory;
  batchNo: string;
  quantity: number;
  unit: string;
  productionDate: string;
  expiryDate: string;
  inboundDate: string;
  status: 'normal' | 'expiring' | 'expired' | 'locked';
  location: string;
  price?: number;
  supplier?: string;
}

export interface Liquor {
  id: string;
  name: string;
  category: LiquorCategory;
  brand: string;
  spec: string;
  totalStock: number;
  unit: string;
  batches: Batch[];
  warningCount: number;
}

export interface OutboundRecord {
  id: string;
  batchId: string;
  liquorId: string;
  liquorName: string;
  batchNo: string;
  quantity: number;
  unit: string;
  operator: string;
  outboundDate: string;
  purpose: string;
  courseId?: string;
  isFifo: boolean;
}

export interface ExamRecord {
  id: string;
  studentName: string;
  courseName: string;
  examType: string;
  score?: number;
  recordUrl?: string;
  createdAt: string;
  status: 'pending' | 'reviewing' | 'passed' | 'failed';
  reviewer?: string;
  comments?: string;
}
