import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../components/Toast'
import BarberPoleLogo from '../components/BarberPoleLogo'

const COLORS = ['#2c3e50','#1a5276','#512e7a','#1e5e38','#7d3c00','#1a4a6e','#4a1a5e']
function getColor(id) {
  const idx = parseInt(id?.replace(/-/g,'').slice(-4), 16) % COLORS.length
  return COLORS[idx] || COLORS[0]
}

export default function HomePage({ onOpenProfile }) {
  const [barbers, setBarbers] = useState([])
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(250)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => { fetchBarbers() }, [])

  async function fetchBarbers() {
    setLoading(true)
    const { data } = await supabase.from('barbers').select('*').order('score', { ascending: false })
    setBarbers(data || [])
    setLoading(false)
  }

  function handleLocation() {
    if (!navigator.geolocation) {
      showToast('הדפדפן לא תומך במיקום')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        showToast('📍 המיקום זוהה')
      },
      () => {
        showToast('לא ניתן לגשת למיקום')
      }
    )
  }

  const filtered = barbers.filter(b => {
    const noLimit = maxPrice >= 250
    const matchPrice = noLimit || !b.max_price || b.max_price <= maxPrice
    const matchSearch = !search || b.name?.includes(search) || b.area?.includes(search)
    return matchPrice && matchSearch
  })

  const rankLabel = { 1: '#1 באזור', 2: '#2 באזור', 3: '#3 באזור' }

  return (
    <div className="screen">
      <div className="header">
        <div className="logo-row">
          <BarberPoleLogo />
          <div>
            <div className="app-name">ספר<span className="red-text">ת'י</span></div>
            <div className="tagline">מפת הספרים של ישראל</div>
          </div>
        </div>
        <div className="search-row">
          <div className="search-box">
            <svg className="search-ico" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
            </svg>
            <input placeholder="חפש לפי שם, שכונה..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="loc-btn" onClick={handleLocation}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#1a1a1a" strokeWidth="2.2">
              <circle cx="8" cy="7" r="2.5"/>
              <path d="M8 1C5 1 2.5 3.5 2.5 7c0 4.5 5.5 8 5.5 8s5.5-3.5 5.5-8C13.5 3.5 11 1 8 1z"/>
            </svg>
            המיקום שלי
          </button>
        </div>
        <div className="price-label">
          <span>עד כמה אתה מוכן לשלם?</span>
          <span className="price-val">{maxPrice >= 250 ? 'ללא הגבלה' : 'עד ' + maxPrice + '₪'}</span>
        </div>
        <div className="range-wrap">
          <span className="range-ends">0</span>
          <input type="range" min="20" max="250" value={maxPrice} step="5" onChange={e => setMaxPrice(+e.target.value)} />
          <span className="range-ends">250+</span>
        </div>
      </div>
      <div className="sec-lbl">הכי מדורגים באזורך</div>
      {loading ? (
        <div className="empty-state">טוען...</div>
      ) : (
        <div className="cards-list">
          {filtered.length === 0 ? (
            <div className="empty-state">אין ספרים בטווח זה</div>
          ) : filtered.map((b, i) => (
            <div key={b.id} className="barber-card" onClick={() => onOpenProfile(b.id)}>
              <div className="card-stripe" />
              <div className="card-main">
                <div className="card-top">
                  <div className="card-avatar" style={{ background: getColor(b.id) }}>
                    {b.photo_url ? <img src={b.photo_url} alt={b.name} /> : b.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-name">{b.name}</div>
                    <div className="card-area">{b.area} · {b.type}</div>
                  </div>
                  <div style={{ textAlign: 'left', flexShrink: 0 }}>
                    <div className="score-big"><span style={{ color: '#c0392b' }}>★</span>{b.score?.toFixed(1) || '—'}</div>
                    <div className="rev-cnt">{b.review_count || 0} ביקח</div>
                    {i < 3 && <div className={`rank-tag rank-${i+1}`}>{rankLabel[i+1]}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {b.max_price && <span className="tag">עד {b.max_price}₪</span>}
                  {b.cut_time && <span className="tag">{b.cut_time}</span>}
                  {b.available !== undefined && (
                    <span className={`avail-badge ${b.available ? 'avail-on' : 'avail-off'}`}>
                      <span className={`avail-dot ${b.available ? 'avail-dot-on' : 'avail-dot-off'}`} />
                      {b.available ? 'פנוי עכשיו' : 'לא פנוי'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
