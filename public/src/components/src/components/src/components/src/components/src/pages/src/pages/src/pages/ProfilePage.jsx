import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../components/Toast'

const COLORS = ['#2c3e50','#1a5276','#512e7a','#1e5e38','#7d3c00','#1a4a6e','#4a1a5e']
function getColor(id) {
  const idx = parseInt(id?.replace(/-/g,'').slice(-4), 16) % COLORS.length
  return COLORS[idx] || COLORS[0]
}

export default function ProfilePage({ barberId, onBack, user, favs, setFavs, visited, setVisited }) {
  const [barber, setBarber] = useState(null)
  const [reviews, setReviews] = useState([])
  const [photos, setPhotos] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewScores, setReviewScores] = useState({ תספורת:5,'יחס אישי':5,היגיינה:5,'מחיר/ערך':5,אווירה:5 })
  const [showReplyFor, setShowReplyFor] = useState(null)
  const [replyText, setReplyText] = useState({})

  useEffect(() => { fetchAll() }, [barberId])

  async function fetchAll() {
    const [{ data: b }, { data: r }, { data: p }] = await Promise.all([
      supabase.from('barbers').select('*').eq('id', barberId).single(),
      supabase.from('reviews').select('*, profiles(display_name), review_replies(reply_text)').eq('barber_id', barberId).order('created_at', { ascending: false }),
      supabase.from('barber_photos').select('*').eq('barber_id', barberId).order('created_at')
    ])
    setBarber(b); setReviews(r || []); setPhotos(p || [])
  }

  const isFav = favs.has(barberId)
  const wasHere = visited.has(barberId)
  const isOwner = user && barber?.user_id === user.id

  function toggleFav() {
    const next = new Set(favs)
    if (isFav) { next.delete(barberId); showToast('הוסר ממועדפים') }
    else { next.add(barberId); showToast('נוסף למועדפים ♥') }
    setFavs(next)
  }

  function toggleVisited() {
    const next = new Set(visited)
    if (wasHere) { next.delete(barberId); showToast('הוסר מהיסטוריה') }
    else { next.add(barberId); showToast('✓ סיפר אותי!') }
    setVisited(next)
  }

  async function submitReview() {
    if (!user) { showToast('נדרשת כניסה'); return }
    if (!reviewText.trim()) return
    const avg = Object.values(reviewScores).reduce((a,b) => a+b, 0) / 5
    await supabase.from('reviews').insert({ barber_id: barberId, user_id: user.id, text: reviewText, scores: reviewScores, avg_score: avg })
    setShowReviewForm(false); setReviewText(''); showToast('ביקורת נשמרה!'); fetchAll()
  }

  async function submitReply(reviewId) {
    if (!replyText[reviewId]?.trim()) return
    await supabase.from('review_replies').insert({ review_id: reviewId, barber_id: barberId, reply_text: replyText[reviewId] })
    setShowReplyFor(null); setReplyText({}); showToast('תגובה נשמרה!'); fetchAll()
  }

  function handleShare() {
    const url = `${window.location.origin}?barber=${barberId}`
    if (navigator.share) navigator.share({ title: barber?.name, url })
    else { navigator.clipboard.writeText(url); showToast('הקישור הועתק!') }
  }

  if (!barber) return <div className="empty-state">טוען...</div>

  const color = getColor(barber.id)
  const scoreKeys = ['תספורת','יחס אישי','היגיינה','מחיר/ערך','אווירה']

  return (
    <div className="screen">
      <div className="prof-header">
        <button className="back-btn" onClick={onBack}>← חזרה לרשימה</button>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div className="prof-av" style={{ background: color }}>
            {barber.photo_url ? <img src={barber.photo_url} alt={barber.name}/> : barber.name?.[0]}
          </div>
          <div style={{ flex:1 }}>
            <div className="prof-name">{barber.name}</div>
            <div className="prof-area">{barber.area} · {barber.type}</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="big-num">{barber.score?.toFixed(1) || '—'}</div>
              <div>
                <div className="stars-r">{'★'.repeat(Math.round(barber.score||0))}</div>
                <div className="rev-s">{barber.review_count||0} ביקורות</div>
              </div>
              <div className={`avail-badge ${barber.available?'avail-on':'avail-off'}`} style={{ marginRight:'auto' }}>
                <span className={`avail-dot ${barber.available?'avail-dot-on':'avail-dot-off'}`}/>
                {barber.available ? 'פנוי עכשיו' : 'לא פנוי'}
              </div>
            </div>
          </div>
        </div>
        <div className="pole-div">
          {['#1a5ea8','#d0d0d0','#c0392b','#1a5ea8','#d0d0d0','#c0392b'].map((c,i) => (
            <div key={i} style={{ background:c, flex:i%2===0?2:1 }}/>
          ))}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-c"><div className="stat-v">עד {barber.max_price}₪</div><div className="stat-l">מחיר</div></div>
        <div className="stat-c"><div className="stat-v">{barber.cut_time}</div><div className="stat-l">זמן תספורת</div></div>
        <div className="stat-c"><div className="stat-v">{barber.experience}</div><div className="stat-l">ניסיון</div></div>
      </div>

      <div className="info-block">
        <div className="info-r"><span className="il">זימון תורים</span><span className="iv">{barber.booking_method?.join(', ')}</span></div>
        <div className="info-r"><span className="il">טלפון</span><span className="iv" style={{ direction:'ltr' }}>{barber.phone}</span></div>
        <div className="info-r"><span className="il">תשלום</span><span className="iv">{barber.payment_methods?.join(', ')}</span></div>
        <div className="info-r"><span className="il">שפות</span><span className="iv">{barber.languages?.join(', ')}</span></div>
        <div className="info-r"><span className="il">חניה</span><span className="iv">{barber.parking}</span></div>
      </div>

      {barber.score_breakdown && (
        <div className="block-card">
          <div className="blk-title">פירוט דירוג</div>
          {scoreKeys.map(k => (
            <div key={k} className="sc-row">
              <span className="sc-lbl">{k}</span>
              <div className="bar-w"><div className="bar-f" style={{ width:`${(barber.score_breakdown[k]||0)/5*100}%` }}/></div>
              <span className="sc-n">{barber.score_breakdown[k]?.toFixed(1)||'—'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="block-card">
        <div className="blk-title">עבודות ({photos.length}/20)</div>
        <div className="photos-grid">
          {photos.map(p => (
            <div key={p.id} className="photo-box"><img src={p.url} alt="עבודה"/></div>
          ))}
          {photos.length === 0 && <div style={{ color:'#ccc', fontSize:11, fontFamily:'Secular One' }}>אין תמונות עדיין</div>}
        </div>
      </div>

      <div className="block-card">
        <div className="blk-title">ביקורות ({reviews.length})</div>
        {reviews.length === 0 && <div style={{ color:'#bbb', fontSize:13, padding:'4px 0' }}>עדיין אין ביקורות</div>}
        {reviews.map(r => (
          <div key={r.id} className="rev-item">
            <div className="rev-top">
              <span className="rev-nm">{r.profiles?.display_name||'משתמש'}</span>
              <span className="rev-st">{'★'.repeat(Math.round(r.avg_score||0))}</span>
            </div>
            <div className="rev-tx">{r.text}</div>
            <div className="rev-dt">{new Date(r.created_at).toLocaleDateString('he-IL')}</div>
            {r.review_replies?.[0] && (
              <div className="rev-reply"><span style={{ fontWeight:700 }}>תגובת הספר: </span>{r.review_replies[0].reply_text}</div>
            )}
            {isOwner && !r.review_replies?.[0] && (
              showReplyFor === r.id ? (
                <div style={{ marginTop:6 }}>
                  <input className="form-input" style={{ marginBottom:4, fontSize:12 }} placeholder="כתוב תגובה..."
                    value={replyText[r.id]||''} onChange={e => setReplyText({...replyText,[r.id]:e.target.value})}/>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn-primary" style={{ flex:1, padding:'7px', fontSize:12 }} onClick={() => submitReply(r.id)}>שלח</button>
                    <button className="btn-secondary" style={{ padding:'7px 12px', fontSize:12 }} onClick={() => setShowReplyFor(null)}>ביטול</button>
                  </div>
                </div>
              ) : (
                <button style={{ marginTop:4, fontSize:11, color:'#888', background:'none', border:'none', cursor:'pointer' }}
                  onClick={() => setShowReplyFor(r.id)}>↩ הגב לביקורת</button>
              )
            )}
          </div>
        ))}
        {showReviewForm ? (
          <div style={{ marginTop:12 }}>
            {scoreKeys.map(k => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:11, color:'#888', width:80, fontFamily:'Secular One' }}>{k}</span>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ cursor:'pointer', fontSize:16, color: n<=reviewScores[k]?'#c0392b':'#ddd' }}
                    onClick={() => setReviewScores({...reviewScores,[k]:n})}>★</span>
                ))}
              </div>
            ))}
            <textarea className="form-input" style={{ minHeight:70, marginBottom:8, resize:'none' }}
              placeholder="כתוב את הביקורת שלך..." value={reviewText} onChange={e => setReviewText(e.target.value)}/>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-primary" style={{ flex:1 }} onClick={submitReview}>פרסם ביקורת</button>
              <button className="btn-secondary" onClick={() => setShowReviewForm(false)}>ביטול</button>
            </div>
          </div>
        ) : (
          <button className="write-rev-btn" onClick={() => setShowReviewForm(true)}>+ כתוב ביקורת</button>
        )}
      </div>

      <div className="cta-bar">
        <button className="btn-primary" style={{ flex:1 }} onClick={() => window.open(`tel:${barber.phone}`)}>התקשר לזמן תור</button>
        <button className="btn-secondary" onClick={toggleFav}>{isFav ? '♥' : '♡'}</button>
        <button className={`btn-saprati${wasHere?' marked':''}`} onClick={toggleVisited}>{wasHere ? '✓ סיפר אותי' : "סיפר אותי"}</button>
        <button className="share-btn" onClick={handleShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          שלח לחבר
        </button>
      </div>
    </div>
  )
}