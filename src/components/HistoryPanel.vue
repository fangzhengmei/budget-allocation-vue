<template>
  <div class="history-panel">
    <div class="panel-header">
      <h3>历史记录</h3>
      <button 
        v-if="history.length > 0"
        @click="$emit('clear')" 
        class="btn-clear"
        title="清空历史"
      >
        清空
      </button>
    </div>
    
    <div v-if="history.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>暂无历史记录</p>
      <p class="empty-hint">修改预算后将自动记录</p>
    </div>
    
    <div v-else class="history-list">
      <div 
        v-for="(entry, index) in history" 
        :key="index"
        class="history-item"
        @click="$emit('restore', index)"
      >
        <div class="item-info">
          <span class="item-time">{{ formatTime(entry.timestamp) }}</span>
          <span class="item-summary">
            总额: ¥{{ entry.totalBudget.toLocaleString() }} | 
            {{ entry.budgetItems.length }} 项
          </span>
        </div>
        <div class="item-details">
          <span 
            v-for="(item, idx) in entry.budgetItems.slice(0, 3)" 
            :key="idx"
            class="detail-tag"
          >
            {{ item.name }}: ¥{{ item.value }}
          </span>
          <span 
            v-if="entry.budgetItems.length > 3" 
            class="detail-tag more"
          >
            +{{ entry.budgetItems.length - 3 }} 项
          </span>
        </div>
        <button class="btn-restore" title="点击恢复此状态">
          ↩ 恢复
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTimestamp } from '../utils/storage.js'

defineProps({
  history: {
    type: Array,
    required: true
  }
})

defineEmits(['restore', 'clear'])

function formatTime(timestamp) {
  return formatTimestamp(timestamp)
}
</script>

<style scoped>
.history-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.panel-header h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.btn-clear {
  padding: 6px 12px;
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.btn-clear:hover {
  background: #ff1744;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 0.85rem;
  color: #bbb;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.history-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.item-time {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.item-summary {
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.detail-tag {
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #555;
}

.detail-tag.more {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.btn-restore {
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-restore:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
