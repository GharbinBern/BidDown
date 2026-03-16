import { useEffect, useMemo, useRef, useState } from 'react'

export default function CustomDropdown({
  options,
  value,
  onChange,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  caretClassName = '',
  placeholder = 'Select',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selectedLabel = useMemo(() => {
    const match = options.find((option) => option.value === value)
    return match?.label || placeholder
  }, [options, value, placeholder])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className={`app-dropdown ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className={`app-dropdown-trigger ${buttonClassName}`.trim()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedLabel}
        <span className={`app-dropdown-caret ${open ? 'open' : ''} ${caretClassName}`.trim()}>▾</span>
      </button>
      {open && (
        <div className={`app-dropdown-menu ${menuClassName}`.trim()} role="listbox" aria-label="Dropdown options">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`app-dropdown-option ${optionClassName} ${value === option.value ? 'active' : ''}`.trim()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
