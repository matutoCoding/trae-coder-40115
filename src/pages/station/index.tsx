import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockStations } from '@/data/mockCourse';
import { Station } from '@/types';
import { getStationStatusText } from '@/components/Card/Tags';

const StationPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>(mockStations);

  const activeCount = stations.filter(s => s.status === 'active').length;
  const maintenanceCount = stations.filter(s => s.status === 'maintenance').length;
  const totalCapacity = stations.filter(s => s.status === 'active').reduce((sum, s) => sum + s.capacity, 0);

  const handleAddStation = () => {
    Taro.showToast({ title: '新增操作台功能开发中', icon: 'none' });
  };

  const handleEditStation = (station: Station) => {
    Taro.showActionSheet({
      itemList: ['编辑信息', '切换状态', '删除操作台'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
        } else if (res.tapIndex === 1) {
          handleToggleStatus(station);
        } else if (res.tapIndex === 2) {
          handleDeleteStation(station);
        }
      }
    });
  };

  const handleToggleStatus = (station: Station) => {
    const nextStatus = station.status === 'active' ? 'inactive' : station.status === 'maintenance' ? 'active' : 'active';
    const statusLabels: Record<Station['status'], string> = {
      active: '使用中',
      maintenance: '维护中',
      inactive: '停用'
    };

    Taro.showModal({
      title: '切换状态',
      content: `将「${station.name}」状态切换为「${statusLabels[nextStatus]}」，确定吗？`,
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          setStations(prev => prev.map(s =>
            s.id === station.id ? { ...s, status: nextStatus } : s
          ));
          Taro.showToast({ title: '状态已更新', icon: 'success' });
        }
      }
    });
  };

  const handleDeleteStation = (station: Station) => {
    Taro.showModal({
      title: '删除操作台',
      content: `确定删除「${station.name}」吗？该操作不可恢复。`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          setStations(prev => prev.filter(s => s.id !== station.id));
          Taro.showToast({ title: '已删除', icon: 'success' });
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
    <View className={styles.container}>
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
    </View>
  );
};

export default StationPage;
