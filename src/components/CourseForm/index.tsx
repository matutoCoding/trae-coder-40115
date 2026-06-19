import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Course, CourseMaterial, Liquor } from '@/types';
import { useApp } from '@/store';
import { generateId } from '@/utils/storage';
import { formatDate, today } from '@/utils/date';

interface Props {
  visible: boolean;
  initialData?: Course | null;
  defaultDate?: string;
  onClose: () => void;
  onConfirm: (course: Course) => void;
}

const CourseForm: React.FC<Props> = ({ visible, initialData, defaultDate, onClose, onConfirm }) => {
  const { state } = useApp();
  const isEdit = !!initialData;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<Course['type']>('basic');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState(formatDate(new Date().toISOString()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [stationId, setStationId] = useState(state.stations[0]?.id || '');
  const [maxStudents, setMaxStudents] = useState(4);
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [conflictError, setConflictError] = useState('');

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
        setMaxStudents(initialData.maxStudents);
        setNotes(initialData.notes || '');
        setMaterials(initialData.materials ? JSON.parse(JSON.stringify(initialData.materials)) : []);
      } else {
        setTitle('');
        setType('basic');
        setInstructor('');
        setDate(defaultDate || formatDate(new Date().toISOString()));
        setStartTime('09:00');
        setEndTime('11:00');
        setStationId(state.stations[0]?.id || '');
        setMaxStudents(4);
        setNotes('');
        setMaterials([]);
      }
      setTimeError('');
      setConflictError('');
    }
  }, [visible, initialData, defaultDate, state.stations]);

  const stationName = state.stations.find(s => s.id === stationId)?.name || '';

  const validateTime = (): boolean => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin <= startMin) {
      setTimeError('结束时间必须晚于开始时间');
      return false;
    }
    if (endMin - startMin < 30) {
      setTimeError('课程时长至少30分钟');
      return false;
    }
    setTimeError('');
    return true;
  };

  const hasConflict = (): string => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    const conflict = state.courses.find(c => {
      if (initialData && c.id === initialData.id) return false;
      if (c.stationId !== stationId) return false;
      if (c.date !== date) return false;
      if (c.status === 'cancelled') return false;
      const [cH1, cM1] = c.startTime.split(':').map(Number);
      const [cH2, cM2] = c.endTime.split(':').map(Number);
      const cStart = cH1 * 60 + cM1;
      const cEnd = cH2 * 60 + cM2;
      return startMin < cEnd && endMin > cStart;
    });
    return conflict ? `与「${conflict.title}」(${conflict.startTime}-${conflict.endTime}) 冲突` : '';
  };

  useEffect(() => {
    if (visible) validateTime();
  }, [startTime, endTime, visible]);

  useEffect(() => {
    if (visible && !timeError) {
      setConflictError(hasConflict());
    }
  }, [date, stationId, startTime, endTime, visible, state.courses, initialData, timeError]);

  const handleAddMaterial = (liquor: Liquor) => {
    if (materials.find(m => m.liquorId === liquor.id)) {
      Taro.showToast({ title: '该酒品已添加', icon: 'none' });
      return;
    }
    setMaterials([...materials, {
      liquorId: liquor.id,
      liquorName: liquor.name,
      unit: liquor.unit,
      estimatedQty: 1
    }]);
    setMaterialModalVisible(false);
  };

  const handleRemoveMaterial = (liquorId: string) => {
    setMaterials(materials.filter(m => m.liquorId !== liquorId));
  };

  const handleUpdateQty = (liquorId: string, qty: number) => {
    setMaterials(materials.map(m => m.liquorId === liquorId ? { ...m, estimatedQty: Math.max(0, qty) } : m));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入课程名称', icon: 'none' });
      return;
    }
    if (!instructor.trim()) {
      Taro.showToast({ title: '请输入授课老师', icon: 'none' });
      return;
    }
    if (!validateTime()) {
      Taro.showToast({ title: '时间设置无效', icon: 'none' });
      return;
    }
    if (hasConflict()) {
      Taro.showToast({ title: '操作台时段冲突', icon: 'none' });
      return;
    }

    const course: Course = {
      id: initialData?.id || generateId(),
      title: title.trim(),
      type,
      instructor: instructor.trim(),
      date,
      startTime,
      endTime,
      stationId,
      stationName,
      students: initialData?.students || [],
      presentStudents: initialData?.presentStudents || [],
      absentStudents: initialData?.absentStudents || [],
      maxStudents,
      status: initialData?.status || 'scheduled',
      isGenerated: initialData?.isGenerated || false,
      ruleId: initialData?.ruleId,
      notes: notes.trim() || undefined,
      materials,
      completedAt: initialData?.completedAt
    };

    onConfirm(course);
  };

  if (!visible) return null;

  const typeOptions = [
    { key: 'basic', label: '基础课' },
    { key: 'intermediate', label: '进阶课' },
    { key: 'advanced', label: '高级课' },
    { key: 'exam', label: '考核课' }
  ];

  return (
    <View className={styles.overlay} onClick={onClose}>
      <View className={styles.modal} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>{isEdit ? '编辑课程' : '新增课程'}</Text>
          <View className={styles.closeBtn} onClick={onClose}>×</View>
        </View>

        <ScrollView className={styles.body} scrollY>
          <View className={styles.field}>
            <Text className={styles.label}>课程名称 *</Text>
            <Input className={styles.input} placeholder='请输入课程名称' value={title} onInput={(e) => setTitle(e.detail.value)} />
          </View>

          <View className={styles.field}>
            <Text className={styles.label}>课程类型</Text>
            <Picker
              range={typeOptions.map(o => o.label)}
              value={typeOptions.findIndex(o => o.key === type)}
              onChange={(e) => setType(typeOptions[e.detail.value].key as Course['type'])}
            >
              <View className={styles.picker}>
                {typeOptions.find(o => o.key === type)?.label} <Text className={styles.arrow}>▼</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.field}>
            <Text className={styles.label}>授课老师 *</Text>
            <Input className={styles.input} placeholder='请输入老师姓名' value={instructor} onInput={(e) => setInstructor(e.detail.value)} />
          </View>

          <View className={styles.fieldRow}>
            <View className={styles.fieldHalf}>
              <Text className={styles.label}>上课日期</Text>
              <Picker mode='date' value={date} start={today()} onChange={(e) => setDate(e.detail.value)}>
                <View className={styles.picker}>
                  {date} <Text className={styles.arrow}>▼</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.fieldHalf}>
              <Text className={styles.label}>学员上限</Text>
              <Input
                className={styles.input}
                type='number'
                value={String(maxStudents)}
                onInput={(e) => setMaxStudents(Math.max(1, Number(e.detail.value) || 1))}
              />
            </View>
          </View>

          <View className={styles.fieldRow}>
            <View className={styles.fieldHalf}>
              <Text className={styles.label}>开始时间</Text>
              <Picker mode='time' value={startTime} onChange={(e) => setStartTime(e.detail.value)}>
                <View className={styles.picker}>
                  {startTime} <Text className={styles.arrow}>▼</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.fieldHalf}>
              <Text className={styles.label}>结束时间</Text>
              <Picker mode='time' value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
                <View className={`${styles.picker} ${timeError ? styles.pickerError : ''}`}>
                  {endTime} <Text className={styles.arrow}>▼</Text>
                </View>
              </Picker>
            </View>
          </View>
          {timeError && <Text className={styles.errorText}>❌ {timeError}</Text>}

          <View className={styles.field}>
            <Text className={styles.label}>操作台</Text>
            <Picker
              range={state.stations.map(s => s.name)}
              value={state.stations.findIndex(s => s.id === stationId)}
              onChange={(e) => setStationId(state.stations[e.detail.value].id)}
            >
              <View className={`${styles.picker} ${conflictError ? styles.pickerError : ''}`}>
                {stationName} <Text className={styles.arrow}>▼</Text>
              </View>
            </Picker>
          </View>
          {conflictError && <Text className={styles.errorText}>⚠️ 操作台冲突：{conflictError}</Text>}

          <View className={styles.field}>
            <View className={styles.labelRow}>
              <Text className={styles.label}>课程用料（预计消耗）</Text>
              <Button className={styles.addBtnSmall} onClick={() => setMaterialModalVisible(true)}>+ 添加</Button>
            </View>
            {materials.length === 0 ? (
              <View className={styles.emptyHint}>暂未设置用料，可在课程完成后自动按FIFO扣减库存</View>
            ) : (
              materials.map(m => (
                <View key={m.liquorId} className={styles.materialItem}>
                  <View className={styles.materialName}>
                    {m.liquorName}
                    <Text className={styles.materialUnit}>({m.unit})</Text>
                  </View>
                  <View className={styles.qtyControl}>
                    <Button className={styles.qtyBtn} onClick={() => handleUpdateQty(m.liquorId, m.estimatedQty - 1)}>-</Button>
                    <Text className={styles.qtyValue}>{m.estimatedQty}</Text>
                    <Button className={styles.qtyBtn} onClick={() => handleUpdateQty(m.liquorId, m.estimatedQty + 1)}>+</Button>
                  </View>
                  <View className={styles.removeBtn} onClick={() => handleRemoveMaterial(m.liquorId)}>×</View>
                </View>
              ))
            )}
          </View>

          <View className={styles.field}>
            <Text className={styles.label}>备注</Text>
            <Input className={styles.input} placeholder='备注信息（可选）' value={notes} onInput={(e) => setNotes(e.detail.value)} />
          </View>
        </ScrollView>

        <View className={styles.footer}>
          <Button className={styles.cancelBtn} onClick={onClose}>取消</Button>
          <Button
            className={styles.confirmBtn}
            onClick={handleSubmit}
            disabled={!!timeError || !!conflictError}
          >
            {isEdit ? '保存修改' : '确认新增'}
          </Button>
        </View>

        {materialModalVisible && (
          <View className={styles.materialModal} onClick={() => setMaterialModalVisible(false)}>
            <View className={styles.materialModalContent} onClick={e => e.stopPropagation()}>
              <View className={styles.materialModalHeader}>
                <Text>选择基酒/糖浆</Text>
                <View className={styles.closeBtn} onClick={() => setMaterialModalVisible(false)}>×</View>
              </View>
              <ScrollView className={styles.materialList} scrollY>
                {state.liquors.filter(l => l.category === 'base' || l.category === 'syrup').map(l => (
                  <View key={l.id} className={styles.liquorItem} onClick={() => handleAddMaterial(l)}>
                    <View>
                      <View className={styles.liquorName}>{l.name}</View>
                      <View className={styles.liquorMeta}>{l.brand} · {l.spec} · 库存 {l.totalStock}{l.unit}</View>
                    </View>
                    <Text className={styles.arrow}>+</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default CourseForm;
