import { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import PoleLoader from './components/PoleLoader'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import FavsPage, { VisitedPage } from './pages/FavsPage'
import MePage from './pages/MePage'

export default function App() {
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [page, setPage] = useState('home')
    const [prevPage, setPrevPage] = useState(null)
    const [profileId, setProfileId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [favs, setFavs] = useState(new Set())
    const [visited, setVisited] = useState(new Set())

  useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user || null)
                setAuthLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
                setUser(session?.user || null)
        })
        const params = new URLSearchParams(window.location.search)
        const sharedBarber = params.get('barber')
        if (sharedBarber) { setProfileId(sharedBarber); setPage('profile') }
        return () => subscription.unsubscribe()
  }, [])

  function navigate(target) {
        setLoading(true)
        setTimeout(() => { setPrevPage(page); setPage(target); setLoading(false) }, 420)
  }

  function openProfile(id) {
        setLoading(true)
        setTimeout(() => { setProfileId(id); setPrevPage(page); setPage('profile'); setLoading(false) }, 420)
  }

  async function handleRandom() {
        const { data } = await supabase.from('barbers').select('id')
        if (!data || data.length === 0) return
        const random = data[Math.floor(Math.random() * data.length)]
        openProfile(random.id)
  }

  async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        navigate('home')
  }

  if (authLoading) return <PoleLoader />

      return (
        <>
  {loading && <PoleLoader />}
          <Toast />
  {page === 'home' && <HomePage onOpenProfile={openProfile} user={user} />}
                                               {page === 'favs' && <FavsPage favorites={favs} visited={visited} onSelectBarber={openProfile} />}
                                                 {page === 'visited' && <VisitedPage visited={visited} onOpen={openProfile} />}
                                                 {page === 'me' && (user ? <MePage user={user} favs={favs} visited={visited} onSignOut={signOut} /> : <AuthPage onAuth={setUser} />)}
                                                 {page === 'profile' && profileId && (
                                                           <ProfilePage barberId={profileId} onBack={() => navigate(prevPage || 'home')}
                                                           user={user} favs={favs} setFavs={setFavs} visited={visited} setVisited={setVisited} />
                                                       )}
                                                 {page !== 'profile' && <BottomNav active={page} onNavigate={navigate} onRandom={handleRandom} />}
                                                 </>
                                                   )
                                                }
