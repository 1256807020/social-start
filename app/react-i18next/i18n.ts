// i18next 初始化（客户端实例）。react-i18next 用 initReactI18next 把实例接进 React context。
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      translation: {
        title: '待办列表（react-i18next）',
        add: '新增',
        refresh: '刷新',
        newPlaceholder: '新待办标题',
        edit: '改',
        delete: '删',
        save: '保存',
        prev: '上一页',
        next: '下一页',
        total: '共',
        switchLang: '切换语言',
        done: '已完成',
        undone: '未完成',
      },
    },
    en: {
      translation: {
        title: 'Todo List (react-i18next)',
        add: 'Add',
        refresh: 'Refresh',
        newPlaceholder: 'New todo title',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        prev: 'Prev',
        next: 'Next',
        total: 'Total',
        switchLang: 'Switch Language',
        done: 'Done',
        undone: 'Undone',
      },
    },
  },
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
