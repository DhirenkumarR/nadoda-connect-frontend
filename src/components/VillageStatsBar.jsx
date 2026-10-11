import React, { useState } from 'react';
import { Home, Users, UserCheck, RefreshCw, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { villageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const VillageStatsBar = ({ village, stats, onRefresh }) => {
    const { canManageVillage } = useAuth();
    const [recalculating, setRecalculating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRecalculate = async () => {
        if (!village?._id) return;
        setRecalculating(true);
        setSuccessMessage('');
        try {
            const res = await villageApi.recalculate(village._id);
            if (res.success) {
                setSuccessMessage('વસ્તી અને ઘરોની ગણતરી ડેટાબેઝમાંથી સફળતાપૂર્વક અપડેટ થઈ! (Counts recalculated from DB)');
                if (onRefresh) onRefresh();
                setTimeout(() => setSuccessMessage(''), 4000);
            }
        } catch (err) {
            alert('Recalculation error: ' + err.message);
        } finally {
            setRecalculating(false);
        }
    };

    // Fallbacks if stats object or village object
    const totalHouses = stats?.summary?.totalHouses ?? village?.totalHouses ?? 0;
    const totalMembers = stats?.summary?.totalMembers ?? village?.totalMembers ?? 0;
    const totalMale = stats?.summary?.totalMale ?? village?.totalMale ?? 0;
    const totalFemale = stats?.summary?.totalFemale ?? village?.totalFemale ?? 0;
    const sexRatio = stats?.summary?.sexRatio ?? (totalMale > 0 ? Math.round((totalFemale / totalMale) * 1000) : 0);
    const avgFamilySize = stats?.summary?.averageFamilySize ?? (totalHouses > 0 ? (totalMembers / totalHouses).toFixed(1) : 0);

    return (
        <div style={{ marginBottom: '24px' }}>
            {/* Top Village Header Bar */}
            <div className="glass-panel" style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(27, 41, 75, 0.7) 0%, rgba(19, 30, 54, 0.9) 100%)',
                border: '1px solid var(--border-hover)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#FFF' }}>
                            {village?.name?.gu || 'બાસ્પા'} ({village?.name?.en || 'Baspa'})
                        </h2>
                        <span className="badge badge-emerald">
                            <CheckCircle2 size={13} /> લાઈવ ડેટાબેઝ ગણતરી (Live DB Count)
                        </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        તાલુકો: {village?.taluka?.gu || 'સમી'} ({village?.taluka?.en || 'Sami'}) • જિલ્લો: {village?.district?.gu || 'પાટણ'} ({village?.district?.en || 'Patan'}) • પિનકોડ: {village?.pincode || '384245'}
                    </p>
                </div>

                {/* Recalculate Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={handleRecalculate}
                        disabled={recalculating}
                        className="btn btn-secondary"
                        style={{
                            fontSize: '0.825rem',
                            padding: '8px 14px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: 'var(--accent-amber)'
                        }}
                    >
                        <RefreshCw size={15} className={recalculating ? 'spin-icon' : ''} style={{
                            animation: recalculating ? 'spin 1s linear infinite' : 'none'
                        }} />
                        <span>{recalculating ? 'ગણતરી ચાલુ છે...' : 'Recalculate Stats from DB'}</span>
                    </button>
                </div>
            </div>

            {/* Notification alert on recalculation */}
            {successMessage && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <Sparkles size={16} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Metric Cards Grid */}
            <div className="stats-grid" style={{ marginTop: '14px' }}>
                {/* Total Families Card */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            કુલ ઘરો / Families
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--accent-amber)'
                        }}>
                            <Home size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFF', marginTop: '6px' }}>
                        {totalHouses}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        નોંધાયેલ કુટુંબો (Houses)
                    </div>
                </div>

                {/* Total Members Card */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            કુલ સભ્યો / Members
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60A5FA'
                        }}>
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFF', marginTop: '6px' }}>
                        {totalMembers}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        કુલ ગામ વસ્તી (Population)
                    </div>
                </div>

                {/* Male Members Card */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            પુરુષ / Male
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38BDF8'
                        }}>
                            <UserCheck size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#38BDF8', marginTop: '6px' }}>
                        {totalMale}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {totalMembers > 0 ? `${Math.round((totalMale / totalMembers) * 100)}% વસ્તી હિસ્સો` : ''}
                    </div>
                </div>

                {/* Female Members Card */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            સ્ત્રી / Female
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#FB7185'
                        }}>
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FB7185', marginTop: '6px' }}>
                        {totalFemale}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {totalMembers > 0 ? `${Math.round((totalFemale / totalMembers) * 100)}% વસ્તી હિસ્સો` : ''}
                    </div>
                </div>

                {/* Sex Ratio Card */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            જાતિ પ્રમાણ / Sex Ratio
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34D399'
                        }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34D399', marginTop: '6px' }}>
                        {sexRatio}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        પ્રતિ ૧,૦૦૦ પુરુષે સ્ત્રીઓ
                    </div>
                </div>

                {/* Avg Family Size */}
                <div className="glass-panel stat-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="stat-card-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            સરેરાશ કદ / Avg Size
                        </span>
                        <div style={{
                            padding: '6px',
                            borderRadius: '8px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#C084FC'
                        }}>
                            <Home size={18} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#C084FC', marginTop: '6px' }}>
                        {avgFamilySize}
                    </div>
                    <div className="stat-card-label hide-mobile" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        સભ્યો પ્રતિ ઘર
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
