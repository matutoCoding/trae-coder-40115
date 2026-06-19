import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Button, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { Course, Station } from '@/types';
import { useApp } from '@/store';
import { generateId } from '@/utils/storage';
import { today } from '@/utils/date';

interface CourseFormProps {
  visible: boolean;
  initialData?: Course | null;
  defaultDate?: string;
  onClose: () => void;
  onConfirm: (course: Course) => void;
}

const courseTypes: { key: Course['type']; label: string }[] = [
  { key: 'basic', label: '基础' },
  { key: 'intermediate', label: '进阶' },
  { key: 'advanced', label: '高级' },
  { key: 'exam', label: '考核' }
];

const CourseForm: React.FC<CourseFormProps> = ({ visible, initialData, defaultDate, onClose, onConfirm }) => {
  const { state } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<Course['type']>('basic');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState(defaultDate || today());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [stationId, setStationId] = useState('');
  const [maxStudents, setMaxStudents] = useState('4');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setType(initialData.type);
        setInstructor(initialData.instructor);
        setDate(initialData.date);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setStationId(initialData.stationId);
        setMaxStudents(String(initialData.maxStudents));
        setEditingId(initialData.id);
      } else {
        setTitle('');
        setType('basic');
        setInstructor('');
        setDate(defaultDate || today());
        setStartTime('09:00');
        setEndTime('11:00');
        setStationId(state.stations[0]?.id || '');
        setMaxStudents('4');
        setEditingId(null);
      }
    }
  }, [visible, initialData, defaultDate, state.stations]);

  const activeStations = useMemo(() => {
    return state.stations.filter(s => s.status === 'active');
  }, [state.stations]);

  const selectedStation = useMemo(() => {
    return state.stations.find(s => s.id === stationId);
  }, [state.stations, stationId]);

  const conflict = useMemo(() => {
    if (!stationId || !date) return null;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    const existing = state.courses.find(c => {
      if (c.id === editingId) return false;
      if (c.stationId !== stationId) return false;
      if (c.date !== date) return false;
      if (c.status === 'cancelled') return false;
      const [cH1, cM1] = c.startTime.split(':').map(Number);
      const [cH2, cM2] = c.endTime.split(':').map(Number);
      const cStart = cH1 * 60 + cM1;
      const cEnd = cH2 * 60 + cM2;
      return startMin < cEnd && endMin > cStart;
    });

    return existing || null;
  }, [state.courses, stationId, date, startTime, endTime, editingId]);

  const canSubmit = title.trim() && instructor.trim() && date && startTime && endTime && stationId && !conflict;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const course: Course = {
      id: editingId || generateId(),
      title: title.trim(),
      type,
      instructor: instructor.trim(),
      date,
      startTime,
      endTime,
      stationId,
      stationName: selectedStation?.name || '',
      students: initialData?.students || [],
      maxStudents: parseInt(maxStudents) || 4,
      status: initialData?.status || 'scheduled',
      isGenerated: initialData?.isGenerated || false,
      ruleId: initialData?.ruleId
    };

    onConfirm(course);
  };

  if (!visible) return null;

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.modalHeader}>
          <View className={styles.modalTitle}>{editingId ? '调整课程' : '新增课程'}</View>
          <View className={styles.closeBtn} onClick={onClose}>×</View>
        </View>

        <ScrollView className={styles.modalBody} scrollY>
          <View className={styles.formItem}>
            <View className={styles.label}>课程名称<Text className={styles.required}>*</Text></View>
            <Input
              className={styles.input}
              placeholder="请输入课程名称"
              placeholderStyle="color: #6B5B4F"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>课程类型</View>
            <View className={styles.typeSelector}>
              {courseTypes.map(t => (
                <View
                  key={t.key}
                  className={`${styles.typeItem} ${type === t.key ? styles.selected : ''}`}
                  onClick={() => setType(t.key)}
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

          <View className={styles.formItem}>
            <View className={styles.label}>上课日期<Text className={styles.required}>*</Text></View>
            <Input
              className={styles.input}
              type="text"
              placeholder="YYYY-MM-DD"
              placeholderStyle="color: #6B5B4F"
              value={date}
              onInput={(e) => setDate(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>上课时间<Text className={styles.required}>*</Text></View>
            <View className={styles.rowInput}>
              <Input
                className={styles.input}
                placeholder="开始时间 HH:mm"
                placeholderStyle="color: #6B5B4F"
                value={startTime}
                onInput={(e) => setStartTime(e.detail.value)}
              />
              <Input
                className={styles.input}
                placeholder="结束时间 HH:mm"
                placeholderStyle="color: #6B5B4F"
                value={endTime}
                onInput={(e) => setEndTime(e.detail.value)}
              />
            </View>
          </View>

          {conflict && (
            <View className={styles.conflictHint}>
              ⚠️ 时间冲突：该操作台此时段已有「{conflict.title}」({conflict.startTime}-{conflict.endTime})
            </View>
          )}

          <View className={styles.formItem}>
            <View className={styles.label}>操作台<Text className={styles.required}>*</Text></View>
            <View className={styles.pickerList}>
              {activeStations.map(s => (
                <View
                  key={s.id}
                  className={`${styles.pickerItem} ${stationId === s.id ? styles.selected : ''}`}
                  onClick={() => setStationId(s.id)}
                >
                  <Text>{s.name} ({s.code}) - {s.location}</Text>
                  {stationId === s.id && <Text className={styles.checkIcon}>✓</Text>}
                </View>
              ))}
              {activeStations.length === 0 && (
                <View className={styles.pickerItem} style={{ color: '#6B5B4F' }}>
                  暂无可用操作台
                </View>
              )}
            </View>
          </View>

          <View className={styles.formItem}>
            <View className={styles.label}>人数上限</View>
            <Input
              className={styles.input}
              type="number"
              placeholder="最多可容纳学员数"
              placeholderStyle="color: #6B5B4F"
              value={maxStudents}
              onInput={(e) => setMaxStudents(e.detail.value)}
            />
          </View>
        </ScrollView>

        <View className={styles.modalFooter}>
          <Button className={styles.btnCancel} onClick={onClose}>取消</Button>
          <Button
            className={`${styles.btnConfirm} ${!canSubmit ? styles.disabled : ''}`}
            onClick={handleSubmit}
          >
            {editingId ? '保存修改' : '确认新增'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CourseForm;
