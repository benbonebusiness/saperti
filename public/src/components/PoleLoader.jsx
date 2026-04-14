import { useEffect, useState } from 'react'

export default function PoleLoader() {
  const [visible, setVisible] = useState([false, false, false, false, false])

  useEffect(() => {
    const timers = [0, 60, 120, 180, 240].map((delay, i) =>
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const segs = ['#1a5ea8','#e0e0e0','#c0392b','#e0e0e0','#1a5ea8','#e0e0e0','#c0392b','#e0e0e0']

  return (
    <div className="pole-loader-overlay">
      <div className="pole-loader">
        {visible.map((v, i) => (
          <div key={i} className={`pole-seg${v ? ' visible' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {segs.map((c, j) => <div key={j} style={{ flex: 1, background: c }} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}