import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { removeStorage } from '@/utils/storage';

const MinePage: React.FC = () => {
  const { state } = useApp();

  const courseCount = state.courses.filter(c => c.status !== 'cancelled').length;
  const ruleCount = state.cycleRules.length;
  const liquorCount = state.liquors.length;
  const batchCount = state.batches.filter(b => b.status !== 'locked' && b.status !== 'expired').length;
  const outboundCount = state.outboundRecords.length;
  const examCount = state.examRecords.length;

  const handleNav = (path: string, requirePermission: boolean = false) => {
    if (requirePermission) {
      Taro.showToast({ title: '请使用管理员账号登录', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: path });
  };

  const handleClearData = () => {
    Taro.showModal({
      title: '清除本地数据',
      content: '确定要清除所有本地缓存数据吗？此操作不可恢复。',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          try {
            removeStorage('app_state_v1');
            Taro.showToast({ title: '请重启应用', icon: 'success' });
          } catch (e) {
            Taro.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.avatar}>调</View>
        <View>
          <View className={styles.userName}>调酒师管理员</View>
          <View className={styles.userRole}>调酒培训 · 管理员</View>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/schedule/index' })}>
          <View className={styles.statValue}>{courseCount}</View>
          <View className={styles.statLabel}>课程排期</View>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/cycle/index' })}>
          <View className={styles.statValue}>{ruleCount}</View>
          <View className={styles.statLabel}>周期规则</View>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/inventory/index' })}>
          <View className={styles.statValue}>{batchCount}</View>
          <View className={styles.statLabel}>在库批次</View>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/outbound/index' })}>
          <View className={styles.statValue}>{outboundCount}</View>
          <View className={styles.statLabel}>出库记录</View>
        </View>
      </View>

      <View className={styles.sectionTitle}>快捷入口</View>

      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/station/index' })}>
          <View className={styles.menuIcon}>🪑</View>
          <View className={styles.menuText}>操作台建档</View>
          <View className={styles.menuArrow}>›</View>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/exam-record/index' })}>
          <View className={styles.menuIcon}>🎬</View>
          <View className={styles.menuText}>花式考核录像</View>
          <View className={styles.menuBadge}>{examCount > 0 ? examCount : ''}</View>
          <View className={styles.menuArrow}>›</View>
        </View>
      </View>

      <View className={styles.sectionTitle}>系统</View>

      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={() => Taro.showToast({ title: '数据统计开发中', icon: 'none' })}>
          <View className={styles.menuIcon}>📊</View>
          <View className={styles.menuText}>数据统计</View>
          <View className={styles.menuArrow}>›</View>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.showToast({ title: '学员管理开发中', icon: 'none' })}>
          <View className={styles.menuIcon}>👥</View>
          <View className={styles.menuText}>学员档案</View>
          <View className={styles.menuArrow}>›</View>
        </View>
        <View className={styles.menuItem} onClick={() => handleNav('/pages/batch-detail/index?id=' + state.liquors[0]?.id, false)}>
          <View className={styles.menuIcon}>🍾</View>
          <View className={styles.menuText}>基酒批次详情</View>
          <View className={styles.menuArrow}>›</View>
        </View>
      </View>

      <View className={styles.sectionTitle}>其他</View>

      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={() => Taro.showToast({ title: '设置开发中', icon: 'none' })}>
          <View className={styles.menuIcon}>⚙️</View>
          <View className={styles.menuText}>系统设置</View>
          <View className={styles.menuArrow}>›</View>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.showToast({ title: '关于调酒师培训系统 v1.0.0', icon: 'none' })}>
          <View className={styles.menuIcon}>ℹ️</View>
          <View className={styles.menuText}>关于我们</View>
          <View className={styles.menuArrow}>›</View>
        </View>
        <View className={styles.menuItem} onClick={handleClearData}>
          <View className={styles.menuIcon}>🗑️</View>
          <View className={styles.menuText}>清除本地缓存</View>
          <View className={styles.menuArrow}>›</View>
        </View>
      </View>

      <View className={styles.versionInfo}>
        调酒师培训系统 v1.0.0
      </View>
    </ScrollView>
  );
};

export default MinePage;
