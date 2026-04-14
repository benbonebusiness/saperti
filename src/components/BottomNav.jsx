export default function BottomNav({ active, onNavigate, onRandom }) {
  const left = [
    { id: 'home', label: 'בית', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg> },
    { id: 'favs', label: 'מועדפים', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  ]
  const right = [
    { id: 'visited', label: 'ביקרתי', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> },
    { id: 'me', label: 'אני', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  ]

  return (
    <div className="bottom-nav">
      {left.map(item => (
        <button key={item.id} className={`nav-item${active === item.id ? ' active' : ''}`} onClick={() => onNavigate(item.id)}>
          <span style={{ color: active === item.id ? '#1a1a1a' : '#bbb' }}>{item.icon}</span>
          <span className="nav-lbl" style={{ color: active === item.id ? '#1a1a1a' : '#bbb' }}>{item.label}</span>
        </button>
      ))}
      <div className="nav-fab-wrap">
        <button className="nav-fab" onClick={onRandom}>
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
            <circle cx="4.5" cy="4.5" r="3.5" stroke="#fff" strokeWidth="1.6"/>
            <circle cx="21.5" cy="4.5" r="3.5" stroke="#fff" strokeWidth="1.6"/>
            <line x1="8" y1="8" x2="20" y2="20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="18" y1="8" x2="6" y2="20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="4.5" cy="4.5" r="1.5" fill="#c0392b"/>
            <circle cx="21.5" cy="4.5" r="1.5" fill="#1a5ea8"/>
          </svg>
          <span className="nav-fab-lbl">הגרל</span>
        </button>
      </div>
      {right.map(item => (
        <button key={item.id} className={`nav-item${active === item.id ? ' active' : ''}`} onClick={() => onNavigate(item.id)}>
          <span style={{ color: active === item.id ? '#1a1a1a' : '#bbb' }}>{item.icon}</span>
          <span className="nav-lbl" style={{ color: active === item.id ? '#1a1a1a' : '#bbb' }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}