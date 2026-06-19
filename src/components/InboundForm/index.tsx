import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { Batch, Liquor, LiquorCategory } from '@/types';
import { useApp } from '@/store';
import { generateId } from '@/utils/storage';
import { getDaysDiff, today } from '@/utils/date';

interface InboundFormProps {
  visible: boolean;
  defaultLiquorId?: string;
  onClose: () => void;
  onConfirm: (batch: Batch, liquor: Liquor | null) => void;
}

const InboundForm: React.FC<InboundFormProps> = ({ visible, defaultLiquorId, onClose, onConfirm }) => {
  const { state } = useApp();

  const [liquorId, setLiquorId] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('瓶');
  const [productionDate, setProductionDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (visible) {
      setLiquorId(defaultLiquorId || state.liquors[0]?.id || '');
      setBatchNo('');
      setQuantity('');
      setUnit('瓶');
      setProductionDate(today());
      setExpiryDate('');
      setLocation('');
    }
  }, [visible, defaultLiquorId, state.liquors]);

  const selectedLiquor = useMemo(() => {
    return state.liquors.find(l => l.id === liquorId);
  }, [state.liquors, liquorId]);

  useEffect(() => {
    if (selectedLiquor) {
      setUnit(selectedLiquor.unit);
    }
  }, [selectedLiquor]);

  const canSubmit = useMemo(() => {
    if (!liquorId || !batchNo.trim() || !quantity || !expiryDate) return false;
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return false;
    return true;
  }, [liquorId, batchNo, quantity, expiryDate]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const daysToExpiry = getDaysDiff(today(), expiryDate);
    let status: Batch['status'] = 'normal';
    if (daysToExpiry < 0) status = 'expired';
    else if (daysToExpiry <= 15) status = 'expiring';

    const batch: Batch = {
      id: generateId(),
      liquorId,
      liquorName: selectedLiquor?.name || '',
      category: selectedLiquor?.category || 'other',
      batchNo: batchNo.trim(),
      quantity: parseInt(quantity) || 0,
      unit: selectedLiquor?.unit || unit,
      productionDate,
      expiryDate,
      inboundDate: today(),
      status,
      location: location.trim() || '未指定位置'
    };

    onConfirm(batch, selectedLiquor || null);
  };

  if (!visible) return null;

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.modalHeader}>
          <View className={styles.modalTitle}>登记入库</View>
          <View className={styles.closeBtn} onClick={onClose}>×</View>
        </View>

        <ScrollView className={styles.modalBody} scrollY>
          <View className={styles.formItem}>
            <View className={styles.label}>选择基酒<Text className={styles.required}>*</Text></View>
            <ScrollView className={styles.liquorPicker} scrollY style={{ maxHeight: '300rpx' }}>
              {state.liquors.map(l => (
                <View
                  key={l.id}
                  className={`${styles.liquorItem} ${liquorId === l.id ? styles.selected : ''}`}
                  onClick={() => setLiquorId(l.id)}
                >
                  <View className={styles.liquorInfo}>
                    <View className={styles.liquorName}>{l.name}</View>
                    <View className={styles.liquorSpec}>
                      {l.brand} · {l.spec} · 当前库存 {l.totalStock} {l.unit}
                    </View>
                  </View>
                  {liquorId === l.id && <Text className={styles.checkIcon}>✓</Text>}
                </View>
              ))}
            </ScrollView>
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>批号<Text className={styles.required}>*</Text></View>
            <Input
              className={styles.input}
              placeholder="请输入生产批号"
              placeholderStyle="color: #6B5B4F"
              value={batchNo}
              onInput={(e) => setBatchNo(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>入库数量<Text className={styles.required}>*</Text></View>
            <View className={styles.rowInput}>
              <Input
                className={styles.input}
                type="number"
                placeholder="数量"
                placeholderStyle="color: #6B5B4F"
                value={quantity}
                onInput={(e) => setQuantity(e.detail.value)}
              />
              <Input
                className={styles.input}
                placeholder="单位"
                placeholderStyle="color: #6B5B4F"
                value={unit}
                onInput={(e) => setUnit(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>生产日期</View>
            <Input
              className={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderStyle="color: #6B5B4F"
              value={productionDate}
              onInput={(e) => setProductionDate(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>有效期至<Text className={styles.required}>*</Text></View>
            <Input
              className={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderStyle="color: #6B5B4F"
              value={expiryDate}
              onInput={(e) => setExpiryDate(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>存放位置</View>
            <Input
              className={styles.input}
              placeholder="如：A区-01货架"
              placeholderStyle="color: #6B5B4F"
              value={location}
              onInput={(e) => setLocation(e.detail.value)}
            />
          </View>
        </ScrollView>

        <View className={styles.modalFooter}>
          <Button className={styles.btnCancel} onClick={onClose}>取消</Button>
          <Button
            className={`${styles.btnConfirm} ${!canSubmit ? styles.disabled : ''}`}
            onClick={handleSubmit}
          >
            确认入库
          </Button>
        </View>
      </View>
    </View>
  );
};

export default InboundForm;
