import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Batch, OutboundRecord } from '@/types';
import { getDaysDiff, today } from '@/utils/date';
import { generateId } from '@/utils/storage';

type TabType = 'records' | 'pending';

const OutboundPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('records');

  const fifoBatches = useMemo(() => {
    const available = state.batches.filter(b =>
      (b.status === 'normal' || b.status === 'expiring') && b.quantity > 0
    );
    return available.sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }).slice(0, 5);
  }, [state.batches]);

  const todayOutbound = state.outboundRecords.filter(r => r.outboundDate === today()).length;
  const totalOutbound = state.outboundRecords.length;
  const fifoRate = totalOutbound > 0
    ? Math.round(state.outboundRecords.filter(r => r.isFifo).length / totalOutbound * 100)
    : 100;

  const isFifoBatch = (batch: Batch): boolean => {
    const sameLiquor = state.batches.filter(b =>
      b.liquorId === batch.liquorId
      && (b.status === 'normal' || b.status === 'expiring')
      && b.quantity > 0
    );
    const sorted = sameLiquor.sort((a, b) =>
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    return sorted.length > 0 && sorted[0].id === batch.id;
  };

  const doOutbound = (batch: Batch, qty: number) => {
    const isFifo = isFifoBatch(batch);
    const actualQty = Math.min(qty, batch.quantity);

    const record: OutboundRecord = {
      id: generateId(),
      batchId: batch.id,
      liquorId: batch.liquorId,
      liquorName: batch.liquorName,
      batchNo: batch.batchNo,
      quantity: actualQty,
      unit: batch.unit,
      operator: '当前管理员',
      outboundDate: today(),
      purpose: '课程使用',
      isFifo
    };

    dispatch({ type: 'ADD_OUTBOUND', payload: record });

    if (!isFifo) {
      Taro.showModal({
        title: '非FIFO出库提醒',
        content: `「${batch.liquorName}」存在更早到期的批次，本次出库不符合先进先出原则。是否确认？`,
        confirmText: '仍要出库',
        confirmColor: '#F44336',
        showCancel: false
      });
    }
  };

  const handleNewOutbound = () => {
    if (fifoBatches.length === 0) {
      Taro.showToast({ title: '暂无可用库存', icon: 'none' });
      return;
    }
    const firstBatch = fifoBatches[0];
    const daysToExpiry = getDaysDiff(today(), firstBatch.expiryDate);
    const daysText = daysToExpiry > 0
      ? `${daysToExpiry}天后过期`
      : daysToExpiry === 0 ? '今日到期' : `已过期${Math.abs(daysToExpiry)}天`;

    Taro.showModal({
      title: '先进先出出库 (FIFO)',
      content: `系统按效期优先推荐：\n\n${firstBatch.liquorName}\n批号: ${firstBatch.batchNo}\n有效期至: ${firstBatch.expiryDate} (${daysText})\n可用数量: ${firstBatch.quantity} ${firstBatch.unit}\n\n是否确认出库1瓶？`,
      confirmText: '确认出库1瓶',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          doOutbound(firstBatch, 1);
          Taro.showToast({ title: '出库成功', icon: 'success' });
        }
      }
    });
  };

  const handleQuickOutbound = (batch: Batch) => {
    if (batch.status === 'locked' || batch.status === 'expired') {
      Taro.showToast({ title: '该批次已锁定/过期，不可出库', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认出库',
      content: `${batch.liquorName}\n批次: ${batch.batchNo}\n剩余: ${batch.quantity} ${batch.unit}\n\n确定出库1${batch.unit}吗？`,
      confirmText: '确认出库',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          doOutbound(batch, 1);
          Taro.showToast({ title: '出库成功', icon: 'success' });
        }
      }
    });
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
              const isLocked = batch.status === 'locked' || batch.status === 'expired';
              return (
                <View key={batch.id} className={styles.pendingCard}>
                  <View className={styles.pendingHeader}>
                    <View>
                      <View className={styles.pendingTitle}>{batch.liquorName}</View>
                      <View style={{ fontSize: '22rpx', color: '#A08060', marginTop: '4rpx' }}>
                        批号: {batch.batchNo}
                      </View>
                    </View>
                    {daysToExpiry <= 15 && (
                      <View className={styles.expiryText}>
                        {daysToExpiry > 0 ? `还剩${daysToExpiry}天` : daysToExpiry === 0 ? '今日到期' : '已过期'}
                      </View>
                    )}
                  </View>
                  <View className={styles.pendingInfo}>
                    <View>
                      <View className={styles.pendingBatch}>存放: {batch.location}</View>
                      <View className={styles.pendingBatch} style={{ marginTop: '8rpx' }}>
                        有效期至: {batch.expiryDate}
                      </View>
                    </View>
                    <View className={styles.pendingQty}>{batch.quantity} {batch.unit}</View>
                  </View>
                  <View className={styles.pendingAction}>
                    <Button
                      className={styles.actionBtn}
                      disabled={isLocked}
                      onClick={() => handleQuickOutbound(batch)}
                    >
                      {isLocked ? '已锁定不可出库' : '立即出库'}
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
            <Text className={styles.countBadge}>共 {state.outboundRecords.length} 条</Text>
          </View>
          {state.outboundRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📋</View>
              <View className={styles.emptyText}>暂无出库记录</View>
            </View>
          ) : (
            state.outboundRecords.slice().sort((a, b) => b.outboundDate.localeCompare(a.outboundDate)).map(record => (
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
                    <View className={styles.quantity}>-{record.quantity} {record.unit}</View>
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
