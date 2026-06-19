import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import CourseForm from '@/components/CourseForm';
import { useApp } from '@/store';
import { Course, CourseMaterial, Batch } from '@/types';
import { getCourseTypeText, getCourseStatusText } from '@/components/Card/Tags';

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const courseId = router.params.id;

  const [formVisible, setFormVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [actualMaterials, setActualMaterials] = useState<CourseMaterial[]>([]);

  const course: Course | undefined = useMemo(() => {
    return state.courses.find(c => c.id === courseId);
  }, [state.courses, courseId]);

  useDidShow(() => {
    if (course && course.status !== 'completed') {
      setActualMaterials(
        course.materials.map(m => ({
          ...m,
          actualQty: m.actualQty ?? m.estimatedQty
        }))
      );
    }
  });

  const relatedOutboundRecords = useMemo(() => {
    return state.outboundRecords.filter(r => r.courseId === courseId);
  }, [state.outboundRecords, courseId]);

  if (!course) {
    return (
      <View className={styles.container}>
        <View style={{ padding: '64rpx 32rpx', textAlign: 'center', color: '#A08060' }}>
          未找到该课程信息
        </View>
      </View>
    );
  }

  const handleSignin = (studentName: string, isPresent: boolean) => {
    if (course.status === 'completed' || course.status === 'cancelled') {
      Taro.showToast({ title: '课程已完成/取消，不可签到', icon: 'none' });
      return;
    }
    dispatch({
      type: 'SIGNIN_STUDENT',
      payload: { courseId: course.id, studentName, isPresent }
    });
    Taro.showToast({ title: isPresent ? '已签到' : '已标记缺勤', icon: 'success', duration: 800 });
  };

  const getStudentStatus = (name: string) => {
    if (course.presentStudents.includes(name)) return 'present';
    if (course.absentStudents.includes(name)) return 'absent';
    return 'pending';
  };

  const handleEdit = () => {
    setFormVisible(true);
  };

  const handleCourseConfirm = (updated: Course) => {
    dispatch({ type: 'UPDATE_COURSE', payload: updated });
    setFormVisible(false);
    Taro.showToast({ title: '已更新课程', icon: 'success' });
  };

  const handleCancel = () => {
    if (course.status === 'cancelled') {
      Taro.showToast({ title: '该课程已取消', icon: 'none' });
      return;
    }
    if (course.status === 'completed') {
      Taro.showToast({ title: '已完成课程不能取消', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认取消',
      content: `确定要取消「${course.title}」这节课吗？\n日期: ${course.date} ${course.startTime}-${course.endTime}`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          dispatch({
            type: 'UPDATE_COURSE',
            payload: { ...course, status: 'cancelled' }
          });
          Taro.showToast({ title: '已取消课程', icon: 'success' });
        }
      }
    });
  };

  const handleRestore = () => {
    Taro.showModal({
      title: '恢复课程',
      content: `确定要恢复「${course.title}」吗？`,
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          dispatch({
            type: 'UPDATE_COURSE',
            payload: { ...course, status: 'scheduled' }
          });
          Taro.showToast({ title: '已恢复课程', icon: 'success' });
        }
      }
    });
  };

  const handleOpenCompleteModal = () => {
    if (course.materials.length === 0) {
      Taro.showModal({
        title: '无预设用料',
        content: '该课程未设置预计用料，确认完课后将不扣减库存，是否继续？',
        confirmText: '确认完课',
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm) {
            dispatch({ type: 'COMPLETE_COURSE', payload: { courseId: course.id, materials: [] } });
            Taro.showToast({ title: '课程已完成', icon: 'success' });
          }
        }
      });
      return;
    }
    setActualMaterials(
      course.materials.map(m => ({
        ...m,
        actualQty: m.actualQty ?? m.estimatedQty
      }))
    );
    setCompleteModalVisible(true);
  };

  const checkStockSufficient = (): { sufficient: boolean; insufficient: string[] } => {
    const insufficient: string[] = [];
    for (const m of actualMaterials) {
      const actualQty = m.actualQty ?? m.estimatedQty;
      if (actualQty <= 0) continue;
      const availableBatches: Batch[] = state.batches.filter(b =>
        b.liquorId === m.liquorId
        && (b.status === 'normal' || b.status === 'expiring')
        && b.quantity > 0
      );
      const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalAvailable < actualQty) {
        insufficient.push(`${m.liquorName}(需${actualQty}${m.unit}，库存仅${totalAvailable}${m.unit})`);
      }
    }
    return { sufficient: insufficient.length === 0, insufficient };
  };

  const handleUpdateActualQty = (liquorId: string, qty: number) => {
    setActualMaterials(actualMaterials.map(m =>
      m.liquorId === liquorId ? { ...m, actualQty: Math.max(0, qty) } : m
    ));
  };

  const handleCompleteCourse = () => {
    const { sufficient, insufficient } = checkStockSufficient();
    if (!sufficient) {
      Taro.showModal({
        title: '库存不足',
        content: `以下酒品可用库存不足：\n\n${insufficient.join('\n')}\n\n请先补充库存或调整实际用量。`,
        showCancel: false,
        confirmColor: '#F44336'
      });
      return;
    }
    Taro.showModal({
      title: '确认完成课程',
      content: `完成「${course.title}」后将按先进先出扣减库存：\n${actualMaterials.map(m => `• ${m.liquorName}: ${m.actualQty ?? m.estimatedQty}${m.unit}`).join('\n')}\n\n确认要完成课程吗？`,
      confirmText: '确认完课',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          dispatch({
            type: 'COMPLETE_COURSE',
            payload: {
              courseId: course.id,
              courseName: course.title,
              courseDate: course.date,
              stationName: course.stationName,
              materials: actualMaterials
            }
          });
          setCompleteModalVisible(false);
          Taro.showToast({ title: '课程已完成，库存已扣减', icon: 'success', duration: 2000 });
        }
      }
    });
  };

  const signinRate = course.students.length > 0
    ? Math.round((course.presentStudents.length / course.students.length) * 100)
    : 0;

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.headerCard}>
        <View className={styles.courseTitle}>{course.title}</View>
        <View className={styles.tagRow}>
          <View className={styles.tag}>{getCourseTypeText(course.type)}</View>
          <View className={styles.tag}>{getCourseStatusText(course.status)}</View>
          {course.isGenerated && <View className={styles.tag}>周期生成</View>}
        </View>
      </View>

      <View className={styles.infoCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardIcon}>📅</Text>
          课程信息
        </View>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>上课日期</View>
            <View className={styles.infoValue}>{course.date}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>上课时间</View>
            <View className={styles.infoValue}>{course.startTime} - {course.endTime}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>授课老师</View>
            <View className={styles.infoValue}>{course.instructor}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>操作台</View>
            <View className={styles.infoValue}>{course.stationName}</View>
          </View>
          <View className={styles.infoItem}>
            <View className={styles.infoLabel}>签到情况</View>
            <View className={styles.infoValue}>
              已签{course.presentStudents.length} / 缺勤{course.absentStudents.length} / 共{course.students.length}人
            </View>
          </View>
        </View>

        {course.students.length > 0 && (
          <View className={styles.progressSection}>
            <View className={styles.progressLabel}>签到进度 {signinRate}%</View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${signinRate}%` }} />
            </View>
          </View>
        )}
      </View>

      <View className={styles.infoCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardIcon}>👥</Text>
          学员签到
          {course.status !== 'completed' && course.status !== 'cancelled' && (
            <Text className={styles.tip}>点击学员签到/缺勤</Text>
          )}
        </View>
        {course.students.length === 0 ? (
          <View style={{ color: '#A08060', fontSize: '28rpx', textAlign: 'center', padding: '32rpx 0' }}>
            暂无学员报名
          </View>
        ) : (
          <View className={styles.studentList}>
            {course.students.map((student, idx) => {
              const status = getStudentStatus(student);
              return (
                <View
                  key={idx}
                  className={`${styles.studentChip} ${styles[`student_${status}`]}`}
                  onClick={() => {
                    if (status === 'pending' || status === 'absent') {
                      handleSignin(student, true);
                    } else {
                      Taro.showActionSheet({
                        itemList: ['标记为缺勤', '取消签到（待签到）'],
                        success: (res) => {
                          if (res.tapIndex === 0) handleSignin(student, false);
                          if (res.tapIndex === 1) {
                            dispatch({
                              type: 'UPDATE_COURSE',
                              payload: {
                                ...course,
                                presentStudents: course.presentStudents.filter(s => s !== student),
                                absentStudents: course.absentStudents.filter(s => s !== student)
                              }
                            });
                          }
                        }
                      });
                    }
                  }}
                >
                  <View className={`${styles.studentAvatar} ${styles[`avatar_${status}`]}>{student.charAt(0)}</View>
                  {student}
                  {status === 'present' && <Text className={styles.statusIcon}>✓</Text>}
                  {status === 'absent' && <Text className={styles.statusIcon}>✗</Text>}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {course.materials.length > 0 && (
        <View className={styles.infoCard}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🧪</Text>
            课程用料
            {course.status === 'completed' && <Text className={styles.tip}>已扣减</Text>}
          </View>
          <View className={styles.materialList}>
            {course.materials.map(m => (
              <View key={m.liquorId} className={styles.materialItem}>
                <View className={styles.materialName}>{m.liquorName}</View>
                <View className={styles.materialQty}>
                  预计 {m.estimatedQty}{m.unit}
                  {m.actualQty !== undefined && <Text className={styles.actualQty}> / 实耗 {m.actualQty}{m.unit}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {course.status === 'completed' && relatedOutboundRecords.length > 0 && (
        <View className={styles.infoCard}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📦</Text>
            出库扣减记录
          </View>
          {relatedOutboundRecords.map(r => (
            <View key={r.id} className={styles.recordItem}>
              <View className={styles.recordInfo}>
                <View className={styles.recordTitle}>{r.liquorName} · {r.batchNo}</View>
                <View className={styles.recordDesc}>{r.outboundDate} · FIFO先进先出</View>
              </View>
              <View className={styles.recordQty}>-{r.quantity} {r.unit}</View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.actionRow}>
        {course.status === 'cancelled' ? (
          <Button
            className={styles.btnPrimary}
            onClick={handleRestore}
            style={{ gridColumn: '1 / -1' }}
          >
            恢复课程
          </Button>
        ) : course.status === 'completed' ? (
          <Button
            className={styles.btnPrimary}
            onClick={() => setFormVisible(true)}
            style={{ gridColumn: '1 / -1' }}
          >
            调整排课
          </Button>
        ) : (
          <>
            <Button className={styles.btnSecondary} onClick={handleCancel}>取消课程</Button>
            <Button className={styles.btnEdit} onClick={handleEdit}>调整排课</Button>
            <Button className={styles.btnPrimary} onClick={handleOpenCompleteModal}>确认完课</Button>
          </>
        )}
      </View>

      <CourseForm
        visible={formVisible}
        initialData={course}
        onClose={() => setFormVisible(false)}
        onConfirm={handleCourseConfirm}
      />

      {completeModalVisible && (
        <View className={styles.overlay} onClick={() => setCompleteModalVisible(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation()}>
            <View className={styles.header}>
              <Text className={styles.modalTitle}>确认实际用料</Text>
              <View className={styles.closeBtn} onClick={() => setCompleteModalVisible(false)}>×</View>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.modalTip}>根据实际消耗调整用量，确认后将按FIFO扣减库存</View>
              {actualMaterials.map(m => {
                const actualQty = m.actualQty ?? m.estimatedQty;
                const availableBatches = state.batches.filter(b =>
                  b.liquorId === m.liquorId
                  && (b.status === 'normal' || b.status === 'expiring')
                  && b.quantity > 0
                );
                const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity, 0);
                const isShort = totalAvailable < actualQty;
                return (
                  <View key={m.liquorId} className={styles.materialRow}>
                    <View>
                      <View className={styles.materialName}>{m.liquorName}</View>
                      <View className={`${styles.materialStock} ${isShort ? styles.stockShort : ''}`}>
                        可用库存: {totalAvailable}{m.unit}
                      </View>
                    </View>
                    <View className={styles.qtyControl}>
                      <Button className={styles.qtyBtn} onClick={() => handleUpdateActualQty(m.liquorId, actualQty - 1)}>-</Button>
                      <Input
                        className={styles.qtyInput}
                        type='number'
                        value={String(actualQty)}
                        onInput={(e) => handleUpdateActualQty(m.liquorId, Number(e.detail.value) || 0)}
                      />
                      <Button className={styles.qtyBtn} onClick={() => handleUpdateActualQty(m.liquorId, actualQty + 1)}>+</Button>
                      <Text className={styles.qtyUnit}>{m.unit}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setCompleteModalVisible(false)}>取消</Button>
              <Button className={styles.confirmBtn} onClick={handleCompleteCourse}>确认完课并扣减</Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default CourseDetailPage;
