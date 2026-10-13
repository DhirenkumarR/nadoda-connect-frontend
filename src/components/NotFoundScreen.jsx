import React from 'react';
import { Home, ArrowLeft, Building2, Users, AlertCircle } from 'lucide-react';

export const NotFoundScreen = ({ onGoHome, onNavigateTab }) => {
    return (
        <div style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 16px',
            position: 'relative'
        }}>
            <div
                className="glass-panel"
                style={{
                    maxWidth: '560px',
                    width: '100%',
                    padding: '40px 32px',
                    textAlign: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 158, 11, 0.1)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)'
                }}
            >
                {/* 404 Glowing Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '84px',
                    height: '84px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
                    margin: '0 auto 20px',
                    color: 'var(--accent-amber)'
                }}>
                    <AlertCircle size={44} />
                </div>

                <div style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    lineHeight: '1',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #EF4444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '2px',
                    marginBottom: '10px'
                }}>
                    404
                </div>

                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#FFF',
                    marginBottom: '8px'
                }}>
                    પૃષ્ઠ મળ્યું નથી (Page Not Found)
                </h2>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    marginBottom: '26px'
                }}>
                    તમે જે સરનામું (URL) દાખલ કર્યું છે તે અસ્તિત્વમાં નથી અથવા ખસેડવામાં આવ્યું છે. નીચે આપેલા બટન પર ક્લિક કરીને સીધા મુખ્ય પૃષ્ઠ પર પહોંચી શકો છો.
                </p>

                {/* Primary Action Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={onGoHome}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            maxWidth: '320px',
                            padding: '12px 20px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
                        }}
                    >
                        <Home size={18} />
                        <span>હોમ પેજ પર જાઓ (Go to Home Page)</span>
                    </button>

                    {/* Secondary Quick Links */}
                    {onNavigateTab && (
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '12px',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => onNavigateTab('members')}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Users size={14} />
                                <span>સભ્યો નિર્દેશિકા</span>
                            </button>

                            <button
                                onClick={() => onNavigateTab('hierarchy')}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Building2 size={14} />
                                <span>ગામ વંશાવળી</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
