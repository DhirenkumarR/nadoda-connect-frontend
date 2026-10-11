import React from 'react';
import {
    BarChart3,
    Briefcase,
    MapPin,
    Heart,
    Users,
    TrendingUp,
    Sparkles
} from 'lucide-react';

export const DemographicsView = ({ village, stats }) => {
    const demo = stats?.demographics || {};
    const summary = stats?.summary || {};

    const ageDistribution = demo.ageDistribution || [];
    const topOccupations = demo.topOccupations || [];
    const topCities = demo.topCities || [];
    const maritalStatus = demo.maritalStatus || [];

    const totalPop = summary.totalMembers || village?.totalMembers || 1;

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                    ગામ વસ્તી આંકડા & એનાલિટિક્સ / Demographics Analytics
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ડેટાબેઝના વાસ્તવિક રેકોર્ડ્સ પરથી કમ્પ્યુટેડ લાઈવ આંકડા ({village?.name?.gu} - {village?.name?.en})
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '16px'
            }}>
                {/* 1. Age Distribution */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Users size={18} color="var(--accent-amber)" />
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFF' }}>
                            ઉંમર જૂથ વિતરણ / Age Distribution
                        </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {ageDistribution.map((group, idx) => {
                            const percent = Math.round((group.count / totalPop) * 100);
                            return (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                            {group.range}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            <strong>{group.count}</strong> સભ્યો ({percent}%) • ♂ {group.male} | ♀ {group.female}
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #F59E0B 0%, #10B981 100%)',
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Top Occupations */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Briefcase size={18} color="#60A5FA" />
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFF' }}>
                            મુખ્ય વ્યવસાયો / Top Occupations
                        </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topOccupations.slice(0, 7).map((occ, idx) => {
                            const percent = Math.round((occ.count / totalPop) * 100);
                            return (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="badge badge-amber" style={{ fontSize: '0.675rem' }}>
                                            #{idx + 1}
                                        </span>
                                        <span style={{ fontWeight: '600', color: '#FFF' }}>{occ._id}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                                        {occ.count} સભ્યો
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Top Residence / Work Cities */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <MapPin size={18} color="#34D399" />
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFF' }}>
                            વસવાટ & કાર્યક્ષેત્ર શહેરો / Living & Work Cities
                        </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topCities.slice(0, 7).map((city, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="badge badge-emerald" style={{ fontSize: '0.675rem' }}>
                                        #{idx + 1}
                                    </span>
                                    <span style={{ fontWeight: '600', color: '#FFF' }}>{city._id}</span>
                                </div>
                                <span style={{ color: '#34D399', fontWeight: '700' }}>
                                    {city.count} સભ્યો
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Marital Status */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Heart size={18} color="#FB7185" />
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFF' }}>
                            લગ્ન સ્થિતિ / Marital Status Distribution
                        </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {maritalStatus.map((m, idx) => (
                            <div key={idx} style={{
                                padding: '14px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {m._id || m.key}
                                </div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF', marginTop: '4px' }}>
                                    {m.count}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {Math.round((m.count / totalPop) * 100)}% વસ્તી
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
