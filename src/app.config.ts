export default defineAppConfig({
  pages: [
    'pages/schedule/index',
    'pages/cycle/index',
    'pages/inventory/index',
    'pages/outbound/index',
    'pages/mine/index',
    'pages/course-detail/index',
    'pages/rule-detail/index',
    'pages/batch-detail/index',
    'pages/exam-record/index',
    'pages/station/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2C1810',
    navigationBarTitleText: '调酒师培训',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1A0F0A'
  },
  tabBar: {
    color: '#A08060',
    selectedColor: '#D4A574',
    backgroundColor: '#2C1810',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/schedule/index',
        text: '课程排期'
      },
      {
        pagePath: 'pages/cycle/index',
        text: '周期生成'
      },
      {
        pagePath: 'pages/inventory/index',
        text: '基酒库存'
      },
      {
        pagePath: 'pages/outbound/index',
        text: '出库管理'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
