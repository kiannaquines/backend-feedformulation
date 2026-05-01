import { cn } from '@/lib/utils'

export function Icon({ name, size = 24, style = {}, className = '', color }) {
  return (
    <span 
      className={cn('material-symbols-outlined', className)}
      style={{
        fontSize: size,
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...style
      }}
    >
      {name}
    </span>
  )
}

