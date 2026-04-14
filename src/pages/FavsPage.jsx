import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/Toast";

export default function FavsPage({ favorites, visited, onSelectBarber, defaultTab = "favs" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [favBarbers, setFavBarbers] = useState([]);
  const [visitedBarbers, setVisitedBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, [favorites, visited]);

  async function fetchBarbers() {
    setLoading(true);
    try {
      const allIds = [
        ...Array.from(favorites || []),
        ...Array.from(visited || []),
      ];
      const uniqueIds = [...new Set(allIds)];

      if (uniqueIds.length === 0) {
        setFavBarbers([]);
        setVisitedBarbers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("barbers")
        .select("id, name, area, score, review_count, photo_url, available")
        .in("id", uniqueIds);

      if (error) throw error;

      const byId = {};
      (data || []).forEach((b) => (byId[b.id] = b));

      setFavBarbers(
        Array.from(favorites || [])
          .map((id) => byId[id])
          .filter(Boolean)
      );
      setVisitedBarbers(
        Array.from(visited || [])
          .map((id) => byId[id])
          .filter(Boolean)
      );
    } catch (err) {
      showToast("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }

  const list = activeTab === "favs" ? favBarbers : visitedBarbers;
  const isEmpty = !loading && list.length === 0;

  return (
    <div className="page favs-page">
      <div className="favs-tabs">
        <button
          className={`favs-tab${activeTab === "favs" ? " active" : ""}`}
          onClick={() => setActiveTab("favs")}
        >
          ❤️ מועדפים
        </button>
        <button
          className={`favs-tab${activeTab === "visited" ? " active" : ""}`}
          onClick={() => setActiveTab("visited")}
        >
          ✅ ביקרתי
        </button>
      </div>

      {loading && (
        <div className="favs-loading">
          <div className="pole-loader-small" />
        </div>
      )}

      {isEmpty && (
        <div className="favs-empty">
          <span className="favs-empty-icon">
            {activeTab === "favs" ? "🪒" : "💈"}
          </span>
          <p>
            {activeTab === "favs"
              ? "עוד לא שמרת ספרים למועדפים"
              : "עוד לא ביקרת אצל ספר"}
          </p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="favs-list">
          {list.map((barber) => (
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
  return (
    <FavsPage
      favorites={new Set()}
      visited={visited}
      onSelectBarber={onOpen}
      defaultTab="visited"
    />
  );
}