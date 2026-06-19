import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Course, CycleRule, Liquor, Batch, OutboundRecord, ExamRecord, Station, StockCheckRecord, CourseMaterial } from '@/types';
import { getStorage, setStorage, generateId } from '@/utils/storage';
import { mockCourses, mockCycleRules, mockStations } from '@/data/mockCourse';
import { mockLiquors, mockBatches, mockOutboundRecords, mockExamRecords, mockStockCheckRecords } from '@/data/mockInventory';
import { getDaysDiff, today } from '@/utils/date';

export interface AppState {
  courses: Course[];
  cycleRules: CycleRule[];
  stations: Station[];
  liquors: Liquor[];
  batches: Batch[];
  outboundRecords: OutboundRecord[];
  examRecords: ExamRecord[];
  stockCheckRecords: StockCheckRecord[];
}

type ActionType =
  | { type: 'INIT'; payload: AppState }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'BATCH_ADD_COURSES'; payload: Course[] }
  | { type: 'SIGNIN_STUDENT'; payload: { courseId: string; studentName: string; isPresent: boolean } }
  | { type: 'COMPLETE_COURSE'; payload: { courseId: string; materials: CourseMaterial[] } }
  | { type: 'ADD_RULE'; payload: CycleRule }
  | { type: 'UPDATE_RULE'; payload: CycleRule }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'UPDATE_BATCH'; payload: Batch }
  | { type: 'UPDATE_LIQUOR'; payload: Liquor }
  | { type: 'ADD_OUTBOUND'; payload: OutboundRecord }
  | { type: 'ADD_STOCK_CHECK'; payload: StockCheckRecord }
  | { type: 'ADD_EXAM'; payload: ExamRecord }
  | { type: 'UPDATE_EXAM'; payload: ExamRecord };

const STORAGE_KEY = 'app_state_v1';

const initialState: AppState = {
  courses: mockCourses,
  cycleRules: mockCycleRules,
  stations: mockStations,
  liquors: mockLiquors,
  batches: mockBatches,
  outboundRecords: mockOutboundRecords,
  examRecords: mockExamRecords,
  stockCheckRecords: mockStockCheckRecords
};

const updateBatchStatus = (batch: Batch): Batch => {
  if (batch.status === 'locked') return batch;
  const days = getDaysDiff(today(), batch.expiryDate);
  if (days < 0) return { ...batch, status: 'expired' };
  if (days <= 15) return { ...batch, status: 'expiring' };
  return { ...batch, status: 'normal' };
};

const recalculateLiquor = (liquor: Liquor, allBatches: Batch[]): Liquor => {
  const relatedBatches = allBatches.filter(b => b.liquorId === liquor.id).map(updateBatchStatus);
  const totalStock = relatedBatches.reduce((sum, b) => sum + b.quantity, 0);
  const warningCount = relatedBatches.filter(b => b.status === 'expiring' || b.status === 'expired' || b.status === 'locked').length;
  return {
    ...liquor,
    batches: relatedBatches,
    totalStock,
    warningCount
  };
};

const fifoDeduct = (
  liquorId: string,
  qty: number,
  batches: Batch[],
  outboundRecords: OutboundRecord[],
  operator: string,
  purpose: string,
  courseId?: string
): { newBatches: Batch[]; newRecords: OutboundRecord[]; insufficient: boolean } => {
  let remaining = qty;
  let newBatches = [...batches];
  const newRecords: OutboundRecord[] = [...outboundRecords];

  const sorted = newBatches
    .filter(b =>
      b.liquorId === liquorId
      && (b.status === 'normal' || b.status === 'expiring')
      && b.quantity > 0
    )
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const totalAvailable = sorted.reduce((sum, b) => sum + b.quantity, 0);
  if (totalAvailable < qty) {
    return { newBatches, newRecords, insufficient: true };
  }

  for (const batch of sorted) {
    if (remaining <= 0) break;
    const deductQty = Math.min(remaining, batch.quantity);
    newBatches = newBatches.map(b =>
      b.id === batch.id
        ? updateBatchStatus({ ...b, quantity: b.quantity - deductQty })
        : b
    );
    newRecords.unshift({
      id: generateId(),
      batchId: batch.id,
      liquorId: batch.liquorId,
      liquorName: batch.liquorName,
      batchNo: batch.batchNo,
      quantity: deductQty,
      unit: batch.unit,
      operator,
      outboundDate: today(),
      purpose,
      courseId,
      isFifo: true
    });
    remaining -= deductQty;
  }

  return { newBatches, newRecords, insufficient: false };
};

function reducer(state: AppState, action: ActionType): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'INIT':
      newState = action.payload;
      break;

    case 'ADD_COURSE':
      newState = { ...state, courses: [...state.courses, action.payload] };
      break;

    case 'UPDATE_COURSE':
      newState = {
        ...state,
        courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c)
      };
      break;

    case 'DELETE_COURSE':
      newState = {
        ...state,
        courses: state.courses.filter(c => c.id !== action.payload)
      };
      break;

    case 'BATCH_ADD_COURSES':
      newState = { ...state, courses: [...state.courses, ...action.payload] };
      break;

    case 'SIGNIN_STUDENT': {
      const { courseId, studentName, isPresent } = action.payload;
      newState = {
        ...state,
        courses: state.courses.map(c => {
          if (c.id !== courseId) return c;
          const inPresent = c.presentStudents.includes(studentName);
          const inAbsent = c.absentStudents.includes(studentName);
          let newPresent = inPresent ? c.presentStudents.filter(s => s !== studentName) : c.presentStudents;
          let newAbsent = inAbsent ? c.absentStudents.filter(s => s !== studentName) : c.absentStudents;
          if (isPresent) {
            if (!inPresent) newPresent = [...newPresent, studentName];
          } else {
            if (!inAbsent) newAbsent = [...newAbsent, studentName];
          }
          return { ...c, presentStudents: newPresent, absentStudents: newAbsent };
        })
      };
      break;
    }

    case 'COMPLETE_COURSE': {
      const { courseId, materials } = action.payload;
      let workingBatches = state.batches;
      let workingRecords = state.outboundRecords;
      const operator = '当前管理员';

      for (const m of materials) {
        const actualQty = (m.actualQty ?? m.estimatedQty);
        if (actualQty <= 0) continue;
        const res = fifoDeduct(
          m.liquorId,
          actualQty,
          workingBatches,
          workingRecords,
          operator,
          `课程消耗:${m.liquorName}`,
          courseId
        );
        if (!res.insufficient) {
          workingBatches = res.newBatches;
          workingRecords = res.newRecords;
        }
      }

      const newLiquors = state.liquors.map(l => recalculateLiquor(l, workingBatches));
      const newCourses = state.courses.map(c =>
        c.id === courseId
          ? {
              ...c,
              status: 'completed' as const,
              completedAt: today(),
              materials: materials.map(m => ({
                ...m,
                actualQty: m.actualQty ?? m.estimatedQty
              }))
            }
          : c
      );

      newState = {
        ...state,
        batches: workingBatches,
        liquors: newLiquors,
        outboundRecords: workingRecords,
        courses: newCourses
      };
      break;
    }

    case 'ADD_RULE':
      newState = { ...state, cycleRules: [...state.cycleRules, action.payload] };
      break;

    case 'UPDATE_RULE':
      newState = {
        ...state,
        cycleRules: state.cycleRules.map(r => r.id === action.payload.id ? action.payload : r)
      };
      break;

    case 'DELETE_RULE':
      newState = {
        ...state,
        cycleRules: state.cycleRules.filter(r => r.id !== action.payload)
      };
      break;

    case 'ADD_BATCH': {
      const newBatches = [...state.batches, action.payload].map(updateBatchStatus);
      const liquorExists = state.liquors.find(l => l.id === action.payload.liquorId);
      let newLiquors = state.liquors;
      if (liquorExists) {
        newLiquors = state.liquors.map(l => recalculateLiquor(l, newBatches));
      }
      newState = { ...state, batches: newBatches, liquors: newLiquors };
      break;
    }

    case 'UPDATE_BATCH': {
      const newBatches = state.batches.map(b =>
        b.id === action.payload.id ? updateBatchStatus(action.payload) : b
      );
      const newLiquors = state.liquors.map(l => recalculateLiquor(l, newBatches));
      newState = { ...state, batches: newBatches, liquors: newLiquors };
      break;
    }

    case 'UPDATE_LIQUOR':
      newState = {
        ...state,
        liquors: state.liquors.map(l => l.id === action.payload.id ? action.payload : l)
      };
      break;

    case 'ADD_OUTBOUND': {
      const relatedBatch = state.batches.find(b => b.id === action.payload.batchId);
      let newBatches = state.batches;
      if (relatedBatch) {
        const newQty = Math.max(0, relatedBatch.quantity - action.payload.quantity);
        newBatches = state.batches.map(b =>
          b.id === action.payload.batchId ? updateBatchStatus({ ...b, quantity: newQty }) : b
        );
      }
      const newLiquors = state.liquors.map(l => recalculateLiquor(l, newBatches));
      newState = {
        ...state,
        batches: newBatches,
        liquors: newLiquors,
        outboundRecords: [action.payload, ...state.outboundRecords]
      };
      break;
    }

    case 'ADD_STOCK_CHECK': {
      newState = {
        ...state,
        stockCheckRecords: [action.payload, ...state.stockCheckRecords]
      };
      break;
    }

    case 'ADD_EXAM':
      newState = { ...state, examRecords: [...state.examRecords, action.payload] };
      break;

    case 'UPDATE_EXAM':
      newState = {
        ...state,
        examRecords: state.examRecords.map(e => e.id === action.payload.id ? action.payload : e)
      };
      break;

    default:
      newState = state;
  }

  try {
    setStorage(STORAGE_KEY, newState);
  } catch (e) {
    console.error('[Store] persist error:', e);
  }

  return newState;
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
  generateId: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = getStorage<AppState | null>(STORAGE_KEY, null);
      if (saved) {
        const refreshedBatches = saved.batches.map(updateBatchStatus);
        const refreshedLiquors = saved.liquors.map(l => recalculateLiquor(l, refreshedBatches));
        const savedStockChecks = saved.stockCheckRecords ?? [];
        dispatch({
          type: 'INIT',
          payload: {
            ...saved,
            batches: refreshedBatches,
            liquors: refreshedLiquors,
            stockCheckRecords: savedStockChecks
          }
        });
        console.log('[Store] Loaded persisted state');
      }
    } catch (e) {
      console.error('[Store] load error:', e);
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, generateId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
