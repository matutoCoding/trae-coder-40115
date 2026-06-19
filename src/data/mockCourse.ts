import { Course, CycleRule, Station, CourseMaterial } from '@/types';
import { addDays, today } from '@/utils/date';

export const mockStations: Station[] = [
  {
    id: 'st_001',
    name: '一号操作台',
    code: 'BAR-01',
    location: '主楼一层A区',
    capacity: 4,
    status: 'active',
    tools: ['雪克壶', '量酒器', '吧勺', '冰桶'],
    createdAt: '2024-01-15'
  },
  {
    id: 'st_002',
    name: '二号操作台',
    code: 'BAR-02',
    location: '主楼一层A区',
    capacity: 4,
    status: 'active',
    tools: ['雪克壶', '量酒器', '吧勺', '冰桶', '滤冰器'],
    createdAt: '2024-01-15'
  },
  {
    id: 'st_003',
    name: '三号操作台',
    code: 'BAR-03',
    location: '主楼一层B区',
    capacity: 6,
    status: 'active',
    tools: ['雪克壶×2', '量酒器×2', '吧勺', '冰桶', '搅棒'],
    createdAt: '2024-02-20'
  },
  {
    id: 'st_004',
    name: '考核专用台',
    code: 'EXAM-01',
    location: '主楼二层考核区',
    capacity: 2,
    status: 'active',
    tools: ['专业雪克壶', '精准量酒器', '标准吧勺', '摄像设备'],
    createdAt: '2024-03-01'
  },
  {
    id: 'st_005',
    name: '五号操作台',
    code: 'BAR-05',
    location: '主楼一层B区',
    capacity: 4,
    status: 'maintenance',
    tools: ['雪克壶', '量酒器', '吧勺'],
    createdAt: '2024-01-20'
  }
];

const todayDate = today();

export const mockCourses: Course[] = [
  {
    id: 'c_001',
    title: '基础调酒入门',
    type: 'basic',
    instructor: '张老师',
    date: todayDate,
    startTime: '09:00',
    endTime: '11:00',
    stationId: 'st_001',
    stationName: '一号操作台',
    students: ['李明', '王芳', '赵强'],
    presentStudents: ['李明', '王芳'],
    absentStudents: [],
    maxStudents: 4,
    status: 'scheduled',
    isGenerated: true,
    ruleId: 'r_001',
    materials: [
      { liquorId: 'l_001', liquorName: '百加得白朗姆酒', unit: '瓶', estimatedQty: 2 },
      { liquorId: 'l_004', liquorName: '必得利红石榴糖浆', unit: '瓶', estimatedQty: 1 }
    ]
  },
  {
    id: 'c_002',
    title: '经典鸡尾酒调制',
    type: 'intermediate',
    instructor: '李老师',
    date: todayDate,
    startTime: '14:00',
    endTime: '16:30',
    stationId: 'st_002',
    stationName: '二号操作台',
    students: ['陈红', '刘洋', '周杰', '吴敏'],
    presentStudents: ['陈红', '刘洋', '周杰'],
    absentStudents: ['吴敏'],
    maxStudents: 4,
    status: 'ongoing',
    isGenerated: true,
    ruleId: 'r_002',
    materials: [
      { liquorId: 'l_003', liquorName: '尊尼获加黑牌威士忌', unit: '瓶', estimatedQty: 2 },
      { liquorId: 'l_007', liquorName: '柠檬汁', unit: '瓶', estimatedQty: 3 }
    ]
  },
  {
    id: 'c_003',
    title: '花式调酒进阶',
    type: 'advanced',
    instructor: '王老师',
    date: addDays(todayDate, 1),
    startTime: '10:00',
    endTime: '12:00',
    stationId: 'st_003',
    stationName: '三号操作台',
    students: ['孙丽', '钱伟'],
    presentStudents: [],
    absentStudents: [],
    maxStudents: 6,
    status: 'scheduled',
    isGenerated: true,
    ruleId: 'r_003',
    materials: [
      { liquorId: 'l_002', liquorName: '斯米诺伏特加', unit: '瓶', estimatedQty: 1 },
      { liquorId: 'l_005', liquorName: '莫林香草糖浆', unit: '瓶', estimatedQty: 1 },
      { liquorId: 'l_006', liquorName: '君度力娇酒', unit: '瓶', estimatedQty: 1 }
    ]
  },
  {
    id: 'c_004',
    title: '实操考核',
    type: 'exam',
    instructor: '张老师',
    date: addDays(todayDate, 2),
    startTime: '09:00',
    endTime: '12:00',
    stationId: 'st_004',
    stationName: '考核专用台',
    students: ['郑涛'],
    presentStudents: [],
    absentStudents: [],
    maxStudents: 2,
    status: 'scheduled',
    isGenerated: false,
    materials: []
  },
  {
    id: 'c_005',
    title: '基础调酒入门',
    type: 'basic',
    instructor: '张老师',
    date: addDays(todayDate, 2),
    startTime: '14:00',
    endTime: '16:00',
    stationId: 'st_001',
    stationName: '一号操作台',
    students: ['黄丽', '徐明'],
    presentStudents: [],
    absentStudents: [],
    maxStudents: 4,
    status: 'scheduled',
    isGenerated: true,
    ruleId: 'r_001',
    materials: [
      { liquorId: 'l_001', liquorName: '百加得白朗姆酒', unit: '瓶', estimatedQty: 2 }
    ]
  },
  {
    id: 'c_006',
    title: '糖浆与配料使用',
    type: 'basic',
    instructor: '李老师',
    date: addDays(todayDate, 3),
    startTime: '09:00',
    endTime: '11:00',
    stationId: 'st_002',
    stationName: '二号操作台',
    students: ['朱峰', '秦雪', '何斌', '罗燕'],
    presentStudents: [],
    absentStudents: [],
    maxStudents: 4,
    status: 'scheduled',
    isGenerated: true,
    ruleId: 'r_004',
    materials: [
      { liquorId: 'l_004', liquorName: '必得利红石榴糖浆', unit: '瓶', estimatedQty: 2 },
      { liquorId: 'l_005', liquorName: '莫林香草糖浆', unit: '瓶', estimatedQty: 2 }
    ]
  },
  {
    id: 'c_007',
    title: '经典鸡尾酒调制',
    type: 'intermediate',
    instructor: '李老师',
    date: addDays(todayDate, 4),
    startTime: '14:00',
    endTime: '16:30',
    stationId: 'st_002',
    stationName: '二号操作台',
    students: ['陈红', '刘洋', '周杰'],
    presentStudents: [],
    absentStudents: [],
    maxStudents: 4,
    status: 'scheduled',
    isGenerated: true,
    ruleId: 'r_002',
    materials: [
      { liquorId: 'l_003', liquorName: '尊尼获加黑牌威士忌', unit: '瓶', estimatedQty: 2 }
    ]
  },
  {
    id: 'c_008',
    title: '基础调酒入门',
    type: 'basic',
    instructor: '张老师',
    date: addDays(todayDate, -1),
    startTime: '09:00',
    endTime: '11:00',
    stationId: 'st_001',
    stationName: '一号操作台',
    students: ['李明', '王芳'],
    presentStudents: ['李明', '王芳'],
    absentStudents: [],
    maxStudents: 4,
    status: 'completed',
    isGenerated: true,
    ruleId: 'r_001',
    completedAt: addDays(todayDate, -1),
    materials: [
      { liquorId: 'l_001', liquorName: '百加得白朗姆酒', unit: '瓶', estimatedQty: 2, actualQty: 2 }
    ]
  }
];

export const mockCycleRules: CycleRule[] = [
  {
    id: 'r_001',
    name: '周一四下午基础班',
    courseTitle: '基础调酒入门',
    courseType: 'basic',
    instructor: '张老师',
    stationId: 'st_001',
    stationName: '一号操作台',
    weekdays: [1, 4],
    startTime: '09:00',
    endTime: '11:00',
    maxStudents: 4,
    startDate: todayDate,
    endDate: addDays(todayDate, 60),
    status: 'active',
    createdAt: '2024-05-01',
    totalGenerated: 12
  },
  {
    id: 'r_002',
    name: '周二五下午进阶班',
    courseTitle: '经典鸡尾酒调制',
    courseType: 'intermediate',
    instructor: '李老师',
    stationId: 'st_002',
    stationName: '二号操作台',
    weekdays: [2, 5],
    startTime: '14:00',
    endTime: '16:30',
    maxStudents: 4,
    startDate: todayDate,
    endDate: addDays(todayDate, 45),
    status: 'active',
    createdAt: '2024-05-10',
    totalGenerated: 8
  },
  {
    id: 'r_003',
    name: '周三上午高级班',
    courseTitle: '花式调酒进阶',
    courseType: 'advanced',
    instructor: '王老师',
    stationId: 'st_003',
    stationName: '三号操作台',
    weekdays: [3],
    startTime: '10:00',
    endTime: '12:00',
    maxStudents: 6,
    startDate: todayDate,
    endDate: addDays(todayDate, 30),
    status: 'active',
    createdAt: '2024-06-01',
    totalGenerated: 4
  },
  {
    id: 'r_004',
    name: '周四上午配料课',
    courseTitle: '糖浆与配料使用',
    courseType: 'basic',
    instructor: '李老师',
    stationId: 'st_002',
    stationName: '二号操作台',
    weekdays: [4],
    startTime: '09:00',
    endTime: '11:00',
    maxStudents: 4,
    startDate: todayDate,
    endDate: addDays(todayDate, 20),
    status: 'inactive',
    createdAt: '2024-06-10',
    totalGenerated: 2
  }
];
