export function calculateTotalAllocation(budgetItems) {
  return budgetItems.reduce((sum, item) => sum + item.value, 0)
}

export function calculateRemaining(totalBudget, budgetItems) {
  const total = calculateTotalAllocation(budgetItems)
  return totalBudget - total
}

export function isOverBudget(totalBudget, budgetItems) {
  return calculateRemaining(totalBudget, budgetItems) < 0
}

export function validateAllocation(totalBudget, budgetItems) {
  const total = calculateTotalAllocation(budgetItems)
  const remaining = totalBudget - total
  
  return {
    isOver: remaining < 0,
    remaining,
    total,
    totalBudget
  }
}

export function getMaxAllocatableForItem(budgetItems, id, totalBudget) {
  const otherTotal = budgetItems
    .filter(item => item.id !== id)
    .reduce((sum, item) => sum + item.value, 0)
  
  return Math.max(0, totalBudget - otherTotal)
}

export function getMinAllocatableForItem() {
  return 0
}

export function updateBudgetItem(budgetItems, id, newValue) {
  return budgetItems.map(item => 
    item.id === id ? { ...item, value: Math.max(0, newValue) } : item
  )
}

export function tryUpdateBudgetItemWithConstraint(budgetItems, id, newValue, totalBudget) {
  const otherTotal = budgetItems
    .filter(item => item.id !== id)
    .reduce((sum, item) => sum + item.value, 0)
  
  const constrainedValue = Math.max(0, Math.min(newValue, totalBudget - otherTotal))
  
  const willBeOver = otherTotal + newValue > totalBudget
  const constrained = willBeOver || newValue < 0
  
  const updatedItems = budgetItems.map(item => 
    item.id === id ? { ...item, value: constrainedValue } : item
  )
  
  const overAmount = willBeOver ? (otherTotal + newValue - totalBudget) : 0
  
  return {
    updatedItems,
    appliedValue: constrainedValue,
    wasConstrained: constrained,
    wasOverBudget: willBeOver,
    overAmount
  }
}

export function canAddBudgetItem(budgetItems, newItemValue, totalBudget) {
  const currentTotal = calculateTotalAllocation(budgetItems)
  const willBeOver = currentTotal + newItemValue > totalBudget
  
  return {
    canAdd: !willBeOver,
    willBeOver,
    overAmount: willBeOver ? (currentTotal + newItemValue - totalBudget) : 0
  }
}

export function distributeEvenly(totalBudget, count) {
  if (count === 0) return []
  const base = Math.floor(totalBudget / count)
  const remainder = totalBudget % count
  
  const items = []
  for (let i = 0; i < count; i++) {
    items.push(base + (i < remainder ? 1 : 0))
  }
  return items
}

export function createBudgetItem(name, value = 0) {
  return {
    id: Date.now() + Math.random(),
    name,
    value: Math.max(0, value)
  }
}

export function cloneBudgetItems(budgetItems) {
  return budgetItems.map(item => ({ ...item }))
}

export function generateConstraintMessage(type, details = {}) {
  const messages = {
    overBudget: `超出预算约束！超额 ¥${details.overAmount?.toLocaleString() || 0}。已自动调整为允许的最大值。`,
    negativeValue: '预算项金额不能为负数！已自动调整为 0。',
    addItemOverBudget: `添加此项目会超出预算！超额 ¥${details.overAmount?.toLocaleString() || 0}。`,
    maxReached: `已达到该项目可分配的最大值 ¥${details.maxValue?.toLocaleString() || 0}。`,
    constraintInfo: `该项目当前最大可分配：¥${details.maxValue?.toLocaleString() || 0}`
  }
  
  return messages[type] || '预算约束限制'
}
