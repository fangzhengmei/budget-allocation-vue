<template>
  <div class="status-container">
    <div class="status-header">
      <h3>预算状态</h3>
    </div>
    
    <div class="status-grid">
      <div class="status-item">
        <span class="label">总预算</span>
        <span class="value total">¥{{ totalBudget.toLocaleString() }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">已分配</span>
        <span class="value allocated">¥{{ totalAllocated.toLocaleString() }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">剩余额度</span>
        <span class="value remaining" :class="{ 'over-budget': isOver }">
          ¥{{ remaining.toLocaleString() }}
        </span>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="{ 'over-budget': isOver }"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      <div class="progress-labels">
        <span>0%</span>
        <span>{{ progressPercent.toFixed(1) }}%</span>
        <span>100%</span>
      </div>
    </div>
    
    <div v-if="isOver" class="warning-message">
      <span class="warning-icon">⚠️</span>
      <span>超出预算 ¥{{ Math.abs(remaining).toLocaleString() }}！请调整分配</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calculateTotalAllocation, calculateRemaining, isOverBudget } from '../utils/budgetLogic.js'

const props = defineProps({
  totalBudget: {
    type: Number,
    required: true
  },
  budgetItems: {
    type: Array,
    required: true
  }
})

const totalAllocated = computed(() => calculateTotalAllocation(props.budgetItems))
const remaining = computed(() => calculateRemaining(props.totalBudget, props.budgetItems))
const isOver = computed(() => isOverBudget(props.totalBudget, props.budgetItems))

const progressPercent = computed(() => {
  if (props.totalBudget === 0) return 0
  return (totalAllocated.value / props.totalBudget) * 100
})
</script>

<style scoped>
.status-container {
  width: 100%;
}

.status-header h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 16px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.status-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
}

.value {
  font-size: 1.3rem;
  font-weight: 600;
}

.value.total {
  color: #667eea;
}

.value.allocated {
  color: #333;
}

.value.remaining {
  color: #4CAF50;
}

.value.remaining.over-budget {
  color: #f44336;
}

.progress-bar-container {
  margin-bottom: 16px;
}

.progress-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-fill.over-budget {
  background: linear-gradient(90deg, #ff5252, #ff1744);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.warning-message {
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c62828;
  font-weight: 500;
}

.warning-icon {
  font-size: 1.2rem;
}

@media (max-width: 600px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
