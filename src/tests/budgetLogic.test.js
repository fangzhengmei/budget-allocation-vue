import { describe, it, expect } from 'vitest'
import {
  calculateTotalAllocation,
  calculateRemaining,
  isOverBudget,
  validateAllocation,
  getMaxAllocatableForItem,
  getMinAllocatableForItem,
  updateBudgetItem,
  tryUpdateBudgetItemWithConstraint,
  canAddBudgetItem,
  distributeEvenly,
  createBudgetItem,
  cloneBudgetItems,
  generateConstraintMessage
} from '../utils/budgetLogic.js'

describe('预算分配核心逻辑', () => {
  describe('calculateTotalAllocation', () => {
    it('应该正确计算多个预算项的总和', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 },
        { id: 3, name: '娱乐', value: 150 }
      ]
      expect(calculateTotalAllocation(items)).toBe(650)
    })

    it('应该正确处理空数组', () => {
      expect(calculateTotalAllocation([])).toBe(0)
    })

    it('应该正确处理单个预算项', () => {
      const items = [{ id: 1, name: '测试', value: 500 }]
      expect(calculateTotalAllocation(items)).toBe(500)
    })

    it('应该正确处理零值预算项', () => {
      const items = [
        { id: 1, name: 'A', value: 0 },
        { id: 2, name: 'B', value: 0 }
      ]
      expect(calculateTotalAllocation(items)).toBe(0)
    })
  })

  describe('calculateRemaining', () => {
    it('应该正确计算剩余预算', () => {
      const totalBudget = 1000
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(calculateRemaining(totalBudget, items)).toBe(500)
    })

    it('应该正确计算超额情况（返回负值）', () => {
      const totalBudget = 500
      const items = [
        { id: 1, name: '餐饮', value: 400 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(calculateRemaining(totalBudget, items)).toBe(-100)
    })

    it('应该正确计算刚好用完的情况', () => {
      const totalBudget = 500
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(calculateRemaining(totalBudget, items)).toBe(0)
    })
  })

  describe('isOverBudget', () => {
    it('应该返回 false 当未超额时', () => {
      const totalBudget = 1000
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(isOverBudget(totalBudget, items)).toBe(false)
    })

    it('应该返回 true 当超额时', () => {
      const totalBudget = 400
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(isOverBudget(totalBudget, items)).toBe(true)
    })

    it('应该返回 false 当刚好用完时', () => {
      const totalBudget = 500
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      expect(isOverBudget(totalBudget, items)).toBe(false)
    })

    it('应该返回 false 当没有预算项时', () => {
      expect(isOverBudget(1000, [])).toBe(false)
    })
  })

  describe('validateAllocation', () => {
    it('应该返回正确的验证信息（未超额）', () => {
      const totalBudget = 1000
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = validateAllocation(totalBudget, items)
      expect(result.isOver).toBe(false)
      expect(result.remaining).toBe(500)
      expect(result.total).toBe(500)
      expect(result.totalBudget).toBe(1000)
    })

    it('应该返回正确的验证信息（超额）', () => {
      const totalBudget = 400
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = validateAllocation(totalBudget, items)
      expect(result.isOver).toBe(true)
      expect(result.remaining).toBe(-100)
      expect(result.total).toBe(500)
      expect(result.totalBudget).toBe(400)
    })

    it('应该返回正确的验证信息（刚好用完）', () => {
      const totalBudget = 500
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = validateAllocation(totalBudget, items)
      expect(result.isOver).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.total).toBe(500)
      expect(result.totalBudget).toBe(500)
    })
  })

  describe('updateBudgetItem', () => {
    it('应该正确更新指定预算项的值', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const updated = updateBudgetItem(items, 2, 250)
      expect(updated[1].value).toBe(250)
      expect(updated[0].value).toBe(300)
    })

    it('应该不修改原始数组', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      updateBudgetItem(items, 2, 250)
      expect(items[1].value).toBe(200)
    })

    it('应该将负值转换为 0', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const updated = updateBudgetItem(items, 2, -100)
      expect(updated[1].value).toBe(0)
    })

    it('当 ID 不存在时应该返回原始数组的副本', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const updated = updateBudgetItem(items, 999, 500)
      expect(updated.length).toBe(2)
      expect(updated[0].value).toBe(300)
      expect(updated[1].value).toBe(200)
    })
  })

  describe('distributeEvenly', () => {
    it('应该平均分配整数预算', () => {
      const result = distributeEvenly(1000, 4)
      expect(result.length).toBe(4)
      expect(result[0]).toBe(250)
      expect(result.reduce((a, b) => a + b, 0)).toBe(1000)
    })

    it('应该正确处理不能整除的情况', () => {
      const result = distributeEvenly(1001, 4)
      expect(result.length).toBe(4)
      expect(result.filter(v => v === 251).length).toBe(1)
      expect(result.filter(v => v === 250).length).toBe(3)
      expect(result.reduce((a, b) => a + b, 0)).toBe(1001)
    })

    it('应该对零项返回空数组', () => {
      expect(distributeEvenly(1000, 0)).toEqual([])
    })

    it('应该正确处理零预算', () => {
      const result = distributeEvenly(0, 4)
      expect(result.length).toBe(4)
      expect(result.every(v => v === 0)).toBe(true)
    })
  })

  describe('createBudgetItem', () => {
    it('应该创建具有正确属性的预算项', () => {
      const item = createBudgetItem('测试项目', 100)
      expect(item.name).toBe('测试项目')
      expect(item.value).toBe(100)
      expect(item.id).toBeDefined()
    })

    it('应该将负值转换为 0', () => {
      const item = createBudgetItem('测试项目', -50)
      expect(item.value).toBe(0)
    })

    it('应该使用默认值 0 当未提供 value', () => {
      const item = createBudgetItem('测试项目')
      expect(item.value).toBe(0)
    })

    it('应该生成唯一的 ID', () => {
      const item1 = createBudgetItem('项目1')
      const item2 = createBudgetItem('项目2')
      expect(item1.id).not.toBe(item2.id)
    })
  })

  describe('cloneBudgetItems', () => {
    it('应该创建预算项数组的深拷贝', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const cloned = cloneBudgetItems(items)
      expect(cloned).not.toBe(items)
      expect(cloned[0]).not.toBe(items[0])
      expect(cloned[1]).not.toBe(items[1])
    })

    it('应该保持所有属性值不变', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const cloned = cloneBudgetItems(items)
      expect(cloned[0].id).toBe(1)
      expect(cloned[0].name).toBe('餐饮')
      expect(cloned[0].value).toBe(300)
      expect(cloned[1].id).toBe(2)
      expect(cloned[1].name).toBe('交通')
      expect(cloned[1].value).toBe(200)
    })

    it('修改克隆数组不应影响原数组', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const cloned = cloneBudgetItems(items)
      cloned[0].value = 999
      expect(items[0].value).toBe(300)
    })

    it('应该正确处理空数组', () => {
      expect(cloneBudgetItems([])).toEqual([])
    })
  })

  describe('getMaxAllocatableForItem', () => {
    it('应该正确计算单个预算项的最大可分配额', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 },
        { id: 3, name: '娱乐', value: 150 }
      ]
      const max = getMaxAllocatableForItem(items, 1, 1000)
      expect(max).toBe(650)
    })

    it('应该正确计算第一个项目的最大可分配额', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const max = getMaxAllocatableForItem(items, 1, 1000)
      expect(max).toBe(800)
    })

    it('应该正确计算最后一个项目的最大可分配额', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const max = getMaxAllocatableForItem(items, 2, 1000)
      expect(max).toBe(700)
    })

    it('当其他项目已占用全部预算时应该返回 0', () => {
      const items = [
        { id: 1, name: '餐饮', value: 600 },
        { id: 2, name: '交通', value: 400 }
      ]
      const max = getMaxAllocatableForItem(items, 1, 1000)
      expect(max).toBe(0)
    })

    it('当其他项目超出预算时应该返回 0', () => {
      const items = [
        { id: 1, name: '餐饮', value: 500 },
        { id: 2, name: '交通', value: 600 }
      ]
      const max = getMaxAllocatableForItem(items, 1, 1000)
      expect(max).toBe(0)
    })
  })

  describe('getMinAllocatableForItem', () => {
    it('应该始终返回 0', () => {
      expect(getMinAllocatableForItem()).toBe(0)
    })
  })

  describe('tryUpdateBudgetItemWithConstraint', () => {
    it('应该正常更新当值在约束范围内', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, 400, 1000)
      expect(result.updatedItems[0].value).toBe(400)
      expect(result.appliedValue).toBe(400)
      expect(result.wasConstrained).toBe(false)
      expect(result.wasOverBudget).toBe(false)
      expect(result.overAmount).toBe(0)
    })

    it('应该自动回退到最大值当超出预算', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 500 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, 600, 1000)
      expect(result.updatedItems[0].value).toBe(500)
      expect(result.appliedValue).toBe(500)
      expect(result.wasConstrained).toBe(true)
      expect(result.wasOverBudget).toBe(true)
      expect(result.overAmount).toBe(100)
    })

    it('应该自动回退到 0 当值为负数', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, -100, 1000)
      expect(result.updatedItems[0].value).toBe(0)
      expect(result.appliedValue).toBe(0)
      expect(result.wasConstrained).toBe(true)
      expect(result.wasOverBudget).toBe(false)
    })

    it('应该不修改其他预算项', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, 400, 1000)
      expect(result.updatedItems[1].value).toBe(200)
    })

    it('应该不修改原始数组', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      tryUpdateBudgetItemWithConstraint(items, 1, 400, 1000)
      expect(items[0].value).toBe(300)
    })

    it('应该正确处理刚好用完预算的情况', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, 800, 1000)
      expect(result.updatedItems[0].value).toBe(800)
      expect(result.wasConstrained).toBe(false)
      expect(result.wasOverBudget).toBe(false)
    })

    it('应该正确处理零预算情况', () => {
      const items = [
        { id: 1, name: '餐饮', value: 0 },
        { id: 2, name: '交通', value: 0 }
      ]
      const result = tryUpdateBudgetItemWithConstraint(items, 1, 100, 0)
      expect(result.updatedItems[0].value).toBe(0)
      expect(result.wasConstrained).toBe(true)
      expect(result.wasOverBudget).toBe(true)
    })
  })

  describe('canAddBudgetItem', () => {
    it('应该返回 true 当添加新项目后不会超出预算', () => {
      const items = [
        { id: 1, name: '餐饮', value: 300 },
        { id: 2, name: '交通', value: 200 }
      ]
      const result = canAddBudgetItem(items, 100, 1000)
      expect(result.canAdd).toBe(true)
      expect(result.willBeOver).toBe(false)
      expect(result.overAmount).toBe(0)
    })

    it('应该返回 false 当添加新项目后会超出预算', () => {
      const items = [
        { id: 1, name: '餐饮', value: 600 },
        { id: 2, name: '交通', value: 300 }
      ]
      const result = canAddBudgetItem(items, 200, 1000)
      expect(result.canAdd).toBe(false)
      expect(result.willBeOver).toBe(true)
      expect(result.overAmount).toBe(100)
    })

    it('应该返回 true 当添加新项目后刚好用完预算', () => {
      const items = [
        { id: 1, name: '餐饮', value: 500 },
        { id: 2, name: '交通', value: 300 }
      ]
      const result = canAddBudgetItem(items, 200, 1000)
      expect(result.canAdd).toBe(true)
      expect(result.willBeOver).toBe(false)
    })

    it('应该正确处理空预算项列表', () => {
      const result = canAddBudgetItem([], 500, 1000)
      expect(result.canAdd).toBe(true)
    })

    it('应该正确处理零值新项目', () => {
      const items = [
        { id: 1, name: '餐饮', value: 1000 }
      ]
      const result = canAddBudgetItem(items, 0, 1000)
      expect(result.canAdd).toBe(true)
    })
  })

  describe('generateConstraintMessage', () => {
    it('应该生成超出预算的提示信息', () => {
      const message = generateConstraintMessage('overBudget', { overAmount: 150 })
      expect(message).toContain('150')
      expect(message).toContain('超出')
    })

    it('应该生成负值的提示信息', () => {
      const message = generateConstraintMessage('negativeValue')
      expect(message).toContain('负数')
      expect(message).toContain('0')
    })

    it('应该生成添加项目超出预算的提示信息', () => {
      const message = generateConstraintMessage('addItemOverBudget', { overAmount: 200 })
      expect(message).toContain('200')
      expect(message).toContain('添加')
    })

    it('应该生成达到最大值的提示信息', () => {
      const message = generateConstraintMessage('maxReached', { maxValue: 500 })
      expect(message).toContain('500')
      expect(message).toContain('最大值')
    })

    it('应该生成约束信息提示', () => {
      const message = generateConstraintMessage('constraintInfo', { maxValue: 300 })
      expect(message).toContain('300')
      expect(message).toContain('最大可分配')
    })

    it('应该返回默认信息当类型不存在', () => {
      const message = generateConstraintMessage('nonexistentType')
      expect(message).toBeDefined()
    })

    it('应该正确处理缺失的 details 参数', () => {
      const message = generateConstraintMessage('overBudget')
      expect(message).toContain('0')
    })
  })
})
