import { useState, useMemo } from 'react';
import { ThumbsUp, Send, ArrowUpDown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COMMENTS_KEY = 'animeplay_comments';
const AUTH_KEY = 'animeplay_auth';

const getUser = () => {
    try {
        const data = localStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
};

const loadComments = (episodeKey) => {
    try {
        const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        return (all[episodeKey] || []).map(c => ({ ...c, createdAt: new Date(c.createdAt) }));
    } catch { return []; }
};

const saveComments = (episodeKey, comments) => {
    try {
        const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        all[episodeKey] = comments.map(c => ({ ...c, createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt }));
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    } catch {}
};

const timeAgo = (date) => {
    const diff = Date.now() - (date instanceof Date ? date.getTime() : new Date(date).getTime());
    if (isNaN(diff)) return '';
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Baru saja';
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    return `${Math.floor(h / 24)}h lalu`;
};

const StreamingAnimeCommentsSection = ({ episodeUrl }) => {
    const navigate = useNavigate();
    const user = getUser();

    const episodeKey = episodeUrl || 'default';
    const [comments, setComments] = useState(() => loadComments(episodeKey));
    const [newComment, setNewComment] = useState('');
    const [sortNewest, setSortNewest] = useState(true);

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) =>
            sortNewest
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [comments, sortNewest]);

    const handleAddComment = () => {
        if (!newComment.trim() || !user) return;
        const comment = {
            id: Date.now(),
            name: user.username || 'User',
            userId: user.id,
            comment: newComment.trim(),
            createdAt: new Date(),
            likes: 0,
            likedBy: [],
        };
        const updated = [comment, ...comments];
        setComments(updated);
        saveComments(episodeKey, updated);
        setNewComment('');
    };

    const handleLike = (id) => {
        if (!user) return;
        const updated = comments.map(c => {
            if (c.id !== id) return c;
            const likedBy = c.likedBy || [];
            const alreadyLiked = likedBy.includes(user.id);
            return {
                ...c,
                likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
                likedBy: alreadyLiked ? likedBy.filter(uid => uid !== user.id) : [...likedBy, user.id],
            };
        });
        setComments(updated);
        saveComments(episodeKey, updated);
    };

    const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

    return (
        <div className="mb-8 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-gray-500" />
                    <h3 className="text-sm font-semibold text-white">
                        Comments {comments.length > 0 && <span className="text-gray-500 font-normal">({comments.length})</span>}
                    </h3>
                </div>
                {comments.length > 0 && (
                    <button
                        onClick={() => setSortNewest(!sortNewest)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <ArrowUpDown size={13} />
                        {sortNewest ? 'Newest' : 'Oldest'}
                    </button>
                )}
            </div>

            {user ? (
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary-400/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0">
                        {getInitial(user.username)}
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-dark-card border border-white/8 rounded-xl px-3 py-2 focus-within:border-white/15 transition-colors">
                        <input
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                            placeholder="Write a comment..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="p-1.5 rounded-lg bg-primary-400 text-black hover:bg-primary-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={13} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-center gap-2 bg-dark-card border border-white/8 rounded-xl py-3 text-sm text-gray-400 hover:border-white/15 hover:text-gray-300 transition-all mb-5"
                >
                    <MessageCircle size={15} />
                    Login to comment
                </button>
            )}

            {sortedComments.length === 0 ? (
                <div className="text-center py-8">
                    <MessageCircle size={28} className="text-gray-800 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">No comments yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {sortedComments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                                {getInitial(c.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-white">{c.name}</span>
                                    <span className="text-[10px] text-gray-600">{timeAgo(c.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{c.comment}</p>
                                <button
                                    onClick={() => handleLike(c.id)}
                                    className={`flex items-center gap-1 mt-1.5 text-[11px] transition-colors ${
                                        user && (c.likedBy || []).includes(user.id)
                                            ? 'text-primary-400'
                                            : 'text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    <ThumbsUp size={12} />
                                    {c.likes > 0 && c.likes}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StreamingAnimeCommentsSection;
