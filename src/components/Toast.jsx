import { useEffect, useState } from 'react'

let toastFn = null
export function showToast(msg) { toastFn && toastFn(msg) }

export default function Toast() {
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    toastFn = (m) => {
      setMsg(m)
      setTimeout(() => setMsg(null), 2000)
    }
  }, [])

  if (!msg) return null
  return <div className="toast">{msg}</div>
}