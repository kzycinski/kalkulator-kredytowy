import { useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface NumericInputProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  className,
  'aria-label': ariaLabel,
}: NumericInputProps) {
  const [raw, setRaw] = useState('')
  const [focused, setFocused] = useState(false)
  const dirtyRef = useRef(false)

  function handleFocus() {
    setRaw(Number.isFinite(value) ? String(value) : '')
    setFocused(true)
    dirtyRef.current = false
  }

  function handleBlur() {
    setFocused(false)
    if (!dirtyRef.current) return
    const parsed = parseFloat(raw)
    if (Number.isFinite(parsed)) onChange(parsed)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    dirtyRef.current = true
    const next = e.target.value
    setRaw(next)
    const parsed = parseFloat(next)
    if (Number.isFinite(parsed)) onChange(parsed)
  }

  return (
    <input
      type="number"
      value={focused ? raw : (Number.isFinite(value) ? value : '')}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={ariaLabel}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={cn(className)}
    />
  )
}
