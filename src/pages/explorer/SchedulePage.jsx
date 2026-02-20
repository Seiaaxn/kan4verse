// pages/explorer/SchedulePage.jsx
import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Tv,
    Flame
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const days = [
    { id: 'monday', label: 'Mon', full: 'Monday' },
    { id: 'tuesday', label: 'Tue', full: 'Tuesday' },
    { id: 'wednesday', label: 'Wed', full: 'Wednesday' },
    { id: 'thursday', label: 'Thu', full: 'Thursday' },
    { id: 'friday', label: 'Fri', full: 'Friday' },
    { id: 'saturday', label: 'Sat', full: 'Saturday' },
    { id: 'sunday', label: 'Sun', full: 'Sunday' },
];

const SchedulePage = ({ onAnimeSelect }) => {
    const [activeDay, setActiveDay] = useState(() => {
        const today = new Date().getDay();
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return dayMap[today];
    });
    const [animeSchedule, setAnimeSchedule] = useState([]);
    const [donghuaSchedule, setDonghuaSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, anime, donghua

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);

                // Fetch both schedules in parallel
                const [animeRes, donghuaRes] = await Promise.all([
                    axios.get(`${API_BASE}/anime/schedule`),
                    axios.get(`${API_BASE}/donghua/schedule`)
                ]);

                setAnimeSchedule(animeRes.data.data || {});
                setDonghuaSchedule(donghuaRes.data.data || {});
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    const getCurrentSchedule = () => {
        const animeList = animeSchedule[activeDay] || [];
        const donghuaList = donghuaSchedule[activeDay] || [];

        if (activeTab === 'anime') return animeList.map(item => ({ ...item, type: 'anime' }));
        if (activeTab === 'donghua') return donghuaList.map(item => ({ ...item, type: 'donghua' }));

        // Combine both for 'all'
        return [
            ...animeList.map(item => ({ ...item, type: 'anime' })),
            ...donghuaList.map(item => ({ ...item, type: 'donghua' }))
        ].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    };

    const currentSchedule = getCurrentSchedule();

    return (
        <div className="animate-fade-in">
            {/* Day Selector */}
            <div className="sticky top-[15px] z-30 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar size={20} className="text-primary-400" />
                        Release Schedule
                    </h2>
                    <span className="text-xs text-gray-500 capitalize">{activeDay}</span>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {days.map((day) => {
                        const isActive = activeDay === day.id;
                        const isToday = day.id === days[new Date().getDay()].id;

                        return (
                            <button
                                key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-400 text-black'
                                        : 'bg-dark-surface text-gray-400 hover:bg-dark-card border border-dark-border'
                                    }`}
                            >
                                <span className="text-xs font-medium">{day.label}</span>
                                {isToday && !isActive && (
                                    <span className="w-1 h-1 bg-primary-400 rounded-full mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4">
                    {[
                        { id: 'all', label: 'All', icon: Calendar },
                        { id: 'anime', label: 'Anime', icon: Tv },
                        { id: 'donghua', label: 'Donghua', icon: Flame },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                                        ? 'bg-primary-400/20 text-primary-400 border border-primary-400/50'
                                        : 'bg-dark-surface text-gray-400 border border-dark-border hover:border-primary-400/30'
                                    }`}
                            >
                                <Icon size={12} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Schedule List */}
            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-dark-surface rounded-xl border border-dark-border">
                                <div className="w-16 h-20 rounded-lg skeleton shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded skeleton" />
                                    <div className="h-3 w-1/2 rounded skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentSchedule.length > 0 ? (
                    <div className="space-y-3">
                        {currentSchedule.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => onAnimeSelect(item)}
                                className="group flex gap-3 p-3 bg-dark-surface rounded-xl border border-dark-border hover:border-primary-400/50 transition-all cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-dark-card">
                                    <img
                                        src={item.image || `https://via.placeholder.com/100x150/1a1a1a/ffaf2f?text=${encodeURIComponent(item.title?.slice(0, 2))}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">View</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-primary-300 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.genre || 'Anime'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${item.type === 'anime' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {item.type === 'anime' ? 'ANIME' : 'DONGHUA'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1 text-primary-400 font-medium">
                                            <Clock size={12} />
                                            {item.time || 'TBA'}
                                        </span>
                                        {item.score && (
                                            <span className="flex items-center gap-1">
                                                ★ {item.score}
                                            </span>
                                        )}
                                        <span>{item.type || 'TV'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No releases scheduled for {activeDay}</p>
                        <p className="text-xs text-gray-600 mt-1">Check back later or select another day</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;