import { useState } from 'react'
import { supabase } from '../lib/supabase'
import BarberPoleLogo from '../components/BarberPoleLogo'

export default function AuthPage({ onAuth }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { data: { display_name: name } }
      })
      if (error) throw error
      setMode('sent')
    } catch (e) {
      const msg = e?.message || e?.error_description || String(e) || ''
      const isNetworkErr =
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('load failed') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('failed to fetch')
      if (isNetworkErr) {
        setError('בעיית חיבור — בדוק אינטרנט ונסה שוב')
      } else if (msg) {
        setError(msg)
      } else {
        setError('שגיאה לא ידועה — נסה שוב')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0' }}>
      <div style={{ background: '#1a1a1a', padding: '1.5rem 1rem 1rem' }}>
        <div className="logo-row">
          <BarberPoleLogo />
          <div>
            <div className="app-name" style={{ color: '#fff' }}>ספר<span className="red-text">ת'י</span></div>
            <div className="tagline">מפת הספרים של ישראל</div>
          </div>
        </div>
      </div>
      <div className="auth-wrap">
        {mode === 'sent' ? (
          <>
            <div className="auth-title">בדוק את האימייל שלך</div>
            <div className="auth-sub">שלחנו לך קישור כניסה ל-{email}</div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setMode('login')}>נסה שוב</button>
          </>
        ) : (
          <>
            <div className="auth-title">{mode === 'login' ? 'כניסה לחשבון' : 'הרשמה'}</div>
            <div className="auth-sub">נשלח לך קישור כניסה מהיר לאימייל</div>
            {mode === 'register' && (
              <>
                <label className="form-lbl">שם מלא</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="השם שלך" style={{ marginBottom: 10 }} />
              </>
            )}
            <label className="form-lbl">אימייל</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 10, direction: 'ltr' }} />
            {error && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'שולח...' : 'שלח קישור כניסה'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888', cursor: 'pointer' }}
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'עדיין אין לך חשבון? הירשם' : 'כבר יש חשבון? כניסה'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
