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

export function updateBudgetItem(budgetItems, id, newValue) {
  return budgetItems.map(item => 
    item.id === id ? { ...item, value: Math.max(0, newValue) } : item
  )
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
