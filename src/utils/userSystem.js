// src/utils/userSystem.js — XP, Levels, Roles, Per-user data

const AUTH_KEY = 'animeplay_auth';
const USERS_KEY = 'animeplay_users';

// ===== XP CONFIG =====
const XP_PER_EPISODE = 50;
const XP_PER_MINUTE = 2;

export const LEVELS = [
  { level: 1, name: 'Newcomer', minXP: 0, color: '#888', gradient: 'linear-gradient(135deg,#888,#aaa)' },
  { level: 2, name: 'Watcher', minXP: 200, color: '#6dfabc', gradient: 'linear-gradient(135deg,#6dfabc,#6dfae0)' },
  { level: 3, name: 'Enthusiast', minXP: 500, color: '#6daefa', gradient: 'linear-gradient(135deg,#6daefa,#6d7cfa)' },
  { level: 4, name: 'Otaku', minXP: 1000, color: '#7c6dfa', gradient: 'linear-gradient(135deg,#7c6dfa,#b06dfa)' },
  { level: 5, name: 'Weeb', minXP: 2000, color: '#fa6d9a', gradient: 'linear-gradient(135deg,#fa6d9a,#fa6d6d)' },
  { level: 6, name: 'Veteran', minXP: 4000, color: '#fac96d', gradient: 'linear-gradient(135deg,#fac96d,#fa9a6d)' },
  { level: 7, name: 'Legend', minXP: 8000, color: '#fff', gradient: 'linear-gradient(135deg,#7c6dfa,#fa6d9a,#fac96d)' },
];

export const ROLES = {
  admin: { label: 'Admin', className: 'role-admin', icon: '👑' },
  mod: { label: 'Mod', className: 'role-mod', icon: '🍃' },
  vip: { label: 'VIP', className: 'role-vip', icon: '⭐' },
  user: { label: 'User', className: 'role-user', icon: '👤' },
};

export const getLevelInfo = (xp) => {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break; }
  }
  const xpInLevel = xp - current.minXP;
  const xpToNext = next ? next.minXP - current.minXP : 0;
  const progress = next ? Math.min((xpInLevel / xpToNext) * 100, 100) : 100;
  return { current, next, xpInLevel, xpToNext, progress };
};

// ===== AUTH HELPERS =====
export const getUser = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } };
export const getStoredUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } };

export const updateUser = (updates) => {
  try {
    const user = getUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = { ...users[idx], ...updates }; localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
    return updated;
  } catch { return null; }
};

export const updateUserById = (userId, updates) => {
  try {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx < 0) return false;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    // also update session if it's current user
    const current = getUser();
    if (current?.id === userId) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ ...current, ...updates }));
    }
    return true;
  } catch { return false; }
};

// ===== XP SYSTEM =====
export const addXP = (amount, reason = '') => {
  const user = getUser();
  if (!user) return null;
  const newXP = (user.xp || 0) + amount;
  const oldLevel = getLevelInfo(user.xp || 0).current.level;
  const newLevel = getLevelInfo(newXP).current.level;
  const leveledUp = newLevel > oldLevel;
  updateUser({ xp: newXP });
  return { newXP, amount, reason, leveledUp, newLevel };
};

// ===== PER-USER HISTORY =====
const getHistoryKey = () => {
  const user = getUser();
  return user ? `animeplay_history_${user.id}` : 'animeplay_history_guest';
};

export const getUserHistory = () => {
  try { return JSON.parse(localStorage.getItem(getHistoryKey()) || '[]'); } catch { return []; }
};

export const addToUserHistory = (anime, episode) => {
  try {
    const key = getHistoryKey();
    const history = getUserHistory();
    const itemId = `${anime.url}::${episode?.url || anime.url}`;
    const existingIdx = history.findIndex(h => h.id === itemId);
    const item = {
      id: itemId,
      title: anime.title,
      image: anime.image,
      url: anime.url,
      category: anime.category || 'anime',
      episodeTitle: episode?.title || `Episode ${episode?.episode || 1}`,
      episodeUrl: episode?.url || anime.url,
      episodeNum: episode?.episode || episode?.number || 1,
      lastWatched: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      history[existingIdx] = { ...history[existingIdx], ...item };
      const updated = history.splice(existingIdx, 1)[0];
      history.unshift(updated);
    } else {
      history.unshift(item);
    }
    localStorage.setItem(key, JSON.stringify(history.slice(0, 100)));
  } catch {}
};

export const removeFromUserHistory = (id) => {
  try {
    const key = getHistoryKey();
    const history = getUserHistory().filter(h => h.id !== id);
    localStorage.setItem(key, JSON.stringify(history));
    return history;
  } catch { return []; }
};

export const clearUserHistory = () => {
  try { localStorage.removeItem(getHistoryKey()); } catch {}
};

// ===== PER-USER BOOKMARKS =====
const getBookmarkKey = () => {
  const user = getUser();
  return user ? `animeplay_bookmarks_${user.id}` : 'animeplay_bookmarks_guest';
};

export const getUserBookmarks = () => {
  try { return JSON.parse(localStorage.getItem(getBookmarkKey()) || '[]'); } catch { return []; }
};

export const toggleUserBookmark = (item) => {
  try {
    const key = getBookmarkKey();
    const bookmarks = getUserBookmarks();
    const exists = bookmarks.some(b => b.url === item.url);
    let updated;
    if (exists) { updated = bookmarks.filter(b => b.url !== item.url); }
    else { updated = [...bookmarks, { ...item, addedAt: new Date().toISOString() }]; }
    localStorage.setItem(key, JSON.stringify(updated));
    return !exists;
  } catch { return false; }
};

export const isBookmarked = (url) => {
  return getUserBookmarks().some(b => b.url === url);
};

// ===== ADMIN HELPERS =====
export const isAdmin = () => getUser()?.role === 'admin';
export const isMod = () => ['admin', 'mod'].includes(getUser()?.role);

// Default first user is admin
export const ensureAdminExists = () => {
  const users = getStoredUsers();
  if (users.length === 1 && !users[0].role) {
    users[0].role = 'admin';
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = getUser();
    if (session && session.id === users[0].id) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ ...session, role: 'admin' }));
    }
  }
};
      
