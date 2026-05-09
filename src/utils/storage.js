const STORAGE_KEY = 'budget-allocation-app'

export function saveToLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (error) {
    console.error('保存到本地存储失败:', error)
    return false
  }
}

export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('从本地存储加载失败:', error)
    return null
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清除本地存储失败:', error)
    return false
  }
}

export function addToHistory(history, newEntry, maxHistory = 50) {
  const updatedHistory = [
    {
      ...newEntry,
      timestamp: Date.now()
    },
    ...history
  ]
  
  return updatedHistory.slice(0, maxHistory)
}

export function restoreFromHistory(history, index) {
  if (index >= 0 && index < history.length) {
    return history[index]
  }
  return null
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
