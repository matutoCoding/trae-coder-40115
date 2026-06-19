import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Course } from '@/types';
import { Tag, getCourseTypeText, getCourseStatusText } from '../Card/Tags';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/course-detail/index?id=${course.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
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

      <View className={styles.footer}>
        <View className={styles.students}>
          学员 {course.students.length}/{course.maxStudents}人
        </View>
        <View className={styles.action}>查看详情 →</View>
      </View>
    </View>
  );
};

export default CourseCard;
