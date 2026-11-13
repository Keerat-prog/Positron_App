import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type BreathingPhase = "inhale" | "holdIn" | "exhale" | "holdOut";

interface PhaseConfig {
  label: string;
  duration: number; // in seconds
  color: string;
  bgColor: string;
  scale: number;
}

const PHASES: Record<BreathingPhase, PhaseConfig> = {
  inhale: {
    label: "Inhale Deeply",
    duration: 4,
    color: "from-[#F7B28B] to-[#F26B5B]",
    bgColor: "bg-[#F7B28B]/20",
    scale: 1.35,
  },
  holdIn: {
    label: "Hold Peacefully",
    duration: 4,
    color: "from-[#F26B5B] to-[#C95D4E]",
    bgColor: "bg-[#F26B5B]/20",
    scale: 1.35,
  },
  exhale: {
    label: "Exhale Comfortably",
    duration: 4,
    color: "from-[#6F9B82] to-[#244F46]",
    bgColor: "bg-[#6F9B82]/20",
    scale: 1.0,
  },
  holdOut: {
    label: "Rest in Quietude",
    duration: 4,
    color: "from-[#244F46] to-[#17645F]",
    bgColor: "bg-[#244F46]/20",
    scale: 1.0,
  },
};

const PHASE_ORDER: BreathingPhase[] = ["inhale", "holdIn", "exhale", "holdOut"];

interface BreathingExerciseProps {
  isDark?: boolean;
  themeObj?: any;
}

export default function BreathingExercise({ isDark = false, themeObj }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Audio Context Ref to avoid creating multiples
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const activePhase = PHASE_ORDER[phaseIndex];
  const phaseConfig = PHASES[activePhase];

  // Store variables in refs to avoid closure stale state
  const activePhaseRef = useRef<BreathingPhase>(activePhase);
  const soundEnabledRef = useRef<boolean>(soundEnabled);

  useEffect(() => {
    activePhaseRef.current = activePhase;
  }, [activePhase]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (soundEnabled) {
      resumeSynthesizer();
    } else {
      pauseSynthesizer();
    }
  }, [soundEnabled]);

  // Handle Web Audio API synthesizer for breathing guidance
  const initAudio = () => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(180, ctx.currentTime); // Deep soothing pitch

      gain.gain.setValueAtTime(0, ctx.currentTime); // Quiet initially

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);

      audioContextRef.current = ctx;
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error("Audio Context initialization failed:", e);
    }
  };

  const updateSynthesizerPitchForPhase = (phase: BreathingPhase) => {
    const ctx = audioContextRef.current;
    const osc = oscillatorRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !osc || !gain || !soundEnabledRef.current) return;

    const now = ctx.currentTime;
    // Smooth transitions of frequency and gain
    switch (phase) {
      case "inhale":
        // Slide pitch upwards gently to follow expansion
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 4);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 4);
        break;
      case "holdIn":
        // Stable, very low soothing rumble
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 4);
        break;
      case "exhale":
        // Slide pitch downwards gently to follow contraction
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 4);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 4);
        break;
      case "holdOut":
        // Near-silent soft hum
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.002, now + 4);
        break;
    }
  };

  const resumeSynthesizer = () => {
    initAudio();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    updateSynthesizerPitchForPhase(activePhaseRef.current);
  };

  const pauseSynthesizer = () => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (ctx && gain) {
      gain.gain.setValueAtTime(0, ctx.currentTime);
    }
  };

  // Timer runner
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isActive) {
      // Trigger synth change right on start or phase transition
      if (soundEnabledRef.current) {
        resumeSynthesizer();
      }

      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setPhaseIndex((prevIndex) => {
              const nextIndex = (prevIndex + 1) % PHASE_ORDER.length;
              const nextPhase = PHASE_ORDER[nextIndex];
              // Update synth immediately
              updateSynthesizerPitchForPhase(nextPhase);

              if (nextIndex === 0) {
                setCyclesCompleted((c) => c + 1);
              }
              return nextIndex;
            });
            return 4; // Constant 4 seconds per phase for box breathing
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      pauseSynthesizer();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleStartStop = () => {
    if (!isActive) {
      initAudio();
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(4);
    setCyclesCompleted(0);
    pauseSynthesizer();
  };

  const percentage = ((4 - secondsRemaining) / 4) * 100;

  return (
    <div className={`rounded-[32px] p-8 organic-card-shadow border max-w-lg mx-auto flex flex-col items-center backdrop-blur-xl transition-all duration-300 ${
      isDark ? "bg-[#242129]/95 border-zinc-800 text-zinc-100" : "bg-[#FFFDF9]/95 border-[#EFE5D8] text-[#292623]"
    }`}>
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-calibri tracking-tight font-bold ${isDark ? "text-white" : "text-[#292623]"}`}>Box Breathing Exercise</h3>
        <p className={`text-sm mt-1 max-w-sm ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
          A calming rhythmic breath cycle designed to quiet your nervous system and return awareness to the present moment.
        </p>
      </div>

      {/* Interactive Visual Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center my-6">
        <AnimatePresence mode="wait">
          {/* Pulsing glow background of the phase */}
          <motion.div
            key={`bg-${activePhase}`}
            className={`absolute inset-0 rounded-full ${phaseConfig.bgColor} blur-2xl`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        </AnimatePresence>

        {/* Breathing Ring */}
        <motion.div
          className={`w-48 h-48 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-gradient-to-tr ${phaseConfig.color} shadow-lg relative z-10 text-white overflow-hidden`}
          animate={{
            scale: isActive ? phaseConfig.scale : 1.0,
            boxShadow: isActive
              ? "0 20px 40px -10px rgba(16, 185, 129, 0.3)"
              : "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
        >
          {/* Subtle Dynamic SVG Breathing Mandala */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 200 200"
          >
            {/* Spinning background guide ring */}
            <motion.circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Inhale/Exhale expanding and contracting ring waves */}
            <motion.circle
              cx="100"
              cy="100"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1.2"
              animate={{
                scale: isActive 
                  ? (activePhase === "inhale" ? [1, 1.45] : activePhase === "holdIn" ? [1.45, 1.48, 1.45] : activePhase === "exhale" ? [1.45, 0.95] : [0.95, 0.92, 0.95]) 
                  : 1,
                opacity: isActive 
                  ? (activePhase === "inhale" ? [0.15, 0.55] : activePhase === "holdIn" ? 0.55 : activePhase === "exhale" ? [0.55, 0.15] : 0.15) 
                  : 0.25
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
            />

            <motion.circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              animate={{
                scale: isActive 
                  ? (activePhase === "inhale" ? [0.85, 1.35] : activePhase === "holdIn" ? [1.35, 1.37, 1.35] : activePhase === "exhale" ? [1.35, 0.85] : [0.85, 0.82, 0.85]) 
                  : 1,
                opacity: isActive 
                  ? (activePhase === "inhale" ? [0.1, 0.35] : activePhase === "holdIn" ? 0.35 : activePhase === "exhale" ? [0.35, 0.1] : 0.1) 
                  : 0.15
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                delay: 0.1,
              }}
            />

            {/* Sacred geometry petal blossom (Lotus of Life) */}
            <motion.g
              transform="translate(100, 100)"
              animate={{
                scale: isActive 
                  ? (activePhase === "inhale" ? [0.72, 1.18] : activePhase === "holdIn" ? [1.18, 1.22, 1.18] : activePhase === "exhale" ? [1.18, 0.72] : [0.72, 0.68, 0.72]) 
                  : 0.85,
                rotate: isActive 
                  ? (activePhase === "inhale" ? [0, 15] : activePhase === "holdIn" ? [15, 18, 15] : activePhase === "exhale" ? [15, 0] : [0, -3, 0]) 
                  : 0
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                <path
                  key={index}
                  d="M 0 0 C -12 -30 -22 -50 0 -75 C 22 -50 12 -30 0 0"
                  fill="rgba(255, 255, 255, 0.04)"
                  stroke="rgba(255, 255, 255, 0.28)"
                  strokeWidth="1.2"
                  transform={`rotate(${angle})`}
                />
              ))}
            </motion.g>

            {/* Center target anchor dot */}
            <motion.circle
              cx="100"
              cy="100"
              r="5"
              fill="rgba(255, 255, 255, 0.85)"
              animate={{
                scale: isActive ? [1, 1.25, 1] : 1,
                opacity: isActive ? [0.75, 1, 0.75] : 0.85,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>

          {/* Inner Text Status */}
          <div className="text-center p-3 select-none z-10 relative">
            <span className="text-xs uppercase tracking-wider text-white/80 font-calibri">
              {isActive ? "Breath Vibe" : "Let's Begin"}
            </span>
            <h4 className="text-lg font-calibri font-medium mt-1 leading-tight h-12 flex items-center justify-center text-white">
              {phaseConfig.label}
            </h4>
            <div className="text-3xl font-calibri font-bold mt-2">
              {secondsRemaining}
              <span className="text-xs font-normal text-white/75 ml-0.5">s</span>
            </div>
          </div>

          {/* Semicircular progress ring inside */}
          {isActive && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1 z-10">
              <circle
                cx="96"
                cy="96"
                r="90"
                className="stroke-white/20 fill-none"
                strokeWidth="4"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="90"
                className="stroke-white/90 fill-none"
                strokeWidth="4"
                strokeDasharray="565"
                animate={{
                  strokeDashoffset: 565 - (565 * percentage) / 100,
                }}
                transition={{ duration: 0.95, ease: "linear" }}
              />
            </svg>
          )}
        </motion.div>
      </div>

      {/* Audio Toggle & Cycles Progress */}
      <div className={`flex justify-between w-full max-w-xs items-center text-sm mb-8 mt-2 px-1 ${
        isDark ? "text-zinc-300" : "text-slate-600"
      }`}>
        <button
          onClick={() => {
            initAudio();
            setSoundEnabled(!soundEnabled);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
            soundEnabled
              ? isDark ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              : isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
          }`}
          title="Toggle deep breathing biofeedback hum"
        >
          {soundEnabled ? (
            <>
              <Volume2 size={16} /> <span className="font-calibri text-xs font-medium">Audio Hum On</span>
            </>
          ) : (
            <>
              <VolumeX size={16} /> <span className="font-calibri text-xs font-medium">Muted</span>
            </>
          )}
        </button>

        <span className="font-calibri">
          Cycles Core: <strong className={`font-calibri font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{cyclesCompleted}</strong>
        </span>
      </div>

      {/* Core Action Controls */}
      <div className="flex gap-4">
        <button
          id="btn-breathing-control"
          onClick={handleStartStop}
          className={`flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold transition-all transform shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
            isActive
              ? "bg-[#C95D4E] hover:bg-[#B34F40] text-white"
              : "btn-organic-coral text-white"
          }`}
        >
          {isActive ? (
            <>
              <Square size={17} fill="currentColor" /> <span>Pause Exercise</span>
            </>
          ) : (
            <>
              <Play size={17} fill="currentColor" /> <span>Start Breathing</span>
            </>
          )}
        </button>

        <button
          id="btn-breathing-reset"
          onClick={handleReset}
          className={`flex items-center justify-center p-3.5 rounded-2xl transition-all cursor-pointer ${
            isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700" : "bg-[#F7EBDD] hover:bg-[#EFE0D0] text-[#292623] border border-[#E8D5C2]"
          }`}
          title="Reset timer"
        >
          <RefreshCw size={17} />
        </button>
      </div>
    </div>
  );
}
