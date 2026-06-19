import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CalendarView from '@/components/CalendarView';
import CourseCard from '@/components/CourseCard';
import CourseForm from '@/components/CourseForm';
import { useApp } from '@/store';
import { Course } from '@/types';
import { today, formatDate } from '@/utils/date';

type TabType = 'today' | 'week' | 'all';

const SchedulePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date().toISOString()));
  const [formVisible, setFormVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const todayStr = today();
  const courses = state.courses;
  const stations = state.stations;

  const courseDates = useMemo(() => {
    return [...new Set(courses.filter(c => c.status !== 'cancelled').map(c => c.date))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return courses.filter(c => c.date === selectedDate);
      case 'week': {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return courses.filter(c => {
          const d = new Date(c.date);
          return d >= weekStart && d <= weekEnd;
        }).sort((a, b) => a.date.localeCompare(b.date));
      }
      case 'all':
        return courses.sort((a, b) => a.date.localeCompare(b.date));
      default:
        return courses;
    }
  }, [courses, activeTab, selectedDate]);

  const todayCourses = courses.filter(c => c.date === todayStr);
  const weekCoursesCount = useMemo(() => {
    const weekStart = new Date(todayStr);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return courses.filter(c => {
      const d = new Date(c.date);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }, [courses, todayStr]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormVisible(true);
  };

  const handleCourseConfirm = (course: Course) => {
    if (editingCourse) {
      dispatch({ type: 'UPDATE_COURSE', payload: course });
      Taro.showToast({ title: '已更新课程', icon: 'success' });
    } else {
      dispatch({ type: 'ADD_COURSE', payload: course });
      Taro.showToast({ title: '已新增课程', icon: 'success' });
    }
    setFormVisible(false);
    setEditingCourse(null);
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setActiveTab('today');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormVisible(true);
  };

  return (
    <ScrollView className={styles.container} scrollY onRefresh={handleRefresh} refresherEnabled>
      <View className={styles.header}>
        <View>
          <View className={styles.title}>课程排期</View>
          <View className={styles.subtitle}>{selectedDate}</View>
        </View>
        <Button className={styles.addBtn} onClick={handleAddCourse}>+ 新增</Button>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{todayCourses.length}</View>
          <View className={styles.statLabel}>今日课程</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{weekCoursesCount}</View>
          <View className={styles.statLabel}>本周课程</View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statValue}>{stations.filter(s => s.status === 'active').length}</View>
          <View className={styles.statLabel}>可用操作台</View>
        </View>
      </View>

      <CalendarView
        selectedDate={selectedDate}
        onSelect={handleSelectDate}
        courseDates={courseDates}
      />

      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'today' ? styles.active : ''}`}
          onClick={() => setActiveTab('today')}
        >
          当日
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'week' ? styles.active : ''}`}
          onClick={() => setActiveTab('week')}
        >
          本周
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          全部
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>课程列表</Text>
        <Text className={styles.countBadge}>共 {filteredCourses.length} 节</Text>
      </View>

      {filteredCourses.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📭</View>
          <View className={styles.emptyText}>暂无课程安排</View>
        </View>
      ) : (
        filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} onEdit={handleEditCourse} />
        ))
      )}

      <CourseForm
        visible={formVisible}
        initialData={editingCourse}
        defaultDate={selectedDate}
        onClose={() => {
          setFormVisible(false);
          setEditingCourse(null);
        }}
        onConfirm={handleCourseConfirm}
      />
    </ScrollView>
  );
};

export default SchedulePage;
