import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { getStationStatusText } from '@/components/Card/Tags';
import { Station } from '@/types';

const StationPage: React.FC = () => {
  const { state } = useApp();
  const [stations, setStations] = useState<Station[]>(state.stations);

  React.useEffect(() => {
    setStations(state.stations);
  }, [state.stations]);

  const activeCount = stations.filter(s => s.status === 'active').length;
  const maintenanceCount = stations.filter(s => s.status === 'maintenance').length;
  const totalCapacity = stations.filter(s => s.status === 'active').reduce((sum, s) => sum + s.capacity, 0);

  const handleAddStation = () => {
    Taro.showToast({ title: '新增操作台功能开发中', icon: 'none' });
  };

  const handleEditStation = (station: Station) => {
    Taro.showActionSheet({
      itemList: ['切换为使用中', '切换为维护中', '切换为停用', '删除操作台'],
      success: (res) => {
        if (res.tapIndex < 3) {
          const statusMap: Record<number, Station['status']> = {
            0: 'active',
            1: 'maintenance',
            2: 'inactive'
          };
          Taro.showToast({ title: '状态已更新', icon: 'success' });
        } else if (res.tapIndex === 3) {
          Taro.showModal({
            title: '删除操作台',
            content: `确定删除「${station.name}」吗？`,
            confirmColor: '#F44336'
          });
        }
      }
    });
  };

  const getTagClass = (status: Station['status']) => {
    switch (status) {
      case 'active': return styles.tagActive;
      case 'maintenance': return styles.tagMaintenance;
      case 'inactive': return styles.tagInactive;
      default: return '';
    }
  };

  const getCardClass = (status: Station['status']) => {
    if (status === 'maintenance') return styles.maintenance;
    if (status === 'inactive') return styles.inactive;
    return '';
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>操作台管理</View>
          <View className={styles.subtitle}>吧台操作台建档</View>
        </View>
        <Button className={styles.addBtn} onClick={handleAddStation}>+ 新增</Button>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{activeCount}</View>
          <View className={styles.statLabel}>使用中</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{maintenanceCount}</View>
          <View className={styles.statLabel}>维护中</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{totalCapacity}</View>
          <View className={styles.statLabel}>总容量(人)</View>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>操作台列表</Text>
        <Text className={styles.countBadge}>共 {stations.length} 个</Text>
      </View>

      {stations.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🪑</View>
          <View className={styles.emptyText}>暂无操作台数据</View>
        </View>
      ) : (
        stations.map(station => (
          <View
            key={station.id}
            className={`${styles.stationCard} ${getCardClass(station.status)}`}
            onClick={() => handleEditStation(station)}
          >
            <View className={styles.cardHeader}>
              <View className={styles.stationInfo}>
                <View className={styles.stationName}>{station.name}</View>
                <View className={styles.stationCode}>编号: {station.code}</View>
              </View>
              <View className={`${styles.tag} ${getTagClass(station.status)}`}>
                {getStationStatusText(station.status)}
              </View>
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>位置</View>
                <View className={styles.infoValue}>{station.location}</View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>容量</View>
                <View className={styles.infoValue}>{station.capacity} 人</View>
              </View>
            </View>

            <View className={styles.toolsSection}>
              <View className={styles.toolsTitle}>配备工具</View>
              <View className={styles.toolsList}>
                {station.tools.map((tool, idx) => (
                  <View key={idx} className={styles.toolChip}>{tool}</View>
                ))}
              </View>
            </View>

            <View className={styles.cardFooter}>
              <View className={styles.createDate}>建档于 {station.createdAt}</View>
              <Button className={styles.actionBtn}>管理</Button>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default StationPage;
