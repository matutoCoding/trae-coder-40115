import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { CycleRule, Course } from '@/types';
import { Tag, getCourseTypeText } from '@/components/Card/Tags';
import { getWeekdayName, formatDate } from '@/utils/date';
import { generateId } from '@/utils/storage';

const CyclePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [rules, setRules] = useState<CycleRule[]>(state.cycleRules);

  React.useEffect(() => {
    setRules(state.cycleRules);
  }, [state.cycleRules]);

  const activeRules = rules.filter(r => r.status === 'active');
  const totalGenerated = rules.reduce((sum, r) => sum + r.totalGenerated, 0);

  const handleAddRule = () => {
    Taro.navigateTo({ url: '/pages/rule-detail/index' });
  };

  const handleEditRule = (id: string) => {
    Taro.navigateTo({ url: `/pages/rule-detail/index?id=${id}` });
  };

  const hasConflict = (date: string, stationId: string, startTime: string, endTime: string, excludeId?: string): Course | null => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    return state.courses.find(c => {
      if (excludeId && c.ruleId === excludeId) return false;
      if (c.id === excludeId) return false;
      if (c.stationId !== stationId) return false;
      if (c.date !== date) return false;
      if (c.status === 'cancelled') return false;
      const [cH1, cM1] = c.startTime.split(':').map(Number);
      const [cH2, cM2] = c.endTime.split(':').map(Number);
      const cStart = cH1 * 60 + cM1;
      const cEnd = cH2 * 60 + cM2;
      return startMin < cEnd && endMin > cStart;
    }) || null;
  };

  const handleGenerate = (rule: CycleRule) => {
    if (rule.status !== 'active') {
      Taro.showToast({ title: '请先启用该规则', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '计算中...' });

    setTimeout(() => {
      const startDate = new Date(rule.startDate);
      const endDate = new Date(rule.endDate);
      const generated: Course[] = [];
      const conflicts: string[] = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const weekday = d.getDay();
        if (!rule.weekdays.includes(weekday)) continue;

        const dateStr = formatDate(d.toISOString());
        const conflict = hasConflict(dateStr, rule.stationId, rule.startTime, rule.endTime);

        if (conflict) {
          conflicts.push(`${dateStr}(${getWeekdayName(weekday)}) - 与「${conflict.title}」冲突`);
          continue;
        }

        generated.push({
          id: generateId(),
          title: rule.courseTitle,
          type: rule.courseType,
          instructor: rule.instructor,
          date: dateStr,
          startTime: rule.startTime,
          endTime: rule.endTime,
          stationId: rule.stationId,
          stationName: rule.stationName,
          students: [],
          presentStudents: [],
          absentStudents: [],
          maxStudents: rule.maxStudents,
          status: 'scheduled',
          isGenerated: true,
          ruleId: rule.id,
          materials: []
        });
      }

      Taro.hideLoading();

      if (generated.length === 0 && conflicts.length > 0) {
        Taro.showModal({
          title: '全部时间冲突',
          content: `所选时间段内 ${conflicts.length} 个上课日均存在操作台占用冲突，无法生成课程。建议调整时间或更换操作台。`,
          showCancel: false,
          confirmColor: '#8B4513'
        });
        return;
      }

      const conflictMsg = conflicts.length > 0
        ? `\n\n⚠️ 有 ${conflicts.length} 个日期因操作台冲突已跳过：\n${conflicts.slice(0, 3).join('\n')}${conflicts.length > 3 ? `\n...等共${conflicts.length}个` : ''}`
        : '';

      Taro.showModal({
        title: '确认生成',
        content: `规则「${rule.name}」\n将生成 ${generated.length} 节课程${conflictMsg}\n\n是否继续？`,
        confirmText: '生成课程',
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm) {
            if (generated.length > 0) {
              dispatch({ type: 'BATCH_ADD_COURSES', payload: generated });
              dispatch({
                type: 'UPDATE_RULE',
                payload: { ...rule, totalGenerated: rule.totalGenerated + generated.length }
              });
            }
            Taro.showToast({
              title: `成功生成 ${generated.length} 节`,
              icon: 'success'
            });
          }
        }
      });
    }, 300);
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  return (
    <ScrollView className={styles.container} scrollY onRefresh={handleRefresh} refresherEnabled>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>周期生成</View>
          <View className={styles.subtitle}>批量生成未来课程排期</View>
        </View>
        <Button className={styles.addBtn} onClick={handleAddRule}>+ 新建规则</Button>
      </View>

      <View className={styles.statsBanner}>
        <View className={styles.statsTitle}>生成概览</View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{rules.length}</View>
            <View className={styles.statLabel}>周期规则</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{activeRules.length}</View>
            <View className={styles.statLabel}>运行中</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{totalGenerated}</View>
            <View className={styles.statLabel}>已生成课程</View>
          </View>
        </View>
      </View>

      {rules.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📋</View>
          <View className={styles.emptyText}>暂无周期规则</View>
        </View>
      ) : (
        rules.map(rule => (
          <View key={rule.id} className={styles.card} onClick={() => handleEditRule(rule.id)}>
            <View className={styles.cardHeader}>
              <View className={styles.titleSection}>
                <View className={styles.ruleTitle}>{rule.name}</View>
                <View className={styles.courseTitle}>{rule.courseTitle}</View>
              </View>
              <View className={styles.tagRow}>
                <Tag text={getCourseTypeText(rule.courseType)} type={rule.courseType} />
                <Tag text={rule.status === 'active' ? '运行中' : '已停用'} type={rule.status} />
              </View>
            </View>

            <View className={styles.weekdayRow}>
              {rule.weekdays.map(wd => (
                <View key={wd} className={styles.weekdayChip}>{getWeekdayName(wd)}</View>
              ))}
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>上课时间</View>
                <View className={styles.infoValue}>{rule.startTime} - {rule.endTime}</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>授课老师</View>
                <View className={styles.infoValue}>{rule.instructor}</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>操作台</View>
                <View className={styles.infoValue}>{rule.stationName}</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>人数上限</View>
                <View className={styles.infoValue}>{rule.maxStudents} 人</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>生效日期</View>
                <View className={styles.infoValue}>{rule.startDate}</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>截止日期</View>
                <View className={styles.infoValue}>{rule.endDate}</View>
              </View>
            </View>

            <View className={styles.footer}>
              <View className={styles.generatedCount}>已生成 {rule.totalGenerated} 节课程</View>
              <Button
                className={`${styles.generateBtn} ${rule.status !== 'active' ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate(rule);
                }}
              >
                批量生成
              </Button>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default CyclePage;
