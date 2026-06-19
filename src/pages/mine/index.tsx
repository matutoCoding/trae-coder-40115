import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockBatches, mockExamRecords } from '@/data/mockInventory';
import { mockCycleRules, mockStations } from '@/data/mockCourse';

const MinePage: React.FC = () => {
  const warningCount = mockBatches.filter(b => b.status !== 'normal').length;
  const pendingExams = mockExamRecords.filter(e => e.status === 'pending' || e.status === 'reviewing').length;
  const activeRules = mockCycleRules.filter(r => r.status === 'active').length;

  const menuItems = [
    {
      group: '吧台管理',
      items: [
        {
          icon: '🪑',
          label: '操作台建档',
          badge: '',
          badgeType: '',
          path: '/pages/station/index'
        },
        {
          icon: '📋',
          label: '周期规则管理',
          badge: `${activeRules} 个运行中`,
          badgeType: 'new',
          path: '/pages/cycle/index'
        }
      ]
    },
    {
      group: '考核管理',
      items: [
        {
          icon: '🎬',
          label: '花式考核录像',
          badge: pendingExams > 0 ? `${pendingExams} 待评审` : '',
          badgeType: 'warning',
          path: '/pages/exam-record/index'
        }
      ]
    },
    {
      group: '库存预警',
      items: [
        {
          icon: '⚠️',
          label: '效期预警列表',
          badge: warningCount > 0 ? `${warningCount} 个批次` : '',
          badgeType: 'warning',
          path: '/pages/inventory/index'
        },
        {
          icon: '🔒',
          label: '过期锁定管理',
          badge: mockBatches.filter(b => b.status === 'locked' || b.status === 'expired').length > 0
            ? `${mockBatches.filter(b => b.status === 'locked' || b.status === 'expired').length} 批锁定`
            : '',
          badgeType: '',
          path: '/pages/inventory/index'
        }
      ]
    },
    {
      group: '系统',
      items: [
        {
          icon: '📊',
          label: '数据统计',
          badge: '',
          badgeType: '',
          path: ''
        },
        {
          icon: '⚙️',
          label: '设置',
          badge: '',
          badgeType: '',
          path: ''
        },
        {
          icon: '❓',
          label: '帮助与反馈',
          badge: '',
          badgeType: '',
          path: ''
        }
      ]
    }
  ];

  const handleMenuClick = (item: { path: string; label: string }) => {
    if (item.path) {
      Taro.switchTab({
        url: item.path,
        fail: () => {
          Taro.navigateTo({
            url: item.path,
            fail: () => {
              Taro.showToast({ title: `${item.label}功能开发中`, icon: 'none' });
            }
          });
        }
      });
    } else {
      Taro.showToast({ title: `${item.label}功能开发中`, icon: 'none' });
    }
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'warning': return styles.badgeWarning;
      case 'new': return styles.badgeNew;
      default: return '';
    }
  };

  return (
    <ScrollView className={styles.container} scrollY onRefresh={handleRefresh} refresherEnabled>
      <View className={styles.headerSection}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>👨‍🏫</View>
          <View className={styles.userText}>
            <View className={styles.userName}>调酒培训管理员</View>
            <View className={styles.userRole}>高级调酒师 / 系统管理员</View>
          </View>
        </View>
        <View className={styles.statsBar}>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{mockStations.filter(s => s.status === 'active').length}</View>
            <View className={styles.statLabel}>操作台</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{activeRules}</View>
            <View className={styles.statLabel}>周期规则</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{warningCount}</View>
            <View className={styles.statLabel}>效期预警</View>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        {menuItems.map(group => (
          <View key={group.group}>
            <View className={styles.menuTitle}>{group.group}</View>
            <View className={styles.menuCard}>
              {group.items.map(item => (
                <View key={item.label} className={styles.menuItem} onClick={() => handleMenuClick(item)}>
                  <View className={styles.menuIcon}>{item.icon}</View>
                  <View className={styles.menuText}>{item.label}</View>
                  {item.badge && (
                    <View className={`${styles.menuBadge} ${getBadgeClass(item.badgeType)}`}>
                      {item.badge}
                    </View>
                  )}
                  <View className={styles.menuArrow}>›</View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;
