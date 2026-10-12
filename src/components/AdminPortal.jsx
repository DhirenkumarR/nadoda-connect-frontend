import React, { useState, useEffect } from 'react';
import {
    Shield,
    ShieldAlert,
    Check,
    X,
    Clock,
    User,
    Home,
    AlertTriangle,
    Plus,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Building2,
    Users,
    KeyRound,
    Eye,
    EyeOff,
    Search
} from 'lucide-react';
import { approvalApi, authApi, villageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPortal = ({
    village,
    villages = [],
    onAddFamily,
    onAddMember,
    onRefreshStats
}) => {
    const { user, isSuperAdmin, isVillageAdmin, canManageVillage } = useAuth();
    const canManageSelectedVillage = village?._id ? canManageVillage(village._id) : false;

    const [adminTab, setAdminTab] = useState('approvals'); // 'approvals', 'users', 'villages'
    const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Reject Modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequestForReject, setSelectedRequestForReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    // User management state (Super Admin & Village Admin)
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // Set Password Modal state
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
    const [adminNewPassword, setAdminNewPassword] = useState('');
    const [adminShowPassword, setAdminShowPassword] = useState(false);
    const [settingPasswordLoading, setSettingPasswordLoading] = useState(false);

    // Create Village state (Super Admin)
    const [showCreateVillageModal, setShowCreateVillageModal] = useState(false);
    const [newVillageData, setNewVillageData] = useState({
        nameGu: '',
        nameEn: '',
        slug: '',
        talukaGu: 'સમી',
        talukaEn: 'Sami',
        districtGu: 'પાટણ',
        districtEn: 'Patan',
        pincode: '384245'
    });

    // Create Village Admin state (Super Admin)
    const [showCreateVillageAdminModal, setShowCreateVillageAdminModal] = useState(false);
    const [newVillageAdminData, setNewVillageAdminData] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        assignedVillageId: village?._id || '',
        initialPassword: ''
    });

    // Fetch requests
    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const res = await approvalApi.getAll({
                status: statusFilter,
                villageId: isVillageAdmin ? user?.assignedVillageId?._id || user?.assignedVillageId : undefined
            });
            if (res.success) {
                setRequests(res.data);
            }
        } catch (err) {
            console.error('Error fetching approval requests:', err);
        } finally {
            setLoadingRequests(false);
        }
    };

    // Fetch users (Super Admin & Village Admin)
    const fetchUsers = async () => {
        if (!isSuperAdmin && !isVillageAdmin) return;
        setLoadingUsers(true);
        try {
            const res = await authApi.getUsers();
            if (res.success) {
                setUsersList(res.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAdminSetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserForPassword || adminNewPassword.trim().length < 6) {
            alert('પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ (Password must be at least 6 characters)');
            return;
        }
        setSettingPasswordLoading(true);
        try {
            const res = await authApi.adminSetPassword(selectedUserForPassword._id, adminNewPassword.trim());
            if (res.success) {
                alert(res.message || 'પાસવર્ડ સફળતાપૂર્વક સેટ થઈ ગયો છે!');
                setSelectedUserForPassword(null);
                setAdminNewPassword('');
                fetchUsers();
            }
        } catch (err) {
            alert('Password setting error: ' + (err.response?.message || err.message));
        } finally {
            setSettingPasswordLoading(false);
        }
    };

    useEffect(() => {
        if (!isSuperAdmin && !isVillageAdmin) return;
        fetchRequests();
    }, [statusFilter, isVillageAdmin, user, isSuperAdmin]);

    useEffect(() => {
        if (adminTab === 'users' && (isSuperAdmin || isVillageAdmin)) {
            fetchUsers();
        }
    }, [adminTab, isSuperAdmin, isVillageAdmin]);

    const handleApprove = async (reqId) => {
        setActionLoadingId(reqId);
        try {
            const res = await approvalApi.approve(reqId, 'Approved by admin');
            if (res.success) {
                alert('અરજી મંજૂર કરવામાં આવી! (Request approved successfully)');
                fetchRequests();
                if (onRefreshStats) onRefreshStats();
            }
        } catch (err) {
            alert('Approval error: ' + (err.response?.message || err.message));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleOpenReject = (req) => {
        setSelectedRequestForReject(req);
        setRejectionReason('માહિતી ચકાસણીમાં ખામી જણાયેલ છે');
        setAdminNotes('');
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRequestForReject) return;
        setActionLoadingId(selectedRequestForReject._id);
        try {
            const res = await approvalApi.reject(
                selectedRequestForReject._id,
                rejectionReason,
                adminNotes
            );
            if (res.success) {
                alert('અરજી નામંજૂર કરવામાં આવી (Request rejected)');
                setRejectModalOpen(false);
                setSelectedRequestForReject(null);
                fetchRequests();
            }
        } catch (err) {
            alert('Rejection error: ' + (err.response?.message || err.message));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRoleChange = async (targetUserId, newRole, targetVillageId) => {
        try {
            const res = await authApi.updateRole(targetUserId, {
                role: newRole,
                assignedVillageId: targetVillageId || null
            });
            if (res.success) {
                alert('User role updated successfully!');
                fetchUsers();
            }
        } catch (err) {
            alert('Failed to update role: ' + err.message);
        }
    };

    const handleCreateVillageSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: { gu: newVillageData.nameGu, en: newVillageData.nameEn },
                slug: newVillageData.slug || newVillageData.nameEn.toLowerCase().replace(/\s+/g, '-'),
                taluka: { gu: newVillageData.talukaGu, en: newVillageData.talukaEn },
                district: { gu: newVillageData.districtGu, en: newVillageData.districtEn },
                pincode: newVillageData.pincode
            };
            const res = await villageApi.create(payload);
            if (res.success) {
                alert('New village registered successfully!');
                setShowCreateVillageModal(false);
                window.location.reload();
            }
        } catch (err) {
            alert('Error creating village: ' + err.message);
        }
    };

    const handleCreateVillageAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi.createVillageAdmin({
                name: newVillageAdminData.name,
                mobileNumber: newVillageAdminData.mobileNumber,
                email: newVillageAdminData.email || undefined,
                assignedVillageId: newVillageAdminData.assignedVillageId,
                initialPassword: newVillageAdminData.initialPassword || undefined
            });
            if (res.success) {
                alert('Village Admin created successfully! They can log in with their credentials or set password.');
                setShowCreateVillageAdminModal(false);
                fetchUsers();
            }
        } catch (err) {
            alert('Error creating Village Admin: ' + err.message);
        }
    };

    if (!isSuperAdmin && !isVillageAdmin) {
        return (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#FB7185',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <ShieldAlert size={32} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF', marginBottom: '8px' }}>
                    પ્રતિબંધિત એક્સેસ (Access Restricted)
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
                    આ વહીવટી પોર્ટલ ફક્ત સુપર એડમિન અને ગામ એડમિન માટે જ અધિકૃત છે. સામાન્ય સભ્યો માટે આ વિભાગ ઉપલબ્ધ નથી.
                    <br />
                    (This admin portal is strictly restricted to Super Admins and Village Admins.)
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade">
            {/* Authority Scope Banner */}
            <div className="glass-panel" style={{
                padding: '20px 24px',
                marginBottom: '20px',
                border: `1px solid ${
                    isSuperAdmin
                        ? 'rgba(245, 158, 11, 0.4)'
                        : isVillageAdmin
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'var(--border-subtle)'
                }`,
                background: isSuperAdmin
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(19, 30, 54, 0.9) 100%)'
                    : isVillageAdmin
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(19, 30, 54, 0.9) 100%)'
                    : 'var(--bg-glass)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: isSuperAdmin
                                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0F172A'
                        }}>
                            {isSuperAdmin ? <ShieldAlert size={24} /> : <Shield size={24} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                                    {isSuperAdmin ? 'સુપર એડમિન પોર્ટલ (Super Admin Access)' : 'ગામ એડમિન પોર્ટલ (Village Admin Access)'}
                                </h3>
                                <span className={`badge ${isSuperAdmin ? 'badge-amber' : 'badge-blue'}`}>
                                    {isSuperAdmin ? 'Full Global Authority' : 'Village Authority'}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {isSuperAdmin ? (
                                    <>તમે તમામ ગામોના રેકોર્ડ્સ એડિટ/ડીલીટ કરી શકો છો અને બધી મંજૂરી અરજીઓ પ્રોસેસ કરી શકો છો.</>
                                ) : (
                                    <>
                                        તમે ફક્ત તમારા ફાળવેલ ગામ (<strong>{village?.name?.gu}</strong>) માટે રેકોર્ડ્સ મેનેજ અને અરજીઓ મંજૂર કરી શકો છો. અન્ય ગામો માટે ફેરફાર પ્રતિબંધિત છે.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Quick Create Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {canManageSelectedVillage && (
                            <>
                                <button
                                    onClick={() => onAddFamily && onAddFamily(village)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    <Plus size={14} /> કુટુંબ ઉમેરો (Family)
                                </button>
                                <button
                                    onClick={() => onAddMember && onAddMember(village)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <Plus size={14} /> સભ્ય ઉમેરો (Member)
                                </button>
                            </>
                        )}
                        {isSuperAdmin && (
                            <>
                                <button
                                    onClick={() => {
                                        setNewVillageAdminData({
                                            name: '',
                                            mobileNumber: '',
                                            email: '',
                                            assignedVillageId: village?._id || '',
                                            initialPassword: ''
                                        });
                                        setShowCreateVillageAdminModal(true);
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{ borderColor: '#60A5FA', color: '#60A5FA' }}
                                >
                                    <Shield size={14} /> + ગામ એડમિન બનાવો (Village Admin)
                                </button>
                                <button
                                    onClick={() => setShowCreateVillageModal(true)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
                                >
                                    <Building2 size={14} /> નવું ગામ ઉમેરો (New Village)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Subtabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <button
                    onClick={() => setAdminTab('approvals')}
                    style={{
                        padding: '10px 16px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: adminTab === 'approvals' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        borderBottom: `2px solid ${adminTab === 'approvals' ? 'var(--accent-amber)' : 'transparent'}`
                    }}
                >
                    મંજૂરી અરજીઓ (Approval Requests)
                </button>

                {(isSuperAdmin || isVillageAdmin) && (
                    <button
                        onClick={() => setAdminTab('users')}
                        style={{
                            padding: '10px 16px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: adminTab === 'users' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                            borderBottom: `2px solid ${adminTab === 'users' ? 'var(--accent-amber)' : 'transparent'}`
                        }}
                    >
                        {isSuperAdmin
                            ? 'વપરાશકર્તા & પાસવર્ડ સંચાલન (Users & Passwords)'
                            : 'સભ્યોના વપરાશકર્તા ખાતા & પાસવર્ડ (Member Users & Passwords)'}
                    </button>
                )}
            </div>

            {/* TAB 1: APPROVAL REQUESTS */}
            {adminTab === 'approvals' && (
                <div>
                    {/* Status Filter Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>સ્થિતિ:</span>
                        {[
                            { key: 'pending', label: 'બાકી (Pending)' },
                            { key: 'approved', label: 'મંજૂર (Approved)' },
                            { key: 'rejected', label: 'નામંજૂર (Rejected)' },
                            { key: 'all', label: 'તમામ (All)' }
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setStatusFilter(item.key)}
                                className="btn btn-secondary btn-sm"
                                style={{
                                    background: statusFilter === item.key ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                    color: statusFilter === item.key ? 'var(--accent-amber)' : 'var(--text-secondary)',
                                    borderColor: statusFilter === item.key ? 'var(--accent-amber)' : 'var(--border-subtle)'
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Requests list */}
                    {loadingRequests ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            અરજીઓ લોડ થઈ રહી છે... (Loading requests)
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>
                                કોઈ {statusFilter !== 'all' ? statusFilter : ''} અરજી ઉપલબ્ધ નથી.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {requests.map((req) => {
                                const isPending = req.status === 'pending';
                                const isApproved = req.status === 'approved';
                                const isRejected = req.status === 'rejected';

                                // Can this admin approve this particular request?
                                const canApproveThis = isSuperAdmin || (
                                    isVillageAdmin && String(user?.assignedVillageId?._id || user?.assignedVillageId) === String(req.villageId?._id || req.villageId)
                                );

                                return (
                                    <div
                                        key={req._id}
                                        className="glass-panel"
                                        style={{
                                            padding: '18px 22px',
                                            border: '1px solid var(--border-subtle)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className={`badge ${
                                                    req.requestType === 'create'
                                                        ? 'badge-emerald'
                                                        : req.requestType === 'update'
                                                        ? 'badge-amber'
                                                        : 'badge-rose'
                                                }`}>
                                                    {req.requestType.toUpperCase()} {req.entityType.toUpperCase()}
                                                </span>

                                                <span className={`badge ${
                                                    isPending ? 'badge-amber' : isApproved ? 'badge-emerald' : 'badge-rose'
                                                }`}>
                                                    {req.status.toUpperCase()}
                                                </span>

                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    ગામ: <strong>{req.villageId?.name?.gu || req.villageId?.name?.en || 'બાસ્પા'}</strong>
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(req.createdAt).toLocaleString('gu-IN')}
                                            </div>
                                        </div>

                                        {/* Payload summary */}
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            background: 'rgba(0, 0, 0, 0.25)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.825rem'
                                        }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                સભ્ય / કુટુંબ વિગતો:
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)' }}>
                                                નામ: <strong>{req.payload?.fullName?.gu || req.payload?.fullName?.en || '-'}</strong> •
                                                અટક: <strong>{req.payload?.atak?.gu || req.payload?.atak?.en || '-'}</strong> •
                                                ઘર નં: <strong>{req.payload?.houseNumber || '-'}</strong> •
                                                મોબાઈલ: <strong>{req.payload?.mobileNumber || req.payload?.primaryMobile || '-'}</strong>
                                            </div>
                                            {req.rejectionReason && (
                                                <div style={{ marginTop: '6px', color: '#FB7185' }}>
                                                    નામંજૂરીનું કારણ: {req.rejectionReason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {isPending && (
                                            <div style={{
                                                marginTop: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                gap: '10px'
                                            }}>
                                                {canApproveThis ? (
                                                    <>
                                                        <button
                                                            disabled={actionLoadingId === req._id}
                                                            onClick={() => handleOpenReject(req)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            <X size={14} /> નામંજૂર કરો (Reject)
                                                        </button>
                                                        <button
                                                            disabled={actionLoadingId === req._id}
                                                            onClick={() => handleApprove(req._id)}
                                                            className="btn btn-success btn-sm"
                                                        >
                                                            <Check size={14} /> મંજૂર કરો (Approve & Commit to DB)
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        (તમારા ગામ સિવાયની અરજી - મંજૂરી અધિકાર નથી)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: USER MANAGEMENT & PASSWORD SETTING */}
            {adminTab === 'users' && (isSuperAdmin || isVillageAdmin) && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                {isSuperAdmin
                                    ? 'વપરાશકર્તા & પાસવર્ડ સંચાલન (User Accounts & Direct Password Setup)'
                                    : `તમારા ગામ (${village?.name?.gu || ''}) ના સભ્યોના વપરાશકર્તા ખાતા & પાસવર્ડ`}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                એડમિન સભ્યો માટે સીધો પાસવર્ડ સેટ કરી શકે છે, જેથી સભ્ય કોઈપણ સમસ્યા વગર સીધા લૉગિન કરી શકે.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="નામ, મોબાઈલ અથવા ઈમેલ શોધો..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '32px', paddingRight: '12px', fontSize: '0.825rem' }}
                            />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{
                                    borderBottom: '1px solid var(--border-hover)',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    fontSize: '0.725rem'
                                }}>
                                    <th style={{ padding: '12px 14px' }}>નામ / Name</th>
                                    <th style={{ padding: '12px 14px' }}>મોબાઈલ</th>
                                    <th style={{ padding: '12px 14px' }}>ઈમેલ</th>
                                    <th style={{ padding: '12px 14px' }}>રોલ (Role)</th>
                                    <th style={{ padding: '12px 14px' }}>ફાળવેલ ગામ (Village)</th>
                                    <th style={{ padding: '12px 14px' }}>પાસવર્ડ સ્ટેટસ</th>
                                    <th style={{ padding: '12px 14px' }}>ક્રિયા (Action)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList
                                    .filter((u) => {
                                        if (!userSearchTerm) return true;
                                        const term = userSearchTerm.toLowerCase();
                                        return (
                                            (u.name && u.name.toLowerCase().includes(term)) ||
                                            (u.mobileNumber && u.mobileNumber.toLowerCase().includes(term)) ||
                                            (u.email && u.email.toLowerCase().includes(term))
                                        );
                                    })
                                    .map((u) => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '12px 14px', fontWeight: '600', color: '#FFF' }}>
                                                {u.name || 'User'}
                                            </td>
                                            <td style={{ padding: '12px 14px', color: '#34D399', fontWeight: '500' }}>
                                                {u.mobileNumber}
                                            </td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                {u.email || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span className={`badge ${
                                                    u.role === 'super_admin'
                                                        ? 'badge-amber'
                                                        : u.role === 'village_admin'
                                                        ? 'badge-blue'
                                                        : 'badge-slate'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                {u.assignedVillageId?.name?.gu || u.assignedVillageId?.name?.en || 'બધા ગામો (Global)'}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                {u.isPasswordSet ? (
                                                    <span className="badge badge-emerald" style={{ fontSize: '0.725rem' }}>
                                                        <CheckCircle2 size={12} /> સેટ કરેલ (Active)
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                                                        <Clock size={12} /> પાસવર્ડ બાકી (Not set)
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {/* Set Password Button (Super Admin can set for all, Village Admin sets for members) */}
                                                    {(isSuperAdmin || (isVillageAdmin && u.role === 'member')) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedUserForPassword(u);
                                                                setAdminNewPassword('');
                                                                setAdminShowPassword(false);
                                                            }}
                                                            className="btn btn-primary btn-sm"
                                                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                                                            title="આ સભ્ય માટે પાસવર્ડ સેટ કરો"
                                                        >
                                                            <KeyRound size={13} /> પાસવર્ડ સેટ કરો
                                                        </button>
                                                    )}

                                                    {/* Role Dropdown (Super Admin only) */}
                                                    {isSuperAdmin && (
                                                        <select
                                                            defaultValue={u.role}
                                                            onChange={(e) => {
                                                                const role = e.target.value;
                                                                const vId = role === 'village_admin' ? (villages[0]?._id || null) : null;
                                                                handleRoleChange(u._id, role, vId);
                                                            }}
                                                            className="form-select"
                                                            style={{ width: '135px', padding: '4px 6px', fontSize: '0.75rem' }}
                                                        >
                                                            <option value="super_admin">Super Admin</option>
                                                            <option value="village_admin">Village Admin</option>
                                                            <option value="member">Member</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DIRECT PASSWORD SET MODAL FOR ADMIN */}
            {selectedUserForPassword && (
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
                                        સભ્ય પાસવર્ડ સેટ કરો (Direct Password Setup)
                                    </h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                        સભ્ય માટે સીધો પાસવર્ડ બનાવી આપો
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedUserForPassword(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* User Summary Box */}
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '18px',
                            fontSize: '0.825rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>સભ્ય નામ: </span>
                                <strong style={{ color: '#FFF' }}>{selectedUserForPassword.name || 'User'}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>મોબાઈલ: </span>
                                <strong style={{ color: '#34D399' }}>{selectedUserForPassword.mobileNumber}</strong>
                            </div>
                            {selectedUserForPassword.email && (
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>ઈમેલ: </span>
                                    <span style={{ color: '#CBD5E1' }}>{selectedUserForPassword.email}</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAdminSetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label className="form-label" style={{ marginBottom: 0 }}>
                                        નવો પાસવર્ડ (New Password - Min 6 chars)*
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setAdminNewPassword('Nadoda@2026')}
                                        style={{ fontSize: '0.725rem', color: 'var(--accent-amber)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        + Nadoda@2026 લખો
                                    </button>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={adminShowPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={adminNewPassword}
                                        onChange={(e) => setAdminNewPassword(e.target.value)}
                                        placeholder="નવો પાસવર્ડ દાખલ કરો"
                                        className="form-input"
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAdminShowPassword(!adminShowPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {adminShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    આ પાસવર્ડ સેટ કર્યા પછી સભ્ય પોતાનો મોબાઈલ અને આ પાસવર્ડ વાપરીને સીધા જ લૉગિન કરી શકશે.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserForPassword(null)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    રદ કરો (Cancel)
                                </button>
                                <button
                                    type="submit"
                                    disabled={settingPasswordLoading}
                                    className="btn btn-primary"
                                    style={{ flex: 1.5 }}
                                >
                                    {settingPasswordLoading ? (
                                        <>
                                            <RefreshCw size={14} className="spin-icon" /> સેવિંગ...
                                        </>
                                    ) : (
                                        'પાસવર્ડ સેટ કરો (Save)'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REJECT MODAL */}
            {rejectModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FB7185', marginBottom: '12px' }}>
                            અરજી નામંજૂર કરો / Reject Approval Request
                        </h3>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                            કૃપા કરીને નામંજૂર કરવાનું કારણ સ્પષ્ટ કરો:
                        </p>

                        <div style={{ marginBottom: '14px' }}>
                            <label className="form-label">કારણ (Rejection Reason):</label>
                            <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="form-input"
                                placeholder="દા.ત. ખોટી માહિતી / દસ્તાવેજ ખૂટે છે"
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label className="form-label">એડમિન નોંધ (Admin Notes):</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="form-input"
                                rows={3}
                                placeholder="વધારાની નોંધ..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="btn btn-secondary"
                            >
                                રદ કરો (Cancel)
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="btn btn-danger"
                            >
                                પુષ્ટિ કરો (Confirm Reject)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE VILLAGE MODAL (SUPER ADMIN ONLY) */}
            {showCreateVillageModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
                            નવું ગામ ઉમેરો / Register New Village
                        </h3>

                        <form onSubmit={handleCreateVillageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">ગામનું નામ (ગુજરાતી)*</label>
                                    <input
                                        type="text"
                                        required
                                        value={newVillageData.nameGu}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, nameGu: e.target.value })}
                                        className="form-input"
                                        placeholder="દા.ત. રાધનપુર"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Village Name (English)*</label>
                                    <input
                                        type="text"
                                        required
                                        value={newVillageData.nameEn}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, nameEn: e.target.value })}
                                        className="form-input"
                                        placeholder="e.g. Radhanpur"
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">તાલુકો (ગુજરાતી)</label>
                                    <input
                                        type="text"
                                        value={newVillageData.talukaGu}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, talukaGu: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Taluka (English)</label>
                                    <input
                                        type="text"
                                        value={newVillageData.talukaEn}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, talukaEn: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">જિલ્લો (ગુજરાતી)</label>
                                    <input
                                        type="text"
                                        value={newVillageData.districtGu}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, districtGu: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">પિનકોડ (Pincode)</label>
                                    <input
                                        type="text"
                                        value={newVillageData.pincode}
                                        onChange={(e) => setNewVillageData({ ...newVillageData, pincode: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateVillageModal(false)}
                                    className="btn btn-secondary"
                                >
                                    રદ કરો (Cancel)
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    ગામ સેવ કરો (Save Village)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE VILLAGE ADMIN MODAL (SUPER ADMIN ONLY) */}
            {showCreateVillageAdminModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={22} color="#60A5FA" />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                                    ગામ એડમિન નિયુક્ત કરો / Create Village Admin
                                </h3>
                            </div>
                            <button onClick={() => setShowCreateVillageAdminModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateVillageAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label className="form-label">ગામ પસંદ કરો (Assigned Village)*</label>
                                <select
                                    required
                                    value={newVillageAdminData.assignedVillageId}
                                    onChange={(e) => setNewVillageAdminData({ ...newVillageAdminData, assignedVillageId: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="">ગામ પસંદ કરો...</option>
                                    {villages.map((v) => (
                                        <option key={v._id} value={v._id}>
                                            {v.name.gu} ({v.name.en})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">એડમિનનું નામ (Admin Name)*</label>
                                    <input
                                        type="text"
                                        required
                                        value={newVillageAdminData.name}
                                        onChange={(e) => setNewVillageAdminData({ ...newVillageAdminData, name: e.target.value })}
                                        className="form-input"
                                        placeholder="દા.ત. કાંતિભાઈ ચાવડા"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">મોબાઈલ નંબર (Mobile)*</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newVillageAdminData.mobileNumber}
                                        onChange={(e) => setNewVillageAdminData({ ...newVillageAdminData, mobileNumber: e.target.value })}
                                        className="form-input"
                                        placeholder="98XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">ઈમેલ (Email - Optional)</label>
                                    <input
                                        type="email"
                                        value={newVillageAdminData.email}
                                        onChange={(e) => setNewVillageAdminData({ ...newVillageAdminData, email: e.target.value })}
                                        className="form-input"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">પ્રારંભિક પાસવર્ડ (Initial Password)</label>
                                    <input
                                        type="password"
                                        value={newVillageAdminData.initialPassword}
                                        onChange={(e) => setNewVillageAdminData({ ...newVillageAdminData, initialPassword: e.target.value })}
                                        className="form-input"
                                        placeholder="ખાલી છોડો જો OTPથી બનાવવો હોય"
                                    />
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                💡 જો પાસવર્ડ ખાલી રાખશો, તો તે 'Set Password / Forgot Password' નો ઉપયોગ કરીને તેમના મોબાઈલ પર OTP મેળવીને પાસવર્ડ બનાવી શકશે.
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateVillageAdminModal(false)}
                                    className="btn btn-secondary"
                                >
                                    રદ કરો (Cancel)
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    એડમિન બનાવો (Create Admin)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
