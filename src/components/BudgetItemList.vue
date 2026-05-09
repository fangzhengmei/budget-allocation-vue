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
        :class="{ 'item-warning': isOverBudget }"
      >
        <div class="item-header">
          <span class="item-name">{{ item.name }}</span>
          <div class="item-header-right">
            <span class="constraint-info">
              最大可分配: ¥{{ getMaxAllocatable(item.id).toLocaleString() }}
            </span>
            <button 
              @click="$emit('remove-item', item.id)"
              class="btn-remove"
              :disabled="budgetItems.length <= 1"
              title="删除"
            >
              ×
            </button>
          </div>
        </div>
        
        <div class="item-content">
          <div class="slider-container">
            <input
              type="range"
              :value="item.value"
              @input="handleSliderChange(item.id, $event)"
              @change="handleSliderChangeEnd(item.id, $event)"
              :min="0"
              :max="totalBudget"
              class="slider"
            />
            <div class="slider-labels">
              <span class="slider-min">¥0</span>
              <span class="slider-current">¥{{ item.value.toLocaleString() }}</span>
              <span class="slider-max">¥{{ getMaxAllocatable(item.id).toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="item-controls">
            <button 
              @click="adjustValue(item.id, -100)"
              class="btn-adjust"
              :disabled="item.value < 100"
              title="减少 100"
            >
              -100
            </button>
            <button 
              @click="adjustValue(item.id, -10)"
              class="btn-adjust"
              :disabled="item.value < 10"
              title="减少 10"
            >
              -10
            </button>
            <input
              type="number"
              :value="item.value"
              @input="handleInputChange(item.id, $event)"
              @blur="handleInputBlur(item.id, $event)"
              @keyup.enter="handleInputBlur(item.id, $event)"
              min="0"
              :max="getMaxAllocatable(item.id)"
              class="value-input"
              :class="{ 'input-error': itemErrorStates[item.id] }"
            />
            <button 
              @click="adjustValue(item.id, 10)"
              class="btn-adjust"
              :disabled="item.value + 10 > getMaxAllocatable(item.id)"
              title="增加 10"
            >
              +10
            </button>
            <button 
              @click="adjustValue(item.id, 100)"
              class="btn-adjust"
              :disabled="item.value + 100 > getMaxAllocatable(item.id)"
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
          <span v-if="itemErrorStates[item.id]" class="item-error-text">
            ⚠️ {{ itemErrorStates[item.id] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  calculateTotalAllocation, 
  getMaxAllocatableForItem,
  tryUpdateBudgetItemWithConstraint,
  generateConstraintMessage
} from '../utils/budgetLogic.js'

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

const emit = defineEmits(['update-item', 'add-item', 'remove-item', 'show-message'])

const showAddForm = ref(false)
const newItemName = ref('')
const newItemValue = ref(0)
const itemErrorStates = reactive({})
const cachedValues = reactive({})

const isOverBudget = computed(() => {
  const total = calculateTotalAllocation(props.budgetItems)
  return total > props.totalBudget
})

function getMaxAllocatable(id) {
  return getMaxAllocatableForItem(props.budgetItems, id, props.totalBudget)
}

function getPercentage(value) {
  if (props.totalBudget === 0) return 0
  return ((value / props.totalBudget) * 100).toFixed(1)
}

function clearItemError(id) {
  if (itemErrorStates[id]) {
    delete itemErrorStates[id]
  }
}

function setItemError(id, message) {
  itemErrorStates[id] = message
}

function handleSliderChange(id, event) {
  const value = parseInt(event.target.value)
  const maxValue = getMaxAllocatable(id)
  
  if (value > maxValue) {
    event.target.value = maxValue
    cachedValues[id] = maxValue
  } else {
    cachedValues[id] = value
  }
  
  emit('update-item', id, parseInt(event.target.value))
}

function handleSliderChangeEnd(id, event) {
  const value = parseInt(event.target.value)
  const maxValue = getMaxAllocatable(id)
  
  if (value > maxValue) {
    const overAmount = value - maxValue
    event.target.value = maxValue
    emit('update-item', id, maxValue)
    emit('show-message', 
      generateConstraintMessage('overBudget', { overAmount }), 
      'warning'
    )
  }
  clearItemError(id)
}

function handleInputChange(id, event) {
  const value = parseInt(event.target.value)
  cachedValues[id] = value
}

function handleInputBlur(id, event) {
  const rawValue = event.target.value
  const value = parseInt(rawValue)
  
  if (isNaN(value)) {
    const item = props.budgetItems.find(i => i.id === id)
    event.target.value = item?.value || 0
    setItemError(id, '请输入有效的数字')
    emit('show-message', '请输入有效的数字', 'warning')
    return
  }
  
  const maxValue = getMaxAllocatable(id)
  const item = props.budgetItems.find(i => i.id === id)
  
  if (value < 0) {
    event.target.value = 0
    emit('update-item', id, 0)
    setItemError(id, '金额不能为负数')
    emit('show-message', 
      generateConstraintMessage('negativeValue'), 
      'warning'
    )
  } else if (value > maxValue) {
    const overAmount = value - maxValue
    event.target.value = maxValue
    emit('update-item', id, maxValue)
    setItemError(id, `超出最大可分配额度 ¥${maxValue.toLocaleString()}`)
    emit('show-message', 
      generateConstraintMessage('overBudget', { overAmount }), 
      'warning'
    )
  } else {
    event.target.value = value
    emit('update-item', id, value)
    clearItemError(id)
  }
}

function adjustValue(id, delta) {
  const item = props.budgetItems.find(i => i.id === id)
  if (!item) return
  
  const maxValue = getMaxAllocatable(id)
  let newValue = item.value + delta
  
  if (delta > 0 && newValue > maxValue) {
    const overAmount = newValue - maxValue
    newValue = maxValue
    emit('update-item', id, newValue)
    emit('show-message', 
      generateConstraintMessage('overBudget', { overAmount }), 
      'warning'
    )
    setItemError(id, generateConstraintMessage('maxReached', { maxValue }))
  } else if (delta < 0 && newValue < 0) {
    newValue = 0
    emit('update-item', id, newValue)
    setItemError(id, '金额不能为负数')
    emit('show-message', 
      generateConstraintMessage('negativeValue'), 
      'warning'
    )
  } else {
    emit('update-item', id, newValue)
    clearItemError(id)
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

.item-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.constraint-info {
  font-size: 0.85rem;
  color: #666;
  background: #e3f2fd;
  padding: 4px 10px;
  border-radius: 12px;
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
  background: linear-gradient(90deg, #e0e0e0 0%, #e0e0e0 100%);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #666;
}

.slider-current {
  font-weight: 600;
  color: #667eea;
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

.btn-adjust:hover:not(:disabled) {
  background: #bbdefb;
}

.btn-adjust:disabled {
  background: #f5f5f5;
  color: #bdbdbd;
  border-color: #e0e0e0;
  cursor: not-allowed;
}

.value-input {
  width: 100px;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.2s;
}

.value-input:focus {
  outline: none;
  border-color: #667eea;
}

.value-input.input-error {
  border-color: #f44336;
  background: #ffebee;
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

.item-error-text {
  font-size: 0.85rem;
  color: #f44336;
  font-weight: 500;
}
</style>
