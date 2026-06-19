import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { Course, CycleRule } from '@/types';
import { getWeekdayName, today, addDays } from '@/utils/date';
import { generateId } from '@/utils/storage';

const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
const courseTypes: { key: Course['type']; label: string }[] = [
  { key: 'basic', label: '基础' },
  { key: 'intermediate', label: '进阶' },
  { key: 'advanced', label: '高级' },
  { key: 'exam', label: '考核' }
];

const RuleDetailPage: React.FC = () => {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const ruleId = router.params.id;

  const existingRule = ruleId ? state.cycleRules.find(r => r.id === ruleId) : null;

  const [name, setName] = useState(existingRule?.name || '');
  const [courseTitle, setCourseTitle] = useState(existingRule?.courseTitle || '');
  const [courseType, setCourseType] = useState<Course['type']>(existingRule?.courseType || 'basic');
  const [instructor, setInstructor] = useState(existingRule?.instructor || '');
  const [stationId, setStationId] = useState(existingRule?.stationId || state.stations[0]?.id || '');
  const [weekdays, setWeekdays] = useState<number[]>(existingRule?.weekdays || [1, 3, 5]);
  const [startTime, setStartTime] = useState(existingRule?.startTime || '09:00');
  const [endTime, setEndTime] = useState(existingRule?.endTime || '11:00');
  const [maxStudents, setMaxStudents] = useState(String(existingRule?.maxStudents || '4'));
  const [startDate, setStartDate] = useState(existingRule?.startDate || today());
  const [endDate, setEndDate] = useState(existingRule?.endDate || addDays(today(), 30));
  const [isActive, setIsActive] = useState(existingRule?.status !== 'inactive');

  useDidShow(() => {
    if (ruleId) {
      const latest = state.cycleRules.find(r => r.id === ruleId);
      if (latest) {
        setName(latest.name);
        setCourseTitle(latest.courseTitle);
        setCourseType(latest.courseType);
        setInstructor(latest.instructor);
        setStationId(latest.stationId);
        setWeekdays(latest.weekdays);
        setStartTime(latest.startTime);
        setEndTime(latest.endTime);
        setMaxStudents(String(latest.maxStudents));
        setStartDate(latest.startDate);
        setEndDate(latest.endDate);
        setIsActive(latest.status !== 'inactive');
      }
    }
  });

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter(d => d !== day));
    } else {
      setWeekdays([...weekdays, day].sort());
    }
  };

  const selectedStation = state.stations.find(s => s.id === stationId);
  const estimatedCount = weekdays.length * 4;

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入规则名称', icon: 'none' });
      return;
    }
    if (!courseTitle.trim()) {
      Taro.showToast({ title: '请输入课程名称', icon: 'none' });
      return;
    }
    if (weekdays.length === 0) {
      Taro.showToast({ title: '请选择上课日', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '保存中...' });

    const ruleData: CycleRule = {
      id: existingRule?.id || generateId(),
      name: name.trim(),
      courseTitle: courseTitle.trim(),
      courseType,
      instructor: instructor.trim(),
      stationId,
      stationName: selectedStation?.name || '',
      weekdays,
      startTime,
      endTime,
      maxStudents: parseInt(maxStudents) || 4,
      startDate,
      endDate,
      status: isActive ? 'active' : 'inactive',
      createdAt: existingRule?.createdAt || today(),
      totalGenerated: existingRule?.totalGenerated || 0
    };

    setTimeout(() => {
      if (existingRule) {
        dispatch({ type: 'UPDATE_RULE', payload: ruleData });
      } else {
        dispatch({ type: 'ADD_RULE', payload: ruleData });
      }
      Taro.hideLoading();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 800);
    }, 400);
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后该规则将无法恢复，已生成的课程不会被删除。确定要删除吗？',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm && ruleId) {
          dispatch({ type: 'DELETE_RULE', payload: ruleId });
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 800);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.formCard}>
        <View className={styles.sectionTitle}>基本信息</View>

        <View className={styles.formItem}>
          <View className={styles.label}>规则名称<Text className={styles.required}>*</Text></View>
          <Input
            className={styles.input}
            placeholder="如：周一三下午基础班"
            placeholderStyle="color: #6B5B4F"
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>课程名称<Text className={styles.required}>*</Text></View>
          <Input
            className={styles.input}
            placeholder="请输入课程名称"
            placeholderStyle="color: #6B5B4F"
            value={courseTitle}
            onInput={(e) => setCourseTitle(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>课程类型</View>
          <View className={styles.typeSelector}>
            {courseTypes.map(t => (
              <View
                key={t.key}
                className={`${styles.typeItem} ${courseType === t.key ? styles.selected : ''}`}
                onClick={() => setCourseType(t.key)}
              >
                {t.label}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>授课老师<Text className={styles.required}>*</Text></View>
          <Input
            className={styles.input}
            placeholder="请输入授课老师姓名"
            placeholderStyle="color: #6B5B4F"
            value={instructor}
            onInput={(e) => setInstructor(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.sectionTitle}>排课周期</View>

        <View className={styles.formItem}>
          <View className={styles.label}>上课日<Text className={styles.required}>*</Text></View>
          <View className={styles.weekdaySelector}>
            {weekdayNames.map((name, idx) => (
              <View
                key={idx}
                className={`${styles.weekdayItem} ${weekdays.includes(idx) ? styles.selected : ''}`}
                onClick={() => toggleWeekday(idx)}
              >
                {name}
              </View>
            ))}
          </View>
          {weekdays.length > 0 && (
            <View style={{ marginTop: '16rpx', fontSize: '24rpx', color: '#A08060' }}>
              已选: {weekdays.map(d => getWeekdayName(d)).join('、')}
            </View>
          )}
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>上课时间</View>
          <View className={styles.rowInput}>
            <Input
              className={styles.input}
              placeholder="开始时间"
              placeholderStyle="color: #6B5B4F"
              value={startTime}
              onInput={(e) => setStartTime(e.detail.value)}
            />
            <Input
              className={styles.input}
              placeholder="结束时间"
              placeholderStyle="color: #6B5B4F"
              value={endTime}
              onInput={(e) => setEndTime(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>生效日期</View>
          <View className={styles.rowInput}>
            <Input
              className={styles.input}
              placeholder="开始日期"
              placeholderStyle="color: #6B5B4F"
              value={startDate}
              onInput={(e) => setStartDate(e.detail.value)}
            />
            <Input
              className={styles.input}
              placeholder="结束日期"
              placeholderStyle="color: #6B5B4F"
              value={endDate}
              onInput={(e) => setEndDate(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.sectionTitle}>其他设置</View>

        <View className={styles.formItem}>
          <View className={styles.label}>操作台</View>
          <Input
            className={styles.input}
            placeholder="操作台名称"
            placeholderStyle="color: #6B5B4F"
            value={selectedStation?.name || ''}
            onClick={() => {
              const stationNames = state.stations.filter(s => s.status === 'active').map(s => s.name);
              Taro.showActionSheet({
                itemList: stationNames,
                success: (res) => {
                  const selected = state.stations.filter(s => s.status === 'active')[res.tapIndex];
                  if (selected) setStationId(selected.id);
                }
              });
            }}
          />
        </View>

        <View className={styles.formItem}>
          <View className={styles.label}>人数上限</View>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入最大学员数"
            placeholderStyle="color: #6B5B4F"
            value={maxStudents}
            onInput={(e) => setMaxStudents(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <View className={styles.switchRow}>
            <View>
              <View className={styles.switchLabel}>启用规则</View>
              <View className={styles.switchDesc}>启用后可用于批量生成排课</View>
            </View>
            <View
              className={`${styles.switchBox} ${isActive ? styles.active : ''}`}
              onClick={() => setIsActive(!isActive)}
            >
              <View className={`${styles.switchDot} ${isActive ? styles.active : ''}`}></View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.previewCard}>
        <View className={styles.previewTitle}>📊 生成预览</View>
        <View className={styles.previewItem}>
          <View className={styles.previewLabel}>预计每周生成</View>
          <View className={styles.previewValue}>{weekdays.length} 节</View>
        </View>
        <View className={styles.previewItem}>
          <View className={styles.previewLabel}>4周课程数</View>
          <View className={styles.previewValue}>{estimatedCount} 节</View>
        </View>
        {existingRule && (
          <View className={styles.previewItem}>
            <View className={styles.previewLabel}>已累计生成</View>
            <View className={styles.previewValue}>{existingRule.totalGenerated} 节</View>
          </View>
        )}
      </View>

      <View className={styles.actionRow}>
        {existingRule && (
          <Button className={styles.btnSecondary} onClick={handleDelete}>删除规则</Button>
        )}
        <Button
          className={styles.btnPrimary}
          onClick={handleSave}
          style={!existingRule ? { gridColumn: '1 / -1' } : {}}
        >
          保存规则
        </Button>
      </View>
    </View>
  );
};

export default RuleDetailPage;
