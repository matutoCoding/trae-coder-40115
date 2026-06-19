import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import LiquorCard from '@/components/BatchCard';
import InboundForm from '@/components/InboundForm';
import { useApp } from '@/store';
import { Liquor, LiquorCategory, Batch } from '@/types';
import { getBatchStatusText } from '@/components/Card/Tags';

type FilterType = 'all' | LiquorCategory;

const InventoryPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [inboundVisible, setInboundVisible] = useState(false);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'base', label: '基酒' },
    { key: 'syrup', label: '糖浆' },
    { key: 'liqueur', label: '力娇酒' },
    { key: 'juice', label: '果汁' },
    { key: 'other', label: '其他' }
  ];

  const warningBatches = useMemo(() => {
    return state.batches.filter(b => b.status !== 'normal' && b.quantity > 0);
  }, [state.batches]);

  const filteredLiquors = useMemo(() => {
    let result = state.liquors;
    if (activeFilter !== 'all') {
      result = result.filter(l => l.category === activeFilter);
    }
    if (searchText) {
      result = result.filter(l =>
        l.name.includes(searchText) || l.brand.includes(searchText)
      );
    }
    return result;
  }, [state.liquors, activeFilter, searchText]);

  const handleAddBatch = () => {
    setInboundVisible(true);
  };

  const handleInboundConfirm = (batch: Batch) => {
    dispatch({ type: 'ADD_BATCH', payload: batch });
    setInboundVisible(false);
    Taro.showToast({ title: '入库成功', icon: 'success' });
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  const getBatchStatusClass = (status: Batch['status']) => {
    switch (status) {
      case 'expiring': return styles.expiring;
      case 'expired': return styles.expired;
      case 'locked': return styles.locked;
      default: return '';
    }
  };

  return (
    <ScrollView className={styles.container} scrollY onRefresh={handleRefresh} refresherEnabled>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>基酒库存</View>
          <View className={styles.subtitle}>批号效期管理</View>
        </View>
        <Button className={styles.addBtn} onClick={handleAddBatch}>+ 登记入库</Button>
      </View>

      {warningBatches.length > 0 && (
        <View className={styles.warningBanner}>
          <View className={styles.warningHeader}>
            ⚠️ 效期预警（<Text className={styles.warningCount}>{warningBatches.length}</Text>）
          </View>
          <View className={styles.warningList}>
            {warningBatches.slice(0, 3).map(batch => (
              <View key={batch.id} className={styles.warningItem}>
                <Text className={styles.warningItemText}>{batch.liquorName} - {batch.batchNo}</Text>
                <Text className={`${styles.warningItemTag} ${getBatchStatusClass(batch.status)}`}>
                  {getBatchStatusText(batch.status)}
                </Text>
              </View>
            ))}
            {warningBatches.length > 3 && (
              <View className={styles.warningItem}>
                <Text className={styles.warningItemText} style={{ color: '#FF9800' }}>
                  ...还有 {warningBatches.length - 3} 个批次需要关注
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索基酒名称或品牌"
          placeholderStyle="color: #6B5B4F"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <ScrollView className={styles.filterRow} scrollX enhanced showScrollbar={false}>
        {filters.map(f => (
          <View
            key={f.key}
            className={`${styles.filterChip} ${activeFilter === f.key ? styles.active : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.sectionTitle}>
        <Text>库存列表</Text>
        <Text className={styles.countBadge}>共 {filteredLiquors.length} 种</Text>
      </View>

      {filteredLiquors.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🍾</View>
          <View className={styles.emptyText}>暂无库存数据</View>
        </View>
      ) : (
        filteredLiquors.map(liquor => (
          <LiquorCard key={liquor.id} liquor={liquor} />
        ))
      )}

      <InboundForm
        visible={inboundVisible}
        onClose={() => setInboundVisible(false)}
        onConfirm={handleInboundConfirm}
      />
    </ScrollView>
  );
};

export default InventoryPage;
