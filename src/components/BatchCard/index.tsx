import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Liquor, Batch } from '@/types';
import { Tag, getCategoryText, getBatchStatusText } from '../Card/Tags';
import { getDaysDiff, today } from '@/utils/date';

interface LiquorCardProps {
  liquor: Liquor;
  onClick?: () => void;
}

const LiquorCard: React.FC<LiquorCardProps> = ({ liquor, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/batch-detail/index?id=${liquor.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.titleSection}>
          <View className={styles.title}>{liquor.name}</View>
          <View className={styles.brand}>{liquor.brand} · {liquor.spec}</View>
        </View>
        <View className={styles.tagRow}>
          <Tag text={getCategoryText(liquor.category)} type={liquor.category} />
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>总库存</View>
          <View className={styles.infoValue}>{liquor.totalStock} {liquor.unit}</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>批次数量</View>
          <View className={styles.infoValue}>{liquor.batches.length} 批</View>
        </View>
      </View>

      <View className={styles.footer}>
        {liquor.warningCount > 0 ? (
          <View className={styles.warningBadge}>⚠️ {liquor.warningCount} 个批次临期/过期</View>
        ) : (
          <View className={styles.batchCount}>库存正常</View>
        )}
        <View className={styles.action}>查看批次 →</View>
      </View>
    </View>
  );
};

interface BatchDetailCardProps {
  batch: Batch;
  showAction?: boolean;
  onOutbound?: () => void;
}

export const BatchDetailCard: React.FC<BatchDetailCardProps> = ({ batch, showAction = false, onOutbound }) => {
  const daysToExpiry = getDaysDiff(today(), batch.expiryDate);
  const isExpiring = batch.status === 'expiring';
  const isExpired = batch.status === 'expired' || batch.status === 'locked';

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.titleSection}>
          <View className={styles.title}>批号: {batch.batchNo}</View>
          <View className={styles.brand}>{batch.location}</View>
        </View>
        <View className={styles.tagRow}>
          <Tag text={getBatchStatusText(batch.status)} type={batch.status} />
        </View>
      </View>

      <View className={styles.infoSection}>
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
          <View className={`${styles.infoValue} ${isExpired ? styles.dangerValue : isExpiring ? styles.warningValue : ''}`}>
            {batch.expiryDate}
            {!isExpired && (
              <Text style={{ fontSize: '22rpx', marginLeft: '8rpx' }}>
                ({daysToExpiry > 0 ? `${daysToExpiry}天后过期` : daysToExpiry === 0 ? '今天过期' : `已过期${Math.abs(daysToExpiry)}天`})
              </Text>
            )}
          </View>
        </View>
      </View>

      {showAction && !isExpired && (
        <View className={styles.footer}>
          <View></View>
          <View className={styles.action} onClick={onOutbound}>先进先出出库 →</View>
        </View>
      )}
    </View>
  );
};

export default LiquorCard;
