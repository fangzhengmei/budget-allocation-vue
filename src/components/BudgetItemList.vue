<template>
  <div class="list-container">
    <div class="list-header">
      <h2>预算项分配</h2>
      <button @click="showAddForm = true" class="btn-add">
        + 添加项目
      </button>
    </div>
    
    <div v-if="showAddForm" class="add-form">
      <input
        v-model="newItemName"
        type="text"
        placeholder="输入项目名称..."
        @keyup.enter="handleAddItem"
      />
      <input
        v-model.number="newItemValue"
        type="number"
        min="0"
        placeholder="初始金额"
      />
      <button @click="handleAddItem" class="btn-confirm">确认</button>
      <button @click="cancelAdd" class="btn-cancel">取消</button>
    </div>
    
    <div class="items-list">
      <div 
        v-for="item in budgetItems" 
        :key="item.id"
        class="budget-item"
        :class="{ 'item-warning': isItemOverBudget(item) }"
      >
        <div class="item-header">
          <span class="item-name">{{ item.name }}</span>
          <button 
            @click="$emit('remove-item', item.id)"
            class="btn-remove"
            :disabled="budgetItems.length <= 1"
            title="删除"
          >
            ×
          </button>
        </div>
        
        <div class="item-content">
          <div class="slider-container">
            <input
              type="range"
              :value="item.value"
              @input="handleSliderChange(item.id, $event)"
              :min="0"
              :max="totalBudget"
              class="slider"
            />
          </div>
          
          <div class="item-controls">
            <button 
              @click="adjustValue(item.id, -100)"
              class="btn-adjust"
              title="减少 100"
            >
              -100
            </button>
            <button 
              @click="adjustValue(item.id, -10)"
              class="btn-adjust"
              title="减少 10"
            >
              -10
            </button>
            <input
              type="number"
              :value="item.value"
              @input="handleInputChange(item.id, $event)"
              min="0"
              class="value-input"
            />
            <button 
              @click="adjustValue(item.id, 10)"
              class="btn-adjust"
              title="增加 10"
            >
              +10
            </button>
            <button 
              @click="adjustValue(item.id, 100)"
              class="btn-adjust"
              title="增加 100"
            >
              +100
            </button>
          </div>
        </div>
        
        <div class="item-footer">
          <span class="percentage">
            {{ getPercentage(item.value) }}%
          </span>
          <span v-if="isItemOverBudget(item)" class="item-warning-text">
            ⚠️ 此项分配可能导致总额超额
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { calculateTotalAllocation } from '../utils/budgetLogic.js'

const props = defineProps({
  budgetItems: {
    type: Array,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update-item', 'add-item', 'remove-item'])

const showAddForm = ref(false)
const newItemName = ref('')
const newItemValue = ref(0)

function handleSliderChange(id, event) {
  const value = parseInt(event.target.value)
  emit('update-item', id, value)
}

function handleInputChange(id, event) {
  const value = parseInt(event.target.value) || 0
  emit('update-item', id, value)
}

function adjustValue(id, delta) {
  const item = props.budgetItems.find(i => i.id === id)
  if (item) {
    emit('update-item', id, Math.max(0, item.value + delta))
  }
}

function handleAddItem() {
  if (newItemName.value.trim()) {
    emit('add-item', newItemName.value.trim(), newItemValue.value)
    newItemName.value = ''
    newItemValue.value = 0
    showAddForm.value = false
  }
}

function cancelAdd() {
  showAddForm.value = false
  newItemName.value = ''
  newItemValue.value = 0
}

function isItemOverBudget(item) {
  const otherTotal = calculateTotalAllocation(props.budgetItems) - item.value
  return otherTotal + item.value > props.totalBudget
}

function getPercentage(value) {
  if (props.totalBudget === 0) return 0
  return ((value / props.totalBudget) * 100).toFixed(1)
}
</script>

<style scoped>
.list-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  font-size: 1.2rem;
  color: #333;
}

.btn-add {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #5a6fd1;
}

.add-form {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.add-form input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.add-form input[type="text"] {
  flex: 1;
  min-width: 150px;
}

.add-form input[type="number"] {
  width: 100px;
}

.btn-confirm, .btn-cancel {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-confirm {
  background: #4CAF50;
  color: white;
}

.btn-confirm:hover {
  background: #45a049;
}

.btn-cancel {
  background: #757575;
  color: white;
}

.btn-cancel:hover {
  background: #616161;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.budget-item {
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s;
}

.budget-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.budget-item.item-warning {
  border-color: #ffcdd2;
  background: #fff5f5;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #ff5252;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-remove:hover:not(:disabled) {
  background: #ff1744;
  transform: scale(1.1);
}

.btn-remove:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-container {
  width: 100%;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-adjust {
  padding: 6px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-adjust:hover {
  background: #bbdefb;
}

.value-input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.value-input:focus {
  outline: none;
  border-color: #667eea;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.percentage {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.item-warning-text {
  font-size: 0.85rem;
  color: #f44336;
  font-weight: 500;
}
</style>
