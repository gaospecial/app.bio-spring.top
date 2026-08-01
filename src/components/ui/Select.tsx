import { SelectHTMLAttributes } from 'react'

interface SelectOption {
  label: string
  value: string | number
}

interface BaseSelectProps {
  label?: string
  options: readonly SelectOption[]
  className?: string
}

interface SingleSelectProps extends BaseSelectProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'multiple'> {
  multiple?: false
}

interface MultiSelectProps extends BaseSelectProps {
  multiple: true
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
  name?: string
  id?: string
}

type SelectProps = SingleSelectProps | MultiSelectProps

function isMulti(props: SelectProps): props is MultiSelectProps {
  return props.multiple === true
}

const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"

export default function Select(props: SelectProps) {
  const { label, options, className = '' } = props

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {isMulti(props) ? (
        <select
          multiple
          value={props.value ?? []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            props.onChange?.(selected)
          }}
          disabled={props.disabled}
          name={props.name}
          id={props.id}
          className={`${selectClass} ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <select
          className={`${selectClass} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
