import React, { useState, useEffect } from "react";
import { Play, Square, FastForward, Rewind, RefreshCw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StepConfig {
  title: string;
  instruction: string;
  tip: string;
  duration: number; // in seconds
  animationType: "clockwise" | "counterclockwise" | "side-tilt" | "center";
}

const STEPS: StepConfig[] = [
  {
    title: "1. Posture Alignment",
    instruction: "Sit tall with your spine elongated and shoulders completely relaxed. Place your hands gently on your lap.",
    tip: "Inhale courage, let go of any tension currently stored in your shoulders.",
    duration: 10,
    animationType: "center",
  },
  {
    title: "2. Clockwise Rotation",
    instruction: "Drop your chin slowly to your chest, then roll your neck towards your right shoulder, gently back, to your left, and forward.",
    tip: "Keep the movement continuous and extremely slow. Do not force any stretch.",
    duration: 30,
    animationType: "clockwise",
  },
  {
    title: "3. Brief Re-centering",
    instruction: "Raise your head back to absolute neutral alignment. Take a deep stabilizing breath.",
    tip: "Notice any warm micro-sensations of relief or blood flow in the neck muscles.",
    duration: 10,
    animationType: "center",
  },
  {
    title: "4. Anti-clockwise Rotation",
    instruction: "Gently lower your chin again. Rotate slowly towards the left shoulder, trailing back, then right, and down.",
    tip: "Sync with your breathing: Inhale as your head goes back, exhale as it returns front.",
    duration: 30,
    animationType: "counterclockwise",
  },
  {
    title: "5. Side-to-Side Shoulder Stretch",
    instruction: "Lower your right ear towards your right shoulder without raising your shoulder. Hold, then repeat on the left side.",
    tip: "Rest your opposite hand down towards the ground to extend the side neck muscles.",
    duration: 20,
    animationType: "side-tilt",
  },
];

interface NeckRotationProps {
  isDark?: boolean;
  themeObj?: any;
}

export default function NeckRotation({ isDark = false, themeObj }: NeckRotationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(STEPS[0].duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const step = STEPS[currentStepIndex];

  // Timer run effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Step complete
            if (currentStepIndex < STEPS.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              return STEPS[nextIdx].duration;
            } else {
              setIsActive(false);
              setIsCompleted(true);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentStepIndex]);

  const handleStartStop = () => {
    if (isCompleted) {
      // Re-start entire sequence
      setCurrentStepIndex(0);
      setSecondsRemaining(STEPS[0].duration);
      setIsCompleted(false);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setSecondsRemaining(STEPS[nextIdx].duration);
      setIsCompleted(false);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setSecondsRemaining(STEPS[prevIdx].duration);
      setIsCompleted(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(STEPS[0].duration);
    setIsCompleted(false);
  };

  const totalStepSecs = STEPS[currentStepIndex].duration;
  const progressPercentage = ((totalStepSecs - secondsRemaining) / totalStepSecs) * 100;

  return (
    <div className={`rounded-3xl p-8 shadow-xl border max-w-lg mx-auto flex flex-col items-center backdrop-blur-xl transition-colors duration-300 ${
      isDark ? "bg-[#14161c]/95 border-zinc-800 text-zinc-100" : "bg-white/95 border-emerald-100 text-slate-900"
    }`}>
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-calibri tracking-tight font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Gentle Neck Release</h3>
        <p className={`text-sm mt-1 max-w-sm ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
          Relieve physical tension in the cervical muscles and neck. Follow the visual guidance slow and steady.
        </p>
      </div>

      {/* SVG Interactive Guidance Graphic */}
      <div className={`relative w-48 h-48 flex items-center justify-center my-4 rounded-full border ${
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Centering Dot / Posture Guidance */}
          {step.animationType === "center" && (
            <motion.div
              className="w-10 h-10 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="w-4 h-4 rounded-full bg-indigo-500" />
            </motion.div>
          )}

          {/* Clockwise Rotation Guide */}
          {step.animationType === "clockwise" && (
            <svg className="w-36 h-36">
              <circle cx="72" cy="72" r="50" className="stroke-emerald-200/50 fill-none" strokeWidth="2" strokeDasharray="5 5" />
              <motion.circle
                cx="72"
                cy="72"
                r="50"
                className="fill-emerald-500 stroke-none"
                r-value="6"
                initial={{ pathLength: 0 }}
                animate={{
                  cx: 72 + Math.cos((progressPercentage * Math.PI * 2) / 100) * 50,
                  cy: 72 + Math.sin((progressPercentage * Math.PI * 2) / 100) * 50,
                }}
                transition={{ duration: 0.1 }}
              />
              <path
                d="M 122 72 A 50 50 0 1 1 72 22"
                className="stroke-emerald-500/50 fill-none"
                strokeWidth="2"
                markerEnd="url(#arrow)"
                strokeDasharray="4 4"
              />
            </svg>
          )}

          {/* Anti-clockwise Rotation Guide */}
          {step.animationType === "counterclockwise" && (
            <svg className="w-36 h-36">
              <circle cx="72" cy="72" r="50" className="stroke-indigo-200/50 fill-none" strokeWidth="2" strokeDasharray="5 5" />
              <motion.circle
                cx="72"
                cy="72"
                r="50"
                className="fill-indigo-500 stroke-none"
                r-value="6"
                initial={{ pathLength: 0 }}
                animate={{
                  cx: 72 + Math.cos((-progressPercentage * Math.PI * 2) / 100 + Math.PI / 2) * 50,
                  cy: 72 + Math.sin((-progressPercentage * Math.PI * 2) / 100 + Math.PI / 2) * 50,
                }}
                transition={{ duration: 0.1 }}
              />
              <path
                d="M 22 72 A 50 50 0 1 1 72 122"
                className="stroke-indigo-500/50 fill-none"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          )}

          {/* Side Tilt Guide */}
          {step.animationType === "side-tilt" && (
            <svg className="w-36 h-36">
              <path d="M 22 72 A 50 50 0 0 1 122 72" className="stroke-cyan-200/50 fill-none" strokeWidth="2" strokeDasharray="5 5" />
              <motion.circle
                cx="72"
                cy="72"
                className="fill-cyan-500 stroke-none"
                r="7"
                animate={{
                  cx: [42, 102, 42],
                  cy: [55, 55, 55],
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
            </svg>
          )}
        </div>

        {/* Outer step timer */}
        <div className={`absolute bottom-3 font-calibri text-sm font-bold z-10 flex items-center gap-1 px-3 py-1 rounded-full shadow-sm ${
          isDark ? "bg-zinc-800 text-zinc-100 border border-zinc-700" : "bg-white text-slate-800 border border-slate-200"
        }`}>
          {isCompleted ? "Done!" : `${secondsRemaining}s`}
        </div>
      </div>

      {/* Step Info */}
      <div className="w-full text-center min-h-[140px] px-2 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completion-screen"
              className="flex flex-col items-center justify-center p-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle className="text-emerald-500 w-12 h-12 mb-2" />
              <h4 className={`text-lg font-calibri font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Neck Release Complete!</h4>
              <p className={`text-sm mt-1 ${isDark ? "text-zinc-300" : "text-slate-600"}`}>Excellent job giving your body this vital physical release of tension.</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className={`text-lg font-calibri font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{step.title}</h4>
              <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-zinc-300" : "text-slate-700"}`}>{step.instruction}</p>
              <div className={`mt-4 inline-block border rounded-xl px-4 py-2 ${
                isDark ? "bg-teal-950/60 border-teal-800 text-teal-200" : "bg-teal-50 border-teal-200 text-teal-900"
              }`}>
                <p className="text-xs font-calibri leading-snug">🌟 {step.tip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step Indicator dots */}
      <div className="flex gap-1.5 my-6">
        {STEPS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentStepIndex(idx);
              setSecondsRemaining(STEPS[idx].duration);
              setIsCompleted(false);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentStepIndex
                ? "w-6 bg-emerald-600"
                : isDark ? "bg-zinc-700 hover:bg-zinc-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
            title={`Step ${idx + 1}`}
          />
        ))}
      </div>

      {/* Controller Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`p-2.5 rounded-full disabled:opacity-40 transition-colors cursor-pointer ${
            isDark ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          }`}
          title="Previous Step"
        >
          <Rewind size={18} />
        </button>

        <button
          id="btn-neck-control"
          onClick={handleStartStop}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
            isActive
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isActive ? (
            <>
              <Square size={16} fill="currentColor" /> Stop Stretch
            </>
          ) : isCompleted ? (
            <>
              <RefreshCw size={16} /> Repeat Release
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" /> Start Stretch
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === STEPS.length - 1 && isCompleted}
          className={`p-2.5 rounded-full disabled:opacity-40 transition-colors cursor-pointer ${
            isDark ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          }`}
          title="Next Step"
        >
          <FastForward size={18} />
        </button>

        <button
          onClick={handleReset}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            isDark ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          }`}
          title="Reset Whole Routine"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
