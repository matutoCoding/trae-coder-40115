import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockOutboundRecords, mockBatches } from '@/data/mockInventory';
import { OutboundRecord, Batch } from '@/types';
import { getDaysDiff, today } from '@/utils/date';

type TabType = 'records' | 'pending';

const OutboundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [records, setRecords] = useState<OutboundRecord[]>(mockOutboundRecords);

  const fifoBatches = useMemo(() => {
    const normalBatches = mockBatches.filter(b => b.status === 'normal' || b.status === 'expiring');
    return normalBatches.sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }).slice(0, 3);
  }, []);

  const todayOutbound = records.filter(r => r.outboundDate === today()).length;
  const totalOutbound = records.length;
  const fifoRate = Math.round(records.filter(r => r.isFifo).length / records.length * 100);

  const handleNewOutbound = () => {
    if (fifoBatches.length === 0) {
      Taro.showToast({ title: '暂无可用库存', icon: 'none' });
      return;
    }
    const firstBatch = fifoBatches[0];
    Taro.showModal({
      title: '先进先出出库',
      content: `系统推荐优先出库 ${firstBatch.liquorName}\n批次号: ${firstBatch.batchNo}\n有效期至: ${firstBatch.expiryDate}`,
      confirmText: '确认出库',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '出库成功', icon: 'success' });
        }
      }
    });
  };

  const handleQuickOutbound = (batch: Batch) => {
    Taro.showModal({
      title: '确认出库',
      content: `确定出库 ${batch.liquorName}?\n批次: ${batch.batchNo}\n剩余: ${batch.quantity} ${batch.unit}`,
      confirmText: '确认出库',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '出库成功', icon: 'success' });
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
          <View className={styles.title}>出库管理</View>
          <View className={styles.subtitle}>严格先进先出 (FIFO)</View>
        </View>
        <Button className={styles.outboundBtn} onClick={handleNewOutbound}>+ 新增出库</Button>
      </View>

      <View className={styles.fifoTip}>
        <Text className={styles.tipIcon}>✅</Text>
        <Text className={styles.tipText}>出库将自动按效期先后推荐，确保先进先出</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{todayOutbound}</View>
          <View className={styles.statLabel}>今日出库</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{totalOutbound}</View>
          <View className={styles.statLabel}>累计出库</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{fifoRate}%</View>
          <View className={styles.statLabel}>FIFO执行率</View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          待出库优先
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'records' ? styles.active : ''}`}
          onClick={() => setActiveTab('records')}
        >
          出库记录
        </View>
      </View>

      {activeTab === 'pending' ? (
        <>
          <View className={styles.sectionTitle}>
            <Text>按FIFO排序待出库</Text>
            <Text className={styles.countBadge}>推荐 {fifoBatches.length} 批</Text>
          </View>
          {fifoBatches.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📦</View>
              <View className={styles.emptyText}>暂无待出库批次</View>
            </View>
          ) : (
            fifoBatches.map(batch => {
              const daysToExpiry = getDaysDiff(today(), batch.expiryDate);
              return (
                <View key={batch.id} className={styles.pendingCard}>
                  <View className={styles.pendingHeader}>
                    <View className={styles.pendingTitle}>{batch.liquorName}</View>
                    {daysToExpiry <= 15 && (
                      <View className={styles.expiryText}>
                        {daysToExpiry > 0 ? `还剩${daysToExpiry}天` : daysToExpiry === 0 ? '今日到期' : '已过期'}
                      </View>
                    )}
                  </View>
                  <View className={styles.pendingInfo}>
                    <View>
                      <View className={styles.pendingBatch}>批号: {batch.batchNo}</View>
                      <View className={styles.pendingBatch} style={{ marginTop: '8rpx' }}>
                        有效期至: {batch.expiryDate}
                      </View>
                    </View>
                    <View className={styles.pendingQty}>{batch.quantity} {batch.unit}</View>
                  </View>
                  <View className={styles.pendingAction}>
                    <Button className={styles.actionBtn} onClick={() => handleQuickOutbound(batch)}>
                      立即出库
                    </Button>
                  </View>
                </View>
              );
            })
          )}
        </>
      ) : (
        <>
          <View className={styles.sectionTitle}>
            <Text>出库记录</Text>
            <Text className={styles.countBadge}>共 {records.length} 条</Text>
          </View>
          {records.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📋</View>
              <View className={styles.emptyText}>暂无出库记录</View>
            </View>
          ) : (
            records.slice().sort((a, b) => b.outboundDate.localeCompare(a.outboundDate)).map(record => (
              <View key={record.id} className={styles.recordCard}>
                <View className={styles.recordHeader}>
                  <View className={styles.recordTitle}>{record.liquorName}</View>
                  {record.isFifo && <View className={styles.fifoBadge}>FIFO</View>}
                </View>
                <View className={styles.infoGrid}>
                  <View className={styles.infoItem}>
                    <View className={styles.infoLabel}>批号</View>
                    <View className={styles.infoValue}>{record.batchNo}</View>
                  </View>
                  <View className={styles.infoItem}>
                    <View className={styles.infoLabel}>出库数量</View>
                    <View className={styles.quantity}>{record.quantity} {record.unit}</View>
                  </View>
                  <View className={styles.infoItem}>
                    <View className={styles.infoLabel}>用途</View>
                    <View className={styles.infoValue}>{record.purpose}</View>
                  </View>
                  <View className={styles.infoItem}>
                    <View className={styles.infoLabel}>操作人</View>
                    <View className={styles.infoValue}>{record.operator}</View>
                  </View>
                </View>
                <View className={styles.recordFooter}>
                  <View className={styles.dateText}>{record.outboundDate}</View>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

export default OutboundPage;
