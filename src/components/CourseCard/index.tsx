import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Course } from '@/types';
import { Tag, getCourseTypeText, getCourseStatusText } from '../Card/Tags';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit }) => {
  const handleDetail = (e) => {
    e.stopPropagation();
    Taro.navigateTo({
      url: `/pages/course-detail/index?id=${course.id}`
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(course);
    }
  };

  const getStatusClass = () => {
    switch (course.status) {
      case 'scheduled': return styles.statusScheduled;
      case 'ongoing': return styles.statusOngoing;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const signinRate = course.students.length > 0
    ? Math.round((course.presentStudents.length / course.students.length) * 100)
    : 0;

  return (
    <View className={`${styles.card} ${getStatusClass()}`}>
      <View className={styles.header}>
        <View className={styles.titleSection}>
          <View className={styles.title}>{course.title}</View>
          <View className={styles.tagRow}>
            <Tag text={getCourseTypeText(course.type)} type={course.type} />
            <Tag text={getCourseStatusText(course.status)} type={course.status} />
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.infoRow}>
          <Text className={styles.infoText}>📅 {course.date} {course.startTime}-{course.endTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoText}>📍 {course.stationName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoText}>👨‍🏫 {course.instructor}</Text>
        </View>
      </View>

      <View className={styles.signinRow}>
        <View className={styles.signinInfo}>
          <Text className={styles.signinLabel}>签到</Text>
          <Text className={styles.signinValue}>
            {course.presentStudents.length}/{course.students.length}
            {course.absentStudents.length > 0 && (
              <Text className={styles.absentBadge}> 缺勤{course.absentStudents.length}</Text>
            )}
          </Text>
        </View>
        {course.students.length > 0 && course.status !== 'completed' && course.status !== 'cancelled' && (
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${signinRate}%` }} />
          </View>
        )}
        {course.status === 'completed' && course.materials.length > 0 && (
          <View className={styles.materialHint}>
            🧪 消耗 {course.materials.reduce((sum, m) => sum + (m.actualQty ?? m.estimatedQty), 0)} 件
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.students}>
          学员 {course.students.length}/{course.maxStudents}人
        </View>
        <View className={styles.actionRow}>
          <Button className={styles.btnEdit} onClick={handleEdit}>调整排课</Button>
          <Button className={styles.btnDetail} onClick={handleDetail}>查看详情 →</Button>
        </View>
      </View>
    </View>
  );
};

export default CourseCard;
