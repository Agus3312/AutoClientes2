import { useState, useCallback, useEffect } from 'react'

const SETTINGS_KEY = 'ac_user_settings'

export function useUserSettings() {
  const [userSettings, setUserSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings))
  }, [userSettings])

  return {
    userSettings,
    setUserSettings,
  }
}