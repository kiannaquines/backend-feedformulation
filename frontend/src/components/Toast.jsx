import { useEffect, useState } from 'react'
import { Icon } from './Icon'

const ICONS = {
  success: <Icon name="check_circle" size={18}/>,
  error:   <Icon name="cancel" size={18}/>,
  info:    <Icon name="info" size={18}/>,
  warning: <Icon name="warning" size={18}/>,
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={`alert alert-${type}`} style={{ position: 'relative' }}>
      {ICONS[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: .7 }}
      >
        <Icon name="close" size={15}/>
      </button>
    </div>
  )
}

/* ── Toast container hook ────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = (message, type = 'info') =>
    setToasts(t => [...t, { id: Date.now(), message, type }])

  const remove = id => setToasts(t => t.filter(x => x.id !== id))

  const ToastContainer = () => (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, minWidth: 300, maxWidth: 400,
    }}>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)}/>
      ))}
    </div>
  )

  return { toast, ToastContainer }
}
