import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockCourses } from '@/data/mockCourse';
import { Course } from '@/types';
import { getCourseTypeText, getCourseStatusText } from '@/components/Card/Tags';

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const courseId = router.params.id;

  const course = mockCourses.find(c => c.id === courseId) || mockCourses[0];

  const handleEdit = () => {
    Taro.showToast({ title: '编辑课程功能开发中', icon: 'none' });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: `确定要取消「${course.title}」这节课吗？`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消课程', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
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
            <View className={styles.infoLabel}>学员人数</View>
            <View className={styles.infoValue}>
              {course.students.length}/{course.maxStudents} 人
              {course.isGenerated && <Text className={styles.generatedBadge}>周期排课</Text>}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.infoCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardIcon}>👥</Text>
          学员名单
        </View>
        {course.students.length === 0 ? (
          <View style={{ color: '#A08060', fontSize: '28rpx', textAlign: 'center', padding: '32rpx 0' }}>
            暂无学员报名
          </View>
        ) : (
          <View className={styles.studentList}>
            {course.students.map((student, idx) => (
              <View key={idx} className={styles.studentChip}>
                <View className={styles.studentAvatar}>{student.charAt(0)}</View>
                {student}
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.btnSecondary} onClick={handleCancel}>取消课程</Button>
        <Button className={styles.btnPrimary} onClick={handleEdit}>调整排课</Button>
      </View>
    </View>
  );
};

export default CourseDetailPage;
