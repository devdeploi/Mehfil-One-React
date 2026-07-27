import React, { useState, useEffect } from 'react';
import { FaImage, FaUpload, FaSave, FaUndo, FaCheckCircle, FaTrashAlt, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import { API_URL } from '../../utils/function';

const DEFAULT_HERO_IMAGES = {
    mainArch: { url: '', title: 'The Royal Palace', subtitle: 'Featured' },
    horizontal: { url: '', title: 'Grand Banquet' },
    vertical: { url: '', title: 'Luxury Decor' },
    circular: { url: '', title: 'Event Hall' }
};

const HeroSettings = () => {
    const [images, setImages] = useState(DEFAULT_HERO_IMAGES);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/hero-settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && (data.mainArch || data.horizontal || data.vertical || data.circular)) {
                        setImages(data);
                        try { localStorage.setItem('hero_landing_images', JSON.stringify(data)); } catch (err) {}
                        return;
                    }
                }
            } catch (e) {
                console.error("Error fetching hero settings from API:", e);
            }
            const stored = localStorage.getItem('hero_landing_images');
            if (stored) {
                try { setImages(JSON.parse(stored)); } catch (e) {}
            }
        };
        fetchSettings();
    }, []);

    const handleFileChange = (key, file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast("File size exceeds 5MB limit. Please choose a smaller image.", "danger");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setImages(prev => ({ ...prev, [key]: { ...prev[key], url: reader.result } }));
            showToast("New image selected! Remember to click Save Changes.", "info");
        };
        reader.readAsDataURL(file);
    };

    const handleTextChange = (key, field, value) => {
        setImages(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    };

    const handleClearSlot = (key) => {
        setImages(prev => ({ ...prev, [key]: { ...prev[key], url: '' } }));
        showToast("Slot reset to default template image.", "info");
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/hero-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(images)
            });
            if (res.ok) {
                try { localStorage.setItem('hero_landing_images', JSON.stringify(images)); } catch (err) {}
                window.dispatchEvent(new Event('hero_images_updated'));
                showToast("Hero section images updated successfully in database!");
            } else {
                showToast("Server returned an error. Please try again.", "danger");
            }
        } catch (e) {
            console.error("Error saving hero settings:", e);
            showToast("Failed to connect to server.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/superadmin/hero-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(DEFAULT_HERO_IMAGES)
            });
            try { localStorage.removeItem('hero_landing_images'); } catch (err) {}
            setImages(DEFAULT_HERO_IMAGES);
            window.dispatchEvent(new Event('hero_images_updated'));
            showToast("Reset to system default static images!", "info");
        } catch (e) {
            console.error("Error resetting hero settings:", e);
            showToast("Failed to reset settings.", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingBottom: '160px' }}>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(110%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { transform: translateY(18px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .hs-page-wrap {
                    max-width: 1380px;
                    margin: 0 auto;
                    padding: 32px 28px;
                }
                .hs-header-banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a0808 100%);
                    border-left: 5px solid #dc2626;
                    padding: 28px 36px;
                    margin-bottom: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    flex-wrap: wrap;
                    box-shadow: 0 8px 32px rgba(15,23,42,0.2);
                }
                .hs-header-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(220,38,38,0.18);
                    border: 1px solid rgba(220,38,38,0.35);
                    color: #fca5a5;
                    font-size: 0.67rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    padding: 4px 12px;
                    margin-bottom: 10px;
                }
                .hs-header-title {
                    color: #ffffff;
                    font-size: 1.6rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin: 0 0 5px;
                    line-height: 1.2;
                }
                .hs-header-sub {
                    color: #94a3b8;
                    font-size: 0.84rem;
                    margin: 0;
                }
                .hs-btn-reset {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #cbd5e1;
                    font-weight: 600;
                    font-size: 0.84rem;
                    padding: 10px 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border-radius: 0;
                }
                .hs-btn-reset:hover:not(:disabled) {
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(255,255,255,0.3);
                    color: #fff;
                }
                .hs-btn-save {
                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                    border: none;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.88rem;
                    padding: 10px 26px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 18px rgba(220,38,38,0.4);
                    transition: all 0.25s ease;
                    cursor: pointer;
                    letter-spacing: 0.01em;
                    border-radius: 0;
                }
                .hs-btn-save:hover:not(:disabled) {
                    background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
                    box-shadow: 0 6px 24px rgba(220,38,38,0.55);
                    transform: translateY(-1px);
                }
                .hs-btn-save:disabled, .hs-btn-reset:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* CARD */
                .hs-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0 !important;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    transition: box-shadow 0.3s ease, transform 0.28s ease;
                    animation: fadeInUp 0.4s ease both;
                    box-shadow: 0 4px 16px rgba(15,23,42,0.08);
                }
                .hs-card:hover {
                    box-shadow: 0 16px 40px rgba(15,23,42,0.14), 0 0 0 2px rgba(220,38,38,0.18);
                    transform: translateY(-6px);
                }
                .hs-card-header {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    padding: 14px 16px 14px 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 2px solid #dc2626;
                }
                .hs-card-title {
                    color: #f8fafc;
                    font-size: 0.86rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0;
                }
                .hs-badge-featured {
                    font-size: 0.58rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 3px 9px;
                    background: #dc2626;
                    color: #fff;
                    border: none;
                }
                .hs-badge-slot {
                    font-size: 0.58rem;
                    font-weight: 700;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    padding: 3px 9px;
                    background: rgba(148,163,184,0.15);
                    color: #94a3b8;
                    border: 1px solid rgba(148,163,184,0.25);
                }
                .hs-card-body {
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                /* PREVIEW */
                .hs-preview-section {
                    background: #0f172a;
                    padding: 0;
                    position: relative;
                }
                .hs-preview {
                    width: 100%;
                    height: 185px;
                    background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
                    border: none;
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .hs-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    opacity: 0.95;
                }
                .hs-preview-empty {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .hs-preview-empty-icon {
                    width: 52px;
                    height: 52px;
                    background: rgba(255,255,255,0.04);
                    border: 2px dashed rgba(255,255,255,0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.2);
                    font-size: 1.3rem;
                }
                .hs-preview-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 28px 14px 10px;
                    background: linear-gradient(to top, rgba(0,0,0,0.88), transparent);
                    color: #fff;
                    font-size: 0.73rem;
                    font-weight: 700;
                    text-align: center;
                    letter-spacing: 0.02em;
                }
                .hs-preview-delete {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 30px;
                    height: 30px;
                    background: #dc2626;
                    border: none;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    cursor: pointer;
                    z-index: 10;
                    transition: background 0.2s ease;
                    box-shadow: 0 2px 10px rgba(220,38,38,0.5);
                    border-radius: 0;
                }
                .hs-preview-delete:hover { background: #991b1b; }

                /* CARD FORM SECTION */
                .hs-card-form {
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: #fff;
                    flex: 1;
                }

                /* FORM */
                .hs-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    display: block;
                }
                .hs-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    border-bottom: 2px solid #e2e8f0;
                    border-radius: 0 !important;
                    font-size: 0.85rem;
                    color: #0f172a;
                    background: #f8fafc;
                    transition: border-color 0.2s ease, background 0.2s ease;
                    outline: none;
                }
                .hs-input:focus {
                    border-bottom-color: #dc2626;
                    background: #fff;
                }
                .hs-input:disabled { opacity: 0.5; cursor: not-allowed; }
                .hs-upload-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: #0f172a;
                    color: #f1f5f9;
                    border: none;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    text-transform: uppercase;
                    font-size: 0.72rem;
                }
                .hs-upload-btn:hover {
                    background: #dc2626;
                    color: #fff;
                }
                .hs-upload-btn .hs-upload-icon {
                    width: 26px;
                    height: 26px;
                    background: rgba(220,38,38,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: #dc2626;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }
                .hs-upload-btn:hover .hs-upload-icon {
                    background: rgba(255,255,255,0.15);
                    color: #fff;
                }

                /* TOAST */
                .hs-toast {
                    position: fixed;
                    top: 22px;
                    right: 22px;
                    z-index: 9999;
                    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    min-width: 310px;
                    background: #ffffff;
                    border-left: 4px solid #22c55e;
                    padding: 14px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(15,23,42,0.12);
                    border-radius: 4px;
                }
                .hs-toast.danger { border-left-color: #dc2626; }
                .hs-toast.info { border-left-color: #3b82f6; }
                .hs-toast-text-title {
                    color: #0f172a;
                    font-size: 0.84rem;
                    font-weight: 700;
                    margin-bottom: 2px;
                }
                .hs-toast-text-msg {
                    color: #64748b;
                    font-size: 0.77rem;
                    line-height: 1.4;
                }
                .hs-toast-close {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.95rem;
                    margin-left: auto;
                    padding: 0 2px;
                    transition: color 0.2s;
                    flex-shrink: 0;
                }
                .hs-toast-close:hover { color: #475569; }
            `}</style>

            {/* TOAST */}
            {toast.show && (
                <div className={`hs-toast ${toast.type}`}>
                    <div style={{ color: toast.type === 'danger' ? '#dc2626' : toast.type === 'info' ? '#3b82f6' : '#22c55e', fontSize: '0.95rem', flexShrink: 0 }}>
                        {toast.type === 'danger' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="hs-toast-text-title">
                            {toast.type === 'danger' ? 'Error' : toast.type === 'info' ? 'Info' : 'Saved'}
                        </div>
                        <div className="hs-toast-text-msg">{toast.message}</div>
                    </div>
                    <button className="hs-toast-close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>✕</button>
                </div>
            )}

            <div className="hs-page-wrap">

                {/* HEADER BANNER */}
                <div className="hs-header-banner">
                    <div>
                        <div className="hs-header-label">
                            <FaStar style={{ fontSize: '0.58rem' }} /> Superadmin Engine · Hero Configurator
                        </div>
                        <h2 className="hs-header-title">Hero Image Management</h2>
                        <p className="hs-header-sub">Configure the 4 dynamic images shown in the public Landing Page hero section.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button className="hs-btn-reset" onClick={handleReset} disabled={loading}>
                            <FaUndo style={{ fontSize: '0.78rem' }} /> Reset Defaults
                        </button>
                        <button className="hs-btn-save" onClick={handleSave} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <><FaSave style={{ fontSize: '0.82rem' }} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>

                {/* CARDS GRID */}
                <div className="row g-4">

                    {/* SLOT 1: MAIN ARCH */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="hs-card">
                            <div className="hs-card-header">
                                <span className="hs-card-title">Main Arch (Right)</span>
                                <span className="hs-badge-featured">Featured</span>
                            </div>
                            <div className="hs-card-body">
                                <div className="hs-preview">
                                    {images.mainArch?.url ? (
                                        <>
                                            <img src={images.mainArch.url} alt="Main Arch" />
                                            <div className="hs-preview-overlay">{images.mainArch?.title || 'Featured'}</div>
                                            <button className="hs-preview-delete" title="Remove image" onClick={() => handleClearSlot('mainArch')}>
                                                <FaTrashAlt />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="hs-preview-empty">
                                            <div className="hs-preview-empty-icon"><FaImage /></div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>No image set</span>
                                            <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.15)' }}>Uses system default</span>
                                        </div>
                                    )}
                                </div>
                                <div className="hs-card-form">
                                    <input type="file" id="file-mainArch" accept="image/*" className="d-none"
                                        onChange={e => handleFileChange('mainArch', e.target.files[0])} disabled={loading} />
                                    <label htmlFor="file-mainArch" className="hs-upload-btn">
                                        <span className="hs-upload-icon"><FaUpload /></span>
                                        Upload Arch Image
                                    </label>
                                    <div>
                                        <label className="hs-label">Featured Title</label>
                                        <input type="text" className="hs-input" placeholder="e.g. Royal Palace"
                                            value={images.mainArch?.title || ''} onChange={e => handleTextChange('mainArch', 'title', e.target.value)} disabled={loading} />
                                    </div>
                                    <div>
                                        <label className="hs-label">Badge Tag</label>
                                        <input type="text" className="hs-input" placeholder="e.g. Featured"
                                            value={images.mainArch?.subtitle || ''} onChange={e => handleTextChange('mainArch', 'subtitle', e.target.value)} disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLOT 2: HORIZONTAL */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="hs-card">
                            <div className="hs-card-header">
                                <span className="hs-card-title">Horizontal (Top Left)</span>
                                <span className="hs-badge-slot">Slot 2</span>
                            </div>
                            <div className="hs-card-body">
                                <div className="hs-preview">
                                    {images.horizontal?.url ? (
                                        <>
                                            <img src={images.horizontal.url} alt="Horizontal" />
                                            <div className="hs-preview-overlay">{images.horizontal?.title || 'Grand Banquet'}</div>
                                            <button className="hs-preview-delete" title="Remove image" onClick={() => handleClearSlot('horizontal')}>
                                                <FaTrashAlt />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="hs-preview-empty">
                                            <div className="hs-preview-empty-icon"><FaImage /></div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>No image set</span>
                                            <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.15)' }}>Uses system default</span>
                                        </div>
                                    )}
                                </div>
                                <div className="hs-card-form">
                                    <input type="file" id="file-horizontal" accept="image/*" className="d-none"
                                        onChange={e => handleFileChange('horizontal', e.target.files[0])} disabled={loading} />
                                    <label htmlFor="file-horizontal" className="hs-upload-btn">
                                        <span className="hs-upload-icon"><FaUpload /></span>
                                        Upload Horizontal Image
                                    </label>
                                    <div>
                                        <label className="hs-label">Image Title</label>
                                        <input type="text" className="hs-input" placeholder="e.g. Grand Banquet"
                                            value={images.horizontal?.title || ''} onChange={e => handleTextChange('horizontal', 'title', e.target.value)} disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLOT 3: VERTICAL */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="hs-card">
                            <div className="hs-card-header">
                                <span className="hs-card-title">Vertical (Bottom Left)</span>
                                <span className="hs-badge-slot">Slot 3</span>
                            </div>
                            <div className="hs-card-body">
                                <div className="hs-preview">
                                    {images.vertical?.url ? (
                                        <>
                                            <img src={images.vertical.url} alt="Vertical" />
                                            <div className="hs-preview-overlay">{images.vertical?.title || 'Luxury Decor'}</div>
                                            <button className="hs-preview-delete" title="Remove image" onClick={() => handleClearSlot('vertical')}>
                                                <FaTrashAlt />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="hs-preview-empty">
                                            <div className="hs-preview-empty-icon"><FaImage /></div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>No image set</span>
                                            <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.15)' }}>Uses system default</span>
                                        </div>
                                    )}
                                </div>
                                <div className="hs-card-form">
                                    <input type="file" id="file-vertical" accept="image/*" className="d-none"
                                        onChange={e => handleFileChange('vertical', e.target.files[0])} disabled={loading} />
                                    <label htmlFor="file-vertical" className="hs-upload-btn">
                                        <span className="hs-upload-icon"><FaUpload /></span>
                                        Upload Vertical Image
                                    </label>
                                    <div>
                                        <label className="hs-label">Image Title</label>
                                        <input type="text" className="hs-input" placeholder="e.g. Luxury Decor"
                                            value={images.vertical?.title || ''} onChange={e => handleTextChange('vertical', 'title', e.target.value)} disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLOT 4: CIRCULAR */}
                    <div className="col-12 col-md-6 col-xl-3">
                        <div className="hs-card">
                            <div className="hs-card-header">
                                <span className="hs-card-title">Circular Accent (Right)</span>
                                <span className="hs-badge-slot">Slot 4</span>
                            </div>
                            <div className="hs-card-body">
                                <div className="hs-preview">
                                    {images.circular?.url ? (
                                        <>
                                            <img src={images.circular.url} alt="Circular" />
                                            <div className="hs-preview-overlay">{images.circular?.title || 'Event Hall'}</div>
                                            <button className="hs-preview-delete" title="Remove image" onClick={() => handleClearSlot('circular')}>
                                                <FaTrashAlt />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="hs-preview-empty">
                                            <div className="hs-preview-empty-icon"><FaImage /></div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>No image set</span>
                                            <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.15)' }}>Uses system default</span>
                                        </div>
                                    )}
                                </div>
                                <div className="hs-card-form">
                                    <input type="file" id="file-circular" accept="image/*" className="d-none"
                                        onChange={e => handleFileChange('circular', e.target.files[0])} disabled={loading} />
                                    <label htmlFor="file-circular" className="hs-upload-btn">
                                        <span className="hs-upload-icon"><FaUpload /></span>
                                        Upload Circle Image
                                    </label>
                                    <div>
                                        <label className="hs-label">Image Title</label>
                                        <input type="text" className="hs-input" placeholder="e.g. Event Hall"
                                            value={images.circular?.title || ''} onChange={e => handleTextChange('circular', 'title', e.target.value)} disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default HeroSettings;
