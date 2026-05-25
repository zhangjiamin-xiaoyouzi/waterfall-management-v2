"use client"

import { useState, useCallback, useRef } from "react"

interface TimeSlotPickerProps {
  value: string[]
  onChange: (value: string[]) => void
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<'add' | 'remove'>('add')
  const gridRef = useRef<HTMLDivElement>(null)

  const isSelected = (dayKey: string, hour: number) => value.includes(`${dayKey}-${hour}`)

  const toggleSlot = useCallback((dayKey: string, hour: number) => {
    const key = `${dayKey}-${hour}`
    if (value.includes(key)) {
      onChange(value.filter(v => v !== key))
    } else {
      onChange([...value, key])
    }
  }, [value, onChange])

  const handleMouseDown = useCallback((dayKey: string, hour: number, e: React.MouseEvent) => {
    e.preventDefault()
    const key = `${dayKey}-${hour}`
    const selected = value.includes(key)
    setIsDragging(true)
    setDragAction(selected ? 'remove' : 'add')
    if (selected) {
      onChange(value.filter(v => v !== key))
    } else {
      onChange([...value, key])
    }
  }, [value, onChange])

  const handleMouseEnter = useCallback((dayKey: string, hour: number) => {
    if (!isDragging) return
    const key = `${dayKey}-${hour}`
    const selected = value.includes(key)
    if (dragAction === 'add' && !selected) {
      onChange([...value, key])
    } else if (dragAction === 'remove' && selected) {
      onChange(value.filter(v => v !== key))
    }
  }, [isDragging, dragAction, value, onChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const selectAllDays = (days: string[]) => {
    const allSlots: string[] = []
    for (const day of days) {
      for (let h = 0; h < 24; h++) {
        allSlots.push(`${day}-${h}`)
      }
    }
    // Merge with existing - add these slots
    const newValue = [...value]
    for (const slot of allSlots) {
      if (!newValue.includes(slot)) newValue.push(slot)
    }
    onChange(newValue)
  }

  const clearAll = () => {
    const daySlots = new Set(value)
    for (const day of DAY_KEYS) {
      for (let h = 0; h < 24; h++) {
        daySlots.delete(`${day}-${h}`)
      }
    }
    onChange(Array.from(daySlots))
  }

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={gridRef}
    >
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => selectAllDays(DAY_KEYS)}
            className="px-2.5 py-1 text-xs rounded border border-[#E5E6EB] text-[#4E5969] hover:bg-[#F7F8FA] transition-colors"
          >
            全周
          </button>
          <button
            type="button"
            onClick={() => selectAllDays(['mon', 'tue', 'wed', 'thu', 'fri'])}
            className="px-2.5 py-1 text-xs rounded border border-[#E5E6EB] text-[#4E5969] hover:bg-[#F7F8FA] transition-colors"
          >
            周一到周五
          </button>
          <button
            type="button"
            onClick={() => selectAllDays(['sat', 'sun'])}
            className="px-2.5 py-1 text-xs rounded border border-[#E5E6EB] text-[#4E5969] hover:bg-[#F7F8FA] transition-colors"
          >
            周末
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-2.5 py-1 text-xs rounded border border-[#E5E6EB] text-[#4E5969] hover:bg-[#F7F8FA] transition-colors"
          >
            清空
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#86909C]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#0B7CFF]" />
            <span>投放时间</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm border border-[#E5E6EB]" />
            <span>不投放时间</span>
          </div>
        </div>
      </div>

      {/* 小时刻度标题 - 分两段 */}
      <div className="flex mb-0.5">
        <div className="w-[46px] shrink-0" />
        <div className="flex-1 text-center text-[10px] text-[#86909C] font-medium">00:00 - 12:00</div>
        <div className="flex-1 text-center text-[10px] text-[#86909C] font-medium">12:00 - 24:00</div>
      </div>
      <div className="flex mb-1.5">
        <div className="w-[46px] shrink-0" />
        {HOURS.map(hour => (
          <div
            key={hour}
            className="flex-1 text-center text-[9px] text-[#A0A8B4] leading-none"
          >
            {hour}
          </div>
        ))}
      </div>

      {/* 网格主体 */}
      {DAYS.map((day, dayIdx) => (
        <div key={day} className="flex items-center mb-[1px]">
          <div className="w-[46px] shrink-0 text-[11px] text-[#4E5969] pr-2 text-right leading-none">
            {day}
          </div>
          {HOURS.map(hour => {
            const selected = isSelected(DAY_KEYS[dayIdx], hour)
            return (
              <div
                key={hour}
                onMouseDown={(e) => handleMouseDown(DAY_KEYS[dayIdx], hour, e)}
                onMouseEnter={() => handleMouseEnter(DAY_KEYS[dayIdx], hour)}
                className={`flex-1 h-[20px] cursor-pointer border-r border-b border-[#F2F3F5] transition-colors ${selected ? 'bg-[#0B7CFF]' : 'bg-white hover:bg-[#F0F5FF]'}`}
              />
            )
          })}
        </div>
      ))}

      {/* 底部提示 */}
      <div className="text-[10px] text-[#C9CDD4] text-center mt-1">
        可拖动鼠标选择时间段
      </div>
    </div>
  )
}