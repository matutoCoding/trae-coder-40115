import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { StockCheckItem, StockCheckRecord } from '@/types';
import { generateId } from '@/utils/storage';
import { today } from '@/utils/date';

type TabType = 'check' | 'records';

const StockCheckPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('check');
  const [checkItems, setCheckItems] = useState<StockCheckItem[]>([]);
  const [remark, setRemark] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<StockCheckRecord | null>(null);

  React.useEffect(() => {
    if (activeTab === 'check') {
      const newItems: StockCheckItem[] = state.liquors.map(l => ({
        liquorId: l.id,
        liquorName: l.name,
        unit: l.unit,
        systemQty: l.totalStock,
        checkQty: l.totalStock,
        diffQty: 0
      }));
      setCheckItems(newItems);
      setRemark('');
    }
  }, [activeTab, state.liquors]);

  const handleUpdateQty = (liquorId: string, qty: number) => {
    setCheckItems(checkItems.map(item => {
      if (item.liquorId !== liquorId) return item;
      const newQty = Math.max(0, qty);
      return {
        ...item,
        checkQty: newQty,
        diffQty: newQty - item.systemQty
      };
    }));
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置盘点',
      content: '确定要重置所有实盘数量为系统库存吗？',
      success: (res) => {
        if (res.confirm) {
          const newItems: StockCheckItem[] = state.liquors.map(l => ({
            liquorId: l.id,
            liquorName: l.name,
            unit: l.unit,
            systemQty: l.totalStock,
            checkQty: l.totalStock,
            diffQty: 0
          }));
          setCheckItems(newItems);
        }
      }
    });
  };

  const handleSave = () => {
    const hasDiff = checkItems.some(i => i.diffQty !== 0);
    let content = `本次共盘点 ${checkItems.length} 个酒品`;
    if (hasDiff) {
      const diffItems = checkItems.filter(i => i.diffQty !== 0);
      content += `\n\n⚠️ 发现 ${diffItems.length} 个差异：\n${diffItems.slice(0, 5).map(i => `• ${i.liquorName}: 系统${i.systemQty} / 实盘${i.checkQty} (${i.diffQty > 0 ? '+' : ''}${i.diffQty})`).join('\n')}${diffItems.length > 5 ? `\n...等${diffItems.length}个` : ''}`;
    } else {
      content += '\n\n✅ 所有酒品账实一致';
    }
    content += '\n\n确认保存盘点记录？';

    Taro.showModal({
      title: '确认保存盘点',
      content,
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          const record: StockCheckRecord = {
            id: generateId(),
            checkDate: today(),
            operator: '当前管理员',
            remark: remark.trim() || undefined,
            items: JSON.parse(JSON.stringify(checkItems))
          };
          dispatch({ type: 'ADD_STOCK_CHECK', payload: record });
          Taro.showToast({ title: '盘点记录已保存', icon: 'success' });
          setActiveTab('records');
        }
      }
    });
  };

  const diffSummary = useMemo(() => {
    const diffCount = checkItems.filter(i => i.diffQty !== 0).length;
    const overQty = checkItems.filter(i => i.diffQty > 0).reduce((sum, i) => sum + i.diffQty, 0);
    const underQty = Math.abs(checkItems.filter(i => i.diffQty < 0).reduce((sum, i) => sum + i.diffQty, 0));
    return { diffCount, overQty, underQty };
  }, [checkItems]);

  if (selectedRecord) {
    return (
      <ScrollView className={styles.container} scrollY>
        <View className={styles.header}>
          <View className={styles.backBtn} onClick={() => setSelectedRecord(null)}>← 返回</View>
          <View>
            <View className={styles.title}>盘点详情</View>
            <View className={styles.subtitle}>
              {selectedRecord.checkDate} · {selectedRecord.operator}
            </View>
          </View>
        </View>

        {selectedRecord.remark && (
          <View className={styles.remarkCard}>
            💬 备注：{selectedRecord.remark}
          </View>
        )}

        <View className={styles.sectionTitle}>盘点明细</View>

        {selectedRecord.items.map(item => (
          <View key={item.liquorId} className={styles.checkCard}>
            <View>
              <View className={styles.liquorName}>{item.liquorName}</View>
              <View className={styles.qtyRow}>
                <Text>系统: {item.systemQty}{item.unit}</Text>
                <Text> | </Text>
                <Text>实盘: {item.checkQty}{item.unit}</Text>
              </View>
            </View>
            <View className={item.diffQty > 0 ? styles.diffPlus : item.diffQty < 0 ? styles.diffMinus : styles.diffZero}>
              {item.diffQty > 0 ? '+' : ''}{item.diffQty}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>库存盘点</View>
          <View className={styles.subtitle}>定期核对库存，记录差异</View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'check' ? styles.active : ''}`}
          onClick={() => setActiveTab('check')}
        >
          新建盘点
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'records' ? styles.active : ''}`}
          onClick={() => setActiveTab('records')}
        >
          盘点记录
        </View>
      </View>

      {activeTab === 'check' ? (
        <>
          <View className={styles.summaryCard}>
            <View className={styles.summaryItem}>
              <View className={styles.summaryValue}>{checkItems.length}</View>
              <View className={styles.summaryLabel}>盘点酒品</View>
            </View>
            <View className={styles.summaryItem}>
              <View className={`${styles.summaryValue} ${styles.diffPlus}`}>+{diffSummary.overQty}</View>
              <View className={styles.summaryLabel}>盘盈</View>
            </View>
            <View className={styles.summaryItem}>
              <View className={`${styles.summaryValue} ${styles.diffMinus}`}>-{diffSummary.underQty}</View>
              <View className={styles.summaryLabel}>盘亏</View>
            </View>
            <View className={styles.summaryItem}>
              <View className={styles.summaryValue}>{diffSummary.diffCount}</View>
              <View className={styles.summaryLabel}>有差异</View>
            </View>
          </View>

          <View className={styles.sectionTitle}>
            <Text>录入实盘数量</Text>
            <Text className={styles.actionLink} onClick={handleReset}>重置</Text>
          </View>

          {checkItems.map(item => (
            <View key={item.liquorId} className={styles.checkCard}>
              <View>
                <View className={styles.liquorName}>{item.liquorName}</View>
                <View className={styles.systemQty}>系统库存: {item.systemQty}{item.unit}</View>
              </View>
              <View className={styles.qtyControl}>
                <Button
                  className={styles.qtyBtn}
                  onClick={() => handleUpdateQty(item.liquorId, item.checkQty - 1)}
                >
                  -
                </Button>
                <Input
                  className={styles.qtyInput}
                  type='number'
                  value={String(item.checkQty)}
                  onInput={(e) => handleUpdateQty(item.liquorId, Number(e.detail.value) || 0)}
                />
                <Button
                  className={styles.qtyBtn}
                  onClick={() => handleUpdateQty(item.liquorId, item.checkQty + 1)}
                >
                  +
                </Button>
                <Text className={styles.qtyUnit}>{item.unit}</Text>
              </View>
              {item.diffQty !== 0 && (
                <View className={`${styles.diffTag} ${item.diffQty > 0 ? styles.diffPlus : styles.diffMinus}`}>
                  {item.diffQty > 0 ? '+' : ''}{item.diffQty}
                </View>
              )}
            </View>
          ))}

          <View className={styles.remarkSection}>
            <Text className={styles.label}>盘点备注</Text>
            <Input
              className={styles.remarkInput}
              placeholder='备注信息（可选）'
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>

          <View className={styles.actionRow}>
            <Button className={styles.btnSave} onClick={handleSave}>
              保存盘点记录
            </Button>
          </View>
        </>
      ) : (
        <>
          <View className={styles.sectionTitle}>
            <Text>历史盘点记录</Text>
            <Text className={styles.countBadge}>共 {state.stockCheckRecords.length} 条</Text>
          </View>

          {state.stockCheckRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📋</View>
              <View className={styles.emptyText}>暂无盘点记录</View>
            </View>
          ) : (
            state.stockCheckRecords.map(record => {
              const diffCount = record.items.filter(i => i.diffQty !== 0).length;
              return (
                <View
                  key={record.id}
                  className={styles.recordCard}
                  onClick={() => setSelectedRecord(record)}
                >
                  <View>
                    <View className={styles.recordTitle}>
                      {record.checkDate} 盘点
                      {diffCount > 0 && (
                        <Text className={styles.diffBadge}>有{diffCount}项差异</Text>
                      )}
                    </View>
                    <View className={styles.recordMeta}>
                      盘点人: {record.operator} · {record.items.length}个酒品
                    </View>
                    {record.remark && (
                      <View className={styles.recordRemark}>💬 {record.remark}</View>
                    )}
                  </View>
                  <Text className={styles.arrow}>›</Text>
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
};

export default StockCheckPage;
