import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  ArrowLeft, Upload, X, ShieldAlert, Leaf, Camera,
  CheckCircle, ChevronRight, AlertCircle, Sparkles,
} from "lucide-react";

import API from '../config';

const G = {
  green900: "#0a2e14",
  green800: "#0f4a1f",
  green700: "#155f28",
  green600: "#16a34a",
  green500: "#22c55e",
  green400: "#4ade80",
  green100: "#dcfce7",
  green50:  "#f0fdf4",
  cream:    "#faf9f6",
  sand:     "#f5f0e8",
  charcoal: "#1a1a1a",
  ink:      "#2d2d2d",
  muted:    "#6b6b6b",
  border:   "#e8e3d8",
};

const CATEGORIES = ["Textbooks","Notes","Lab Equipment","Electronics","Stationery","Other"];
const SEMESTERS  = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];
const CONDITIONS = [
  { value: "Like New", label: "Like New",  desc: "No marks, pristine",     color: G.green600,  bg: G.green100  },
  { value: "Good",     label: "Good",      desc: "Minor wear only",         color: "#2563eb",   bg: "#dbeafe"   },
  { value: "Fair",     label: "Fair",      desc: "Some notes/highlights",   color: "#d97706",   bg: "#fef3c7"   },
  { value: "Used",     label: "Used",      desc: "Visible wear, all intact",color: "#dc2626",   bg: "#fee2e2"   },
];

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes imageReveal {
    from { opacity: 0; transform: scale(1.03); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes successPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
    50%      { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
  }

  .page-enter   { animation: fadeUp 0.5s ease both; }
  .page-enter-2 { animation: fadeUp 0.5s 0.07s ease both; }
  .page-enter-3 { animation: fadeUp 0.5s 0.14s ease both; }

  .nav-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; color: ${G.muted};
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: color 0.15s;
  }
  .nav-link:hover { color: ${G.charcoal}; }

  /* ── Shared field styles ── */
  .field-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid ${G.border};
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: ${G.charcoal};
    background: ${G.cream};
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    appearance: none;
    -webkit-appearance: none;
  }
  .field-input:focus {
    border-color: ${G.green500};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
  }
  .field-input::placeholder { color: #b0a898; }
  .field-input:valid:not(:placeholder-shown) {
    border-color: ${G.green400};
    background: ${G.green50};
  }

  .field-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: ${G.muted};
    text-transform: uppercase; letter-spacing: 0.07em;
    margin-bottom: 8px;
  }

  /* ── Condition pill selector ── */
  .condition-pill {
    flex: 1; min-width: 0;
    padding: 12px 10px;
    border-radius: 14px;
    border: 1.5px solid ${G.border};
    background: #fff;
    cursor: pointer;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.16s, background 0.16s, transform 0.12s, box-shadow 0.16s;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
  }
  .condition-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.07);
  }
  .condition-pill.selected {
    transform: translateY(-2px);
  }

  /* ── Upload zone ── */
  .upload-zone {
    width: 100%; border: 2px dashed ${G.border};
    border-radius: 20px; background: ${G.cream};
    cursor: pointer; transition: border-color 0.18s, background 0.18s;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 24px; gap: 12px;
  }
  .upload-zone:hover {
    border-color: ${G.green500};
    background: ${G.green50};
  }

  /* ── Submit button ── */
  .submit-btn {
    flex: 1; padding: 16px;
    background: ${G.green600}; color: #fff;
    border: none; border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.01em;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.16s, transform 0.12s, box-shadow 0.16s;
  }
  .submit-btn:hover:not(:disabled) {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(22,163,74,0.32);
  }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .cancel-btn {
    padding: 16px 28px;
    background: transparent; color: ${G.muted};
    border: 1.5px solid ${G.border};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .cancel-btn:hover {
    border-color: ${G.green400};
    color: ${G.ink};
    background: ${G.green50};
  }

  /* ── Category grid ── */
  .cat-chip {
    padding: 9px 16px;
    border-radius: 100px;
    border: 1.5px solid ${G.border};
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; color: ${G.ink};
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  .cat-chip:hover {
    border-color: ${G.green500};
    background: ${G.green50};
    transform: translateY(-1px);
  }
  .cat-chip.selected {
    border-color: ${G.green600};
    background: ${G.green100};
    color: ${G.green800};
  }

  /* Price prefix box */
  .price-wrap {
    display: flex;
    border: 1.5px solid ${G.border};
    border-radius: 14px; overflow: hidden;
    background: ${G.cream};
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  }
  .price-wrap:focus-within {
    border-color: ${G.green500};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
  }

  .section-card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 24px;
    padding: 28px;
  }

  .section-title {
    font-family: 'Fraunces', serif;
    font-size: 17px; font-weight: 600;
    color: ${G.charcoal}; letter-spacing: -0.01em;
    margin: 0 0 20px;
  }

  /* progress bar */
  .progress-bar-track {
    height: 3px; border-radius: 100px;
    background: ${G.border}; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 100px;
    background: ${G.green600};
    transition: width 0.4s ease;
  }
`;

export default function AddListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    category: "", condition: "", semester: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  if (!user) return null;

  /* ── Unverified gate ── */
  if (!user.studentVerified) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: G.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{pageStyles}</style>
        <div style={{
          background: "#fff", border: `1px solid ${G.border}`,
          borderRadius: "28px", padding: "52px 40px",
          maxWidth: "420px", width: "100%", textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
          animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "20px",
            background: "#fef3c7", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          }}>
            <ShieldAlert style={{ width: "32px", height: "32px", color: "#d97706" }} />
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 700,
            color: G.charcoal, letterSpacing: "-0.02em", marginBottom: "10px",
          }}>Verified Students Only</h2>
          <p style={{ fontSize: "15px", color: G.muted, lineHeight: 1.65, marginBottom: "32px" }}>
            Only students with a verified college email can list items on the marketplace.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/profile" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "14px", background: G.green600, color: "#fff",
              borderRadius: "100px", fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px", fontWeight: 700, textDecoration: "none",
              transition: "background 0.16s, transform 0.12s",
            }}>
              Verify College Email <ChevronRight style={{ width: "15px", height: "15px" }} />
            </Link>
            <Link to="/browse" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "13px", background: "transparent", color: G.ink,
              border: `1.5px solid ${G.border}`, borderRadius: "100px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
              textDecoration: "none",
            }}>
              Browse Items Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  const handleImageFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(""); setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/listings`, {
        title: formData.title, description: formData.description,
        price: Number(formData.price), category: formData.category,
        condition: formData.condition, semester: formData.semester,
        image: imagePreview,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/my-listings");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to publish listing. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const field = (key: keyof typeof formData) => formData[key];
  const set   = (key: keyof typeof formData, val: string) => setFormData(p => ({ ...p, [key]: val }));

  const isFormValid = !!(
    formData.title.trim() && formData.description.trim() &&
    formData.price && Number(formData.price) > 0 &&
    formData.category && formData.condition && imagePreview
  );

  // Progress: count filled required fields out of 6
  const filledCount = [
    imagePreview, formData.title.trim(), formData.description.trim(),
    formData.price && Number(formData.price) > 0, formData.category, formData.condition,
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / 6) * 100);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{pageStyles}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(250,249,246,0.92)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: "760px", margin: "0 auto",
          padding: "0 24px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/dashboard" className="nav-link">
              <ArrowLeft style={{ width: "18px", height: "18px" }} />
              Dashboard
            </Link>
            <div style={{ width: "1px", height: "20px", background: G.border }} />
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "19px", fontWeight: 700,
              color: G.charcoal, letterSpacing: "-0.02em",
            }}>New Listing</span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "100px",
            background: G.sand, border: `1px solid ${G.border}`,
          }}>
            <Leaf style={{ width: "12px", height: "12px", color: G.green600 }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: G.muted, letterSpacing: "0.03em" }}>
              PassItOn
            </span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── PAGE INTRO ── */}
        <div className="page-enter" style={{ marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 12px", borderRadius: "100px",
            background: G.green100, marginBottom: "14px",
          }}>
            <Sparkles style={{ width: "12px", height: "12px", color: G.green600 }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: G.green800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sell on campus
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 700, letterSpacing: "-0.03em",
            color: G.charcoal, lineHeight: 1.1, marginBottom: "8px",
          }}>
            List your item,{" "}
            <em style={{ color: G.green600, fontStyle: "italic", fontWeight: 300 }}>earn instantly.</em>
          </h1>
          <p style={{ fontSize: "15px", color: G.muted, lineHeight: 1.6 }}>
            Only verified students from your campus will see this listing.
          </p>
        </div>

        {/* ── PROGRESS ── */}
        <div className="page-enter-2" style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: G.muted, fontFamily: "'DM Sans', sans-serif" }}>
              Listing completeness
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: progress === 100 ? G.green600 : G.muted, fontFamily: "'DM Sans', sans-serif" }}>
              {progress}%{progress === 100 ? " ✓ Ready to publish!" : ""}
            </span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "16px", padding: "14px 18px",
              color: "#b91c1c", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
              animation: "fadeUp 0.25s ease both",
            }}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* ── SECTION 1: PHOTO ── */}
          <div className="section-card page-enter-2">
            <h2 className="section-title">
              <span style={{ color: G.green600, marginRight: "8px" }}>01</span>
              Item Photo
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginLeft: "6px" }}>required</span>
            </h2>

            {imagePreview ? (
              <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden" }}>
                <img
                  src={imagePreview} alt="Preview"
                  style={{
                    width: "100%", height: "280px", objectFit: "cover", display: "block",
                    animation: "imageReveal 0.4s ease both",
                  }}
                />
                {/* Overlay controls */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
                  display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                  padding: "16px",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "100px",
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)",
                  }}>
                    <CheckCircle style={{ width: "13px", height: "13px", color: G.green400 }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Photo uploaded</span>
                  </div>
                  <button type="button" onClick={() => setImagePreview(null)} style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <X style={{ width: "15px", height: "15px", color: "#fff" }} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="upload-zone"
                style={{
                  borderColor: isDragOver ? G.green500 : G.border,
                  background: isDragOver ? G.green50 : G.cream,
                }}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <div style={{
                  width: "60px", height: "60px", borderRadius: "18px",
                  background: isDragOver ? G.green100 : G.sand,
                  border: `1px solid ${isDragOver ? G.green400 : G.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s",
                }}>
                  {isDragOver
                    ? <Upload style={{ width: "26px", height: "26px", color: G.green600 }} />
                    : <Camera style={{ width: "26px", height: "26px", color: G.muted }} />
                  }
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Fraunces', serif", fontSize: "17px",
                    fontWeight: 600, color: G.charcoal, margin: "0 0 4px",
                    letterSpacing: "-0.01em",
                  }}>
                    {isDragOver ? "Drop it here!" : "Upload a photo"}
                  </p>
                  <p style={{ fontSize: "13px", color: G.muted, margin: 0 }}>
                    Drag & drop or click · PNG, JPG up to 10MB
                  </p>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "100px",
                  background: G.green600, color: "#fff",
                  fontSize: "13px", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Upload style={{ width: "13px", height: "13px" }} />
                  Choose file
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* ── SECTION 2: DETAILS ── */}
          <div className="section-card page-enter-3">
            <h2 className="section-title">
              <span style={{ color: G.green600, marginRight: "8px" }}>02</span>
              Item Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Title */}
              <div>
                <label className="field-label">
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text" className="field-input"
                  value={field("title")}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g., Engineering Mathematics III Textbook"
                />
                {formData.title.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "5px" }}>
                    <span style={{ fontSize: "11px", color: formData.title.length > 80 ? "#ef4444" : G.muted }}>
                      {formData.title.length}/80
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="field-label">
                  Description <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows={4} className="field-input"
                  value={field("description")}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Describe the item's condition, edition, any markings, why you're selling it…"
                  style={{ resize: "none", lineHeight: 1.6 }}
                />
              </div>

              {/* Price */}
              <div>
                <label className="field-label">
                  Price <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="price-wrap">
                  <div style={{
                    padding: "13px 16px",
                    background: G.sand, borderRight: `1px solid ${G.border}`,
                    display: "flex", alignItems: "center",
                    fontFamily: "'Fraunces', serif",
                    fontSize: "18px", fontWeight: 700, color: G.green600,
                    flexShrink: 0,
                  }}>₹</div>
                  <input
                    type="number" min="1"
                    value={field("price")}
                    onChange={e => set("price", e.target.value)}
                    placeholder="e.g., 250"
                    style={{
                      flex: 1, padding: "13px 16px",
                      border: "none", background: "transparent", outline: "none",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "15px",
                      fontWeight: 600, color: G.charcoal,
                    }}
                  />
                  {formData.price && Number(formData.price) > 0 && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      paddingRight: "14px", fontSize: "12px", color: G.green600,
                      fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                    }}>
                      <CheckCircle style={{ width: "13px", height: "13px" }} />
                    </div>
                  )}
                </div>
                {formData.price && Number(formData.price) > 0 && (
                  <p style={{ fontSize: "12px", color: G.muted, marginTop: "6px", fontFamily: "'DM Sans', sans-serif" }}>
                    Buyers save vs. bookstore price. Avg campus deal: ₹150–₹600.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* ── SECTION 3: CATEGORY ── */}
          <div className="section-card">
            <h2 className="section-title">
              <span style={{ color: G.green600, marginRight: "8px" }}>03</span>
              Category <span style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginLeft: "4px" }}>required</span>
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat} type="button"
                  className={`cat-chip${formData.category === cat ? " selected" : ""}`}
                  onClick={() => set("category", cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── SECTION 4: CONDITION ── */}
          <div className="section-card">
            <h2 className="section-title">
              <span style={{ color: G.green600, marginRight: "8px" }}>04</span>
              Condition <span style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginLeft: "4px" }}>required</span>
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {CONDITIONS.map(c => {
                const selected = formData.condition === c.value;
                return (
                  <button
                    key={c.value} type="button"
                    className={`condition-pill${selected ? " selected" : ""}`}
                    onClick={() => set("condition", c.value)}
                    style={{
                      borderColor: selected ? c.color : G.border,
                      background: selected ? c.bg : "#fff",
                      boxShadow: selected ? `0 6px 20px ${c.color}22` : "none",
                    }}
                  >
                    <span style={{
                      fontSize: "13px", fontWeight: 700,
                      color: selected ? c.color : G.ink,
                    }}>{c.label}</span>
                    <span style={{
                      fontSize: "11px", color: selected ? c.color : G.muted,
                      fontWeight: 400,
                    }}>{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 5: SEMESTER (optional) ── */}
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: "6px" }}>
              <span style={{ color: G.green600, marginRight: "8px" }}>05</span>
              Semester
              <span style={{ fontSize: "12px", fontWeight: 400, color: G.muted, marginLeft: "8px", fontFamily: "'DM Sans', sans-serif" }}>
                optional
              </span>
            </h2>
            <p style={{ fontSize: "13px", color: G.muted, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>
              Helps buyers find textbooks for their specific semester.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                className={`cat-chip${formData.semester === "" ? " selected" : ""}`}
                onClick={() => set("semester", "")}
              >
                Not applicable
              </button>
              {SEMESTERS.map(sem => (
                <button
                  key={sem} type="button"
                  className={`cat-chip${formData.semester === sem ? " selected" : ""}`}
                  onClick={() => set("semester", sem)}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>

          {/* ── PUBLISH / CANCEL ── */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingTop: "4px" }}>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 0.7s linear infinite" }} />
                  Publishing…
                </>
              ) : (
                <>
                  <Sparkles style={{ width: "16px", height: "16px" }} />
                  Publish Listing
                </>
              )}
            </button>
          </div>

          {/* Trust footer */}
          <p style={{
            textAlign: "center", fontSize: "12px", color: G.muted,
            fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300,
            marginTop: "4px",
          }}>
            Visible only to verified students on your campus · Free to list
          </p>

        </form>
      </div>
    </div>
  );
}

// Inline because it's used only here
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}