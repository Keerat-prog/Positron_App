import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Heart, 
  Smile, 
  BarChart3, 
  Activity, 
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";
import { DiaryEntry } from "../types";

// Standard mood configuration with emotional valence scores (1-10)
export const MOOD_DEFINITIONS: Record<
  string, 
  { score: number; emoji: string; color: string; label: string; valence: string }
> = {
  Joyful: { score: 9.6, emoji: "☀️", color: "#F59E0B", label: "Joyful", valence: "Radiant Joy" },
  Radiant: { score: 9.8, emoji: "✨", color: "#F59E0B", label: "Radiant", valence: "Spiritual Elevation" },
  Grateful: { score: 8.8, emoji: "🙏", color: "#10B981", label: "Grateful", valence: "Abundant Gratitude" },
  Hopeful: { score: 8.2, emoji: "🌅", color: "#06B6D4", label: "Hopeful", valence: "Uplifted Faith" },
  Peaceful: { score: 7.8, emoji: "🕊️", color: "#14B8A6", label: "Peaceful", valence: "Deep Serenity" },
  Calm: { score: 7.4, emoji: "🌿", color: "#10B981", label: "Calm", valence: "Tranquil Balance" },
  Reflective: { score: 6.2, emoji: "📜", color: "#8B5CF6", label: "Reflective", valence: "Quiet Inward Look" },
  Contemplative: { score: 6.0, emoji: "🕯️", color: "#6366F1", label: "Contemplative", valence: "Sacred Inquiry" },
  Tired: { score: 4.4, emoji: "🌙", color: "#64748B", label: "Tired", valence: "Gentle Weariness" },
  Restless: { score: 3.8, emoji: "🍃", color: "#D97706", label: "Restless", valence: "Fluttering Heart" },
  Anxious: { score: 3.2, emoji: "🌪️", color: "#EA580C", label: "Anxious", valence: "Seeking Ground" },
  Heavy: { score: 2.6, emoji: "🌧️", color: "#6B7280", label: "Heavy", valence: "Carrying Weight" },
  Sad: { score: 2.2, emoji: "💧", color: "#475569", label: "Sad", valence: "Tender Sorrow" },
  Overwhelmed: { score: 1.8, emoji: "🌊", color: "#EF4444", label: "Overwhelmed", valence: "Surrendering In Grace" },
};

export const normalizeMood = (rawMood?: string) => {
  if (!rawMood) return "Reflective";
  const m = rawMood.trim().toLowerCase();
  if (m.includes("joy") || m.includes("bliss") || m.includes("happy") || m.includes("radiant")) return "Joyful";
  if (m.includes("grate") || m.includes("thank")) return "Grateful";
  if (m.includes("hope") || m.includes("faith") || m.includes("inspir")) return "Hopeful";
  if (m.includes("peace") || m.includes("seren") || m.includes("still") || m.includes("tranquil")) return "Peaceful";
  if (m.includes("calm") || m.includes("balanc")) return "Calm";
  if (m.includes("contemplat") || m.includes("meditat")) return "Contemplative";
  if (m.includes("tire") || m.includes("weary") || m.includes("exhaust")) return "Tired";
  if (m.includes("restless") || m.includes("fidget")) return "Restless";
  if (m.includes("anxi") || m.includes("nerv") || m.includes("fear") || m.includes("worr")) return "Anxious";
  if (m.includes("heavy") || m.includes("burden")) return "Heavy";
  if (m.includes("sad") || m.includes("grief") || m.includes("tear") || m.includes("sorrow")) return "Sad";
  if (m.includes("overwhelm") || m.includes("burnout") || m.includes("stress")) return "Overwhelmed";
  return "Reflective";
};

export const parseEntryTimestamp = (entry: DiaryEntry): number => {
  // If entry id has timestamp suffix (e.g. entry-1791215677295)
  const idMatch = entry.id.match(/\d{10,}/);
  if (idMatch) {
    const ts = parseInt(idMatch[0], 10);
    if (!isNaN(ts) && ts > 1500000000000) return ts;
  }
  // Try Date.parse
  const parsed = Date.parse(entry.date);
  if (!isNaN(parsed)) return parsed;
  return Date.now();
};

interface MoodJourneyChartProps {
  entries: DiaryEntry[];
  isDark?: boolean;
  onSelectEntry?: (entry: DiaryEntry) => void;
  onAddSampleData?: () => void;
}

type Timeframe = "weekly" | "monthly" | "all";
type ViewMode = "trend" | "distribution";

export const MoodJourneyChart: React.FC<MoodJourneyChartProps> = ({
  entries,
  isDark = false,
  onSelectEntry,
  onAddSampleData,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [viewMode, setViewMode] = useState<ViewMode>("trend");

  // Process and sort entries chronologically
  const processedData = useMemo(() => {
    const now = Date.now();
    const daysLimit = timeframe === "weekly" ? 7 : timeframe === "monthly" ? 30 : 365;
    const cutoffTime = now - daysLimit * 24 * 60 * 60 * 1000;

    const items = entries.map((e) => {
      const ts = parseEntryTimestamp(e);
      const moodKey = normalizeMood(e.mood || e.aiAnalysis?.mood);
      const moodDef = MOOD_DEFINITIONS[moodKey] || MOOD_DEFINITIONS["Reflective"];
      const d = new Date(ts);
      
      const dayLabel = d.toLocaleDateString("en-US", {
        weekday: timeframe === "weekly" ? "short" : undefined,
        month: "short",
        day: "numeric",
      });

      const fullDateStr = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      return {
        id: e.id,
        rawEntry: e,
        timestamp: ts,
        date: dayLabel,
        fullDate: fullDateStr,
        score: moodDef.score,
        mood: moodKey,
        emoji: moodDef.emoji,
        color: moodDef.color,
        valence: moodDef.valence,
        snippet: e.text ? (e.text.length > 80 ? e.text.slice(0, 77) + "..." : e.text) : "Reflective note",
        sacredQuote: e.aiAnalysis?.sacredQuoteText,
        sacredSource: e.aiAnalysis?.sacredQuoteSource,
      };
    });

    // Sort chronologically (oldest to newest for trend visualization)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Filter by timeframe cutoff if we have enough items, otherwise show all items available
    const filtered = items.filter((item) => item.timestamp >= cutoffTime);
    return filtered.length >= 2 ? filtered : items;
  }, [entries, timeframe]);

  // Emotional statistics and journey insights
  const stats = useMemo(() => {
    if (processedData.length === 0) {
      return {
        avgScore: 0,
        trendText: "No reflections yet",
        trendDirection: "neutral" as "up" | "down" | "neutral",
        dominantMood: "Peaceful",
        dominantEmoji: "🕊️",
        total: 0,
        elevatedCount: 0,
      };
    }

    const total = processedData.length;
    const sum = processedData.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = Number((sum / total).toFixed(1));

    // Mood counts for dominant mood & distribution chart
    const counts: Record<string, number> = {};
    processedData.forEach((d) => {
      counts[d.mood] = (counts[d.mood] || 0) + 1;
    });

    let dominantMood = "Peaceful";
    let maxCount = 0;
    Object.entries(counts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = m;
      }
    });

    const dominantEmoji = MOOD_DEFINITIONS[dominantMood]?.emoji || "🕊️";

    // Growth trajectory (compare first half to second half)
    let trendText = "Steady harmony";
    let trendDirection: "up" | "down" | "neutral" = "neutral";
    if (processedData.length >= 2) {
      const firstScore = processedData[0].score;
      const lastScore = processedData[processedData.length - 1].score;
      const diff = Number((lastScore - firstScore).toFixed(1));

      if (diff > 0.4) {
        trendText = `Ascending Peace (+${diff} pts)`;
        trendDirection = "up";
      } else if (diff < -0.4) {
        trendText = `Deep Contemplation (${diff} pts)`;
        trendDirection = "down";
      } else {
        trendText = "Tranquil Equilibrium";
        trendDirection = "neutral";
      }
    }

    const elevatedCount = processedData.filter((d) => d.score >= 7.0).length;

    return {
      avgScore,
      trendText,
      trendDirection,
      dominantMood,
      dominantEmoji,
      total,
      elevatedCount,
    };
  }, [processedData]);

  // Mood distribution data for BarChart
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    processedData.forEach((d) => {
      counts[d.mood] = (counts[d.mood] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([mood, count]) => {
        const def = MOOD_DEFINITIONS[mood] || MOOD_DEFINITIONS["Reflective"];
        return {
          mood,
          count,
          score: def.score,
          emoji: def.emoji,
          color: def.color,
          label: `${def.emoji} ${mood}`,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [processedData]);

  // Theme colors
  const cardBg = isDark ? "bg-[#18161D]/90 border-zinc-800" : "bg-[#FFFDF9]/95 border-[#EFE5D8]";
  const subCardBg = isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-stone-50/70 border-stone-200/80";
  const textColor = isDark ? "text-zinc-100" : "text-[#292623]";
  const textMuted = isDark ? "text-zinc-400" : "text-[#8A8279]";
  const strokeGrid = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const strokeLine = isDark ? "#34D399" : "#059669"; // Emerald

  return (
    <div className={`rounded-3xl border p-5 md:p-6 transition-all shadow-sm ${cardBg}`}>
      {/* Top Header with title and controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
              📈
            </div>
            <div>
              <h3 className={`text-base md:text-lg font-calibri font-bold ${textColor} leading-tight`}>
                Emotional Journey & Mood Trends
              </h3>
              <p className={`text-xs font-calibri ${textMuted}`}>
                Visualizing your spiritual cadence and inner serenity across reflections
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle & Timeframe Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Mode toggle (Trend vs Distribution) */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${subCardBg}`}>
            <button
              type="button"
              onClick={() => setViewMode("trend")}
              className={`px-3 py-1 rounded-lg text-xs font-calibri font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "trend"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[#244F46] text-white shadow-sm"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Activity size={12} />
              <span>Trend Wave</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("distribution")}
              className={`px-3 py-1 rounded-lg text-xs font-calibri font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "distribution"
                  ? isDark
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[#244F46] text-white shadow-sm"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BarChart3 size={12} />
              <span>Spectrum</span>
            </button>
          </div>

          {/* Timeframe switch */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${subCardBg}`}>
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              className={`px-2.5 py-1 rounded-lg text-xs font-calibri font-bold transition-all cursor-pointer ${
                timeframe === "weekly"
                  ? isDark
                    ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-stone-600 hover:text-stone-900"
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("monthly")}
              className={`px-2.5 py-1 rounded-lg text-xs font-calibri font-bold transition-all cursor-pointer ${
                timeframe === "monthly"
                  ? isDark
                    ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-stone-600 hover:text-stone-900"
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-calibri font-bold transition-all cursor-pointer ${
                timeframe === "all"
                  ? isDark
                    ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Highlights / Insights Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Metric 1: Serenity Balance */}
        <div className={`p-3.5 rounded-2xl border ${subCardBg}`}>
          <div className="flex items-center justify-between text-[11px] font-calibri font-medium mb-1">
            <span className={textMuted}>Inner Serenity</span>
            <span className="text-emerald-500 text-xs">✨</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-calibri ${textColor}`}>
              {stats.avgScore > 0 ? `${stats.avgScore}` : "—"}
            </span>
            <span className={`text-[10px] font-calibri ${textMuted}`}>/ 10</span>
          </div>
          <p className="text-[10px] font-calibri text-emerald-600 dark:text-emerald-400 mt-1 font-semibold truncate">
            {stats.avgScore >= 7.5 ? "Deep Peace & Radiance" : stats.avgScore >= 5.5 ? "Gentle Contemplation" : "Seeking Ground & Solace"}
          </p>
        </div>

        {/* Metric 2: Journey Trajectory */}
        <div className={`p-3.5 rounded-2xl border ${subCardBg}`}>
          <div className="flex items-center justify-between text-[11px] font-calibri font-medium mb-1">
            <span className={textMuted}>Trend Trajectory</span>
            <TrendingUp size={12} className={stats.trendDirection === "up" ? "text-emerald-500" : "text-amber-500"} />
          </div>
          <div className={`text-sm font-bold font-calibri truncate ${textColor}`}>
            {stats.trendText}
          </div>
          <p className={`text-[10px] font-calibri ${textMuted} mt-1 truncate`}>
            {timeframe === "weekly" ? "Across past 7 days" : timeframe === "monthly" ? "Across past month" : "Lifetime journey"}
          </p>
        </div>

        {/* Metric 3: Predominant Presence */}
        <div className={`p-3.5 rounded-2xl border ${subCardBg}`}>
          <div className="flex items-center justify-between text-[11px] font-calibri font-medium mb-1">
            <span className={textMuted}>Frequent State</span>
            <span>{stats.dominantEmoji}</span>
          </div>
          <div className={`text-base font-bold font-calibri flex items-center gap-1.5 truncate ${textColor}`}>
            <span>{stats.dominantMood}</span>
          </div>
          <p className={`text-[10px] font-calibri ${textMuted} mt-1 truncate`}>
            Most recorded emotional tone
          </p>
        </div>

        {/* Metric 4: Chronicles Logged */}
        <div className={`p-3.5 rounded-2xl border ${subCardBg}`}>
          <div className="flex items-center justify-between text-[11px] font-calibri font-medium mb-1">
            <span className={textMuted}>Reflections</span>
            <Heart size={12} className="text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-calibri ${textColor}`}>
              {stats.total}
            </span>
            <span className={`text-[10px] font-calibri ${textMuted}`}>entries</span>
          </div>
          <p className="text-[10px] font-calibri text-amber-600 dark:text-amber-400 mt-1 font-semibold truncate">
            {stats.elevatedCount} elevated peaceful sessions
          </p>
        </div>
      </div>

      {/* Main Chart Section */}
      {processedData.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
            📜
          </div>
          <div>
            <h4 className={`text-sm font-bold font-calibri ${textColor}`}>No Journal Entries In This Timeframe</h4>
            <p className={`text-xs font-calibri ${textMuted} max-w-sm mt-1 leading-relaxed`}>
              Log a diary entry on the left page or seed sample emotional reflections to preview your chart.
            </p>
          </div>
          {onAddSampleData && (
            <button
              type="button"
              onClick={onAddSampleData}
              className={`px-4 py-2 rounded-xl text-xs font-calibri font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-[#244F46] hover:bg-[#1B3E36] text-white"
              }`}
            >
              <Sparkles size={13} />
              <span>Load Sacred Sample Journey (7 Days)</span>
            </button>
          )}
        </div>
      ) : viewMode === "trend" ? (
        <div className="space-y-4">
          {/* Recharts Area / Line Chart with gradient */}
          <div className="w-full h-[260px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={processedData}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length && onSelectEntry) {
                    onSelectEntry(e.activePayload[0].payload.rawEntry);
                  }
                }}
              >
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeLine} stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeGrid} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: strokeGrid }}
                  tick={{ fill: isDark ? "#A1A1AA" : "#78716C", fontSize: 11, fontFamily: "Calibri, sans-serif" }}
                />
                <YAxis
                  domain={[1, 10]}
                  ticks={[2, 4, 6, 8, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#A1A1AA" : "#78716C", fontSize: 10, fontFamily: "Calibri, sans-serif" }}
                  tickFormatter={(val) => {
                    if (val >= 9.5) return "Radiant";
                    if (val >= 7.5) return "Peace";
                    if (val >= 5.5) return "Musing";
                    if (val >= 3.5) return "Restless";
                    return "Heavy";
                  }}
                />
                <ReferenceLine
                  y={stats.avgScore}
                  stroke={isDark ? "#F59E0B" : "#D97706"}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Avg ${stats.avgScore}`,
                    position: "right",
                    fill: isDark ? "#F59E0B" : "#D97706",
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={strokeLine}
                  strokeWidth={2.8}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  activeDot={{
                    r: 6,
                    fill: strokeLine,
                    stroke: isDark ? "#18161D" : "#FFF",
                    strokeWidth: 2.5,
                  }}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <g key={`dot-${payload.id}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          fill={payload.color || strokeLine}
                          stroke={isDark ? "#18161D" : "#FFF"}
                          strokeWidth={1.5}
                          className="transition-all hover:scale-125 cursor-pointer"
                        />
                      </g>
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Emotional Scale Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-calibri pt-2 border-t border-stone-200/50 dark:border-zinc-800/60 gap-2">
            <span className={textMuted}>Emotional Continuum:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>✨</span> Radiant / Joyful (9-10)
              </span>
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                <span>🕊️</span> Peaceful / Grateful (7-8.5)
              </span>
              <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                <span>📜</span> Reflective (5.5-6.5)
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <span>🍃</span> Anxious / Tired (3-4.5)
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-semibold">
                <span>🌧️</span> Heavy (1-2.5)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Mood Distribution Spectrum BarChart */
        <div className="space-y-4">
          <div className="w-full h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeGrid} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={{ stroke: strokeGrid }}
                  tickLine={false}
                  tick={{ fill: isDark ? "#A1A1AA" : "#78716C", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{ fill: isDark ? "#E4E4E7" : "#292623", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
                  formatter={(val: any) => [`${val} chronicle entries`, "Frequency"]}
                  contentStyle={{
                    backgroundColor: isDark ? "#1F1D24" : "#FFFDF8",
                    borderColor: isDark ? "#27272A" : "#E5E7EB",
                    borderRadius: 12,
                    fontSize: 12,
                    color: isDark ? "#FFF" : "#000",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-calibri ${subCardBg}`}>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">💡 Reflection Wisdom:</span>
              <span className={textMuted}>
                Every emotion observed with reverence is sacred energy returning home.
              </span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {distributionData.length} unique emotional states logged
            </span>
          </div>
        </div>
      )}

      {/* Recent Points Quick Ticker */}
      {processedData.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-[11px] font-calibri font-bold uppercase tracking-wider ${textMuted}`}>
              Chronicle Journey Trail ({processedData.length} entries)
            </span>
            <span className="text-[10px] font-calibri text-stone-500 dark:text-zinc-500">
              Click any point to read past solace
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {processedData.slice(-6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectEntry && onSelectEntry(item.rawEntry)}
                className={`shrink-0 px-3 py-2 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer ${
                  subCardBg
                } hover:border-emerald-500/50`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-calibri">
                  <span>{item.emoji}</span>
                  <span className={textColor}>{item.mood}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                    ({item.score})
                  </span>
                </div>
                <div className={`text-[10px] font-calibri ${textMuted} truncate max-w-[120px] mt-0.5`}>
                  {item.date}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className={`p-3.5 rounded-2xl border shadow-xl max-w-[260px] text-xs font-calibri ${
          isDark
            ? "bg-[#1E1B24] border-zinc-700 text-zinc-100"
            : "bg-[#FFFDF9] border-[#E5CEBA] text-[#292623]"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2 border-stone-200/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-base">{data.emoji}</span>
            <span className="text-sm">{data.mood}</span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Valence {data.score} / 10
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
            {data.fullDate}
          </div>
          <p className="italic text-stone-700 dark:text-zinc-300 leading-relaxed text-[11.5px] line-clamp-3">
            "{data.snippet}"
          </p>

          {data.sacredQuote && (
            <div className="mt-2 pt-2 border-t border-stone-200/50 dark:border-zinc-800 text-[10.5px] text-amber-700 dark:text-amber-300 flex items-start gap-1">
              <span>📜</span>
              <span className="italic line-clamp-2">"{data.sacredQuote}"</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default MoodJourneyChart;
