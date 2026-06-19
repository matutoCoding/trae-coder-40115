import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockLiquors, mockOutboundRecords } from '@/data/mockInventory';
import { Batch, Liquor } from '@/types';
import { getBatchStatusText, getCategoryText } from '@/components/Card/Tags';
import { getDaysDiff, today } from '@/utils/date';

type TabType = 'batches' | 'records';

const BatchDetailPage: React.FC = () => {
  const router = useRouter();
  const liquorId = router.params.id;

  const [activeTab, setActiveTab] = useState<TabType>('batches');
  const liquor: Liquor | undefined = mockLiquors.find(l => l.id === liquorId) || mockLiquors[0];
  const [batches, setBatches] = useState<Batch[]>(liquor?.batches || []);

  const sortedBatches = useMemo(() => {
    return [...batches].sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [batches]);

  const outboundRecords = useMemo(() => {
    return mockOutboundRecords.filter(r => r.liquorId === liquor?.id);
  }, [liquor]);

  const handleAddBatch = () => {
    Taro.showToast({ title: '新增批次功能开发中', icon: 'none' });
  };

  const handleOutbound = (batch: Batch) => {
    if (batch.status === 'locked' || batch.status === 'expired') {
      Taro.showToast({ title: '该批次已锁定/过期，不可出库', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '先进先出出库',
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

  const handleLock = (batch: Batch) => {
    Taro.showModal({
      title: '锁定批次',
      content: `确定锁定批次 ${batch.batchNo}？锁定后将不可出库。`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          setBatches(prev => prev.map(b =>
            b.id === batch.id ? { ...b, status: 'locked' } : b
          ));
          Taro.showToast({ title: '已锁定', icon: 'success' });
        }
      }
    });
  };

  const handleUnlock = (batch: Batch) => {
    if (getDaysDiff(today(), batch.expiryDate) < 0) {
      Taro.showToast({ title: '已过期批次无法解锁', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '解锁批次',
      content: `确定解锁批次 ${batch.batchNo}？`,
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          setBatches(prev => prev.map(b =>
            b.id === batch.id ? { ...b, status: 'normal' } : b
          ));
          Taro.showToast({ title: '已解锁', icon: 'success' });
        }
      }
    });
  };

  const getTagClass = (status: Batch['status']) => {
    switch (status) {
      case 'normal': return styles.tagNormal;
      case 'expiring': return styles.tagExpiring;
      case 'expired': return styles.tagExpired;
      case 'locked': return styles.tagLocked;
      default: return '';
    }
  };

  const getValueClass = (batch: Batch) => {
    const daysToExpiry = getDaysDiff(today(), batch.expiryDate);
    if (daysToExpiry < 0) return styles.dangerValue;
    if (daysToExpiry <= 15) return styles.warningValue;
    return '';
  };

  if (!liquor) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🍾</View>
          <View className={styles.emptyText}>未找到该基酒信息</View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.liquorHeader}>
        <View className={styles.liquorName}>{liquor.name}</View>
        <View className={styles.liquorBrand}>{liquor.brand} · {liquor.spec} · {getCategoryText(liquor.category)}</View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{liquor.totalStock}</View>
            <View className={styles.statLabel}>总库存 ({liquor.unit})</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{liquor.batches.length}</View>
            <View className={styles.statLabel}>批次数</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{liquor.warningCount}</View>
            <View className={styles.statLabel}>预警批次</View>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'batches' ? styles.active : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          批次管理
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'records' ? styles.active : ''}`}
          onClick={() => setActiveTab('records')}
        >
          出库记录
        </View>
      </View>

      {activeTab === 'batches' ? (
        <>
          <View className={styles.sectionTitle}>
            <Text>批次列表（按FIFO排序）</Text>
            <Text className={styles.countBadge}>共 {sortedBatches.length} 批</Text>
          </View>
          {sortedBatches.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📦</View>
              <View className={styles.emptyText}>暂无批次数据</View>
            </View>
          ) : (
            sortedBatches.map(batch => {
              const daysToExpiry = getDaysDiff(today(), batch.expiryDate);
              const isLocked = batch.status === 'locked' || batch.status === 'expired';
              return (
                <View key={batch.id} className={styles.batchCard}>
                  {isLocked && (
                    <View className={styles.lockedOverlay}>
                      <View className={styles.lockedIcon}>🔒</View>
                    </View>
                  )}
                  <View className={styles.batchCardHeader}>
                    <View>
                      <View className={styles.batchTitle}>{batch.batchNo}</View>
                      <View style={{ fontSize: '24rpx', color: '#A08060', marginTop: '8rpx' }}>
                        {batch.location}
                      </View>
                    </View>
                    <View className={styles.tagRow}>
                      <View className={`${styles.tag} ${getTagClass(batch.status)}`}>
                        {getBatchStatusText(batch.status)}
                      </View>
                    </View>
                  </View>

                  <View className={styles.infoGrid}>
                    <View className={styles.infoItem}>
                      <View className={styles.infoLabel}>剩余数量</View>
                      <View className={styles.infoValue}>{batch.quantity} {batch.unit}</View>
                    </View>
                    <View className={styles.infoItem}>
                      <View className={styles.infoLabel}>生产日期</View>
                      <View className={styles.infoValue}>{batch.productionDate}</View>
                    </View>
                    <View className={styles.infoItem}>
                      <View className={styles.infoLabel}>入库日期</View>
                      <View className={styles.infoValue}>{batch.inboundDate}</View>
                    </View>
                    <View className={styles.infoItem}>
                      <View className={styles.infoLabel}>有效期至</View>
                      <View className={`${styles.infoValue} ${getValueClass(batch)}`}>
                        {batch.expiryDate}
                        <Text style={{ fontSize: '22rpx', marginLeft: '8rpx' }}>
                          ({daysToExpiry > 0 ? `${daysToExpiry}天后` : daysToExpiry === 0 ? '今天' : `已过期${Math.abs(daysToExpiry)}天`})
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.batchFooter}>
                    {batch.status === 'locked' ? (
                      <Button className={`${styles.actionBtn} ${styles.btnUnlock}`} onClick={() => handleUnlock(batch)}>
                        解锁
                      </Button>
                    ) : batch.status === 'expired' ? (
                      <Button className={`${styles.actionBtn} ${styles.btnLock}`} disabled>
                        已过期
                      </Button>
                    ) : (
                      <>
                        <Button className={`${styles.actionBtn} ${styles.btnLock}`} onClick={() => handleLock(batch)}>
                          锁定
                        </Button>
                        <Button className={`${styles.actionBtn} ${styles.btnOutbound}`} onClick={() => handleOutbound(batch)}>
                          FIFO出库
                        </Button>
                      </>
                    )}
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
            <Text className={styles.countBadge}>共 {outboundRecords.length} 条</Text>
          </View>
          {outboundRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📋</View>
              <View className={styles.emptyText}>暂无出库记录</View>
            </View>
          ) : (
            <View className={styles.batchCard}>
              {outboundRecords.map(record => (
                <View key={record.id} className={styles.recordItem}>
                  <View className={styles.recordInfo}>
                    <View className={styles.recordTitle}>{record.batchNo}</View>
                    <View className={styles.recordDesc}>
                      {record.outboundDate} · {record.operator} · {record.purpose}
                    </View>
                  </View>
                  <View className={styles.recordQty}>-{record.quantity} {record.unit}</View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View className={styles.floatingBtn} onClick={handleAddBatch}>+</View>
    </View>
  );
};

export default BatchDetailPage;
