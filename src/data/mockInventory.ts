import { Batch, Liquor, OutboundRecord, ExamRecord } from '@/types';
import { addDays, today } from '@/utils/date';

const todayDate = today();

export const mockBatches: Batch[] = [
  {
    id: 'b_001',
    liquorId: 'l_001',
    liquorName: '百加得白朗姆酒',
    category: 'base',
    batchNo: 'BAC-2024-0315',
    quantity: 12,
    unit: '瓶',
    productionDate: '2024-03-15',
    expiryDate: addDays(todayDate, 45),
    inboundDate: '2024-04-01',
    status: 'normal',
    location: 'A区-01货架'
  },
  {
    id: 'b_002',
    liquorId: 'l_001',
    liquorName: '百加得白朗姆酒',
    category: 'base',
    batchNo: 'BAC-2024-0120',
    quantity: 6,
    unit: '瓶',
    productionDate: '2024-01-20',
    expiryDate: addDays(todayDate, 5),
    inboundDate: '2024-02-10',
    status: 'expiring',
    location: 'A区-01货架'
  },
  {
    id: 'b_003',
    liquorId: 'l_002',
    liquorName: '斯米诺伏特加',
    category: 'base',
    batchNo: 'SMI-2023-1105',
    quantity: 8,
    unit: '瓶',
    productionDate: '2023-11-05',
    expiryDate: addDays(todayDate, 90),
    inboundDate: '2023-12-01',
    status: 'normal',
    location: 'A区-02货架'
  },
  {
    id: 'b_004',
    liquorId: 'l_003',
    liquorName: '尊尼获加黑牌威士忌',
    category: 'base',
    batchNo: 'JWB-2024-0210',
    quantity: 10,
    unit: '瓶',
    productionDate: '2024-02-10',
    expiryDate: addDays(todayDate, 180),
    inboundDate: '2024-03-05',
    status: 'normal',
    location: 'A区-03货架'
  },
  {
    id: 'b_005',
    liquorId: 'l_004',
    liquorName: '必得利红石榴糖浆',
    category: 'syrup',
    batchNo: 'BDL-2024-0401',
    quantity: 20,
    unit: '瓶',
    productionDate: '2024-04-01',
    expiryDate: addDays(todayDate, -3),
    inboundDate: '2024-04-15',
    status: 'expired',
    location: 'B区-01货架'
  },
  {
    id: 'b_006',
    liquorId: 'l_004',
    liquorName: '必得利红石榴糖浆',
    category: 'syrup',
    batchNo: 'BDL-2024-0520',
    quantity: 15,
    unit: '瓶',
    productionDate: '2024-05-20',
    expiryDate: addDays(todayDate, 120),
    inboundDate: '2024-06-01',
    status: 'normal',
    location: 'B区-01货架'
  },
  {
    id: 'b_007',
    liquorId: 'l_005',
    liquorName: '莫林香草糖浆',
    category: 'syrup',
    batchNo: 'MLN-2024-0510',
    quantity: 8,
    unit: '瓶',
    productionDate: '2024-05-10',
    expiryDate: addDays(todayDate, 10),
    inboundDate: '2024-05-20',
    status: 'expiring',
    location: 'B区-02货架'
  },
  {
    id: 'b_008',
    liquorId: 'l_006',
    liquorName: '君度力娇酒',
    category: 'liqueur',
    batchNo: 'COT-2024-0301',
    quantity: 6,
    unit: '瓶',
    productionDate: '2024-03-01',
    expiryDate: addDays(todayDate, 200),
    inboundDate: '2024-03-20',
    status: 'normal',
    location: 'C区-01货架'
  },
  {
    id: 'b_009',
    liquorId: 'l_007',
    liquorName: '柠檬汁',
    category: 'juice',
    batchNo: 'LEM-2024-0615',
    quantity: 30,
    unit: '瓶',
    productionDate: '2024-06-15',
    expiryDate: addDays(todayDate, 7),
    inboundDate: '2024-06-16',
    status: 'expiring',
    location: '冷藏区-01'
  },
  {
    id: 'b_010',
    liquorId: 'l_008',
    liquorName: '孟买蓝宝石金酒',
    category: 'base',
    batchNo: 'BOM-2024-0228',
    quantity: 5,
    unit: '瓶',
    productionDate: '2024-02-28',
    expiryDate: addDays(todayDate, -10),
    inboundDate: '2024-03-15',
    status: 'locked',
    location: '待处理区'
  }
];

export const mockLiquors: Liquor[] = [
  {
    id: 'l_001',
    name: '百加得白朗姆酒',
    category: 'base',
    brand: 'Bacardi',
    spec: '750ml',
    totalStock: 18,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_001'),
    warningCount: 1
  },
  {
    id: 'l_002',
    name: '斯米诺伏特加',
    category: 'base',
    brand: 'Smirnoff',
    spec: '750ml',
    totalStock: 8,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_002'),
    warningCount: 0
  },
  {
    id: 'l_003',
    name: '尊尼获加黑牌威士忌',
    category: 'base',
    brand: 'Johnnie Walker',
    spec: '700ml',
    totalStock: 10,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_003'),
    warningCount: 0
  },
  {
    id: 'l_004',
    name: '必得利红石榴糖浆',
    category: 'syrup',
    brand: 'Bardinet',
    spec: '500ml',
    totalStock: 35,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_004'),
    warningCount: 1
  },
  {
    id: 'l_005',
    name: '莫林香草糖浆',
    category: 'syrup',
    brand: 'Monin',
    spec: '700ml',
    totalStock: 8,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_005'),
    warningCount: 1
  },
  {
    id: 'l_006',
    name: '君度力娇酒',
    category: 'liqueur',
    brand: 'Cointreau',
    spec: '700ml',
    totalStock: 6,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_006'),
    warningCount: 0
  },
  {
    id: 'l_007',
    name: '柠檬汁',
    category: 'juice',
    brand: '鲜榨',
    spec: '1L',
    totalStock: 30,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_007'),
    warningCount: 1
  },
  {
    id: 'l_008',
    name: '孟买蓝宝石金酒',
    category: 'base',
    brand: "Bombay Sapphire",
    spec: '750ml',
    totalStock: 5,
    unit: '瓶',
    batches: mockBatches.filter(b => b.liquorId === 'l_008'),
    warningCount: 1
  }
];

export const mockOutboundRecords: OutboundRecord[] = [
  {
    id: 'o_001',
    batchId: 'b_002',
    liquorId: 'l_001',
    liquorName: '百加得白朗姆酒',
    batchNo: 'BAC-2024-0120',
    quantity: 2,
    unit: '瓶',
    operator: '管理员',
    outboundDate: addDays(todayDate, -2),
    purpose: '基础调酒课程使用',
    courseId: 'c_008',
    isFifo: true
  },
  {
    id: 'o_002',
    batchId: 'b_009',
    liquorId: 'l_007',
    liquorName: '柠檬汁',
    batchNo: 'LEM-2024-0615',
    quantity: 5,
    unit: '瓶',
    operator: '管理员',
    outboundDate: addDays(todayDate, -1),
    purpose: '经典鸡尾酒课程',
    isFifo: true
  },
  {
    id: 'o_003',
    batchId: 'b_006',
    liquorId: 'l_004',
    liquorName: '必得利红石榴糖浆',
    batchNo: 'BDL-2024-0520',
    quantity: 3,
    unit: '瓶',
    operator: '管理员',
    outboundDate: todayDate,
    purpose: '糖浆使用教学',
    isFifo: true
  },
  {
    id: 'o_004',
    batchId: 'b_003',
    liquorId: 'l_002',
    liquorName: '斯米诺伏特加',
    batchNo: 'SMI-2023-1105',
    quantity: 1,
    unit: '瓶',
    operator: '李老师',
    outboundDate: todayDate,
    purpose: '进阶课程演示',
    isFifo: true
  }
];

export const mockExamRecords: ExamRecord[] = [
  {
    id: 'e_001',
    studentName: '李明',
    courseName: '基础调酒考核',
    examType: '初级实操',
    score: 85,
    createdAt: addDays(todayDate, -7),
    status: 'passed',
    reviewer: '张老师',
    comments: '动作规范，调制比例准确'
  },
  {
    id: 'e_002',
    studentName: '陈红',
    courseName: '经典鸡尾酒考核',
    examType: '中级实操',
    score: 78,
    createdAt: addDays(todayDate, -3),
    status: 'passed',
    reviewer: '李老师',
    comments: '整体不错，注意摇荡力度'
  },
  {
    id: 'e_003',
    studentName: '郑涛',
    courseName: '花式调酒考核',
    examType: '高级实操',
    createdAt: addDays(todayDate, -1),
    status: 'reviewing'
  },
  {
    id: 'e_004',
    studentName: '王芳',
    courseName: '基础调酒考核',
    examType: '初级实操',
    createdAt: todayDate,
    status: 'pending'
  }
];
