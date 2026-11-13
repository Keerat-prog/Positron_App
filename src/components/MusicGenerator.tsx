import React, { useState, useEffect, useRef } from "react";
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Volume2, 
  VolumeX,
  Volume1,
  Clock, 
  Radio, 
  Bookmark, 
  Check, 
  Loader2,
  Disc,
  RotateCcw,
  RefreshCw,
  Sliders,
  AlertCircle,
  CloudRain,
  Flame,
  Wind,
  Waves,
  Feather,
  Heart
} from "lucide-react";
import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  User 
} from "../lib/firebase";
import {
  saveSupabaseMusicTrack,
  fetchSupabaseMusicTracks,
  deleteSupabaseMusicTrack
} from "../lib/supabase";

interface MusicTrack {
  id?: string;
  userId?: string;
  title: string;
  meditationFocus?: string;
  scaleName?: string;
  baseRoot?: number;
  prompt: string;
  audioUrl?: string;
  modelUsed: "lyria-3-clip-preview" | "lyria-3-pro-preview";
  style: string;
  duration: string;
  createdAt: string;
}

interface MusicGeneratorProps {
  user: User | null;
  isDark: boolean;
  themeObj: any;
  onOpenAuth: () => void;
}

const PRESET_PROMPTS = [
  { 
    label: "432Hz Solfeggio Serenity", 
    desc: "A=432Hz deep meditative pad, Tibetan singing bowls, and soft mountain rainfall.", 
    prompt: "A deeply peaceful 432Hz sine ambient pad with soft Tibetan singing bowls, gentle stream, and serene stillness.", 
    style: "Meditative Solfeggio 432Hz",
    icon: "✨"
  },
  { 
    label: "Sacred Temple Om & Strings", 
    desc: "136.1Hz Om fundamental, temple gongs, warm cello swells, and sanctuary reverb.", 
    prompt: "Sacred Om 136.1Hz resonance with warm ethereal strings, monastic vocal drone, and singing bowls.", 
    style: "Sacred Temple Chants & Bells",
    icon: "🔔"
  },
  { 
    label: "Deep Sleep Delta Waves", 
    desc: "2.5Hz restful binaural pulsation, gentle ocean waves at midnight, and warm soothing minor pads.", 
    prompt: "Pulsing 2.5Hz Delta binaural waves with soft ocean surf crashing on night sand and a lush warm synthesizer drone.", 
    style: "Deep Sleep Delta Waves",
    icon: "🌙"
  },
  { 
    label: "Dawn Forest Awakening", 
    desc: "Pastoral harp arpeggios, morning birds, sunburst woodwind flute, and gentle breeze.", 
    prompt: "Sparkling wooden flute improvs, morning birds, sunburst harp arpeggios, and peaceful pastoral resonance.", 
    style: "Dawn Forest Awakening",
    icon: "🕊️"
  },
  { 
    label: "528Hz Miracle Transformation", 
    desc: "528Hz DNA repair tone, celestial chimes, and luminous ascending ambient chords.", 
    prompt: "528Hz transformation tone with radiant celestial chimes, uplifting major pads, and golden light resonance.", 
    style: "528Hz Miracle Transformation",
    icon: "🌟"
  },
  { 
    label: "Zen Garden & Bamboo Flute", 
    desc: "Soft bamboo windchimes, calm shakuhachi flute, and tranquil river water.", 
    prompt: "Gentle Japanese shakuhachi flute with soft bamboo chimes, tranquil river water, and contemplative pentatonic harmony.", 
    style: "Gentle Acoustic Guitar & Nature",
    icon: "🎋"
  }
];

const AMBIENT_LAYERS = [
  { id: "none", name: "Pure Music", icon: Feather, url: "" },
  { id: "rain", name: "Soft Rain", icon: CloudRain, url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/rain.mp3" },
  { id: "waves", name: "Ocean Waves", icon: Waves, url: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/waves.mp3" },
  { id: "fire", name: "Campfire Warmth", icon: Flame, url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/fire.mp3" },
  { id: "wind", name: "Mountain Breeze", icon: Wind, url: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/wind.mp3" },
];

export default function MusicGenerator({ user, isDark, themeObj, onOpenAuth }: MusicGeneratorProps) {
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [selectedModel, setSelectedModel] = useState<"lyria-3-clip-preview" | "lyria-3-pro-preview">("lyria-3-clip-preview");
  const [selectedStyle, setSelectedStyle] = useState(PRESET_PROMPTS[0].style);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  
  // Audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Ambient Nature Layer Blend
  const [activeAmbientLayer, setActiveAmbientLayer] = useState<string>("none");
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);

  // Web Audio Context for live tone generator
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const webAudioOscRef = useRef<OscillatorNode | null>(null);
  const webAudioGainRef = useRef<GainNode | null>(null);
  const [isWebAudioPlaying, setIsWebAudioPlaying] = useState(false);
  const [testFrequency, setTestFrequency] = useState<number>(432);

  // User saved tracks from Supabase & Firestore
  const [userTracks, setUserTracks] = useState<MusicTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [regeneratingTrackId, setRegeneratingTrackId] = useState<string | null>(null);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = "";
      }
      stopWebAudio();
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Ambient sound layer controller
  useEffect(() => {
    const layer = AMBIENT_LAYERS.find(l => l.id === activeAmbientLayer);
    if (!layer || !layer.url) {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = "";
      }
      return;
    }

    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio(layer.url);
      ambientAudioRef.current.loop = true;
    } else {
      ambientAudioRef.current.src = layer.url;
    }

    ambientAudioRef.current.volume = ambientVolume;
    if (isPlaying) {
      ambientAudioRef.current.play().catch(() => {});
    }
  }, [activeAmbientLayer]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  // Sync ambient playback with master track
  useEffect(() => {
    if (ambientAudioRef.current && activeAmbientLayer !== "none") {
      if (isPlaying) {
        ambientAudioRef.current.play().catch(() => {});
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Load user generated tracks when user changes
  useEffect(() => {
    if (user) {
      loadSavedTracks();
    } else {
      setUserTracks([]);
    }
  }, [user]);

  const loadSavedTracks = async () => {
    if (!user) return;
    setLoadingTracks(true);
    try {
      const tracksMap = new Map<string, MusicTrack>();

      // 1. Fetch from Supabase
      const sbTracks = await fetchSupabaseMusicTracks(user.uid);
      sbTracks.forEach((t) => {
        tracksMap.set(t.id, {
          id: t.id,
          userId: t.user_id,
          title: t.title,
          prompt: t.prompt,
          audioUrl: t.audio_url || t.audio_data || "",
          modelUsed: (t.model_used as any) || "lyria-3-clip-preview",
          style: t.style || "Meditative Solfeggio 432Hz",
          duration: t.duration || "30s",
          createdAt: t.created_at,
        });
      });

      // 2. Fetch from Firestore for backup
      try {
        const q = query(
          collection(db, "generatedTracks"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!tracksMap.has(docSnap.id)) {
            tracksMap.set(docSnap.id, { id: docSnap.id, ...data } as MusicTrack);
          }
        });
      } catch (fsErr) {
        console.warn("Firestore sync fallback:", fsErr);
      }

      const tracks = Array.from(tracksMap.values());
      tracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserTracks(tracks);
    } catch (err: any) {
      console.error("Error loading user tracks:", err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const playAudioTrack = async (audioUrl: string) => {
    if (!audioRef.current) return;
    stopWebAudio();

    try {
      audioRef.current.src = audioUrl;
      audioRef.current.loop = isLooping;
      audioRef.current.volume = isMuted ? 0 : volume;
      await audioRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);

      if (ambientAudioRef.current && activeAmbientLayer !== "none") {
        ambientAudioRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Playback blocked by browser policy:", err);
      setIsPlaying(false);
      if (err.name === "NotAllowedError" || err.name === "NotSupportedError") {
        setAutoplayBlocked(true);
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent, customVariationPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSubmit = (customVariationPrompt || prompt).trim();
    if (!promptToSubmit) return;

    setIsGenerating(true);
    setGenerationError("");
    setSaveSuccess("");
    setAutoplayBlocked(false);

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSubmit,
          model: selectedModel,
          style: selectedStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Music composition request failed");
      }

      if (!data.audioUrl) {
        throw new Error("No audible audio stream returned from synthesizer.");
      }

      const track: MusicTrack = {
        title: data.title || "Sacred Resonance",
        meditationFocus: data.meditationFocus,
        scaleName: data.scaleName,
        baseRoot: data.baseRoot,
        prompt: promptToSubmit,
        audioUrl: data.audioUrl,
        modelUsed: selectedModel,
        style: selectedStyle,
        duration: data.duration || "Harmonic Clip",
        createdAt: new Date().toISOString(),
      };

      setCurrentTrack(track);

      // Play generated audio immediately
      await playAudioTrack(data.audioUrl);

      // If user logged in, persist to Supabase & Firestore
      if (user) {
        saveTrackToDatabases(track);
      }
    } catch (err: any) {
      console.error("Music generation error:", err);
      setGenerationError(err.message || "An error occurred during sound composition.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a distinct variation of the current track
  const handleRegenerateVariation = () => {
    const variationSuffix = ` [Variation ${Math.floor(Math.random() * 900 + 100)}]`;
    handleGenerate(undefined, prompt + variationSuffix);
  };

  const saveTrackToDatabases = async (trackToSave: MusicTrack) => {
    if (!user) return;
    try {
      // 1. Save to Supabase
      const savedSb = await saveSupabaseMusicTrack({
        user_id: user.uid,
        title: trackToSave.title,
        prompt: trackToSave.prompt,
        audio_url: trackToSave.audioUrl || "",
        model_used: trackToSave.modelUsed,
        style: trackToSave.style,
        duration: trackToSave.duration,
        created_at: trackToSave.createdAt,
      });

      // 2. Save to Firestore as backup
      let fsId = "";
      try {
        const docRef = await addDoc(collection(db, "generatedTracks"), {
          userId: user.uid,
          title: trackToSave.title,
          meditationFocus: trackToSave.meditationFocus || "",
          scaleName: trackToSave.scaleName || "",
          prompt: trackToSave.prompt,
          audioUrl: trackToSave.audioUrl || "",
          modelUsed: trackToSave.modelUsed,
          style: trackToSave.style,
          duration: trackToSave.duration,
          createdAt: trackToSave.createdAt,
        });
        fsId = docRef.id;
      } catch (e) {
        console.warn("Firestore backup notice:", e);
      }
      
      const assignedId = savedSb?.id || fsId || String(Date.now());
      setUserTracks(prev => [{ id: assignedId, ...trackToSave, userId: user.uid }, ...prev]);
      setSaveSuccess("Track securely saved in Supabase & Cloud Vault!");
      setTimeout(() => setSaveSuccess(""), 4000);
    } catch (err: any) {
      console.error("Failed to save track:", err);
    }
  };

  const togglePlayback = (track: MusicTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.audioUrl === track.audioUrl && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (track.audioUrl) {
      setCurrentTrack(track);
      playAudioTrack(track.audioUrl);
    } else {
      handleSynthesizeMissingAudio(track);
    }
  };

  const handleSynthesizeMissingAudio = async (track: MusicTrack) => {
    if (!track.id) return;
    setRegeneratingTrackId(track.id);
    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: track.prompt || "Deep meditative 432Hz ambient soundscape",
          model: track.modelUsed || "lyria-3-clip-preview",
          style: track.style || "Meditative Solfeggio 432Hz",
        }),
      });
      const data = await response.json();
      if (data.audioUrl) {
        const updatedTrack = { 
          ...track, 
          audioUrl: data.audioUrl,
          scaleName: data.scaleName,
          baseRoot: data.baseRoot,
          meditationFocus: data.meditationFocus
        };
        setCurrentTrack(updatedTrack);
        setUserTracks(prev => prev.map(t => t.id === track.id ? updatedTrack : t));
        if (user && track.id) {
          saveSupabaseMusicTrack({
            id: track.id,
            user_id: user.uid,
            title: track.title,
            prompt: track.prompt,
            audio_url: data.audioUrl,
            model_used: track.modelUsed,
            style: track.style,
            duration: track.duration,
            created_at: track.createdAt,
          }).catch(console.warn);
        }
        await playAudioTrack(data.audioUrl);
      }
    } catch (err) {
      console.error("Failed to synthesize missing audio:", err);
    } finally {
      setRegeneratingTrackId(null);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!user || !trackId) return;
    try {
      await deleteSupabaseMusicTrack(trackId);
      try {
        await deleteDoc(doc(db, "generatedTracks", trackId));
      } catch (_) {}
      setUserTracks(prev => prev.filter(t => t.id !== trackId));
    } catch (err) {
      console.error("Error deleting track:", err);
    }
  };

  // Client-Side Web Audio Instant Tone Synthesizer
  const toggleWebAudioLiveSynth = (freq?: number) => {
    const targetFreq = freq || testFrequency;
    if (isWebAudioPlaying && (!freq || testFrequency === freq)) {
      stopWebAudio();
    } else {
      if (freq) setTestFrequency(freq);
      startWebAudioLiveSynth(targetFreq);
    }
  };

  const startWebAudioLiveSynth = (freq: number) => {
    try {
      stopWebAudio();
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth attack ramp to avoid click
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      webAudioCtxRef.current = ctx;
      webAudioOscRef.current = osc;
      webAudioGainRef.current = gain;
      setIsWebAudioPlaying(true);
    } catch (e) {
      console.error("Web Audio Live Synth err:", e);
    }
  };

  const stopWebAudio = () => {
    try {
      if (webAudioOscRef.current) {
        webAudioOscRef.current.stop();
        webAudioOscRef.current.disconnect();
        webAudioOscRef.current = null;
      }
      if (webAudioGainRef.current) {
        webAudioGainRef.current.disconnect();
        webAudioGainRef.current = null;
      }
      if (webAudioCtxRef.current) {
        webAudioCtxRef.current.close();
        webAudioCtxRef.current = null;
      }
    } catch (_) {}
    setIsWebAudioPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hidden Master Audio Element with complete event bindings */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
          }
        }}
        onError={(e) => {
          console.warn("Audio element playback error event:", e);
          setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-[32px] border relative overflow-hidden transition-all organic-card-shadow ${
        isDark 
          ? "bg-[#242129]/95 border-zinc-800 text-zinc-100" 
          : "bg-[#FFFDF9]/95 border-[#EFE5D8] text-[#292623]"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-[#F3E3D5] text-[#244F46] flex items-center justify-center shadow-xs">
                <Music size={18} className="text-[#C95D4E]" />
              </span>
              <h2 className={`text-xl font-calibri font-bold ${isDark ? "text-white" : "text-[#292623]"}`}>
                Sacred AI Music Sanctuary
              </h2>
              <span className="text-[11px] font-calibri font-medium text-[#8A8279]">
                · Timeless Meditative Harmony
              </span>
            </div>
            <p className={`text-xs font-calibri leading-relaxed ${isDark ? "text-zinc-400" : "text-[#625C56]"} max-w-xl`}>
              Every melody evolves dynamically with soothing pentatonic chords, velvety analog pads, singing bowls, and nature acoustic layers designed for deep peace, prayer, and stillness.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Frequency Tone Tester */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F7EBDD]/60 dark:bg-black/30 border border-[#EFE5D8] dark:border-white/10 text-[10px] font-calibri">
              <span className="px-2 text-[#8A8279] hidden sm:inline font-medium">Heal Tones:</span>
              {[
                { f: 432, label: "432Hz" },
                { f: 528, label: "528Hz" },
                { f: 136.1, label: "Om 136" },
              ].map(({ f, label }) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleWebAudioLiveSynth(f)}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer text-xs font-bold ${
                    isWebAudioPlaying && testFrequency === f 
                      ? "bg-[#C95D4E] text-white shadow-xs" 
                      : "bg-white/80 dark:bg-zinc-800 text-[#292623] dark:text-zinc-200 hover:bg-white"
                  }`}
                  title={`Play pure ${label} tone`}
                >
                  {isWebAudioPlaying && testFrequency === f ? "■ Stop" : label}
                </button>
              ))}
            </div>

            {!user && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium shadow-md hover:brightness-110 transition cursor-pointer shrink-0"
              >
                Sign In to Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Autoplay Browser Permission Warning Banner */}
      {autoplayBlocked && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 text-xs font-calibri">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <span>Browser sound permissions required. Click the Play button below to start your meditative music.</span>
          </div>
          <button
            onClick={() => currentTrack?.audioUrl && playAudioTrack(currentTrack.audioUrl)}
            className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition cursor-pointer shrink-0"
          >
            Start Audio
          </button>
        </div>
      )}

      {/* Inspiring Soundscape Presets with Rich Variations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`block text-xs font-calibri tracking-wider uppercase font-semibold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
            Select a Meditative Sanctuary Mood
          </label>
          <span className="text-[10px] font-calibri text-indigo-400">
            Each selection alters chord progression & melody
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PRESET_PROMPTS.map((preset, idx) => {
            const isSelected = prompt === preset.prompt;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset.prompt);
                  setSelectedStyle(preset.style);
                }}
                className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer relative group flex flex-col justify-between organic-card-shadow ${
                  isSelected
                    ? "border-[#C95D4E] bg-[#FDF0EB] dark:bg-[#2C242A] ring-2 ring-[#C95D4E]/30 scale-[1.01]"
                    : isDark 
                      ? "bg-[#242129] border-zinc-800 text-zinc-300 hover:border-zinc-700" 
                      : "bg-[#FFFDF9] border-[#EFE5D8] text-[#292623] hover:bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-calibri font-bold text-xs md:text-sm">
                    <span className="text-base">{preset.icon}</span>
                    <span className={isSelected ? "text-[#C95D4E] dark:text-[#F4C84A]" : isDark ? "text-zinc-100" : "text-[#292623]"}>
                      {preset.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-calibri leading-relaxed text-[#8A8279] line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#EFE5D8] dark:border-white/5 flex items-center justify-between text-[10px] font-calibri text-[#8A8279]">
                  <span className="truncate font-medium">{preset.style}</span>
                  {isSelected && <span className="text-[#C95D4E] dark:text-[#F4C84A] font-bold">Selected ✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Generation Customizer Form */}
      <form onSubmit={(e) => handleGenerate(e)} className={`p-6 rounded-3xl border space-y-5 ${
        isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white/80 border-slate-200/80 shadow-md"
      }`}>
        <div className="space-y-2">
          <label className={`block text-xs font-calibri uppercase tracking-widest font-bold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
            Spiritual Vision & Instruments Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="E.g., Gentle rainfall over a bamboo forest with peaceful soft acoustic guitar, Tibetan singing bowls, and meditative 432Hz healing tones..."
            className={`w-full p-4 rounded-2xl border text-xs md:text-sm focus:outline-none transition-all font-calibri ${
              isDark 
                ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500" 
                : "bg-slate-50/50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration Tier */}
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-calibri uppercase tracking-wider font-semibold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Meditation Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel("lyria-3-clip-preview")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedModel === "lyria-3-clip-preview"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5">
                  <Clock size={12} />
                  <span>Harmonic Loop</span>
                </div>
                <div className="text-[10px] opacity-80 font-calibri">20s Repeating Breath</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("lyria-3-pro-preview")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedModel === "lyria-3-pro-preview"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5">
                  <Radio size={12} />
                  <span>Extended Sanctuary</span>
                </div>
                <div className="text-[10px] opacity-80 font-calibri">28s Deep Progression</div>
              </button>
            </div>
          </div>

          {/* Sound Style Filter */}
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-calibri uppercase tracking-wider font-semibold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Harmonic Root & Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className={`w-full p-3 rounded-2xl border text-xs font-calibri focus:outline-none transition-all ${
                isDark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="Meditative Solfeggio 432Hz">Solfeggio 432Hz (Restorative Calm)</option>
              <option value="528Hz Miracle Transformation">528Hz Miracle (Golden Light)</option>
              <option value="Deep Sleep Delta Waves">Deep Sleep Delta Waves (2.5Hz Theta)</option>
              <option value="Sacred Temple Chants & Bells">Sacred Temple Om & Singing Bowls</option>
              <option value="Dawn Forest Awakening">Dawn Forest Awakening (Pastoral Lydian)</option>
              <option value="Gentle Acoustic Guitar & Nature">Zen Garden Bamboo Flute & Nature</option>
            </select>
          </div>
        </div>

        {generationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-calibri">
            {generationError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className={`flex-1 py-4 px-7 rounded-[22px] font-bold text-xs md:text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2.5 ${
              isGenerating || !prompt.trim()
                ? "opacity-60 cursor-not-allowed bg-zinc-800 text-zinc-400"
                : "btn-organic-coral text-white"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Composing Peaceful Meditative Sanctuary...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-[#F4C84A]" />
                <span>Generate Peaceful Meditative Music</span>
              </>
            )}
          </button>

          {currentTrack && (
            <button
              type="button"
              onClick={handleRegenerateVariation}
              disabled={isGenerating}
              className={`py-3.5 px-5 rounded-2xl border text-xs font-calibri font-medium transition cursor-pointer flex items-center gap-2 shrink-0 ${
                isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750" : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              }`}
              title="Generate a completely new chord and melodic variation"
            >
              <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
              <span>New Melody Variation</span>
            </button>
          )}
        </div>
      </form>

      {/* Master Meditative Player Card */}
      {currentTrack && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all animate-fade-in space-y-6 ${
          isDark 
            ? "bg-gradient-to-b from-indigo-950/80 via-zinc-900 to-zinc-950 border-indigo-900/60" 
            : "bg-gradient-to-b from-indigo-50/90 via-white to-stone-50 border-indigo-200 shadow-indigo-100/50"
        }`}>
          {/* Track Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              {/* Master Play/Pause button */}
              <button
                type="button"
                onClick={() => togglePlayback(currentTrack)}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title={isPlaying ? "Pause track" : "Play track"}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-lg sm:text-xl font-calibri font-bold ${isDark ? "text-indigo-200" : "text-indigo-950"}`}>
                    {currentTrack.title}
                  </h3>
                  {/* Calming animated rhythm waves */}
                  {isPlaying && (
                    <div className="flex items-end gap-1 h-5 ml-1">
                      <span className="w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                      <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms] h-3.5" />
                      <span className="w-1 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms] h-5" />
                      <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:75ms] h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-calibri">
                  {currentTrack.scaleName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      🌿 {currentTrack.scaleName}
                    </span>
                  )}
                  {currentTrack.baseRoot && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      {currentTrack.baseRoot}Hz
                    </span>
                  )}
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-400">{currentTrack.duration}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleRegenerateVariation}
                className="px-3.5 py-2 rounded-xl border text-xs font-calibri font-medium transition cursor-pointer flex items-center gap-1.5 text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10"
                title="Generate another peaceful variation of this song"
              >
                <RefreshCw size={13} />
                <span>Variation</span>
              </button>

              {user ? (
                <button
                  onClick={() => saveTrackToDatabases(currentTrack)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-calibri transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-calibri transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>Sign In</span>
                </button>
              )}

              {currentTrack.audioUrl && (
                <a
                  href={currentTrack.audioUrl}
                  download={`${currentTrack.title.replace(/\s+/g, "_")}.wav`}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-calibri transition flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download WAV</span>
                </a>
              )}
            </div>
          </div>

          {/* Meditation Contemplation Card */}
          {currentTrack.meditationFocus && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDark ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-200" : "bg-indigo-50/70 border-indigo-100 text-indigo-900"
            }`}>
              <Heart size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-calibri uppercase tracking-wider text-indigo-400 block font-semibold">
                  Spiritual Contemplation
                </span>
                <p className="text-xs italic font-calibri leading-relaxed">
                  "{currentTrack.meditationFocus}"
                </p>
              </div>
            </div>
          )}

          {/* Timeline & Audio Scrubber */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-calibri text-zinc-400">
                <span>{formatSeconds(currentTime)}</span>
                <span className="text-indigo-400 font-semibold">
                  {isPlaying ? "● Flowing in Harmony" : "○ Paused"}
                </span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Ambient Nature Sound Blend Mixer & Controls */}
            <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Nature sound backdrop layer selector */}
              <div className="space-y-1.5 w-full md:w-auto">
                <span className="text-[10px] font-calibri uppercase tracking-wider text-zinc-400 block font-semibold">
                  Nature Backdrop Sound Layer:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AMBIENT_LAYERS.map((layer) => {
                    const Icon = layer.icon;
                    const isActive = activeAmbientLayer === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveAmbientLayer(layer.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-calibri transition cursor-pointer flex items-center gap-1 border ${
                          isActive 
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm font-semibold" 
                            : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Icon size={12} />
                        <span>{layer.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume & Loop Controls */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={16} className="text-rose-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVol = parseFloat(e.target.value);
                      setVolume(newVol);
                      if (isMuted && newVol > 0) setIsMuted(false);
                    }}
                    className="w-20 sm:w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] font-calibri text-zinc-400 w-7">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Loop toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isLooping;
                    setIsLooping(next);
                    if (audioRef.current) audioRef.current.loop = next;
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-calibri font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                    isLooping 
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm" 
                      : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                  title="Loop audio continuously"
                >
                  <RotateCcw size={11} className={isLooping ? "animate-spin-slow" : ""} />
                  <span>Looping {isLooping ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-calibri flex items-center gap-2">
              <Check size={14} />
              <span>{saveSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Saved Tracks Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="text-indigo-400" size={18} />
            <h3 className={`text-base font-calibri font-bold ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
              Your Sacred AI Audio Vault
            </h3>
          </div>
          {user && (
            <span className="text-xs font-calibri text-zinc-400">
              {userTracks.length} saved tracks
            </span>
          )}
        </div>

        {!user ? (
          <div className={`p-6 rounded-2xl border text-center space-y-3 ${
            isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-slate-50 border-slate-200"
          }`}>
            <p className={`text-xs font-calibri ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
              Sign in with Google using Firebase Auth to keep your personal generated music tracks synced safely across devices.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        ) : loadingTracks ? (
          <div className="p-8 text-center text-xs font-calibri text-zinc-400 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Retrieving saved music from database...</span>
          </div>
        ) : userTracks.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center text-xs font-calibri ${
            isDark ? "bg-zinc-900/30 border-zinc-800 text-zinc-400" : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            No music tracks saved yet. Generate your first AI melody above to start building your sacred sound collection!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userTracks.map((track) => (
              <div
                key={track.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-slate-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => togglePlayback(track)}
                    disabled={regeneratingTrackId === track.id}
                    className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                    title={currentTrack?.audioUrl === track.audioUrl && isPlaying ? "Pause" : "Play"}
                  >
                    {regeneratingTrackId === track.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : currentTrack?.audioUrl === track.audioUrl && isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} className="ml-0.5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-calibri font-bold truncate ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                      {track.title}
                    </h4>
                    <p className="text-[10px] font-calibri text-zinc-400 truncate max-w-xs">
                      {track.style || track.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!track.audioUrl && (
                    <button
                      onClick={() => handleSynthesizeMissingAudio(track)}
                      disabled={regeneratingTrackId === track.id}
                      className="px-2 py-1 rounded text-[10px] font-calibri bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer"
                      title="Synthesize audio stream"
                    >
                      {regeneratingTrackId === track.id ? "Synthesizing..." : "Add Sound"}
                    </button>
                  )}
                  <button
                    onClick={() => track.id && handleDeleteTrack(track.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                    title="Delete track"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
