import React from 'react';
import { View } from '@tarojs/components';
import styles from './Tags.module.scss';
import { Course, Batch, LiquorCategory, Station, ExamRecord } from '@/types';

interface TagProps {
  text: string;
  type: string;
}

export const Tag: React.FC<TagProps> = ({ text, type }) => {
  const tagClassMap: Record<string, string> = {
    basic: styles.tagBasic,
    intermediate: styles.tagIntermediate,
    advanced: styles.tagAdvanced,
    exam: styles.tagExam,
    normal: styles.tagNormal,
    expiring: styles.tagExpiring,
    expired: styles.tagExpired,
    locked: styles.tagLocked,
    base: styles.tagBase,
    syrup: styles.tagSyrup,
    liqueur: styles.tagLiqueur,
    juice: styles.tagJuice,
    other: styles.tagOther,
    scheduled: styles.tagScheduled,
    ongoing: styles.tagOngoing,
    completed: styles.tagCompleted,
    cancelled: styles.tagCancelled,
    active: styles.tagActive,
    inactive: styles.tagInactive,
    maintenance: styles.tagMaintenance,
    pending: styles.tagPending,
    reviewing: styles.tagReviewing,
    passed: styles.tagPassed,
    failed: styles.tagFailed
  };

  return (
    <View className={`${styles.tag} ${tagClassMap[type] || styles.tagOther}`}>
      {text}
    </View>
  );
};

export const getCourseTypeText = (type: Course['type']): string => {
  const map: Record<Course['type'], string> = {
    basic: '基础',
    intermediate: '进阶',
    advanced: '高级',
    exam: '考核'
  };
  return map[type];
};

export const getCourseStatusText = (status: Course['status']): string => {
  const map: Record<Course['status'], string> = {
    scheduled: '待开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status];
};

export const getBatchStatusText = (status: Batch['status']): string => {
  const map: Record<Batch['status'], string> = {
    normal: '正常',
    expiring: '临期',
    expired: '已过期',
    locked: '已锁定'
  };
  return map[status];
};

export const getCategoryText = (category: LiquorCategory): string => {
  const map: Record<LiquorCategory, string> = {
    base: '基酒',
    syrup: '糖浆',
    liqueur: '力娇酒',
    juice: '果汁',
    other: '其他'
  };
  return map[category];
};

export const getStationStatusText = (status: Station['status']): string => {
  const map: Record<Station['status'], string> = {
    active: '使用中',
    maintenance: '维护中',
    inactive: '停用'
  };
  return map[status];
};

export const getExamStatusText = (status: ExamRecord['status']): string => {
  const map: Record<ExamRecord['status'], string> = {
    pending: '待评审',
    reviewing: '评审中',
    passed: '已通过',
    failed: '未通过'
  };
  return map[status];
};

export default Tag;
