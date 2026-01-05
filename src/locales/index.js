import { createI18n } from 'vue-i18n'
import vi from './vi'
import en from './en'

// Get locale from localStorage or default to 'vi'
const savedLocale = localStorage.getItem('locale') || 'vi'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: savedLocale,
  fallbackLocale: 'vi',
  messages: {
    vi,
    en,
  },
})

export default i18n
