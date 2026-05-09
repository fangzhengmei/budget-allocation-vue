<template>
  <div class="settings-card">
    <h2>预算设置</h2>
    <div class="input-group">
      <label for="totalBudget">总预算额度</label>
      <div class="input-wrapper">
        <span class="currency">¥</span>
        <input
          id="totalBudget"
          type="number"
          :value="totalBudget"
          @input="handleInput"
          min="0"
          step="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  totalBudget: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update-total'])

function handleInput(event) {
  const value = parseInt(event.target.value) || 0
  emit('update-total', value)
}
</script>

<style scoped>
.settings-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-card h2 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-group label {
  font-weight: 500;
  color: #555;
  white-space: nowrap;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.currency {
  font-size: 1.2rem;
  color: #666;
  margin-right: 8px;
}

input[type="number"] {
  flex: 1;
  padding: 12px 16px;
  font-size: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
</style>
