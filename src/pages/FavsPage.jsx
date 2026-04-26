import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/Toast";

export default function FavsPage({ favorites, onSelectBarber }) {
  const [favBarbers, setFavBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavs();
  }, [favorites]);

  async function fetchFavs() {
    setLoading(true);
    try {
      const ids = Array.from(favorites || []);
      if (ids.length === 0) {
        setFavBarbers([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("barbers")
        .select("id, name, area, score, review_count, photo_url, available")
        .in("id", ids);
      if (error) throw error;
      const byId = {};
      (data || []).forEach((b) => (byId[b.id] = b));
      setFavBarbers(ids.map((id) => byId[id]).filter(Boolean));
    } catch (err) {
      showToast("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !loading && favBarbers.length === 0;

  return (
    <div className="page favs-page">
      {loading && (
        <div className="favs-loading">
          <div className="pole-loader-small" />
        </div>
      )}
      {isEmpty && (
        <div className="favs-empty">
          <span className="favs-empty-icon">🪒</span>
          <p>עוד לא שמרת ספרים למועדפים</p>
        </div>
      )}
      {!loading && favBarbers.length > 0 && (
        <div className="favs-list">
          {favBarbers.map((barber) => (
            <div
              key={barber.id}
              className="favs-card"
              onClick={() => onSelectBarber(barber.id)}
            >
              <div className="favs-card-photo">
                {barber.photo_url ? (
                  <img src={barber.photo_url} alt={barber.name} />
                ) : (
                  <div className="favs-card-photo-placeholder">💈</div>
                )}
                <span
                  className={`favs-card-status ${
                    barber.available ? "available" : "unavailable"
                  }`}
                />
              </div>
              <div className="favs-card-info">
                <h3 className="favs-card-name">{barber.name}</h3>
                <p className="favs-card-area">📍 {barber.area}</p>
                <div className="favs-card-score">
                  <span className="star">★</span>
                  <span>
                    {barber.score
                      ? Number(barber.score).toFixed(1)
                      : "אין דירוג"}
                  </span>
                  {barber.review_count > 0 && (
                    <span className="favs-card-reviews">
                      ({barber.review_count})
                    </span>
                  )}
                </div>
              </div>
              <div className="favs-card-arrow">›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VisitedPage({ visited, onOpen }) {
  const [visitedBarbers, setVisitedBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisited();
  }, [visited]);

  async function fetchVisited() {
    setLoading(true);
    try {
      const ids = Array.from(visited || []);
      if (ids.length === 0) {
        setVisitedBarbers([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("barbers")
        .select("id, name, area, score, review_count, photo_url, available")
        .in("id", ids);
      if (error) throw error;
      const byId = {};
      (data || []).forEach((b) => (byId[b.id] = b));
      setVisitedBarbers(ids.map((id) => byId[id]).filter(Boolean));
    } catch (err) {
      showToast("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !loading && visitedBarbers.length === 0;

  return (
    <div className="page favs-page">
      {loading && (
        <div className="favs-loading">
          <div className="pole-loader-small" />
        </div>
      )}
      {isEmpty && (
        <div className="favs-empty">
          <span className="favs-empty-icon">💈</span>
          <p>עוד לא ביקרת אצל ספר</p>
        </div>
      )}
      {!loading && visitedBarbers.length > 0 && (
        <div className="favs-list">
          {visitedBarbers.map((barber) => (
            <div
              key={barber.id}
              className="favs-card"
              onClick={() => onOpen(barber.id)}
            >
              <div className="favs-card-photo">
                {barber.photo_url ? (
                  <img src={barber.photo_url} alt={barber.name} />
                ) : (
                  <div className="favs-card-photo-placeholder">💈</div>
                )}
                <span
                  className={`favs-card-status ${
                    barber.available ? "available" : "unavailable"
                  }`}
                />
              </div>
              <div className="favs-card-info">
                <h3 className="favs-card-name">{barber.name}</h3>
                <p className="favs-card-area">📍 {barber.area}</p>
                <div className="favs-card-score">
                  <span className="star">★</span>
                  <span>
                    {barber.score
                      ? Number(barber.score).toFixed(1)
                      : "אין דירוג"}
                  </span>
                  {barber.review_count > 0 && (
                    <span className="favs-card-reviews">
                      ({barber.review_count})
                    </span>
                  )}
                </div>
              </div>
              <div className="favs-card-arrow">›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
