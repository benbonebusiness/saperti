import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/Toast";

const LANGUAGES = ["עברית", "ערבית", "רוסית", "אנגלית"];
const PAYMENT_METHODS = ["מזומן", "אשראי", "ביט"];
const BOOKING_METHODS = ["טלפון", "וואטסאפ", "אתר"];
const PARKING_OPTIONS = ["ללא חניה", "חניה בתשלום", "חניה חינם"];

const EMPTY_FORM = {
  name: "",
  area: "",
  phone: "",
  type: "",
  max_price: "",
  cut_time: "",
  experience: "",
  booking_method: [],
  languages: [],
  payment_methods: [],
  parking: "",
};

export default function MePage({ user, onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [barber, setBarber] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const avatarInputRef = useRef();

  // Barber form
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingBarber, setSavingBarber] = useState(false);
  const [deletingBarber, setDeletingBarber] = useState(false);
  const [togglingAvailable, setTogglingAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBarber();
    }
  }, [user]);

  async function fetchProfile() {
    setLoadingProfile(true);
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    setProfile(data);
    setNewName(data?.display_name || "");
    setLoadingProfile(false);
  }

  async function fetchBarber() {
    const { data } = await supabase
      .from("barbers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setBarber(data || null);
  }

  // ─── Avatar upload ───────────────────────────────────────────────
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("הקובץ גדול מדי (מקסימום 5MB)");
      return;
    }
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const avatar_url = urlData.publicUrl;

      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url });
      if (profErr) throw profErr;

      setProfile((p) => ({ ...p, avatar_url }));
      showToast("תמונה עודכנה ✓");
    } catch {
      showToast("שגיאה בהעלאת התמונה");
    }
  }

  // ─── Display name ─────────────────────────────────────────────────
  async function saveName() {
    if (!newName.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: newName.trim() });
    setSavingName(false);
    if (error) {
      showToast("שגיאה בשמירת השם");
    } else {
      setProfile((p) => ({ ...p, display_name: newName.trim() }));
      setEditingName(false);
      showToast("השם עודכן ✓");
    }
  }

  // ─── Toggle availability ──────────────────────────────────────────
  async function toggleAvailable() {
    if (!barber) return;
    setTogglingAvailable(true);
    const { error } = await supabase
      .from("barbers")
      .update({ available: !barber.available })
      .eq("id", barber.id);
    setTogglingAvailable(false);
    if (error) {
      showToast("שגיאה בעדכון זמינות");
    } else {
      setBarber((b) => ({ ...b, available: !b.available }));
    }
  }

  // ─── Edit barber ──────────────────────────────────────────────────
  function startEdit() {
    setForm({
      name: barber.name || "",
      area: barber.area || "",
      phone: barber.phone || "",
      type: barber.type || "",
      max_price: barber.max_price ?? "",
      cut_time: barber.cut_time || "",
      experience: barber.experience || "",
      booking_method: barber.booking_method || [],
      languages: barber.languages || [],
      payment_methods: barber.payment_methods || [],
      parking: barber.parking || "",
    });
    setShowBarberForm(true);
  }

  // ─── Delete barber ────────────────────────────────────────────────
  async function deleteBarber() {
    if (!window.confirm("למחוק את פרופיל המספרה?")) return;
    setDeletingBarber(true);
    const { error } = await supabase
      .from("barbers")
      .delete()
      .eq("id", barber.id);
    setDeletingBarber(false);
    if (error) {
      showToast("שגיאה במחיקה");
    } else {
      setBarber(null);
      showToast("פרופיל המספרה נמחק");
    }
  }

  // ─── Save barber form ─────────────────────────────────────────────
  async function saveBarber(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.area.trim() || !form.phone.trim()) {
      showToast("נא למלא שם, אזור וטלפון");
      return;
    }
    setSavingBarber(true);
    try {
      const payload = {
        ...form,
        max_price: form.max_price ? Number(form.max_price) : null,
        user_id: user.id,
      };

      let error;
      if (barber) {
        ({ error } = await supabase
          .from("barbers")
          .update(payload)
          .eq("id", barber.id));
      } else {
        ({ error } = await supabase.from("barbers").insert(payload));
      }

      if (error) throw error;
      showToast(barber ? "פרטים עודכנו ✓" : "נרשמת בהצלחה כספר ✓");
      setShowBarberForm(false);
      fetchBarber();
    } catch {
      showToast("שגיאה בשמירה");
    } finally {
      setSavingBarber(false);
    }
  }

  // ─── Multi-toggle helper ──────────────────────────────────────────
  function toggleArrayField(field, value) {
    setForm((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  if (loadingProfile) {
    return (
      <div className="page me-page">
        <div className="me-loading">
          <div className="pole-loader-small" />
        </div>
      </div>
    );
  }

  return (
    <div className="page me-page">
      {/* ─── Profile section ─── */}
      <div className="me-profile-card">
        <div
          className="me-avatar-wrap"
          onClick={() => avatarInputRef.current?.click()}
          title="לחץ להחלפת תמונה"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="תמונת פרופיל"
              className="me-avatar"
            />
          ) : (
            <div className="me-avatar-placeholder">👤</div>
          )}
          <div className="me-avatar-overlay">📷</div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        <div className="me-profile-info">
          {editingName ? (
            <div className="me-name-edit">
              <input
                className="me-name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
              />
              <button
                className="btn-primary btn-sm"
                onClick={saveName}
                disabled={savingName}
              >
                {savingName ? "..." : "שמור"}
              </button>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setEditingName(false)}
              >
                ביטול
              </button>
            </div>
          ) : (
            <div className="me-name-row">
              <h2 className="me-name">
                {profile?.display_name || "ללא שם"}
              </h2>
              <button
                className="btn-ghost btn-icon"
                onClick={() => setEditingName(true)}
                title="ערוך שם"
              >
                ✏️
              </button>
            </div>
          )}
          <p className="me-email">{user.email}</p>
        </div>
      </div>

      {/* ─── Barber section ─── */}
      {barber && !showBarberForm && (
        <div className="me-barber-card">
          <div className="me-barber-header">
            <h3 className="me-barber-title">💈 המספרה שלי</h3>
            <div className="me-barber-actions">
              <button
                className="btn-ghost btn-sm"
                onClick={startEdit}
              >
                ✏️ עריכה
              </button>
              <button
                className="btn-danger btn-sm"
                onClick={deleteBarber}
                disabled={deletingBarber}
              >
                {deletingBarber ? "..." : "🗑️ מחיקה"}
              </button>
            </div>
          </div>

          <div className="me-barber-name">{barber.name}</div>
          <div className="me-barber-area">📍 {barber.area}</div>
          {barber.phone && (
            <div className="me-barber-phone">📞 {barber.phone}</div>
          )}

          <div className="me-availability-row">
            <span className="me-availability-label">
              {barber.available ? "✅ זמין עכשיו" : "⛔ לא זמין"}
            </span>
            <button
              className={`me-toggle ${barber.available ? "on" : "off"}`}
              onClick={toggleAvailable}
              disabled={togglingAvailable}
            >
              <span className="me-toggle-thumb" />
            </button>
          </div>
        </div>
      )}

      {!barber && !showBarberForm && (
        <button
          className="btn-primary me-become-barber"
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowBarberForm(true);
          }}
        >
          💈 אני ספר — הצטרף לרשת
        </button>
      )}

      {/* ─── Barber form ─── */}
      {showBarberForm && (
        <form className="me-barber-form" onSubmit={saveBarber}>
          <h3 className="me-form-title">
            {barber ? "עריכת פרופיל מספרה" : "הרשמה כספר"}
          </h3>

          <label className="me-label">שם המספרה / הספר *</label>
          <input
            className="me-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="למשל: דוד ספרות"
          />

          <label className="me-label">אזור *</label>
          <input
            className="me-input"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            placeholder="למשל: תל אביב - פלורנטין"
          />

          <label className="me-label">טלפון *</label>
          <input
            className="me-input"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="050-0000000"
          />

          <label className="me-label">סוג (אופציונלי)</label>
          <input
            className="me-input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder="למשל: קלאסי, מודרני, ברדיות..."
          />

          <div className="me-row">
            <div className="me-col">
              <label className="me-label">מחיר מקסימלי (₪)</label>
              <input
                className="me-input"
                type="number"
                min="0"
                value={form.max_price}
                onChange={(e) =>
                  setForm({ ...form, max_price: e.target.value })
                }
                placeholder="80"
              />
            </div>
            <div className="me-col">
              <label className="me-label">זמן תספורת</label>
              <input
                className="me-input"
                value={form.cut_time}
                onChange={(e) =>
                  setForm({ ...form, cut_time: e.target.value })
                }
                placeholder="20 דקות"
              />
            </div>
          </div>

          <label className="me-label">ניסיון</label>
          <input
            className="me-input"
            value={form.experience}
            onChange={(e) =>
              setForm({ ...form, experience: e.target.value })
            }
            placeholder="5 שנים"
          />

          <label className="me-label">זימון תור</label>
          <div className="me-chips">
            {BOOKING_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                className={`me-chip ${
                  form.booking_method.includes(m) ? "active" : ""
                }`}
                onClick={() => toggleArrayField("booking_method", m)}
              >
                {m}
              </button>
            ))}
          </div>

          <label className="me-label">שפות</label>
          <div className="me-chips">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                className={`me-chip ${
                  form.languages.includes(l) ? "active" : ""
                }`}
                onClick={() => toggleArrayField("languages", l)}
              >
                {l}
              </button>
            ))}
          </div>

          <label className="me-label">תשלום</label>
          <div className="me-chips">
            {PAYMENT_METHODS.map((p) => (
              <button
                key={p}
                type="button"
                className={`me-chip ${
                  form.payment_methods.includes(p) ? "active" : ""
                }`}
                onClick={() => toggleArrayField("payment_methods", p)}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="me-label">חניה</label>
          <select
            className="me-input"
            value={form.parking}
            onChange={(e) => setForm({ ...form, parking: e.target.value })}
          >
            <option value="">בחר...</option>
            {PARKING_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <div className="me-form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={savingBarber}
            >
              {savingBarber ? "שומר..." : barber ? "שמור שינויים" : "הצטרף"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowBarberForm(false)}
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {/* ─── Sign out ─── */}
      <button className="me-signout" onClick={onSignOut}>
        יציאה מהחשבון
      </button>
    </div>
  );
}