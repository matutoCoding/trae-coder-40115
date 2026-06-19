import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockExamRecords } from '@/data/mockInventory';
import { ExamRecord } from '@/types';
import { getExamStatusText } from '@/components/Card/Tags';

type TabType = 'all' | 'pending' | 'reviewing' | 'passed' | 'failed';

const ExamRecordPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [records, setRecords] = useState<ExamRecord[]>(mockExamRecords);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待评审' },
    { key: 'reviewing', label: '评审中' },
    { key: 'passed', label: '已通过' },
    { key: 'failed', label: '未通过' }
  ];

  const filteredRecords = useMemo(() => {
    if (activeTab === 'all') return records;
    return records.filter(r => r.status === activeTab);
  }, [records, activeTab]);

  const statCounts = {
    all: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    reviewing: records.filter(r => r.status === 'reviewing').length,
    passed: records.filter(r => r.status === 'passed').length,
    failed: records.filter(r => r.status === 'failed').length
  };

  const handleStartRecord = () => {
    Taro.showModal({
      title: '开始录制考核',
      content: '将开始录制学员的花式调酒考核视频，确定开始吗？',
      confirmText: '开始录制',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '录制功能开发中', icon: 'none' });
        }
      }
    });
  };

  const handlePlayVideo = (record: ExamRecord) => {
    Taro.showToast({ title: `播放 ${record.studentName} 的考核录像`, icon: 'none' });
  };

  const handleReview = (record: ExamRecord) => {
    Taro.showActionSheet({
      itemList: ['评分通过', '评分未通过', '查看详情'],
      success: (res) => {
        if (res.tapIndex === 0) {
          setRecords(prev => prev.map(r =>
            r.id === record.id ? { ...r, status: 'passed', score: 80, reviewer: '当前管理员' } : r
          ));
          Taro.showToast({ title: '已标记通过', icon: 'success' });
        } else if (res.tapIndex === 1) {
          setRecords(prev => prev.map(r =>
            r.id === record.id ? { ...r, status: 'failed', score: 55, reviewer: '当前管理员' } : r
          ));
          Taro.showToast({ title: '已标记未通过', icon: 'none' });
        } else {
          handlePlayVideo(record);
        }
      }
    });
  };

  const getTagClass = (status: ExamRecord['status']) => {
    switch (status) {
      case 'pending': return styles.tagPending;
      case 'reviewing': return styles.tagReviewing;
      case 'passed': return styles.tagPassed;
      case 'failed': return styles.tagFailed;
      default: return '';
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>考核录像</View>
          <View className={styles.subtitle}>花式调酒考核管理</View>
        </View>
        <Button className={styles.recordBtn} onClick={handleStartRecord}>
          🎬 开始录制
        </Button>
      </View>

      <View className={styles.statsRow}>
        {tabs.slice(1).map(tab => (
          <View key={tab.key} className={styles.statCard}>
            <View className={styles.statValue}>{statCounts[tab.key as keyof typeof statCounts]}</View>
            <View className={styles.statLabel}>{tab.label}</View>
          </View>
        ))}
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <View className={styles.sectionTitle}>考核列表</View>

      {filteredRecords.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📹</View>
          <View className={styles.emptyText}>暂无考核记录</View>
        </View>
      ) : (
        filteredRecords.map(record => (
          <View key={record.id} className={styles.recordCard}>
            <View className={styles.videoPlaceholder} onClick={() => handlePlayVideo(record)}>
              <View className={styles.playIcon}>▶</View>
              <View className={styles.durationBadge}>03:45</View>
            </View>
            <View className={styles.cardBody}>
              <View className={styles.cardHeader}>
                <View>
                  <View className={styles.studentName}>{record.studentName}</View>
                  <View className={styles.examInfo}>{record.courseName} · {record.examType}</View>
                </View>
                <View className={`${styles.tag} ${getTagClass(record.status)}`}>
                  {getExamStatusText(record.status)}
                </View>
              </View>

              {record.score !== undefined && (
                <View className={styles.scoreRow}>
                  <Text className={styles.scoreLabel}>得分:</Text>
                  <Text className={styles.scoreValue}>{record.score}</Text>
                  <Text className={styles.scoreUnit}>分</Text>
                </View>
              )}

              {record.comments && (
                <View className={styles.comments}>
                  💬 {record.comments}
                </View>
              )}

              <View className={styles.footer}>
                <View className={styles.dateText}>{record.createdAt}</View>
                {(record.status === 'pending' || record.status === 'reviewing') ? (
                  <Button className={`${styles.actionBtn} ${styles.btnReview}`} onClick={() => handleReview(record)}>
                    评审
                  </Button>
                ) : (
                  <View className={styles.reviewer}>评审: {record.reviewer || '-'}</View>
                )}
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default ExamRecordPage;
