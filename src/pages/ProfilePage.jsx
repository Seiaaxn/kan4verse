import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Edit2, Check, X, Heart, Clock, ChevronRight, Crown, Shield, Star, User, Camera, Trash2, Users } from 'lucide-react';
import { getUser, updateUser, getStoredUsers, updateUserById, getLevelInfo, LEVELS, ROLES, getUserBookmarks, getUserHistory } from '../utils/userSystem';

const AUTH_KEY = 'animeplay_auth';

const AVATAR_EMOJIS = ['🐉', '🦊', '🐼', '🐺', '🦁', '🐯', '🦅', '🦋', '🌸', '⚡', '🔥', '🌙', '⭐', '🎭', '🎌', '🗡️', '🏹', '🧿'];

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser);
    const [editing, setEditing] = useState(false);
    const [editUsername, setEditUsername] = useState(user?.username || '');
    const [showLogout, setShowLogout] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');

    const refreshUser = () => { const u = getUser(); setUser(u); };

    const handleSave = () => {
        if (!editUsername.trim()) return;
        const updated = updateUser({ username: editUsername.trim() });
        if (updated) setUser(updated);
        setEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
        setShowLogout(false);
    };

    const handleAvatar = (emoji) => {
        const updated = updateUser({ avatar: emoji });
        if (updated) setUser(updated);
        setShowAvatarPicker(false);
    };

    const openAdmin = () => {
        setAllUsers(getStoredUsers());
        setShowAdminPanel(true);
    };

    const handleRoleChange = (userId, newRole) => {
        updateUserById(userId, { role: newRole });
        setAllUsers(getStoredUsers());
        refreshUser();
    };

    if (!user) {
        return (
            <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #7c6dfa, transparent)' }} />
                <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="px-4 flex items-center" style={{ height: '52px' }}>
                        <h1 className="text-sm font-bold text-white">Profil</h1>
                    </div>
                </header>
                <div className="flex flex-col items-center px-6 pt-16 pb-10">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 animate-float text-5xl"
                        style={{ background: 'var(--card)', border: '2px solid var(--border)' }}>🎌</div>
                    <h2 className="text-xl font-black text-white mb-2">Halo, Nakama!</h2>
                    <p className="text-sm text-center mb-8 leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
                        Login untuk kumpulkan XP, simpan tontonan, dan jadi bagian komunitas AnimePlay!
                    </p>
                    <button onClick={() => navigate('/login')}
                        className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #7c6dfa, #fa6d9a)', boxShadow: '0 8px 24px rgba(124,109,250,0.3)' }}>
                        🚀 Masuk / Daftar
                    </button>
                    <div className="mt-8 w-full max-w-xs space-y-3">
                        {[['⚔️', 'Kumpulkan XP setiap nonton episode'], ['❤️', 'Simpan anime ke My List'], ['🏆', 'Naik level & raih gelar keren']].map(([icon, text]) => (
                            <div key={text} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                <span className="text-xl">{icon}</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const xpInfo = getLevelInfo(user.xp || 0);
    const levelData = xpInfo.current;
    const role = user.role || 'user';
    const roleInfo = ROLES[role] || ROLES.user;
    const bookmarkCount = getUserBookmarks().length;
    const historyCount = getUserHistory().length;

    return (
        <div className="min-h-screen pb-28 relative" style={{ background: 'var(--bg)' }}>
            {/* Color blob based on level */}
            <div className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% -20%, ${levelData.color}44, transparent 70%)` }} />

            {/* Header */}
            <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="px-4 flex items-center justify-between" style={{ height: '52px' }}>
                    <h1 className="text-sm font-bold text-white">Profil</h1>
                    <div className="flex items-center gap-2">
                        {(role === 'admin' || role === 'mod') && (
                            <button onClick={openAdmin}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                                style={{ background: 'rgba(124,109,250,0.15)', color: '#7c6dfa' }}>
                                <Users size={12} /> Admin
                            </button>
                        )}
                        <button onClick={() => setShowLogout(true)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <LogOut size={16} style={{ color: 'var(--muted)' }} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 py-6">
                {/* Avatar + Name */}
                <div className="flex flex-col items-center mb-6 relative">
                    <div className="relative mb-4">
                        <button onClick={() => setShowAvatarPicker(true)}
                            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl relative shadow-2xl transition-all active:scale-95"
                            style={{ background: levelData.gradient }}>
                            {user.avatar || '🎌'}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl flex items-center justify-center"
                                style={{ background: 'var(--card)', border: '2px solid var(--bg)' }}>
                                <Camera size={13} style={{ color: 'var(--muted)' }} />
                            </div>
                        </button>
                    </div>

                    {editing ? (
                        <div className="flex items-center gap-2 mb-2">
                            <input value={editUsername} onChange={e => setEditUsername(e.target.value)}
                                className="text-center text-lg font-black text-white bg-transparent outline-none border-b-2 pb-1"
                                style={{ borderColor: '#7c6dfa', width: '160px' }}
                                autoFocus maxLength={20} />
                            <button onClick={handleSave} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(109,250,188,0.2)', color: '#6dfabc' }}><Check size={14} /></button>
                            <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-black text-white">{user.username}</h2>
                            <button onClick={() => { setEditUsername(user.username); setEditing(true); }} style={{ color: 'var(--muted)' }}>
                                <Edit2 size={13} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className={`level-badge ${roleInfo.className}`}>{roleInfo.icon} {roleInfo.label}</span>
                        <span className="level-badge" style={{ background: levelData.gradient, color: 'white' }}>
                            Lv.{levelData.level} {levelData.name}
                        </span>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="p-4 rounded-3xl mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-bold text-white">⚡ {user.xp || 0} XP</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                                {xpInfo.next ? `${xpInfo.xpInLevel} / ${xpInfo.xpToNext} XP ke Lv.${xpInfo.next.level}` : 'Level Maksimum! 🏆'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold" style={{ color: levelData.color }}>{levelData.name}</p>
                            {xpInfo.next && <p className="text-[10px]" style={{ color: 'var(--muted)' }}>→ {xpInfo.next.name}</p>}
                        </div>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-fill" style={{ width: `${xpInfo.progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                        {LEVELS.map(lv => (
                            <div key={lv.level} className="flex flex-col items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ background: (user.xp || 0) >= lv.minXP ? lv.color : 'rgba(255,255,255,0.1)' }} />
                                <span className="text-[8px]" style={{ color: 'var(--muted)' }}>{lv.level}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { icon: '⚡', label: 'Total XP', value: user.xp || 0, color: '#7c6dfa' },
                        { icon: '❤️', label: 'My List', value: bookmarkCount, color: '#fa6d9a' },
                        { icon: '📺', label: 'Ditonton', value: historyCount, color: '#fac96d' },
                    ].map(stat => (
                        <div key={stat.label} className="p-3 rounded-2xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <p className="text-base font-black" style={{ color: stat.color }}>{stat.value}</p>
                            <p className="text-[9px] font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Level Roadmap */}
                <div className="p-4 rounded-3xl mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-bold text-white mb-3">🗺️ Level Roadmap</p>
                    <div className="space-y-2">
                        {LEVELS.map(lv => {
                            const unlocked = (user.xp || 0) >= lv.minXP;
                            const isCurrent = lv.level === levelData.level;
                            return (
                                <div key={lv.level} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                                        style={{ background: unlocked ? lv.gradient : 'rgba(255,255,255,0.05)', color: unlocked ? 'white' : 'var(--muted)' }}>
                                        {lv.level}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold" style={{ color: unlocked ? 'white' : 'var(--muted)' }}>{lv.name}</p>
                                        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{lv.minXP} XP</p>
                                    </div>
                                    {isCurrent && <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(124,109,250,0.2)', color: '#7c6dfa' }}>Sekarang</span>}
                                    {unlocked && !isCurrent && <Check size={14} style={{ color: '#6dfabc' }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                {[
                    { icon: '❤️', label: 'My List', path: '/mylist', color: '#fa6d9a' },
                    { icon: '📺', label: 'History Tontonan', path: '/history', color: '#fac96d' },
                ].map(item => (
                    <button key={item.path} onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl mb-2 transition-all active:scale-97"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-semibold flex-1 text-left text-white">{item.label}</span>
                        <ChevronRight size={15} style={{ color: 'var(--muted)' }} />
                    </button>
                ))}

                {/* Logout */}
                <button onClick={() => setShowLogout(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold mt-4 transition-all active:scale-97"
                    style={{ border: '1px solid rgba(250,109,154,0.2)', color: '#fa6d9a' }}>
                    <LogOut size={15} /> Keluar dari Akun
                </button>
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-sm p-5 rounded-3xl animate-slide-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-bold text-white">Pilih Avatar</p>
                            <button onClick={() => setShowAvatarPicker(false)} style={{ color: 'var(--muted)' }}><X size={16} /></button>
                        </div>
                        <div className="grid grid-cols-6 gap-3">
                            {AVATAR_EMOJIS.map(emoji => (
                                <button key={emoji} onClick={() => handleAvatar(emoji)}
                                    className="w-full aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90"
                                    style={{ background: user.avatar === emoji ? 'rgba(124,109,250,0.3)' : 'var(--card)', border: user.avatar === emoji ? '2px solid #7c6dfa' : '1px solid var(--border)' }}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Panel */}
            {showAdminPanel && (
                <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg)' }}>
                    <div className="flex items-center justify-between px-4 py-3 glass" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h2 className="text-sm font-bold text-white">👑 Admin Panel</h2>
                        <button onClick={() => setShowAdminPanel(false)} style={{ color: 'var(--muted)' }}><X size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted)' }}>SEMUA PENGGUNA ({allUsers.length})</p>
                        {allUsers.map(u => {
                            const uRole = u.role || 'user';
                            const uXP = getLevelInfo(u.xp || 0);
                            return (
                                <div key={u.id} className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: uXP.current.gradient }}>
                                            {u.avatar || '🎌'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{u.username}</p>
                                            <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>{u.email}</p>
                                        </div>
                                        <span className="level-badge text-[9px]" style={{ background: uXP.current.gradient, color: 'white' }}>
                                            Lv.{uXP.current.level}
                                        </span>
                                    </div>
                                    {u.id !== user.id && (
                                        <div>
                                            <p className="text-[10px] font-bold mb-2" style={{ color: 'var(--muted)' }}>UBAH ROLE</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {['user', 'vip', 'mod', 'admin'].map(r => (
                                                    <button key={r} onClick={() => handleRoleChange(u.id, r)}
                                                        className={`level-badge ${ROLES[r].className} text-[10px] transition-all active:scale-95`}
                                                        style={{ opacity: uRole === r ? 1 : 0.4 }}>
                                                        {ROLES[r].icon} {ROLES[r].label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {u.id === user.id && (
                                        <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>👈 Ini kamu</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Logout Confirm */}
            {showLogout && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-sm p-6 rounded-3xl animate-slide-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-4xl text-center mb-3">👋</div>
                        <h3 className="text-base font-black text-white text-center mb-1">Yakin mau keluar?</h3>
                        <p className="text-xs text-center mb-5" style={{ color: 'var(--muted)' }}>XP dan progress kamu tersimpan dengan aman.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{ background: 'var(--card)', color: 'var(--muted)' }}>Batal</button>
                            <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, #fa6d9a, #fa6d6d)' }}>Keluar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
