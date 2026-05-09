<template>
  <div class="app-container">
    <header class="app-header">
      <h1>预算分配管理</h1>
      <p class="subtitle">在总额约束下自由分配各项预算</p>
    </header>

    <div class="main-content">
      <div class="left-panel">
        <BudgetSettings
          :total-budget="totalBudget"
          @update-total="handleUpdateTotalBudget"
        />
        
        <div class="status-card">
          <BudgetStatus
            :total-budget="totalBudget"
            :budget-items="budgetItems"
          />
        </div>

        <BudgetItemList
          :budget-items="budgetItems"
          :total-budget="totalBudget"
          @update-item="handleUpdateItem"
          @add-item="handleAddItem"
          @remove-item="handleRemoveItem"
        />

        <div class="action-buttons">
          <button @click="saveState" class="btn btn-primary">
            保存到本地
          </button>
          <button @click="loadState" class="btn btn-secondary">
            从本地恢复
          </button>
          <button @click="resetToDefaults" class="btn btn-danger">
            重置
          </button>
        </div>
      </div>

      <div class="right-panel">
        <HistoryPanel
          :history="history"
          @restore="handleRestoreHistory"
          @clear="handleClearHistory"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BudgetSettings from './components/BudgetSettings.vue'
import BudgetStatus from './components/BudgetStatus.vue'
import BudgetItemList from './components/BudgetItemList.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import { calculateTotalAllocation, calculateRemaining, createBudgetItem, updateBudgetItem } from './utils/budgetLogic.js'
import { saveToLocalStorage, loadFromLocalStorage, addToHistory } from './utils/storage.js'

const DEFAULT_TOTAL_BUDGET = 1000
const DEFAULT_ITEMS = [
  { id: 1, name: '餐饮', value: 300 },
  { id: 2, name: '交通', value: 200 },
  { id: 3, name: '娱乐', value: 150 },
  { id: 4, name: '购物', value: 250 }
]

const totalBudget = ref(DEFAULT_TOTAL_BUDGET)
const budgetItems = ref(JSON.parse(JSON.stringify(DEFAULT_ITEMS)))
const history = ref([])
const lastSavedState = ref(null)

const currentState = computed(() => ({
  totalBudget: totalBudget.value,
  budgetItems: JSON.parse(JSON.stringify(budgetItems.value))
}))

function handleUpdateTotalBudget(newValue) {
  const oldState = JSON.parse(JSON.stringify(currentState.value))
  totalBudget.value = Math.max(0, newValue)
  maybeAddHistory(oldState)
}

function handleUpdateItem(id, newValue) {
  const oldState = JSON.parse(JSON.stringify(currentState.value))
  budgetItems.value = updateBudgetItem(budgetItems.value, id, newValue)
  maybeAddHistory(oldState)
}

function handleAddItem(name, value = 0) {
  const oldState = JSON.parse(JSON.stringify(currentState.value))
  budgetItems.value.push(createBudgetItem(name, value))
  maybeAddHistory(oldState)
}

function handleRemoveItem(id) {
  if (budgetItems.value.length <= 1) return
  const oldState = JSON.parse(JSON.stringify(currentState.value))
  budgetItems.value = budgetItems.value.filter(item => item.id !== id)
  maybeAddHistory(oldState)
}

function maybeAddHistory(oldState) {
  if (lastSavedState.value && statesEqual(oldState, lastSavedState.value)) {
    return
  }
  
  history.value = addToHistory(history.value, oldState)
  lastSavedState.value = JSON.parse(JSON.stringify(currentState.value))
}

function statesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function saveState() {
  const saved = saveToLocalStorage(currentState.value)
  if (saved) {
    alert('保存成功！')
  }
}

function loadState() {
  const data = loadFromLocalStorage()
  if (data) {
    const oldState = JSON.parse(JSON.stringify(currentState.value))
    totalBudget.value = data.totalBudget
    budgetItems.value = data.budgetItems
    maybeAddHistory(oldState)
    alert('恢复成功！')
  } else {
    alert('没有找到已保存的数据')
  }
}

function resetToDefaults() {
  const oldState = JSON.parse(JSON.stringify(currentState.value))
  totalBudget.value = DEFAULT_TOTAL_BUDGET
  budgetItems.value = JSON.parse(JSON.stringify(DEFAULT_ITEMS))
  maybeAddHistory(oldState)
}

function handleRestoreHistory(index) {
  const entry = history.value[index]
  if (entry) {
    const oldState = JSON.parse(JSON.stringify(currentState.value))
    totalBudget.value = entry.totalBudget
    budgetItems.value = JSON.parse(JSON.stringify(entry.budgetItems))
    maybeAddHistory(oldState)
  }
}

function handleClearHistory() {
  history.value = []
}

onMounted(() => {
  lastSavedState.value = JSON.parse(JSON.stringify(currentState.value))
})
</script>

<style scoped>
.app-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 40px;
  text-align: center;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subtitle {
  opacity: 0.9;
  font-size: 1rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  padding: 30px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
}

.status-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
