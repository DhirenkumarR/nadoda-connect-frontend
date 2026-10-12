import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { authApi } from '../services/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (newPassword.length < 6) {
            setErrorMessage('નવો પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ (Minimum 6 characters)');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('નવો પાસવર્ડ અને કન્ફર્મ પાસવર્ડ મેળ ખાતા નથી (Passwords do not match)');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.changePassword(oldPassword, newPassword);
            if (res.success) {
                setSuccessMessage(res.message || 'પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    onClose();
                    setSuccessMessage('');
                }, 1800);
            }
        } catch (err) {
            setErrorMessage(err.response?.message || err.message || 'પાસવર્ડ બદલવામાં નિષ્ફળ. જૂનો પાસવર્ડ સાચો છે કે નહીં તે ચકાસો.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
        }}>
            <div className="modal-content" style={{
                maxWidth: '440px',
                width: '100%',
                background: 'rgba(19, 30, 54, 0.98)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg), 0 0 35px rgba(245, 158, 11, 0.15)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-amber)'
                        }}>
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                પાસવર્ડ બદલો (Change Password)
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                તમારા એકાઉન્ટનો પાસવર્ડ અપડેટ કરો
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {errorMessage && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#FB7185',
                        fontSize: '0.8rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <div>{errorMessage}</div>
                    </div>
                )}

                {successMessage && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        fontSize: '0.8rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                        <div>{successMessage}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label className="form-label">
                            હાલનો જૂનો પાસવર્ડ (Current Password)*
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showOld ? 'text' : 'password'}
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="તમારો વર્તમાન પાસવર્ડ દાખલ કરો"
                                className="form-input"
                                style={{ paddingLeft: '36px', paddingRight: '38px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">
                            નવો પાસવર્ડ (New Password - Min 6 chars)*
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showNew ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="નવો સુરક્ષિત પાસવર્ડ દાખલ કરો"
                                className="form-input"
                                style={{ paddingLeft: '36px', paddingRight: '38px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">
                            નવો પાસવર્ડ પુષ્ટિ કરો (Confirm New Password)*
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="નવો પાસવર્ડ ફરીથી લખો"
                                className="form-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            રદ કરો (Cancel)
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ flex: 1.5 }}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={14} className="spin-icon" /> સેવિંગ...
                                </>
                            ) : (
                                'પાસવર્ડ બદલો (Save)'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
