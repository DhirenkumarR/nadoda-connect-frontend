import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    Lock,
    Phone,
    Mail,
    KeyRound,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    UserCheck,
    RefreshCw
} from 'lucide-react';

export const LoginScreen = () => {
    const { login, forgotPassword, setPassword } = useAuth();

    // Mode: 'login' or 'forgot'
    const [mode, setMode] = useState('login');

    // Login Form State
    const [identifier, setIdentifier] = useState('');
    const [password, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot / Set Password State
    const [forgotStep, setForgotStep] = useState(1); // 1: enter identifier, 2: enter otp & new password
    const [forgotIdentifier, setForgotIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    // Status / Feedback
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await login(identifier, password);
        } catch (err) {
            if (err.response?.needsPasswordSetup) {
                setErrorMessage(err.response.message);
                setForgotIdentifier(identifier);
                // Prompt to switch to password setup
            } else {
                setErrorMessage(err.response?.message || err.message || 'Login failed. Please check credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Step 1: Request OTP via Email / SMS
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await forgotPassword(forgotIdentifier);
            if (res.success) {
                setSuccessMessage(res.message || 'વેરિફિકેશન કોડ સફળતાપૂર્વક મોકલવામાં આવ્યો છે.');
                setForgotStep(2);
            } else {
                setErrorMessage(res.message || 'સભ્ય મળ્યા નથી. કૃપા કરીને એડમિનનો સંપર્ક કરો.');
            }
        } catch (err) {
            console.error('OTP request error:', err);
            setErrorMessage(err.response?.message || err.message || 'ચકાસણી નિષ્ફળ ગઈ. કૃપા કરીને સાચો મોબાઈલ નંબર અથવા ઈમેલ દાખલ કરો.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Step 2: Set Password
    const handleSetPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('પાસવર્ડ મેળ ખાતો નથી (Passwords do not match)');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ (Password must be at least 6 characters)');
            return;
        }

        setLoading(true);
        try {
            // Commit new password in backend
            await setPassword(forgotIdentifier, otp, newPassword);
            // On success, user is logged in automatically by AuthContext
        } catch (err) {
            setErrorMessage(err.response?.message || err.message || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 12px',
            position: 'relative'
        }}>
            <div className="login-card" style={{
                maxWidth: '480px',
                width: '100%',
                background: 'rgba(19, 30, 54, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg), 0 0 40px rgba(245, 158, 11, 0.1)',
                padding: '30px 20px',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <img
                        src={`${import.meta.env.BASE_URL}nododa_rajput.png`}
                        alt="શ્રી નાડોદા રાજપૂત સમાજ"
                        style={{
                            width: '84px',
                            height: '84px',
                            margin: '0 auto 14px',
                            display: 'block',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid rgba(245, 158, 11, 0.7)',
                            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                            background: '#1E293B'
                        }}
                    />

                    <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#FFF', letterSpacing: '-0.01em' }}>
                        શ્રી નાડોદા રાજપૂત સમાજ
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: '600', marginTop: '2px' }}>
                        Nadoda Connect Community Portal
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.725rem' }}>
                            <Shield size={12} /> સુરક્ષિત સભ્ય & વહીવટી પોર્ટલ (Protected Access)
                        </span>
                    </div>
                </div>

                {/* Error / Alert Message */}
                {errorMessage && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#FB7185',
                        fontSize: '0.825rem',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>{errorMessage}</div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        fontSize: '0.825rem',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>{successMessage}</div>
                    </div>
                )}

                {/* MODE 1: LOGIN FORM */}
                {mode === 'login' ? (
                    <div>
                        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">
                                    મોબાઈલ નંબર અથવા ઈમેલ (Mobile or Email)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} color="var(--text-muted)" style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="દા.ત. 9999999999 અથવા email@example.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: '38px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label className="form-label" style={{ marginBottom: 0 }}>
                                        પાસવર્ડ (Password)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('forgot');
                                            setForgotStep(1);
                                            setForgotIdentifier(identifier);
                                            setErrorMessage('');
                                            setSuccessMessage('');
                                        }}
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--accent-amber)',
                                            fontWeight: '500'
                                        }}
                                    >
                                        પાસવર્ડ બનાવો / ભૂલી ગયા?
                                    </button>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} color="var(--text-muted)" style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="તમારો ગુપ્ત પાસવર્ડ દાખલ કરો"
                                        value={password}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: '38px', paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '0.95rem',
                                    marginTop: '8px'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw size={16} className="spin-icon" /> ચકાસણી ચાલુ છે...
                                    </>
                                ) : (
                                    <>
                                        લૉગિન કરો (Sign In) <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Notice */}
                        <div style={{
                            marginTop: '24px',
                            paddingTop: '20px',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.775rem',
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            lineHeight: '1.6'
                        }}>
                            <p style={{ margin: 0 }}>
                                🔒 <strong>નોંધ:</strong> પ્લેટફોર્મમાં કોઈ જાહેર રજીસ્ટ્રેશન નથી. ફક્ત અધિકૃત એડમિન દ્વારા નોંધાયેલા સભ્યો જ લૉગિન કરી શકે છે.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* MODE 2: FORGOT / FIRST-TIME PASSWORD CREATION */
                    <div>
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--accent-amber-light)',
                            fontSize: '0.8rem',
                            marginBottom: '18px'
                        }}>
                            ✨ <strong>સભ્ય પાસવર્ડ સેટઅપ:</strong> એડમિન દ્વારા ડિરેક્ટરીમાં ઉમેરેલ કોઈપણ સભ્ય પોતાનો નોંધાયેલ મોબાઈલ નંબર દાખલ કરીને પ્રથમ વખત પાસવર્ડ બનાવી શકે છે.
                        </div>

                        {forgotStep === 1 ? (
                            /* STEP 1: Enter Identifier */
                            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="form-label">
                                        નોંધાયેલ મોબાઈલ નંબર અથવા ઈમેલ
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} color="var(--text-muted)" style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="દા.ત. 9824406691 અથવા તમારો મોબાઈલ"
                                            value={forgotIdentifier}
                                            onChange={(e) => setForgotIdentifier(e.target.value)}
                                            className="form-input"
                                            style={{ paddingLeft: '38px' }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        અમે તમારા એકાઉન્ટની ચકાસણી માટે કોડ મોકલીશું.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {loading ? 'તપાસી રહ્યા છીએ...' : 'ચકાસણી કોડ મેળવો (Get OTP)'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('login');
                                        setErrorMessage('');
                                        setSuccessMessage('');
                                    }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%' }}
                                >
                                    પાછા લૉગિન પર જાઓ (Back to Login)
                                </button>
                            </form>
                        ) : (
                            /* STEP 2: Enter OTP & Set New Password */
                            <form onSubmit={handleSetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="form-label">
                                        ૬-અંકનો ચકાસણી કોડ (Verification OTP)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <KeyRound size={16} color="var(--text-muted)" style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }} />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="૬-અંકનો OTP દાખલ કરો"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="form-input"
                                            style={{ paddingLeft: '38px', letterSpacing: '0.2em', fontWeight: '700' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">
                                        નવો પાસવર્ડ (New Password - Min 6 chars)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} color="var(--text-muted)" style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }} />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            placeholder="નવો ગુપ્ત પાસવર્ડ"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="form-input"
                                            style={{ paddingLeft: '38px', paddingRight: '40px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-muted)'
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">
                                        પાસવર્ડ પુષ્ટિ કરો (Confirm Password)
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="નવો પાસવર્ડ ફરીથી લખો"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '0.95rem',
                                        marginTop: '4px'
                                    }}
                                >
                                    {loading ? 'સેવિંગ...' : 'પાસવર્ડ સેટ કરો અને લૉગિન કરો (Activate & Login)'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setForgotStep(1)}
                                    className="btn btn-secondary"
                                    style={{ width: '100%' }}
                                >
                                    પાછળ (Back)
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
