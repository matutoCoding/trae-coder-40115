import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockCycleRules } from '@/data/mockCourse';
import { CycleRule } from '@/types';
import { Tag, getCourseTypeText } from '@/components/Card/Tags';
import { getWeekdayName } from '@/utils/date';

const CyclePage: React.FC = () => {
  const [rules, setRules] = useState<CycleRule[]>(mockCycleRules);

  const activeRules = rules.filter(r => r.status === 'active');
  const totalGenerated = rules.reduce((sum, r) => sum + r.totalGenerated, 0);

  const handleAddRule = () => {
    Taro.navigateTo({ url: '/pages/rule-detail/index' });
  };

  const handleEditRule = (id: string) => {
    Taro.navigateTo({ url: `/pages/rule-detail/index?id=${id}` });
  };

  const handleGenerate = (rule: CycleRule) => {
    if (rule.status !== 'active') {
      Taro.showToast({ title: '请先启用该规则', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认生成',
      content: `将按规则「${rule.name}」批量生成课程排期，是否继续？`,
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          const newCount = rule.weekdays.length * 4;
          Taro.showLoading({ title: '生成中...' });
          setTimeout(() => {
            setRules(prev => prev.map(r =>
              r.id === rule.id
                ? { ...r, totalGenerated: r.totalGenerated + newCount }
                : r
            ));
            Taro.hideLoading();
            Taro.showToast({ title: `成功生成 ${newCount} 节课程`, icon: 'success' });
          }, 1000);
        }
      }
    });
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
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
