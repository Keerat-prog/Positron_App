import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Heart, 
  Sparkles, 
  MapPin, 
  Menu, 
  X, 
  Check, 
  Smile, 
  Compass, 
  FileText, 
  CornerDownRight, 
  Plus, 
  BookMarked, 
  Calendar, 
  VolumeX, 
  Volume2,
  Sliders,
  Info, 
  ChevronRight, 
  Trash2, 
  RefreshCw,
  ArrowRight,
  Languages,
  Play,
  Pause,
  Square,
  Database,
  Send,
  RotateCcw,
  MessageSquare,
  Clock,
  User as UserIcon,
  Download,
  Smartphone
} from "lucide-react";
import { SACRED_VERSES } from "./data/sacredTexts";
import { DiaryEntry, ActiveSection, SacredVerse } from "./types";
import BreathingExercise from "./components/BreathingExercise";
import NeckRotation from "./components/NeckRotation";
import SupabaseDashboard from "./components/SupabaseDashboard";
import AuthModal from "./components/AuthModal";
import ApkDownloadModal from "./components/ApkDownloadModal";
import MoodJourneyChart from "./components/MoodJourneyChart";
import { getInitialSampleEntries } from "./data/sampleMoodEntries";
import { auth, onAuthStateChanged, User } from "./lib/firebase";
import { 
  fetchSupabaseJournalEntries, 
  saveSupabaseJournalEntry, 
  deleteSupabaseJournalEntry 
} from "./lib/supabase";
import { apiFetchJson } from "./lib/api";
import warmButterflyImg from "./assets/images/warm_butterfly_valley_1791215688932.jpg";
import sakuraBlossomImg from "./assets/images/sakura_blossom_diorama_1794549505337.jpg";
import organicForestImg from "./assets/images/organic_diorama_forest_1791215677295.jpg";
import azureLagoonImg from "./assets/images/azure_lagoon_diorama_1794549505269.jpg";
import tranquilMossImg from "./assets/images/tranquil_moss_haven_1791215703275.jpg";
import twilightLavenderImg from "./assets/images/twilight_lavender_diorama_1794549505526.jpg";

const ORACLE_DIORAMA_SCENES = [
  {
    id: "terracotta-dawn",
    src: warmButterflyImg,
    title: "Terracotta Sunrise",
    subtitle: "Warm amber stillness for an open heart",
    accentColor: "#F4C84A",
    washClass: "from-amber-950/65 via-orange-500/10 to-rose-400/20",
    glowColor: "rgba(244, 162, 97, 0.35)",
  },
  {
    id: "sakura-rose",
    src: sakuraBlossomImg,
    title: "Sakura Rose Morning",
    subtitle: "Gentle rose-quartz petals drifting in peace",
    accentColor: "#F9A8D4",
    washClass: "from-rose-950/65 via-pink-500/15 to-fuchsia-400/20",
    glowColor: "rgba(244, 114, 182, 0.35)",
  },
  {
    id: "golden-meadow",
    src: organicForestImg,
    title: "Golden Meadow Haven",
    subtitle: "Sunlit sage hills and quiet sanctuary light",
    accentColor: "#FDE047",
    washClass: "from-stone-950/65 via-amber-400/10 to-lime-400/15",
    glowColor: "rgba(250, 204, 21, 0.32)",
  },
  {
    id: "azure-lagoon",
    src: azureLagoonImg,
    title: "Azure Lagoon Tide",
    subtitle: "Cool turquoise waves washing worry away",
    accentColor: "#7DD3FC",
    washClass: "from-cyan-950/65 via-sky-500/15 to-blue-400/20",
    glowColor: "rgba(56, 189, 248, 0.35)",
  },
  {
    id: "emerald-moss",
    src: tranquilMossImg,
    title: "Emerald Moss Sanctuary",
    subtitle: "Deep forest green grounded in timeless calm",
    accentColor: "#6EE7B7",
    washClass: "from-emerald-950/65 via-teal-500/15 to-emerald-400/20",
    glowColor: "rgba(52, 211, 153, 0.35)",
  },
  {
    id: "twilight-lavender",
    src: twilightLavenderImg,
    title: "Twilight Lavender Night",
    subtitle: "Indigo starlight and soft violet serenity",
    accentColor: "#C4B5FD",
    washClass: "from-indigo-950/70 via-violet-500/20 to-purple-500/25",
    glowColor: "rgba(167, 139, 250, 0.38)",
  },
];

const LANDSCAPE_BACKGROUNDS = [
  {
    id: "organic-diorama-garden",
    name: "Tactile Garden Diorama",
    category: "3D Artworks",
    url: organicForestImg,
    photographer: "Digital 3D Sculpture"
  },
  {
    id: "warm-butterfly-hills",
    name: "Terracotta Butterfly Haven",
    category: "3D Artworks",
    url: warmButterflyImg,
    photographer: "Tactile Clay Diorama"
  },
  {
    id: "tranquil-moss-haven",
    name: "Sage Moss & Dandelion Sanctuary",
    category: "3D Artworks",
    url: tranquilMossImg,
    photographer: "Miniature Sculptural World"
  },
  {
    id: "yosemite-valley",
    name: "Yosemite Green Valley",
    category: "Valleys",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85",
    photographer: "Ansel Adams"
  },
  {
    id: "mountain-alps",
    name: "Swiss Alps Peaks",
    category: "Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85",
    photographer: "Claudio Testa"
  },
  {
    id: "kyoto-japan",
    name: "Kyoto Pagoda & Mountains",
    category: "Famous Places",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=85",
    photographer: "Sorin Gheorghita"
  },
  {
    id: "mount-fuji",
    name: "Mount Fuji at Sunrise",
    category: "Mountains",
    url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1920&q=85",
    photographer: "Sora Sagano"
  },
  {
    id: "norway-fjords",
    name: "Norway Fjord & Valleys",
    category: "Valleys",
    url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1920&q=85",
    photographer: "Willian Justen de Vasconcellos"
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal Monument",
    category: "Famous Places",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=85",
    photographer: "Julian Yu"
  },
  {
    id: "grand-canyon",
    name: "Grand Canyon Valley",
    category: "Famous Places",
    url: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=1920&q=85",
    photographer: "Alan Carrillo"
  },
  {
    id: "hallstatt-austria",
    name: "Hallstatt Lake & Valley",
    category: "Famous Places",
    url: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1920&q=85",
    photographer: "Kalen Emsley"
  }
];

const AMBIENT_SOUNDS = [
  {
    id: "none",
    name: "Pure Silence",
    description: "Pause all ambient sounds and enjoy quiet focus.",
    icon: "🍃",
    url: ""
  },
  {
    id: "rain",
    name: "Raining",
    description: "Soothing sound of regular steady raindrops hitting leaves.",
    icon: "🌧️",
    url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/rain.mp3"
  },
  {
    id: "thunderstorm",
    name: "Raining and Thunderstorm",
    description: "An evocative storm with heavy sheets of rain and thunderclaps.",
    icon: "⛈️",
    url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/thunder.mp3"
  },
  {
    id: "camping",
    name: "Camping in the Forest",
    description: "Cracking bonfire campfire warmth under whispering forest pine leaves.",
    icon: "🔥",
    url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/fire.mp3"
  },
  {
    id: "wind",
    name: "Wind in the Forest",
    description: "Rushing clean wind and breeze gusting through wild woods.",
    icon: "💨",
    url: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/wind.mp3"
  },
  {
    id: "birds",
    name: "Chirping of Birds",
    description: "Energetic and joyful morning bird songs in a sun-dappled forest.",
    icon: "🐦",
    url: "https://raw.githubusercontent.com/petrovicstefanrs/chillnsound/master/app/sounds/birds.mp3"
  }
];

const MASTER_THEMES = [
  {
    id: "warm-cream",
    name: "Sanctuary Cream (Warm Ivory)",
    icon: "🕊️",
    isDark: false,
    primaryBg: "bg-[#244F46]",
    titleText: "text-[#292623]",
    bodyText: "text-[#625C56]",
    mutedText: "text-[#8A8279]",
    detailText: "text-[#A39A8F]",
    accentText: "text-[#C95D4E]",
    primaryButtonBg: "bg-[#F26B5B] hover:bg-[#E05847] text-white font-medium shadow-sm transition-all",
    gradientFrom: "from-[#F7B28B]",
    gradientTo: "to-[#FFF0D6]",
    mainCardBg: "bg-[#FFFDF8]/92 backdrop-blur-2xl rounded-[32px] organic-card-shadow border border-[#EFE5D8]/80 my-6 text-[#292623]",
    cardBg: "bg-[#FFFDF9]/95 text-[#292623] border-[#EFE4D6]/70 organic-card-shadow",
    cardBorder: "border-[#EFE4D6]/70",
    secondaryBg: "bg-[#F7EBDD]/60",
    badgeBg: "bg-[#F3E3D5] text-[#244F46] border border-[#E5CEBA] font-semibold",
    toastBg: "bg-[#244F46] text-[#FFF8ED] border border-[#6F9B82]/40",
    activeNavBg: "bg-[#244F46] text-[#FFF8ED] shadow-md font-semibold",
    hoverNavBg: "hover:bg-[#F7EBDD] hover:text-[#292623]",
    welcomeBannerGrad: "from-[#FFF8ED] via-[#FDF3E8] to-[#FFFBF5]",
    cardBorderClass: "border-[#EFE4D6]/70"
  },
  {
    id: "terracotta-clay",
    name: "Terracotta Earth (Warm Clay)",
    icon: "🏺",
    isDark: false,
    primaryBg: "bg-[#C95D4E]",
    titleText: "text-[#2B1B17]",
    bodyText: "text-[#5C453E]",
    mutedText: "text-[#876E66]",
    detailText: "text-[#A88C83]",
    accentText: "text-[#C95D4E]",
    primaryButtonBg: "bg-[#C95D4E] hover:bg-[#B34F40] text-white font-medium shadow-sm",
    gradientFrom: "from-[#F26B5B]",
    gradientTo: "to-[#D98686]",
    mainCardBg: "bg-[#FFF9F5]/94 backdrop-blur-2xl rounded-[32px] organic-card-shadow border border-[#EEDCD3]/80 my-6 text-[#2B1B17]",
    cardBg: "bg-white/95 text-[#2B1B17] border-[#EEDCD3]/70 organic-card-shadow",
    cardBorder: "border-[#EEDCD3]/70",
    secondaryBg: "bg-[#FDF0EB]/70",
    badgeBg: "bg-[#FBE5DE] text-[#8C3A2D] border border-[#F2C5B8] font-semibold",
    toastBg: "bg-[#2B1B17] text-[#FFF5F2] border border-[#C95D4E]/40",
    activeNavBg: "bg-[#C95D4E] text-white shadow-md font-semibold",
    hoverNavBg: "hover:bg-[#FDF0EB] hover:text-[#2B1B17]",
    welcomeBannerGrad: "from-[#FFF3ED] via-[#FCEAE2] to-white",
    cardBorderClass: "border-[#EEDCD3]/70"
  },
  {
    id: "sage-haven",
    name: "Sage & Deep Forest (Quiet Woods)",
    icon: "🌿",
    isDark: false,
    primaryBg: "bg-[#244F46]",
    titleText: "text-[#182622]",
    bodyText: "text-[#475752]",
    mutedText: "text-[#6E807A]",
    detailText: "text-[#8E9E99]",
    accentText: "text-[#17645F]",
    primaryButtonBg: "bg-[#244F46] hover:bg-[#1A3D36] text-white font-medium shadow-sm",
    gradientFrom: "from-[#216D68]",
    gradientTo: "to-[#8BB89A]",
    mainCardBg: "bg-[#F9FCFA]/94 backdrop-blur-2xl rounded-[32px] organic-card-shadow border border-[#DEEBE3]/80 my-6 text-[#182622]",
    cardBg: "bg-white/95 text-[#182622] border-[#DEEBE3]/70 organic-card-shadow",
    cardBorder: "border-[#DEEBE3]/70",
    secondaryBg: "bg-[#EEF7F2]/60",
    badgeBg: "bg-[#E1EFE7] text-[#1E433B] border border-[#CADED2] font-semibold",
    toastBg: "bg-[#182622] text-[#EAF5EF] border border-[#6F9B82]/40",
    activeNavBg: "bg-[#244F46] text-white shadow-md font-semibold",
    hoverNavBg: "hover:bg-[#EEF7F2] hover:text-[#182622]",
    welcomeBannerGrad: "from-[#F1F9F4] via-[#F7FCF9] to-white",
    cardBorderClass: "border-[#DEEBE3]/70"
  },
  {
    id: "black",
    name: "Midnight Eclipse (Artisan Dark)",
    icon: "🌑",
    isDark: true,
    primaryBg: "bg-[#1F1D24]",
    titleText: "text-[#FAF8F5]",
    bodyText: "text-[#D6D0C9]",
    mutedText: "text-[#A8A199]",
    detailText: "text-[#857E77]",
    accentText: "text-[#F4C84A]",
    primaryButtonBg: "bg-[#F26B5B] hover:bg-[#E05847] text-white font-bold",
    gradientFrom: "from-[#1F1D24]",
    gradientTo: "to-[#2E2833]",
    mainCardBg: "bg-[#1C1A20]/94 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-zinc-800/80 my-6 text-[#FAF8F5]",
    cardBg: "bg-[#242129]/95 text-[#FAF8F5] border-zinc-800/80 shadow-md",
    cardBorder: "border-zinc-800/80",
    secondaryBg: "bg-[#2B2732]/70",
    badgeBg: "bg-[#2E2936] text-[#F4C84A] border border-zinc-700/60 font-semibold",
    toastBg: "bg-[#121114] text-white border border-zinc-700",
    activeNavBg: "bg-[#F26B5B] text-white shadow-md border border-[#F26B5B]/30 font-semibold",
    hoverNavBg: "hover:bg-[#2E2833] hover:text-white",
    welcomeBannerGrad: "from-[#1C1A20] via-[#242129] to-[#1C1A20]",
    cardBorderClass: "border-zinc-800/80"
  },
  {
    id: "sea-blue",
    name: "Abyssal Ocean (Deep Teal)",
    icon: "🌊",
    isDark: false,
    primaryBg: "bg-[#17645F]",
    titleText: "text-[#0F2927]",
    bodyText: "text-[#355350]",
    mutedText: "text-[#587976]",
    detailText: "text-[#7B9B98]",
    accentText: "text-[#17645F]",
    primaryButtonBg: "bg-[#17645F] hover:bg-[#0E4F4B] text-white font-medium shadow-sm",
    gradientFrom: "from-[#17645F]",
    gradientTo: "to-[#6F9B82]",
    mainCardBg: "bg-[#F6FAF9]/94 backdrop-blur-2xl rounded-[32px] organic-card-shadow border border-[#DCEBE9]/80 my-6 text-[#0F2927]",
    cardBg: "bg-white/95 text-[#0F2927] border-[#DCEBE9]/70 organic-card-shadow",
    cardBorder: "border-[#DCEBE9]/70",
    secondaryBg: "bg-[#EBF5F3]/60",
    badgeBg: "bg-[#D8ECE9] text-[#0F2927] border border-[#BADBD6] font-semibold",
    toastBg: "bg-[#0F2927] text-teal-100 border border-[#17645F]/40",
    activeNavBg: "bg-[#17645F] text-white shadow-md font-semibold",
    hoverNavBg: "hover:bg-[#EBF5F3] hover:text-[#0F2927]",
    welcomeBannerGrad: "from-[#EDF7F5] via-[#F4FAF9] to-white",
    cardBorderClass: "border-[#DCEBE9]/70"
  },
  {
    id: "golden-sun",
    name: "Warm Golden Nectar (Honey)",
    icon: "🍯",
    isDark: false,
    primaryBg: "bg-[#F59B45]",
    titleText: "text-[#2E2010]",
    bodyText: "text-[#5A452E]",
    mutedText: "text-[#83694E]",
    detailText: "text-[#A58B71]",
    accentText: "text-[#C95D4E]",
    primaryButtonBg: "bg-[#F59B45] hover:bg-[#E08631] text-white font-medium shadow-sm",
    gradientFrom: "from-[#F7D35A]",
    gradientTo: "to-[#F39A45]",
    mainCardBg: "bg-[#FFFCF5]/94 backdrop-blur-2xl rounded-[32px] organic-card-shadow border border-[#F3E7D3]/80 my-6 text-[#2E2010]",
    cardBg: "bg-white/95 text-[#2E2010] border-[#F3E7D3]/70 organic-card-shadow",
    cardBorder: "border-[#F3E7D3]/70",
    secondaryBg: "bg-[#FEF5E7]/60",
    badgeBg: "bg-[#FCEACF] text-[#4A3215] border border-[#F4D6A9] font-semibold",
    toastBg: "bg-[#2E2010] text-[#FFF9F0] border border-[#F59B45]/40",
    activeNavBg: "bg-[#F59B45] text-white shadow-md font-semibold",
    hoverNavBg: "hover:bg-[#FEF5E7] hover:text-[#2E2010]",
    welcomeBannerGrad: "from-[#FFF7EA] via-[#FDF5EB] to-white",
    cardBorderClass: "border-[#F3E7D3]/70"
  }
];

export interface ChatMessage {
  id: string;
  sender: "user" | "companion";
  text: string;
  time: string;
  insight?: string;
  tag?: string;
}

export default function App() {
  // Firebase Auth State
  const [user, setUser] = useState<User | any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check local saved user profile
    try {
      const savedUser = localStorage.getItem("sacred_user_profile");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (_) {}

    // 2. Firebase onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          localStorage.setItem("sacred_user_profile", JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          }));
        } catch (_) {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveSection>("wisdom");
  const [relaxationTab, setRelaxationTab] = useState<"breathing" | "relief">("breathing");
  const [currentTheme, setCurrentTheme] = useState<string>("warm-cream");
  const [activeSound, setActiveSound] = useState<string>("none");
  const [soundVolume, setSoundVolume] = useState<number>(0.5);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Background Soundscape Manager
  useEffect(() => {
    // If there was an active audio stream, pause and reset it
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (activeSound === "none") {
      return;
    }

    const soundObj = AMBIENT_SOUNDS.find(s => s.id === activeSound);
    if (soundObj && soundObj.url) {
      const audioObj = new Audio(soundObj.url);
      audioObj.loop = true;
      audioObj.volume = soundVolume;
      audioRef.current = audioObj;

      const playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio autoplay prevented by modern browser policies:", err);
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeSound]);

  // Handle dynamic volume adjust
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume;
    }
    localStorage.setItem("sacred_ambient_volume", soundVolume.toString());
  }, [soundVolume]);

  const handleSelectSound = (soundId: string) => {
    setActiveSound(soundId);
    localStorage.setItem("sacred_ambient_sound", soundId);
    const soundObj = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (soundObj) {
      triggerNotification(`Sanctuary focus sound set to: ${soundObj.name}!`);
    }
  };
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [greeting, setGreeting] = useState<string>("Welcome, Seeker");
  
  // Daily wisdom card selector state (the "oracle" feature)
  const [selectedOracleVerse, setSelectedOracleVerse] = useState<SacredVerse | null>(null);
  const [isDrawingOracle, setIsDrawingOracle] = useState<boolean>(false);

  // Audio Translation and Speech Synthesis States
  const [preferredLanguage, setPreferredLanguage] = useState<string>("English");
  const [translatedVerse, setTranslatedVerse] = useState<{ translatedScripture: string; easyExplanation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);
  const [activeVoiceName, setActiveVoiceName] = useState<string>("Soothing Female Voice");

  // Keep voices loaded and refreshed
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Diary Entry States
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [currentEntryText, setCurrentEntryText] = useState<string>(() => {
    return localStorage.getItem("sacred_diary_draft") || "";
  });
  const [selectedEntryMood, setSelectedEntryMood] = useState<string>("Auto");
  const [rightPageTab, setRightPageTab] = useState<"vault" | "trends">("vault");
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(null);
  const [allowAI, setAllowAI] = useState<boolean>(true);
  const [isSubmittingDiary, setIsSubmittingDiary] = useState<boolean>(false);
  const [diaryError, setDiaryError] = useState<string | null>(null);
  const [selectedPastEntry, setSelectedPastEntry] = useState<DiaryEntry | null>(null);
  const [isPageTurning, setIsPageTurning] = useState<boolean>(false);
  const [mobileSubTab, setMobileSubTab] = useState<"write" | "chronicles">("write");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Auto-dismiss errors after 7 seconds so they never show continuously
  useEffect(() => {
    if (diaryError) {
      const timer = setTimeout(() => setDiaryError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [diaryError]);

  // Simultaneous Confession & Solace Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "companion",
      text: "Hey — I'm here. What's on your mind right now?",
      time: "Open",
      tag: "Sanctuary"
    }
  ]);
  const [isAgentReplying, setIsAgentReplying] = useState<boolean>(false);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAgentReplying]);

  // Auto-save draft feature for #diary-entry-text: saves to localStorage after 2-second typing pause
  useEffect(() => {
    setIsDraftSaving(true);
    const handler = setTimeout(() => {
      try {
        if (currentEntryText.trim()) {
          localStorage.setItem("sacred_diary_draft", currentEntryText);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastDraftSavedAt(timeStr);
        } else {
          localStorage.removeItem("sacred_diary_draft");
          setLastDraftSavedAt(null);
        }
      } catch (err) {
        console.warn("Unable to auto-save diary draft:", err);
      } finally {
        setIsDraftSaving(false);
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [currentEntryText]);

  // Daily Mood/Life Situation Personalizer States
  const [personalizerExpanded, setPersonalizerExpanded] = useState<boolean>(false);
  const [upperPersonalizerOpen, setUpperPersonalizerOpen] = useState<boolean>(false);
  const [personalProblem, setPersonalProblem] = useState<string>("");
  const [personalMood, setPersonalMood] = useState<string>("Restless");
  const [personalSituation, setPersonalSituation] = useState<string>("Feeling stuck in routine & searching for deeper peace");
  const [isPersonalizing, setIsPersonalizing] = useState<boolean>(false);
  const [personalizeError, setPersonalizeError] = useState<string | null>(null);

  useEffect(() => {
    if (personalizeError) {
      const timer = setTimeout(() => setPersonalizeError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [personalizeError]);
  const [personalizedConfig, setPersonalizedConfig] = useState<{
    welcomeGreeting: string;
    customAdmonition: string;
    sacredVerse: {
      origin: string;
      source: string;
      text?: string;
      translation: string;
      context: string;
    };
    recommendedBreathingBreatheCycleText: string;
    actionableAffirmation: string;
  } | null>(null);

  // Scenic Background State
  const [currentBg, setCurrentBg] = useState<string>("organic-diorama-garden");

  // Time-changing multi-color Oracle Diorama Scene state (starts aligned with time of day, then cycles smoothly)
  const [oracleSceneIndex, setOracleSceneIndex] = useState<number>(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 9) return 0; // Terracotta Sunrise
    if (h >= 9 && h < 12) return 1; // Sakura Rose Morning
    if (h >= 12 && h < 15) return 2; // Golden Meadow
    if (h >= 15 && h < 18) return 3; // Azure Lagoon
    if (h >= 18 && h < 21) return 4; // Emerald Moss
    return 5; // Twilight Lavender Night
  });

  useEffect(() => {
    // Preload all diorama color scenes for seamless crossfades
    ORACLE_DIORAMA_SCENES.forEach((scene) => {
      const preloadImg = new Image();
      preloadImg.src = scene.src;
    });

    const interval = setInterval(() => {
      setOracleSceneIndex((prev) => (prev + 1) % ORACLE_DIORAMA_SCENES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activeOracleScene = ORACLE_DIORAMA_SCENES[oracleSceneIndex];

  // Fetch the current theme object
  const themeObj = MASTER_THEMES.find(t => t.id === currentTheme) || MASTER_THEMES[0];
  const isDark = themeObj.isDark;

  // Sync dark class on document element so Tailwind dark: variants and browser styling match perfectly
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Dynamic high-contrast theme typography & card helpers
  const textTitle = isDark ? "text-white" : themeObj.titleText;
  const textBody = isDark ? "text-zinc-100" : themeObj.bodyText;
  const textMuted = isDark ? "text-zinc-300" : themeObj.mutedText;
  const textDetail = isDark ? "text-zinc-400" : themeObj.detailText;
  const accentText = isDark ? "text-amber-400" : themeObj.accentText;
  const bgCard = isDark 
    ? "bg-[#181a20]/95 text-zinc-100 border-zinc-800 shadow-sm" 
    : `${themeObj.cardBg} ${themeObj.cardBorder}`;
  const borderLight = isDark ? "border-zinc-800" : themeObj.cardBorder;
  const bgInput = isDark
    ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/70"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500/70";

  // Handle changing background
  const handleChangeBg = (bgId: string) => {
    setCurrentBg(bgId);
    localStorage.setItem("sacred_app_bg", bgId);
    const bgInfo = LANDSCAPE_BACKGROUNDS.find(b => b.id === bgId);
    if (bgInfo) {
      triggerNotification(`Sanctuary background changed to clear view of ${bgInfo.name}!`);
    }
  };

  // Load state and dynamic greeting
  useEffect(() => {
    // Determine dynamic greeting based on current hour
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning, Cherished Soul");
    } else if (hour < 17) {
      setGreeting("Peaceful Afternoon, Seeker");
    } else {
      setGreeting("Blessed Evening, Noble Friend");
    }

    // Load background image from local storage
    const savedBg = localStorage.getItem("sacred_app_bg");
    if (savedBg) {
      setCurrentBg(savedBg);
    }

    // Load custom theme setting from local storage
    const savedTheme = localStorage.getItem("sacred_app_theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }

    // Load active sound settings from local storage
    const savedSound = localStorage.getItem("sacred_ambient_sound");
    if (savedSound) {
      setActiveSound(savedSound);
    }
    const savedVol = localStorage.getItem("sacred_ambient_volume");
    if (savedVol) {
      setSoundVolume(parseFloat(savedVol));
    }

    // Load diary entries from local storage
    const loadedEntries = localStorage.getItem("sacred_diary_entries");
    if (loadedEntries) {
      try {
        const parsed = JSON.parse(loadedEntries);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDiaryEntries(parsed);
        } else {
          const sample = getInitialSampleEntries();
          setDiaryEntries(sample);
          localStorage.setItem("sacred_diary_entries", JSON.stringify(sample));
        }
      } catch (e) {
        console.error("Failed to parse diary entries", e);
        const sample = getInitialSampleEntries();
        setDiaryEntries(sample);
      }
    } else {
      const sample = getInitialSampleEntries();
      setDiaryEntries(sample);
      localStorage.setItem("sacred_diary_entries", JSON.stringify(sample));
    }

    // Load personalized configuration from local storage
    const savedConfig = localStorage.getItem("sacred_personalized_config");
    if (savedConfig) {
      try {
        setPersonalizedConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse personalized config", e);
      }
    }

    // Set a default random verse for the oracle on load
    const randIdx = Math.floor(Math.random() * SACRED_VERSES.length);
    setSelectedOracleVerse(SACRED_VERSES[randIdx]);
    
    // Initial fetch from Supabase
    loadDiaryEntries();
  }, []);

  // Sync Supabase when user authentication state changes
  useEffect(() => {
    loadDiaryEntries(user?.uid);
  }, [user]);

  // Load diary entries from Supabase & localStorage helper
  const loadDiaryEntries = async (activeUserId?: string) => {
    const local = localStorage.getItem("sacred_diary_entries");
    let parsedLocal: DiaryEntry[] = [];
    if (local) {
      try {
        parsedLocal = JSON.parse(local);
      } catch (e) {
        console.error("Local diary parse err:", e);
      }
    }

    if (!parsedLocal || parsedLocal.length === 0) {
      parsedLocal = getInitialSampleEntries();
    }

    try {
      const sbEntries = await fetchSupabaseJournalEntries(activeUserId);
      if (sbEntries && sbEntries.length > 0) {
        const mergedMap = new Map<string, DiaryEntry>();
        parsedLocal.forEach(e => mergedMap.set(e.id, e));
        sbEntries.forEach(s => {
          mergedMap.set(s.id, {
            id: s.id,
            date: new Date(s.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            text: s.content,
            allowAI: !!s.ai_reflection,
            mood: s.mood || "Reflective",
            aiAnalysis: s.ai_reflection ? {
              mood: s.mood || "Reflective",
              empathicResponse: (s.ai_reflection as any).perspective || (s.ai_reflection as any).empathicResponse || "",
              sacredWisdomPhrase: (s.ai_reflection as any).comfortingAffirmation || (s.ai_reflection as any).sacredWisdomPhrase || "",
              sacredQuoteText: (s.ai_reflection as any).sacredVerse?.text || (s.ai_reflection as any).sacredQuoteText || "",
              sacredQuoteSource: (s.ai_reflection as any).sacredVerse?.source || (s.ai_reflection as any).sacredQuoteSource || "",
              dailyAestheticAction: (s.ai_reflection as any).actionableStep || (s.ai_reflection as any).dailyAestheticAction || "",
            } : undefined,
          });
        });
        const finalEntries = Array.from(mergedMap.values());
        setDiaryEntries(finalEntries);
        localStorage.setItem("sacred_diary_entries", JSON.stringify(finalEntries));
        return;
      }
    } catch (err) {
      console.warn("Supabase diary sync notice:", err);
    }
    setDiaryEntries(parsedLocal);
  };

  // Save diary entry to localStorage & Supabase helper
  const saveToLocalStorage = (updated: DiaryEntry[]) => {
    localStorage.setItem("sacred_diary_entries", JSON.stringify(updated));
    setDiaryEntries(updated);
  };

  // Submit daily personalization details (problem, mood, situation) to server
  const handlePersonalizeVibe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalProblem.trim() && !personalSituation.trim()) {
      setPersonalizeError("Please write at least a minor detail of your current situation or problem.");
      return;
    }
    setPersonalizeError(null);
    setIsPersonalizing(true);
    try {
      const parsedConfig = await apiFetchJson("/api/personalize-vibe", {
        problem: personalProblem,
        mood: personalMood,
        situation: personalSituation,
      });
      setPersonalizedConfig(parsedConfig);
      localStorage.setItem("sacred_personalized_config", JSON.stringify(parsedConfig));
      triggerNotification("Your entire spiritual app has been tailored beautifully for today's condition!");
      setActiveTab("wisdom");
    } catch (err: any) {
      console.error(err);
      setPersonalizeError(err.message || "A slight connection error occurred. Please try again.");
    } finally {
      setIsPersonalizing(false);
    }
  };

  const handleClearPersonalization = () => {
    setPersonalizedConfig(null);
    localStorage.removeItem("sacred_personalized_config");
    setPersonalProblem("");
    setPersonalSituation("");
    triggerNotification("Retuned application to initial general wisdom layout.");
  };

  // Generate surprise/random oracle verse
  const drawRandomVerse = () => {
    setIsDrawingOracle(true);
    // Cancel active speech when drawing new wisdom
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setTranslatedVerse(null);

    setTimeout(() => {
      let filtered = SACRED_VERSES;
      if (selectedOriginFilter !== "all") {
        filtered = filtered.filter(v => v.origin === selectedOriginFilter);
      }
      if (selectedCategoryFilter !== "all") {
        filtered = filtered.filter(v => v.category === selectedCategoryFilter);
      }
      
      const randIdx = Math.floor(Math.random() * filtered.length);
      const picked = filtered[randIdx] || SACRED_VERSES[0];
      setSelectedOracleVerse(picked);
      setIsDrawingOracle(false);
      triggerNotification("A comforting verse has been drawn for you!");
      if (preferredLanguage !== "English") {
        handleTranslateAndExplainAndListen(picked, preferredLanguage, false);
      }
    }, 600);
  };

  // Helper to discover the highest quality, soothing female voice for the target language
  const findSoothingFemaleVoice = (
    allVoices: SpeechSynthesisVoice[],
    targetLanguageName: string
  ): { voice: SpeechSynthesisVoice | null; langCode: string; displayName: string } => {
    const nameLower = targetLanguageName.toLowerCase();

    // Map language names to primary and regional BCP 47 codes
    let primaryCode = "en-US";
    let fallbackCodes: string[] = ["en-GB", "en"];

    if (nameLower.includes("hindi")) {
      primaryCode = "hi-IN";
      fallbackCodes = ["hi", "en-IN"];
    } else if (nameLower.includes("spanish")) {
      primaryCode = "es-ES";
      fallbackCodes = ["es-MX", "es-US", "es"];
    } else if (nameLower.includes("arabic")) {
      primaryCode = "ar-SA";
      fallbackCodes = ["ar-EG", "ar-AE", "ar"];
    } else if (nameLower.includes("punjabi")) {
      primaryCode = "pa-IN";
      fallbackCodes = ["pa", "hi-IN", "hi", "en-IN"];
    } else if (nameLower.includes("french")) {
      primaryCode = "fr-FR";
      fallbackCodes = ["fr-CA", "fr"];
    } else if (nameLower.includes("german")) {
      primaryCode = "de-DE";
      fallbackCodes = ["de-AT", "de"];
    }

    const preferredCodes = [primaryCode, ...fallbackCodes];

    // Priority keywords identifying soothing female and neural voices
    const FEMALE_KEYWORDS = [
      "female", "woman", "natural", "neural", "online", "premium", "soothing",
      "samantha", "victoria", "karen", "zira", "jenny", "aria", "ava", "allison", "serena",
      "fiona", "moira", "tessa", "susan", "zoe", "clara", "alice", "stephanie", "sangeeta",
      "swara", "veena", "lekha", "kalpana", "neerja", "ananya", "geeta",
      "elena", "monica", "paulina", "elvira", "laura", "lucia", "mia", "sofia", "conchita",
      "audrey", "marie", "hortense", "denise", "julie", "amelie", "celine", "lea", "chloe",
      "marlene", "vicki", "katja", "hedda", "gisela", "anna", "petra",
      "salma", "laila", "zariyah", "miren", "hala", "mariam", "fatima", "nour", "zeina",
      "google"
    ];

    // Robotic or harsh male voice names to heavily deprioritize
    const MALE_KEYWORDS = [
      "male", "david", "mark", "george", "stefan", "paul", "guy", "richard", "james",
      "daniel", "oliver", "tom", "alex", "fred", "albert", "bruce", "ralph", "jorge",
      "diego", "thomas", "henri", "nicolas", "hans", "martin", "tarek", "naayf", "espeak"
    ];

    const scoreVoice = (voice: SpeechSynthesisVoice, targetCode: string): number => {
      let score = 0;
      const vLang = voice.lang.toLowerCase();
      const vName = voice.name.toLowerCase();

      // Language match
      if (vLang === targetCode.toLowerCase()) {
        score += 45;
      } else if (vLang.startsWith(targetCode.toLowerCase().split("-")[0])) {
        score += 25;
      }

      // Female tone indicators
      const isFemale = FEMALE_KEYWORDS.some((kw) => vName.includes(kw));
      if (isFemale) score += 35;

      // Natural/Neural high quality
      if (vName.includes("natural") || vName.includes("neural") || vName.includes("online")) {
        score += 20;
      }
      if (vName.includes("premium") || vName.includes("enhanced")) {
        score += 15;
      }

      // Harsh male penalty
      const isMale = MALE_KEYWORDS.some((kw) => vName.includes(kw));
      if (isMale) score -= 60;

      return score;
    };

    // Try matching preferred language codes
    for (const code of preferredCodes) {
      const candidates = allVoices.filter(
        (v) =>
          v.lang.toLowerCase() === code.toLowerCase() ||
          v.lang.toLowerCase().startsWith(code.toLowerCase().split("-")[0])
      );

      if (candidates.length > 0) {
        const sorted = [...candidates].sort((a, b) => scoreVoice(b, code) - scoreVoice(a, code));
        const best = sorted[0];
        return {
          voice: best,
          langCode: best.lang || code,
          displayName: best.name.replace(/Microsoft |Google |Apple /gi, "").trim(),
        };
      }
    }

    // Fallback: If no language-matching voice is on system, use top soothing female voice
    const fallbackSorted = [...allVoices].sort((a, b) => scoreVoice(b, "en-US") - scoreVoice(a, "en-US"));
    const bestFallback = fallbackSorted[0] || null;

    return {
      voice: bestFallback,
      langCode: bestFallback?.lang || primaryCode,
      displayName: bestFallback ? bestFallback.name.replace(/Microsoft |Google |Apple /gi, "").trim() : "Soothing Female Voice",
    };
  };

  // Speaks out the translated text and easy explanation in the target language
  const playTTS = (textToSpeak: string, explanationToSpeak: string, targetLanguageName: string) => {
    if (!("speechSynthesis" in window)) {
      triggerNotification("Speech Synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // Clears any lingering queue

    const cleanText = textToSpeak.replace(/["'“”]/g, "").trim();
    const cleanExpl = explanationToSpeak.replace(/["'“”]/g, "").trim();

    const nameLower = targetLanguageName.toLowerCase();
    const reflectionLabel =
      nameLower.includes("hindi") ? "सरल भावार्थ" :
      nameLower.includes("spanish") ? "Reflexión sagrada" :
      nameLower.includes("arabic") ? "تأمل روحي" :
      nameLower.includes("punjabi") ? "ਸਰਲ ਵਿਆਖਿਆ" :
      nameLower.includes("french") ? "Méditation sereine" :
      nameLower.includes("german") ? "Heilige Betrachtung" : "Sacred Reflection";

    // Clean spoken narrative with calm natural pause between scripture and reflection
    const combinedText = `${cleanText} ... ${reflectionLabel}: ${cleanExpl}`;
    const utterance = new SpeechSynthesisUtterance(combinedText);

    // Get current available voices
    const allVoices = window.speechSynthesis.getVoices();
    const selected = findSoothingFemaleVoice(allVoices, targetLanguageName);

    if (selected.voice) {
      utterance.voice = selected.voice;
      utterance.lang = selected.voice.lang || selected.langCode;
      setActiveVoiceName(selected.displayName);
    } else {
      utterance.lang = selected.langCode;
    }

    // Meditative, soothing cadence & gentle warm tone (soothing female voice, not robotic)
    utterance.rate = 0.86; // Meditative, calm pacing
    utterance.pitch = 1.05; // Gentle, warm soothing tone
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsSpeechPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis audio event:", e);
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };

    // Small delay ensures previous cancel finishes and speech engine is clean
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 70);
  };

  const stopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    triggerNotification("Audio guide stopped.");
  };

  const togglePauseTTS = () => {
    if (!window.speechSynthesis) return;

    if (isSpeechPaused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      triggerNotification("Resuming sacred audio...");
    } else {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
      triggerNotification("Audio paused.");
    }
  };

  const handleTranslateAndExplainAndListen = async (
    verse: SacredVerse,
    targetLang: string,
    autoSpeak: boolean = true
  ) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setIsTranslating(true);

    try {
      const data = await apiFetchJson("/api/translate-explain", {
        verseText: verse.text,
        translation: verse.translation,
        source: verse.source,
        origin: verse.origin,
        targetLanguage: targetLang,
      });
      setTranslatedVerse(data);

      if (autoSpeak) {
        playTTS(data.translatedScripture, data.easyExplanation, targetLang);
      }
    } catch (err) {
      console.warn("Translation API notice:", err);
      // Graceful high-quality fallback for the language
      const nameLower = targetLang.toLowerCase();
      let fallbackVerse = verse.translation;
      let fallbackExplanation = `This passage from ${verse.origin} inspires peace and clarity. Let its words quiet your racing thoughts.`;

      if (nameLower.includes("hindi")) {
        fallbackVerse = verse.text || verse.translation;
        fallbackExplanation = "यह पावन संदेश मन को अगाध शांति और शक्ति प्रदान करता है। व्यर्थ की चिंता त्यागकर ईश्वर पर पूर्ण विश्वास रखें।";
      } else if (nameLower.includes("spanish")) {
        fallbackExplanation = `Este pasaje sagrado de ${verse.origin} brinda profunda calma y claridad interior. Suelta la ansiedad y descansa en la serenidad.`;
      } else if (nameLower.includes("arabic")) {
        fallbackExplanation = "هذه الآية الكريمة تمنح القلب طمأنينة وسكينة عميقة. توكل على الله واعلم أن مع العسر يسراً.";
      } else if (nameLower.includes("punjabi")) {
        fallbackVerse = verse.text || verse.translation;
        fallbackExplanation = "ਇਹ ਪਵਿੱਤਰ ਗੁਰਵਾਕ ਮਨ ਨੂੰ ਪਰਮ ਸ਼ਾਂਤੀ ਅਤੇ ਭਰੋਸਾ ਬਖ਼ਸ਼ਦਾ ਹੈ। ਪ੍ਰਭੂ ਦੀ ਰਜ਼ਾ ਵਿੱਚ ਰਹਿ ਕੇ ਚਿੰਤਾ ਮੁਕਤ ਹੋਵੋ।";
      } else if (nameLower.includes("french")) {
        fallbackExplanation = `Ce passage sacré inspire la paix et la clarté intérieure. Laissez ces mots apaiser vos pensées.`;
      } else if (nameLower.includes("german")) {
        fallbackExplanation = `Diese heilige Schriftstelle schenkt dem Geist Ruhe und Klarheit. Lass die Worte deine Sorgen stillen.`;
      }

      const fallbackData = {
        translatedScripture: fallbackVerse,
        easyExplanation: fallbackExplanation,
      };
      setTranslatedVerse(fallbackData);

      if (autoSpeak) {
        playTTS(fallbackVerse, fallbackExplanation, targetLang);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Trigger quick top toast notification
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Simultaneous Confession & Solace Chat Handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = currentEntryText.trim();
    if (!textToSend || isAgentReplying) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: nowTime
    };

    const previousMessages = chatMessages;
    const nextMessages = [...previousMessages, userMsg];
    setChatMessages(nextMessages);
    setCurrentEntryText("");
    try {
      localStorage.removeItem("sacred_diary_draft");
      setLastDraftSavedAt(null);
    } catch (_) {}
    setIsAgentReplying(true);
    setDiaryError(null);

    try {
      const data = await apiFetchJson<{ reply?: string }>("/api/confession-chat", {
        message: textToSend,
        history: nextMessages.map(m => ({
          role: m.sender === "user" ? "user" : "model",
          content: m.text
        }))
      });

      if (!data.reply || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Received an empty response. Please try sending your message again.");
      }

      const compMsg: ChatMessage = {
        id: `comp-${Date.now()}`,
        sender: "companion",
        text: data.reply.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: "Chat"
      };

      setChatMessages([...nextMessages, compMsg]);
    } catch (err: any) {
      setChatMessages(previousMessages);
      setCurrentEntryText(prev => (prev.trim() ? prev : textToSend));
      setDiaryError(err?.message || "Couldn't reach the companion right now. Please try again in a moment.");
    } finally {
      setIsAgentReplying(false);
    }
  };

  // Handle diary submission with dynamic AI talk component and 3D page turn
  const handleSaveDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    let entryTextToSubmit = currentEntryText.trim();
    if (!entryTextToSubmit) {
      const userMsgs = chatMessages.filter(m => m.sender === "user");
      if (userMsgs.length > 0) {
        entryTextToSubmit = chatMessages
          .map(m => `${m.sender === "user" ? "🕊️ Confession / Doubt" : "✨ Solace Companion"}: ${m.text}`)
          .join("\n\n");
      }
    }
    if (!entryTextToSubmit.trim()) {
      setDiaryError("Please share your confession or doubt in the chat window before saving to chronicles.");
      return;
    }
    setDiaryError(null);
    setIsSubmittingDiary(true);
    setIsPageTurning(true);

    const newId = `entry-${Date.now()}`;
    const newDateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Clear writing text space halfway through the page turn (approx 400ms)
    setTimeout(() => {
      setCurrentEntryText("");
      try {
        localStorage.removeItem("sacred_diary_draft");
        setLastDraftSavedAt(null);
      } catch (_) {}
    }, 400);

    // Turn off page turning flag after animation finishes
    setTimeout(() => {
      setIsPageTurning(false);
    }, 850);

    try {
      let aiResponseData = undefined;

      if (allowAI) {
        // Fetch AI analysis and comforting response from backend server / Netlify function
        aiResponseData = await apiFetchJson("/api/diary-analyze", {
          content: entryTextToSubmit,
        });
      }

      const finalMood = selectedEntryMood !== "Auto" ? selectedEntryMood : (aiResponseData?.mood || "Reflective");

      const newEntry: DiaryEntry = {
        id: newId,
        date: newDateStr,
        text: entryTextToSubmit,
        allowAI: allowAI,
        mood: finalMood,
        aiAnalysis: aiResponseData,
      };

      const updatedEntries = [newEntry, ...diaryEntries];
      saveToLocalStorage(updatedEntries);
      
      // Async persist to Supabase PostgreSQL database
      saveSupabaseJournalEntry({
        id: newId,
        user_id: user?.uid,
        title: `Reflection: ${newDateStr}`,
        content: entryTextToSubmit,
        mood: finalMood,
        ai_reflection: aiResponseData ? {
          perspective: aiResponseData.empathicResponse,
          comfortingAffirmation: aiResponseData.sacredWisdomPhrase,
          actionableStep: aiResponseData.dailyAestheticAction,
          sacredVerse: {
            text: aiResponseData.sacredQuoteText,
            source: aiResponseData.sacredQuoteSource,
          }
        } : undefined
      }).catch(e => console.warn("Supabase background journal save:", e));

      triggerNotification(allowAI ? "Your diary was written, synced to Supabase & AI offered solace." : "Diary saved securely to Supabase & local vault.");
      
      // Auto open if AI spoke
      if (allowAI && newEntry.aiAnalysis) {
        setSelectedPastEntry(newEntry);
      }

    } catch (err: any) {
      console.error(err);
      // Fallback save offline without AI
      const fallbackMood = selectedEntryMood !== "Auto" ? selectedEntryMood : "Contemplative";
      const fallbackEntry: DiaryEntry = {
        id: newId,
        date: newDateStr,
        text: entryTextToSubmit,
        allowAI: false,
        mood: fallbackMood,
        aiAnalysis: {
          mood: fallbackMood,
          empathicResponse: `Thank you for sharing your heart. Although our server is resting (${err.message}), feel comfort in listing your thoughts. You are strong guidance itself.`,
          sacredWisdomPhrase: "Surrendering output and finding peace in active contemplation.",
          sacredQuoteText: "Do not be troubled; take courage and quietness in your heart.",
          sacredQuoteSource: "Ethereal Path",
          dailyAestheticAction: "Take 3 deep slow slow breaths and drop your shoulders completely."
        }
      };
      const updatedEntries = [fallbackEntry, ...diaryEntries];
      saveToLocalStorage(updatedEntries);

      // Async save to Supabase
      saveSupabaseJournalEntry({
        id: newId,
        user_id: user?.uid,
        title: `Reflection: ${newDateStr}`,
        content: entryTextToSubmit,
        mood: fallbackMood,
      }).catch(() => {});

      setSelectedPastEntry(fallbackEntry);
      setDiaryError("The AI helper is resting, but your diary entry was saved perfectly to Supabase and your local vault!");
    } finally {
      setIsSubmittingDiary(false);
    }
  };

  // Delete diary entry
  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to release this diary entry into peace? It will be deleted permanently.")) {
      const filtered = diaryEntries.filter(entry => entry.id !== id);
      saveToLocalStorage(filtered);
      deleteSupabaseJournalEntry(id).catch(err => console.warn("Supabase delete entry:", err));
      if (selectedPastEntry?.id === id) {
        setSelectedPastEntry(null);
      }
      triggerNotification("Diary entry deleted from local and Supabase cloud database.");
    }
  };

  // Get filtered verses list for the scripture directory
  const filteredVerses = SACRED_VERSES.filter(v => {
    const matchOrigin = selectedOriginFilter === "all" || v.origin === selectedOriginFilter;
    const matchCategory = selectedCategoryFilter === "all" || v.category === selectedCategoryFilter;
    return matchOrigin && matchCategory;
  });

  return (
    <div className={`min-h-screen ${isDark ? "text-zinc-100" : textBody} flex flex-col font-sans transition-colors duration-500 relative`}>
      
      {/* Scenic Background Layer (Fully Clear, Not Blurred as Requested) */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out pointer-events-none"
        style={{ 
          backgroundImage: `url(${LANDSCAPE_BACKGROUNDS.find(bg => bg.id === currentBg)?.url || LANDSCAPE_BACKGROUNDS[0].url})` 
        }}
        id="scenic-background"
      />
      {/* Dynamic Soft Warm Ambient Cover Layer (Soft Ivory / Cream warmth with subtle organic radial lighting) */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-all duration-700 ${
        isDark 
          ? "bg-[#141217]/85 backdrop-blur-[2px]" 
          : "bg-[#FFF9F2]/75 backdrop-blur-[2px]"
      }`} />

      {/* Tactile Ambient Atmosphere Glow Blobs (Creative Showcase Depth) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-35 transition-all duration-700 ${
          isDark ? "bg-[#7763A8]/20" : "bg-[#F7B28B]/35"
        }`} />
        <div className={`absolute top-1/3 -right-28 w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-700 ${
          isDark ? "bg-[#244F46]/25" : "bg-[#6F9B82]/25"
        }`} />
        <div className={`absolute -bottom-24 left-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-25 transition-all duration-700 ${
          isDark ? "bg-[#C95D4E]/15" : "bg-[#F4C84A]/30"
        }`} />
      </div>

      {/* Dynamic Pop-up Toast Notifications */}
      {showNotification && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 ${themeObj.toastBg} px-6 py-3 rounded-full organic-card-shadow flex items-center gap-2.5 text-sm font-medium transition-all animate-bounce`}>
          <Sparkles className="w-4.5 h-4.5 text-[#F4C84A] fill-[#F4C84A]" />
          <span>{showNotification}</span>
        </div>
      )}

      <header className={`relative z-40 bg-transparent transition-colors duration-500 pt-3 px-4 sm:px-8 pb-1`}>
        <div className={`w-full max-w-6xl mx-auto px-6 sm:px-8 py-4.5 flex flex-col gap-4 rounded-[28px] border transition-all duration-300 organic-glass organic-card-shadow ${
          isDark 
            ? "border-zinc-800/80 text-zinc-100" 
            : "border-[#EFE5D8]/80 text-[#292623]"
        }`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3.5 max-w-sm md:max-w-2xl">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-xs border border-white/20 overflow-hidden p-0.5">
                <img src="/pwa-192x192.png" alt="Positron Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className={`text-base sm:text-lg md:text-xl font-calibri ${textTitle} tracking-tight leading-normal truncate font-bold`}>
                    Positron
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUpperPersonalizerOpen(!upperPersonalizerOpen)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-calibri font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isDark ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : `${themeObj.primaryButtonBg}`
                    }`}
                    title="Toggle Custom Spirit Vibe Form"
                  >
                    <Sliders size={12} />
                    <span>Customize Vibe {upperPersonalizerOpen ? "▴" : "▾"}</span>
                  </button>
                </div>
                <p className={`${textMuted} text-xs md:text-sm font-calibri leading-relaxed truncate hidden sm:block mt-0.5 font-medium`}>
                  {personalizedConfig 
                    ? `Aligned Vibe: ${personalMood} · Struggle: "${personalProblem || 'General devotions'}"`
                    : "Step inside this offline sanctuary. Access ancient wisdom streams to align body and soul."
                  }
                </p>
              </div>
            </div>

            {/* Header Right Controls: Firebase User Auth & Guest Mode */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap self-center">
              {user ? (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className={`h-8 sm:h-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border transition-all cursor-pointer organic-card-shadow shrink-0 whitespace-nowrap leading-none ${
                    user.isGuest
                      ? isDark
                        ? "bg-emerald-950/70 border-emerald-800/80 text-emerald-200 hover:bg-emerald-900/80"
                        : "bg-emerald-50/90 border-emerald-200 text-emerald-900 hover:bg-emerald-100/90"
                      : isDark 
                        ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800" 
                        : "bg-white/90 border-[#EFE5D8] text-[#292623] hover:bg-[#FFFDF9]"
                  }`}
                  title={user.isGuest ? "Guest Mode Active - Click to view or connect email" : "Account Profile"}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full shrink-0 object-cover" />
                  ) : (
                    <div className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0 ${
                      user.isGuest ? "bg-emerald-600 text-white" : "bg-[#244F46] text-[#FFF8ED]"
                    }`}>
                      {user.isGuest ? <Compass size={10} /> : (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "S")}
                    </div>
                  )}
                  <span className="text-[11px] sm:text-xs font-calibri font-medium truncate max-w-[75px] sm:max-w-[140px]">
                    {user.displayName || (user.isGuest ? "Guest" : user.email?.split("@")[0])}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const guestProfile = {
                        uid: "guest_" + Math.random().toString(36).substring(2, 10),
                        displayName: "Guest Seeker",
                        email: null,
                        photoURL: null,
                        isGuest: true,
                      };
                      try {
                        localStorage.setItem("sacred_user_profile", JSON.stringify(guestProfile));
                      } catch (_) {}
                      setUser(guestProfile);
                      triggerNotification("Welcome, Guest Seeker! You can explore and write freely.");
                    }}
                    className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-calibri font-medium transition cursor-pointer ${
                      isDark
                        ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        : "bg-white/80 border-[#EFE5D8] text-[#625C56] hover:bg-[#FAF4ED] hover:text-[#292623]"
                    }`}
                    title="Continue as Guest without email"
                  >
                    <Compass size={12} className="text-emerald-500" />
                    <span>Guest Mode</span>
                  </button>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="h-8 sm:h-auto px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full btn-organic-coral text-white text-[11px] sm:text-xs font-calibri font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap leading-none active:scale-95 shadow-sm"
                    title="Sign In or Continue as Guest"
                  >
                    <Smile size={13} className="shrink-0" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extendable/Collapsible customize vibe panel (instead of absolute floating dropdown or popover) */}
          {upperPersonalizerOpen && (
            <div className={`w-full p-4 rounded-2xl border animate-fade-in transition-all duration-300 ${
              isDark 
                ? "bg-zinc-950/95 border-zinc-800 text-zinc-100" 
                : "bg-white border-slate-200 text-slate-900 shadow-lg"
            }`}>
              <div className="flex items-center justify-between mb-3 border-b dark:border-zinc-800 pb-2">
                <span className="text-xs font-calibri font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="animate-pulse" /> Spirit Vibe Settings
                </span>
                <div className="flex gap-1.5">
                  {personalizedConfig && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearPersonalization();
                        setUpperPersonalizerOpen(false);
                      }}
                      className={`text-xs font-calibri px-2.5 py-1 rounded-lg border transition-all ${
                        isDark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      Reset Vibe
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setUpperPersonalizerOpen(false)}
                    className="text-xs font-calibri px-1.5 py-0.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!personalProblem.trim() && !personalSituation.trim()) {
                  setPersonalizeError("Please write details of your current problem or situation.");
                  return;
                }
                setPersonalizeError(null);
                setIsPersonalizing(true);
                try {
                  const parsedConfig = await apiFetchJson("/api/personalize-vibe", {
                    problem: personalProblem,
                    mood: personalMood,
                    situation: personalSituation,
                  });
                  setPersonalizedConfig(parsedConfig);
                  localStorage.setItem("sacred_personalized_config", JSON.stringify(parsedConfig));
                  triggerNotification("Your entire spiritual app has been tailored beautifully for today's condition!");
                  setActiveTab("wisdom");
                  setUpperPersonalizerOpen(false);
                } catch (err: any) {
                  console.error(err);
                  setPersonalizeError(err.message || "A slight connection error occurred.");
                } finally {
                  setIsPersonalizing(false);
                }
              }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-calibri font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Current Spirit Mood
                  </label>
                  <select
                    value={personalMood}
                    onChange={(e) => setPersonalMood(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                      isDark 
                        ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-1 focus:ring-amber-500" 
                        : "bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-amber-500"
                    }`}
                  >
                    <option value="Tired">Tired & Exhausted</option>
                    <option value="Anxious">Anxious & Overwhelmed</option>
                    <option value="Restless">Restless & Lost</option>
                    <option value="Sorrowful">Grieving / Sad</option>
                    <option value="Lonely">Lonely or Abandoned</option>
                    <option value="Joyful">Grateful & Joyful</option>
                    <option value="Peaceful">Mellow & Contemplative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-calibri font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Your Current Struggle / Joy
                  </label>
                  <input
                    type="text"
                    value={personalProblem}
                    onChange={(e) => setPersonalProblem(e.target.value)}
                    placeholder="E.g. anxious about task deadlines..."
                    className={`w-full px-3 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                      isDark
                        ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-500"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-calibri font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Life Situation
                  </label>
                  <input
                    type="text"
                    value={personalSituation}
                    onChange={(e) => setPersonalSituation(e.target.value)}
                    placeholder="E.g. transitioning career phases..."
                    className={`w-full px-3 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                      isDark
                        ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-500"
                        : "bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
                    }`}
                  />
                </div>

                <div className="sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex-1 w-full">
                    {personalizeError && (
                      <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 font-calibri font-medium leading-normal flex items-center justify-between gap-2 shadow-xs animate-fade-in">
                        <span>⚠️ {personalizeError}</span>
                        <button
                          type="button"
                          onClick={() => setPersonalizeError(null)}
                          className="text-rose-500 hover:text-rose-800 dark:text-rose-400 p-0.5 rounded cursor-pointer shrink-0"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isPersonalizing}
                    className={`w-full sm:w-auto px-5 text-white font-calibri text-xs py-2 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      isDark ? "bg-amber-600 hover:bg-amber-700 text-white font-semibold" : `${themeObj.primaryButtonBg}`
                    }`}
                  >
                    {isPersonalizing ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    <span>Align Custom Vibe</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main Container with highly readable glass panels so readability is premium */}
      <main className={`flex-1 max-w-6xl w-full mx-auto px-5 md:px-8 py-8 relative z-10 my-6 transition-all duration-500 ${themeObj.mainCardBg}`}>
        {/* --- DYNAMIC COMPACT DEVOTION PERSONALIZER PANEL --- */}
        <div className={`mb-8 rounded-[28px] border transition-all duration-300 overflow-hidden organic-card-shadow ${
          isDark 
            ? "bg-[#242129]/90 border-zinc-800/80 text-zinc-100" 
            : "bg-[#FFFDF9]/95 border-[#EFE5D8]/80 text-[#292623]"
        }`}>
          {/* Header row containing welcome title + Expand button */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                {[
                  { id: "wisdom", label: "Sacred Passages", icon: BookOpen },
                  { id: "relaxation", label: "Relaxation", icon: Heart },
                  { id: "diary", label: "Personal Diary", icon: FileText },
                  { id: "personalize", label: "Personalize", icon: Sliders },
                  { id: "about", label: "The Purpose", icon: Info },
                ].map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id as ActiveSection)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap ${
                        isActive
                          ? `${themeObj.activeNavBg} shadow-sm scale-102`
                          : `${isDark ? "text-zinc-300 hover:text-white hover:bg-zinc-800/70" : "text-[#625C56] hover:text-[#292623] hover:bg-[#F7EBDD]/60"}`
                      }`}
                    >
                      <Icon size={13} />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 items-center justify-end shrink-0">
              {personalizedConfig && (
                <button
                  type="button"
                  onClick={handleClearPersonalization}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-calibri font-medium transition-all cursor-pointer ${
                    isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50" : "bg-[#F7EBDD] hover:bg-[#EFE0D0] text-[#292623] border border-[#E8D5C2]"
                  }`}
                >
                  Reset Vibe
                </button>
              )}
            </div>
          </div>

          {/* Collapsible details for personalizer form & prescription dashboard */}
          {personalizerExpanded && (
            <div className={`border-t p-5 space-y-6 animate-fade-in ${
              isDark ? "border-zinc-800 bg-zinc-950/25" : "border-slate-150 bg-stone-50/10"
            }`}>
              {/* Form details */}
              <div className="space-y-4">
                <p className={`${textMuted} text-xs font-calibri leading-relaxed max-w-2xl`}>
                  Detail your current struggle, mood, or life situation. The applet instantly synthesizes a customized spiritual prescription, selects custom scriptures, and outputs custom physical and energetic anchors.
                </p>
                
                <form onSubmit={handlePersonalizeVibe} className="grid md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-calibri font-medium text-slate-500 dark:text-zinc-400 mb-1">
                      My Primary Mood
                    </label>
                    <select
                      value={personalMood}
                      onChange={(e) => setPersonalMood(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                        isDark 
                          ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-500" 
                          : "bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-amber-500"
                      }`}
                    >
                      <option value="Tired">Tired & Exhausted</option>
                      <option value="Anxious">Anxious & Overwhelmed</option>
                      <option value="Restless">Restless & Lost</option>
                      <option value="Sorrowful">Grieving / Sad</option>
                      <option value="Lonely">Lonely or Abandoned</option>
                      <option value="Joyful">Grateful & Joyful</option>
                      <option value="Peaceful">Mellow & Contemplative</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-calibri font-medium text-slate-500 dark:text-zinc-400 mb-1">
                      Struggle / Problem / Joy Details
                    </label>
                    <input
                      type="text"
                      value={personalProblem}
                      onChange={(e) => setPersonalProblem(e.target.value)}
                      placeholder="E.g., feeling anxious and exhausted..."
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                        isDark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-600"
                          : "bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-calibri font-medium text-slate-500 dark:text-zinc-400 mb-1">
                      My Current Life Situation
                    </label>
                    <input
                      type="text"
                      value={personalSituation}
                      onChange={(e) => setPersonalSituation(e.target.value)}
                      placeholder="E.g., career transition..."
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                        isDark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-500"
                          : "bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isPersonalizing}
                      className={`w-full text-white font-calibri text-xs px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-1.5 h-[34px] cursor-pointer ${
                        isDark ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      {isPersonalizing ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      <span>Apply Vibe</span>
                    </button>
                  </div>
                </form>

                {personalizeError && (
                  <div className="mt-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 font-calibri font-medium flex items-center justify-between gap-2 shadow-xs animate-fade-in">
                    <span>⚠️ {personalizeError}</span>
                    <button
                      type="button"
                      onClick={() => setPersonalizeError(null)}
                      className="text-rose-500 hover:text-rose-800 dark:text-rose-400 p-0.5 rounded cursor-pointer shrink-0"
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* DYNAMIC PRESENTATION CONTENT CARD FROM THE PERSONALIZED WORK */}
              {personalizedConfig && (
                <div id="personalized-prescription-dashboard" className={`p-5 rounded-2xl border shadow-sm animate-fade-in ${
                  isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-amber-100/60"
                }`}>
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b dark:border-zinc-800">
                    <span className={`text-xs font-calibri font-semibold flex items-center gap-1.5 ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                      🛡️ Personalized Sacred Solace
                    </span>
                    <span className={`text-xs font-calibri font-medium px-2.5 py-0.5 rounded-full ${isDark ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-900"}`}>
                      Mood Focus: {personalMood}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-12 gap-5 items-start">
                    <div className="md:col-span-8 space-y-4">
                      {/* Wise counselling advice paragraph */}
                      <div>
                        <span className="text-xs font-calibri font-medium text-slate-500 dark:text-zinc-400 block mb-1">Empathetic Counsel</span>
                        <p className={`text-sm ${isDark ? "text-zinc-200" : "text-slate-700"} font-calibri leading-relaxed italic`}>
                          "{personalizedConfig.customAdmonition}"
                        </p>
                      </div>

                      {/* Tailored Verse block */}
                      <div className={`p-4.5 rounded-xl border ${
                        isDark ? "bg-zinc-950/40 border-zinc-800 text-zinc-200" : "bg-[#fcfaf4] border-amber-200/50"
                      }`}>
                        <span className="text-xs font-calibri font-semibold text-amber-800 dark:text-amber-400 block mb-2">
                           Selected Devotional Verse ({personalizedConfig.sacredVerse.origin})
                        </span>
                        
                        {personalizedConfig.sacredVerse.text && (
                          <p className="text-sm font-calibri italic text-emerald-800 dark:text-emerald-400 mb-2 whitespace-pre-line leading-relaxed">
                            {personalizedConfig.sacredVerse.text}
                          </p>
                        )}

                        <p className={`text-base font-calibri leading-relaxed ${isDark ? "text-zinc-100" : "text-slate-800"}`}>
                          "{personalizedConfig.sacredVerse.translation}"
                        </p>

                        <div className="mt-3 flex items-center justify-between text-xs font-calibri">
                          <strong className="text-amber-800 dark:text-amber-400 font-semibold">{personalizedConfig.sacredVerse.source}</strong>
                          <span className="text-slate-500">Context: {personalizedConfig.sacredVerse.context}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-4">
                      {/* Customized Affirmation card */}
                      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-zinc-950 dark:to-zinc-900 text-white p-4 rounded-xl shadow-inner border dark:border-zinc-800">
                        <span className="text-xs font-calibri font-medium text-teal-300 block mb-1">
                          Today's Affirmation
                        </span>
                        <p className="text-xs font-calibri leading-relaxed font-light">
                          "{personalizedConfig.actionableAffirmation}"
                        </p>
                      </div>

                      {/* Breathing Anchor Instruction recommendation */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? "bg-emerald-950/20 border-emerald-900/55" : "bg-emerald-50/50 border-emerald-100"
                      }`}>
                        <span className="text-xs font-calibri text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">
                          Recommended Breathing Cue
                        </span>
                        <p className={`text-xs ${isDark ? "text-emerald-300" : "text-emerald-900"} font-calibri leading-relaxed`}>
                          {personalizedConfig.recommendedBreathingBreatheCycleText}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("relaxation");
                            setRelaxationTab("breathing");
                            triggerNotification("Focusing on custom cycle at breathing section.");
                          }}
                          className="text-xs font-calibri text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 block mt-2 font-medium cursor-pointer"
                        >
                          Go to Breathing Board →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>



        {/* --- DYNAMIC SECTION RENDER --- */}

        {/* A. SACRED PASSAGES & ORACLE */}
        {activeTab === "wisdom" && (
          <div className="space-y-10">
            {/* Oracle Card Box (The comforting interactive core with tactile 3D diorama visual) */}
            <div className={`rounded-[32px] border overflow-hidden organic-card-shadow transition-all duration-300 relative ${
              isDark 
                ? "bg-[#1F1D24] border-zinc-800/80 text-zinc-100" 
                : "bg-[#FFFDF9] border-[#EFE5D8]/80 text-[#292623]"
            }`}>
              <div className="grid md:grid-cols-12 items-center">
                {/* Visual Art Diorama Showcase (Changes with time & shifts through vibrant colors) */}
                <div
                  onClick={() => setOracleSceneIndex((prev) => (prev + 1) % ORACLE_DIORAMA_SCENES.length)}
                  className="md:col-span-5 relative h-64 md:h-80 overflow-hidden rounded-[26px] m-3 shadow-inner group cursor-pointer select-none transition-shadow duration-1000"
                  style={{ boxShadow: `inset 0 2px 10px rgba(0,0,0,0.2), 0 10px 28px -8px ${activeOracleScene.glowColor}` }}
                  title="Changes automatically over time · Click to cycle color scene"
                >
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={activeOracleScene.id}
                      src={activeOracleScene.src}
                      alt={activeOracleScene.title}
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover rounded-[24px] transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </AnimatePresence>
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${activeOracleScene.washClass} pointer-events-none rounded-[24px] transition-colors duration-1000`}
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between gap-2">
                    <div>
                      <span
                        className="text-[10px] uppercase font-bold tracking-widest block drop-shadow-sm transition-colors duration-700"
                        style={{ color: activeOracleScene.accentColor }}
                      >
                        {activeOracleScene.title}
                      </span>
                      <p className="text-xs text-white/95 font-medium mt-0.5 leading-snug drop-shadow-sm">
                        {activeOracleScene.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 pb-0.5 shrink-0">
                      {ORACLE_DIORAMA_SCENES.map((scene, idx) => (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOracleSceneIndex(idx);
                          }}
                          aria-label={`View ${scene.title}`}
                          className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                            idx === oracleSceneIndex ? "w-4 opacity-100" : "w-1.5 opacity-50 hover:opacity-85"
                          }`}
                          style={{ backgroundColor: scene.accentColor }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Oracle Content & Action Side */}
                <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-2xl bg-[#F3E3D5] text-[#244F46] flex items-center justify-center font-bold shadow-xs">
                      <Sparkles size={17} className="text-[#C95D4E]" />
                    </div>
                    <div>
                      <h3 className={`text-xl md:text-2xl font-calibri font-bold ${textTitle}`}>
                        Dynamic Devotional Oracle
                      </h3>
                      <p className={`${textMuted} text-xs mt-0.5 font-calibri leading-relaxed`}>
                        Draw timeless light aligned with your inner space.
                      </p>
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-5">
                    <select
                      value={selectedOriginFilter}
                      onChange={(e) => setSelectedOriginFilter(e.target.value)}
                      className={`px-4 py-2 rounded-2xl text-xs font-calibri font-semibold border shadow-xs focus:outline-none transition-all ${
                        isDark ? "bg-[#2A2733] border-zinc-700 text-zinc-100" : "bg-white border-[#E5D8C8] text-[#292623]"
                      }`}
                    >
                      <option value="all">All Scriptures</option>
                      <option value="Bhagavad Gita">Bhagavad Gita</option>
                      <option value="Guru Granth Sahib">Guru Granth Sahib</option>
                      <option value="Holy Bible">Holy Bible</option>
                      <option value="Holy Quran">Holy Quran</option>
                    </select>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className={`px-4 py-2 rounded-2xl text-xs font-calibri font-semibold border shadow-xs focus:outline-none transition-all ${
                        isDark ? "bg-[#2A2733] border-zinc-700 text-zinc-100" : "bg-white border-[#E5D8C8] text-[#292623]"
                      }`}
                    >
                      <option value="all">Any Emotion</option>
                      <option value="peace">Quiet Peace</option>
                      <option value="strength">Courage & Strength</option>
                      <option value="worry">Anxiety & Calm</option>
                      <option value="gratitude">Abundance & Thanks</option>
                    </select>

                    <button
                      onClick={drawRandomVerse}
                      disabled={isDrawingOracle}
                      className={`btn-organic-coral font-calibri text-xs px-5 py-2.5 rounded-2xl font-bold text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDrawingOracle ? 'animate-spin' : ''}`} />
                      <span>Seek Sacred Light</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawn Card Output Area */}
              <div className={`p-6 md:p-8 border-t ${isDark ? "border-zinc-800/80 bg-[#17151B]/60" : "border-[#EFE5D8]/80 bg-[#FFFBF5]/70"}`}>
                {selectedOracleVerse ? (
                  <div className="max-w-3xl mx-auto text-center py-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#8A8279]">
                      <span className="font-bold text-[#244F46] dark:text-[#8BB89A]">{selectedOracleVerse.origin}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{selectedOracleVerse.category}</span>
                    </div>
                    
                    {/* Devotional original scriptures */}
                    {selectedOracleVerse.text && (
                      <p className={`text-base md:text-lg font-calibri italic mt-6 whitespace-pre-line tracking-normal leading-relaxed ${
                        isDark ? "text-emerald-300" : "text-emerald-900 font-medium"
                      }`}>
                        {selectedOracleVerse.text}
                      </p>
                    )}

                    {/* Sacred Translation */}
                    <p className={`text-xl md:text-2xl font-calibri mt-4 leading-relaxed font-normal px-4 ${textTitle}`}>
                      "{selectedOracleVerse.translation}"
                    </p>

                    <div className="mt-6 flex flex-col items-center">
                      <strong className={`font-calibri text-sm font-bold tracking-normal ${
                        isDark ? "text-amber-300" : themeObj.accentText
                      }`}>
                        ─ {selectedOracleVerse.source} ─
                      </strong>
                      <p className={`text-xs font-calibri mt-1 max-w-md italic ${textMuted}`}>
                        Context: {selectedOracleVerse.context}
                      </p>
                    </div>

                    {/* SACRED AUDIO TRANSLATION AND LISTEN AND EASY EXPLANATION STATION */}
                    <div className={`mt-8 p-5 rounded-2xl border transition-all max-w-lg mx-auto shadow-sm ${
                      isDark 
                        ? "bg-zinc-950/90 border-zinc-800 text-zinc-100" 
                        : "bg-white/95 border-amber-200/70 text-slate-900"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Languages className={`w-4 h-4 ${isDark ? "text-amber-400" : themeObj.accentText} shrink-0`} />
                          <span className={`text-xs font-calibri font-bold ${textTitle}`}>Preferred Language Audio</span>
                        </div>

                        {/* Language Selector Dropdown */}
                        <select
                          value={preferredLanguage}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            setPreferredLanguage(newLang);
                            if (window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                            }
                            setIsSpeaking(false);
                            setIsSpeechPaused(false);
                            if (selectedOracleVerse) {
                              handleTranslateAndExplainAndListen(selectedOracleVerse, newLang, false);
                            }
                          }}
                          className={`text-xs px-3.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 font-calibri font-semibold shadow-sm ${
                            isDark 
                              ? "bg-zinc-900 border-zinc-700 text-zinc-100"
                              : "bg-white border-slate-300 text-slate-900 shadow-sm"
                          }`}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिन्दी)</option>
                          <option value="Spanish">Spanish (Español)</option>
                          <option value="Arabic">Arabic (العربية)</option>
                          <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                          <option value="French">French (Français)</option>
                          <option value="German">German (Deutsch)</option>
                        </select>
                      </div>

                      {/* Meditative Cadence Status */}
                      <div className="mt-2.5 flex items-center justify-end px-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A8279]">
                          Meditative Cadence
                        </span>
                      </div>

                      {/* Control buttons for Audio Player */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                        <button
                          onClick={() => {
                            if (translatedVerse && selectedOracleVerse) {
                              playTTS(translatedVerse.translatedScripture, translatedVerse.easyExplanation, preferredLanguage);
                            } else if (selectedOracleVerse) {
                              handleTranslateAndExplainAndListen(selectedOracleVerse, preferredLanguage, true);
                            }
                          }}
                          disabled={isTranslating}
                          className={`px-4 py-2 rounded-xl font-calibri text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                            isTranslating 
                              ? "bg-zinc-300 text-zinc-600 cursor-not-allowed" 
                              : isSpeaking && !isSpeechPaused
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                                : `${themeObj.primaryButtonBg}`
                          }`}
                        >
                          {isTranslating ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Translating to {preferredLanguage}...</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} />
                              <span>{isSpeaking && !isSpeechPaused ? "Speaking Audio..." : `Listen in ${preferredLanguage}`}</span>
                            </>
                          )}
                        </button>

                        {isSpeaking && (
                          <>
                            <button
                              onClick={togglePauseTTS}
                              className={`p-2 rounded-xl border cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${
                                isDark ? "border-zinc-700 bg-zinc-900 text-zinc-100" : "border-slate-300 bg-white text-slate-800"
                              }`}
                              title={isSpeechPaused ? "Resume Audio" : "Pause Audio"}
                            >
                              {isSpeechPaused ? <Play size={14} className="text-emerald-600" /> : <Pause size={14} className="text-amber-600" />}
                            </button>

                            <button
                              onClick={stopTTS}
                              className={`p-2 rounded-xl border cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${
                                isDark ? "border-zinc-700 bg-zinc-900" : "border-slate-300 bg-white"
                              }`}
                              title="Stop Audio"
                            >
                              <Square size={13} className="text-red-500 fill-red-500" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Display the dynamically translated text & simple easy explanation */}
                      {translatedVerse && (
                        <div className={`mt-4 pt-4 border-t border-dashed text-left ${
                          isDark ? "border-zinc-800" : "border-amber-200"
                        }`}>
                          <span className={`text-xs font-calibri font-bold ${isDark ? "text-amber-300" : themeObj.accentText}`}>Scripture ({preferredLanguage})</span>
                          <p className={`text-sm font-calibri italic mt-1.5 leading-relaxed font-medium ${
                            isDark ? "text-emerald-300" : "text-emerald-950"
                          }`}>
                            "{translatedVerse.translatedScripture}"
                          </p>

                          <div className="mt-3.5">
                            <span className={`text-xs font-calibri font-bold ${isDark ? "text-amber-300" : themeObj.accentText}`}>Easy Explanation</span>
                            <p className={`text-xs sm:text-sm font-calibri mt-1 leading-relaxed ${textBody}`}>
                              {translatedVerse.easyExplanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Short custom mindful advice based on the drawn text */}
                    <div className={`mt-8 pt-6 border-t max-w-md mx-auto ${isDark ? "border-zinc-800" : "border-slate-200"}`}>
                      <p className={`text-xs font-calibri flex items-center justify-center gap-1.5 font-bold ${isDark ? "text-amber-300" : themeObj.accentText}`}>
                        <Heart className="w-3.5 h-3.5 fill-current" /> Contemplation Path
                      </p>
                      <p className={`text-sm mt-1.5 font-calibri leading-relaxed ${textMuted}`}>
                        Let this teaching breathe inside you today. Reflect on where you are struggling to yield control and offer yourself mercy.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-center py-10 font-calibri font-medium ${textMuted}`}>
                    Set your filters and click Seek Passage to receive comforting sacred light.
                  </p>
                )}
              </div>
            </div>

            {/* Complete Database Directory */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <BookMarked className={`w-5 h-5 text-[#C95D4E]`} />
                <h3 className={`text-xl font-calibri font-bold ${textTitle}`}>Sacred Wisdom Directory</h3>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin p-1">
                {filteredVerses.map((verse) => (
                  <div 
                    key={verse.id} 
                    className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between organic-card-shadow organic-card-shadow-hover hover:-translate-y-0.5 ${
                      isDark 
                        ? "bg-[#242129]/90 border-zinc-800/80 text-zinc-100" 
                        : "bg-[#FFFDF9] border-[#EFE5D8]/80 text-[#292623]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-[#8A8279] mb-3">
                        <span className="font-bold text-[#244F46] dark:text-[#8BB89A]">{verse.origin}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{verse.category}</span>
                      </div>

                      {verse.text && (
                        <p className={`text-xs font-calibri italic mb-2 whitespace-pre-line leading-relaxed font-medium ${
                          isDark ? "text-emerald-300" : "text-[#17645F]"
                        }`}>
                          {verse.text}
                        </p>
                      )}
                      
                      <p className={`text-sm font-calibri leading-relaxed ${textBody}`}>
                        "{verse.translation}"
                      </p>
                    </div>

                    <div className={`mt-5 pt-3 border-t flex justify-between items-center ${
                      isDark ? "border-zinc-800/70" : "border-[#EFE5D8]/70"
                    }`}>
                      <div>
                        <span className={`text-xs font-bold font-calibri ${textTitle}`}>
                          {verse.source}
                        </span>
                        <p className={`text-[11px] font-calibri max-w-[155px] mt-0.5 truncate ${textMuted}`} title={verse.context}>
                          {verse.context}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedOracleVerse(verse);
                          triggerNotification(`Focused on ${verse.source} at the Oracle above.`);
                        }}
                        className={`text-xs font-calibri font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                          isDark ? "text-[#F4C84A] hover:bg-zinc-800" : "text-[#C95D4E] hover:bg-[#FDF0EB]"
                        }`}
                      >
                        <span>Focus</span> <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVerses.length === 0 && (
                <div className={`text-center py-10 rounded-2xl border border-dashed ${isDark ? "border-zinc-800 text-zinc-300" : "border-slate-300 text-slate-700"}`}>
                  <p className="font-calibri text-sm font-medium">No exact scriptures matched these custom filter selections. Try broadening your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* C. MINDFUL RELAXATION CENTER */}
        {activeTab === "relaxation" && (
          <div className="space-y-8 animate-fade-in text-center md:text-left">
            {/* Elegant Sub-navigation for relaxation */}
            <div className="flex justify-center">
              <div className={`p-1 rounded-2xl border flex gap-1 ${
                isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-100/50 border-slate-200/50"
              }`}>
                <button
                  type="button"
                  onClick={() => setRelaxationTab("breathing")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-calibri font-bold tracking-wide transition-all ${
                    relaxationTab === "breathing"
                      ? `${themeObj.activeNavBg} shadow-sm`
                      : `${isDark ? "text-zinc-300 hover:text-white" : "text-slate-700 hover:text-slate-950"}`
                  }`}
                >
                  <Heart size={14} className={relaxationTab === "breathing" ? "" : "text-emerald-500"} />
                  Breathing Harmonics
                </button>
                <button
                  type="button"
                  onClick={() => setRelaxationTab("relief")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-calibri font-bold tracking-wide transition-all ${
                    relaxationTab === "relief"
                      ? `${themeObj.activeNavBg} shadow-sm`
                      : `${isDark ? "text-zinc-300 hover:text-white" : "text-slate-700 hover:text-slate-950"}`
                  }`}
                >
                  <RefreshCw size={14} className={relaxationTab === "relief" ? "" : "text-indigo-500"} />
                  Physical Relief (Neck)
                </button>
              </div>
            </div>

            {relaxationTab === "breathing" ? (
              <div className="space-y-8 animate-fade-in">
                <div className="max-w-2xl mx-auto text-center mb-4">
                  <span className={`text-xs uppercase tracking-widest font-calibri ${isDark ? "text-amber-300" : themeObj.accentText} font-bold block mb-1`}>Deep Breathing</span>
                  <h3 className={`text-3xl font-calibri font-light ${textTitle}`}>Quiet Your Turbulent Winds</h3>
                </div>
                
                <BreathingExercise isDark={isDark} themeObj={themeObj} />

                {/* Custom guidance tips for box breathing */}
                <div className={`rounded-3xl p-6 border max-w-lg mx-auto ${
                  isDark ? "bg-zinc-950/80 border-zinc-800 text-zinc-100" : "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
                }`}>
                  <h4 className={`font-calibri font-bold ${textTitle} text-sm mb-2 flex items-center gap-1.5`}>
                    <Compass className={`w-4 h-4 ${isDark ? "text-amber-400" : themeObj.accentText}`} />
                    {personalizedConfig ? "Your Customized Breathing Direction:" : "How to integrate with sacred prayer:"}
                  </h4>
                  {personalizedConfig ? (
                    <div className={`p-4 rounded-2xl border font-calibri text-sm italic mt-2 ${
                      isDark ? "bg-zinc-900 border-zinc-800 text-amber-300" : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    }`}>
                      "{personalizedConfig.recommendedBreathingBreatheCycleText}"
                    </div>
                  ) : (
                    <ul className={`text-xs ${textBody} font-calibri space-y-2 leading-relaxed text-left`}>
                      <li className="flex items-start gap-1">
                        <CornerDownRight className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-slate-600"} shrink-0 mt-0.5`} />
                        <span><strong>Inhale with intention:</strong> Visualize drinking in patience, purity, and sacred sustenance from the divine ocean.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <CornerDownRight className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-slate-600"} shrink-0 mt-0.5`} />
                        <span><strong>Hold with faith:</strong> Feel the warmth of the quotes from Gita or Bible filling the chambers of your heart.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <CornerDownRight className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-slate-600"} shrink-0 mt-0.5`} />
                        <span><strong>Exhale with surrender:</strong> Let go of results, human expectations, and future results entirely. Give them to God.</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="max-w-2xl mx-auto text-center mb-4">
                  <span className={`text-xs uppercase tracking-widest font-calibri ${isDark ? "text-amber-300" : themeObj.accentText} font-bold block mb-1`}>Cervical Wellness</span>
                  <h3 className={`text-3xl font-calibri font-light ${textTitle}`}>Release Neck & Shoulder Burden</h3>
                  <p className={`${textMuted} text-sm mt-2 max-w-md mx-auto`}>
                    We store severe burdens physically. Use this beautiful step-by-step neck alignment sequence to release long sitting stiffness.
                  </p>
                </div>

                <NeckRotation isDark={isDark} themeObj={themeObj} />

                {/* Custom tips for physical release */}
                <div className={`rounded-3xl p-6 border max-w-lg mx-auto ${
                  isDark ? "bg-zinc-950/80 border-zinc-800 text-zinc-100" : "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
                }`}>
                  <h4 className={`font-calibri font-bold ${textTitle} text-sm mb-2 flex items-center gap-1.5`}>
                    <Sparkles className={`w-4 h-4 ${isDark ? "text-amber-400" : themeObj.accentText}`} />
                    Mind-Body Wisdom Connection:
                  </h4>
                  <p className={`text-xs ${textBody} font-calibri leading-relaxed text-left`}>
                    Your brain carries high workloads. Tight neck columns restrict vital oxygen flow to the amygdala. Shifting head orientation side-to-side signals physical relief to your central neurological network, telling the brain it is safe to unwind.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* D. DAILY REFLECTION DIARY & AI TALK */}
        {activeTab === "diary" && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto w-full max-w-full min-w-0 overflow-x-hidden">
            {/* Header intro or simple instructions */}
            <div className="text-center md:mb-2 max-w-xl mx-auto px-2">
              <span className={`text-xs font-calibri font-bold tracking-widest ${themeObj.accentText} uppercase`}>Divine Notebook</span>
              <h3 className={`text-2xl md:text-3xl font-calibri font-light ${textTitle} mt-0.5`}>Write the Sacred Pages</h3>
            </div>

            {/* Micro Tab Selector visible ONLY on mobile to toggle book side */}
            <div className="flex md:hidden justify-center gap-1.5 mb-4 w-full max-w-full">
              <button
                type="button"
                onClick={() => setMobileSubTab("write")}
                className={`flex-1 py-2 rounded-xl text-xs font-calibri font-bold border transition-all ${
                  mobileSubTab === "write"
                    ? `${isDark ? "bg-amber-600/30 border-amber-500 text-amber-300" : `${themeObj.activeNavBg}`}`
                    : `${isDark ? "bg-zinc-900 text-zinc-300 border-zinc-700" : "bg-white text-slate-700 border-slate-300"}`
                }`}
              >
                📝 Pen
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileSubTab("chronicles");
                  setRightPageTab("vault");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-calibri font-bold border transition-all relative ${
                  mobileSubTab === "chronicles"
                    ? `${isDark ? "bg-amber-600/30 border-amber-500 text-amber-300" : `${themeObj.activeNavBg}`}`
                    : `${isDark ? "bg-zinc-900 text-zinc-300 border-zinc-700" : "bg-white text-slate-700 border-slate-300"}`
                }`}
              >
                📜 Vault ({diaryEntries.length})
                {diaryEntries.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-sans tracking-normal font-bold">
                    {diaryEntries.length}
                  </span>
                )}
              </button>
            </div>

            {/* 3D BOOK BODY OBJECT */}
            <div className="relative w-full max-w-full min-w-0">
              
              {/* Seamless Personal Diary Interface (Boundary Removed) */}
              <div className="w-full max-w-full min-w-0 transition-all duration-300">
                
                {/* Book Pages Container */}
                <div className="relative grid md:grid-cols-2 rounded-2xl md:rounded-3xl bg-[#FFFDF9] dark:bg-[#151419] shadow-lg border border-stone-200/90 dark:border-zinc-800/90 transition-all w-full max-w-full min-w-0 overflow-hidden">
                  
                  {/* --- SIDES CONDITIONAL MOBILE / BOTH ON DESKTOP --- */}

                  {/* 1. LEFT PAGE: WRITE YOUR HEART CLEAR */}
                  <div className={`w-full max-w-full min-w-0 p-3 sm:p-5 md:p-7 flex flex-col justify-between relative md:border-r border-b md:border-b-0 transition-all duration-300 ${
                    isDark 
                      ? "bg-[#18161D] text-[#FAF8F5] border-zinc-800/70" 
                      : "bg-[#FFFDF9] text-[#292623] border-[#EFE5D8]"
                  } ${
                    mobileSubTab === "write" ? "flex" : "hidden md:flex"
                  }`}>
                    
                    {/* The 3D Flipping container */}
                    <motion.div
                      style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "right center",
                        backfaceVisibility: "hidden"
                      }}
                      animate={isPageTurning ? {
                        rotateY: 180,
                        scale: 0.94,
                        filter: "brightness(0.78)",
                        z: 15
                      } : {
                        rotateY: 0,
                        scale: 1,
                        filter: "brightness(1)",
                        z: 0
                      }}
                      transition={{ duration: 0.85, ease: "easeInOut" }}
                      className="flex-1 flex flex-col min-h-0 w-full max-w-full min-w-0"
                    >
                      {/* Form Details */}
                      <form onSubmit={handleSaveDiary} className="space-y-3.5 flex flex-col min-h-0 w-full max-w-full min-w-0">
                        
                        <div className="space-y-3.5 w-full max-w-full min-w-0">
                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b pb-2.5 dark:border-zinc-800 border-[#EFE5D8] w-full max-w-full min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span className={`text-sm font-calibri font-bold tracking-wide block ${isDark ? "text-[#F4C84A]" : "text-[#244F46]"}`}>
                                Write Your Heart Clear
                              </span>
                              <span className="text-[11px] font-calibri font-medium text-[#8A8279] truncate">
                                · 100% Private
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                              <button
                                type="button"
                                onClick={() => {
                                    setChatMessages([
                                      {
                                        id: `welcome-${Date.now()}`,
                                        sender: "companion",
                                        text: "Fresh page. What's going on today?",
                                        time: "Now",
                                        tag: "Sanctuary"
                                      }
                                    ]);
                                    setCurrentEntryText("");
                                }}
                                className={`text-xs flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg font-calibri ${
                                  isDark ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" : "text-stone-600 hover:text-stone-950 hover:bg-stone-100"
                                }`}
                                title="Start fresh conversation"
                              >
                                <RotateCcw size={11} />
                                <span>Renew</span>
                              </button>
                              <span className="text-lg opacity-45 select-none filter sepia" title="Divine sigil">🏵️</span>
                            </div>
                          </div>

                          {/* Simultaneous Confession & Solace Chat Window */}
                          <div className={`relative flex flex-col justify-between rounded-2xl border transition-all p-2.5 sm:p-3 shadow-inner w-full max-w-full min-w-0 ${
                            isDark 
                              ? "bg-zinc-900/80 border-zinc-800 text-zinc-100" 
                              : "bg-stone-50/80 border-stone-300 text-stone-900"
                          } min-h-[420px] md:min-h-[480px]`}>
                            
                            {/* Scrollable Conversation Stream between Seeker and AI Companion */}
                            <div 
                              ref={chatScrollRef}
                              className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[280px] md:min-h-[340px] max-h-[340px] md:max-h-[400px] scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 w-full max-w-full min-w-0"
                            >
                              <AnimatePresence initial={false}>
                                {chatMessages.map((msg) => (
                                  <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      damping: 24,
                                      stiffness: 280,
                                      mass: 0.7,
                                    }}
                                    className={`flex flex-col w-full max-w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}
                                  >
                                    <div
                                      className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed max-w-[95%] sm:max-w-[88%] shadow-sm break-words overflow-hidden ${
                                        msg.sender === "user"
                                          ? isDark
                                            ? "bg-amber-600/25 text-zinc-100 border border-amber-500/40 rounded-br-sm font-medium"
                                            : "bg-amber-100/90 text-stone-950 border border-amber-300 rounded-br-sm font-medium"
                                          : isDark
                                            ? "bg-zinc-950/90 text-zinc-100 border border-zinc-800/90 rounded-bl-sm font-normal"
                                            : "bg-white text-stone-800 border border-stone-200/90 rounded-bl-sm shadow-sm font-normal"
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap font-calibri break-words leading-relaxed">{msg.text}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>

                              <AnimatePresence>
                                {isAgentReplying && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="flex flex-col items-start animate-pulse w-full max-w-full"
                                  >
                                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs rounded-bl-sm flex items-center gap-2 max-w-[95%] break-words ${
                                      isDark ? "bg-zinc-950/90 border border-zinc-800 text-zinc-300" : "bg-white border border-stone-200 text-stone-600 shadow-sm"
                                    }`}>
                                      <span className="inline-flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                      </span>
                                      <span className="font-calibri font-medium break-words">Typing...</span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Docked Interactive Chat Input Area */}
                            <div className="mt-2.5 pt-2 border-t border-stone-200/70 dark:border-zinc-800/80 w-full max-w-full min-w-0 space-y-1.5">
                              <div className="flex items-end gap-2 w-full max-w-full min-w-0">
                                <textarea
                                  id="diary-entry-text"
                                  value={currentEntryText}
                                  onChange={(e) => setCurrentEntryText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendChatMessage();
                                    }
                                  }}
                                  placeholder="Type what's on your mind... (Enter to send, Shift+Enter for new line)"
                                  rows={2}
                                  className={`flex-1 min-w-0 p-2.5 sm:p-3 rounded-xl border focus:outline-none transition-all font-calibri text-xs md:text-sm resize-none shadow-sm break-words box-border ${
                                    isDark 
                                      ? "bg-[#25222B] border-zinc-700/80 text-[#FAF8F5] placeholder:text-zinc-500 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30" 
                                      : `${themeObj.secondaryBg} ${themeObj.cardBorder} text-[#292623] placeholder:text-[#8A8279] focus:border-emerald-600/70 focus:ring-1 focus:ring-emerald-500/30`
                                  }`}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleSendChatMessage()}
                                  disabled={isAgentReplying || !currentEntryText.trim()}
                                  className={`w-[42px] sm:w-[46px] h-[42px] sm:h-[46px] rounded-xl text-xs font-calibri font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                                    isDark 
                                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20" 
                                      : `${themeObj.activeNavBg} hover:opacity-90 text-white shadow-xs`
                                  }`}
                                  title="Send confession / reflection"
                                  aria-label="Send"
                                >
                                  {isAgentReplying ? (
                                    <RefreshCw size={15} className="animate-spin" />
                                  ) : (
                                    <Send size={15} />
                                  )}
                                </button>
                              </div>

                              {currentEntryText.trim() && (
                                <div className="flex items-center gap-1.5 text-[10px] font-calibri px-1">
                                  <span className={`inline-flex items-center gap-1 transition-opacity duration-300 font-mono text-[9px] shrink-0 ${
                                    isDark ? "text-zinc-400" : "text-stone-500"
                                  }`}>
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                      isDraftSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"
                                    }`} />
                                    {isDraftSaving ? "Saving..." : "Draft saved"}
                                  </span>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>

                        {diaryError && (
                          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs font-medium rounded-xl font-calibri break-words w-full max-w-full flex items-center justify-between gap-2 shadow-xs animate-fade-in">
                            <span>⚠️ {diaryError}</span>
                            <button
                              type="button"
                              onClick={() => setDiaryError(null)}
                              className="text-rose-600 hover:text-rose-900 dark:text-rose-400 p-0.5 rounded cursor-pointer shrink-0"
                              title="Dismiss"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-end border-t border-stone-200 dark:border-zinc-800 mt-4 w-full max-w-full">
                          <button
                            type="submit"
                            disabled={isSubmittingDiary}
                            className={`px-5 py-2.5 rounded-xl text-white font-calibri text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-102 hover:-translate-y-0.5 active:scale-98 disabled:opacity-40 select-none ${
                              isDark 
                                ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20"
                                : `${themeObj.primaryButtonBg}`
                            }`}
                          >
                            {isSubmittingDiary ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Chronicles...
                              </>
                            ) : (
                              <>
                                <span>Turn and Save</span> <ArrowRight size={13} />
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    </motion.div>

                    {/* Left Page Page Number styling */}
                    <div className="pt-4 border-t border-stone-200/50 dark:border-zinc-800/80 flex justify-end items-center text-[10px] font-calibri tracking-widest text-stone-500 dark:text-zinc-400 uppercase font-semibold w-full max-w-full">
                      <span>Page {diaryEntries.length * 2 + 1}</span>
                    </div>

                  </div>

                  {/* CENTRAL BINDER IN DESKTOP (Wire notebook spiral rings) */}
                  <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-[24px] -translate-x-1/2 z-30 flex-col items-center justify-around pointer-events-none py-8">
                    {/* Dark center binding crease */}
                    <div className="absolute inset-y-0 w-full bg-gradient-to-r from-black/15 via-black/5 to-black/15 shadow-inner" />
                    {/* Metal binding loops */}
                    {[...Array(9)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-[30px] h-[8px] bg-gradient-to-b from-[#e2e2e2] via-[#f7f7f7] to-[#8c8c8c] dark:from-[#2a221d] dark:via-[#dfbe95] dark:to-[#120f0e] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-[#c0c0c0]/30 dark:border-amber-800/20 relative z-40 transform -rotate-12 translate-x-0.5" 
                      />
                    ))}
                  </div>

                  {/* 2. RIGHT PAGE: CHRONICLES & RESPONSE MIRROR */}
                  <div className={`w-full max-w-full min-w-0 p-3 sm:p-5 md:p-7 flex flex-col justify-between relative transition-all duration-300 overflow-x-hidden ${
                    isDark 
                      ? "bg-zinc-900 text-zinc-100 border-zinc-800" 
                      : "bg-[#faf6ed] text-stone-900 border-stone-200"
                  } ${
                    mobileSubTab === "chronicles" ? "flex" : "hidden md:flex"
                  }`}>
                    
                    {/* Inner Content Wrapper */}
                    <div className="flex-1 flex flex-col min-h-0">
                      
                      {/* Past entries OR Selected details container */}
                      <AnimatePresence mode="wait">
                        {selectedPastEntry ? (
                          <motion.div
                            key="selected-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="flex-1 flex flex-col justify-between min-h-0"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPastEntry(null)}
                                  className={`text-xs font-calibri font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg border hover:scale-103 active:scale-98 transition-all ${
                                    isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white" : "bg-white border-stone-300 text-stone-800 hover:bg-stone-50"
                                  }`}
                                >
                                  ← Back to Chronicles
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteEntry(selectedPastEntry.id, e)}
                                  className="text-stone-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                  title="Delete chronicle permanently"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <span className={`text-[10px] font-calibri tracking-widest block uppercase font-bold ${isDark ? "text-amber-300" : themeObj.accentText}`}>
                                  Sacred Record
                                </span>
                                <h4 className="text-xs text-stone-600 dark:text-zinc-400 font-calibri flex items-center gap-1 leading-none mt-1.5 font-medium">
                                  <Calendar size={12} className="opacity-70" /> {selectedPastEntry.date}
                                </h4>
                              </div>

                              {/* The Entry Text - Previous reflection only */}
                              <div className="p-5 sm:p-6 rounded-2xl border font-calibri text-sm sm:text-base leading-relaxed overflow-y-auto bg-white/90 dark:bg-zinc-950/70 border-stone-300 dark:border-zinc-800 shadow-sm text-stone-900 dark:text-zinc-100 whitespace-pre-wrap min-h-[220px] max-h-[460px]">
                                "{selectedPastEntry.text}"
                              </div>
                            </div>
                          </motion.div>
                        ) : rightPageTab === "trends" ? (
                          <motion.div
                            key="trends-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-thin"
                          >
                            <div className="flex items-center justify-between mb-3 border-b pb-2 dark:border-zinc-800 border-stone-200">
                              <h4 className={`text-base font-calibri font-bold ${textTitle} flex items-center gap-1.5`}>
                                <span>📈</span>
                                <span>Mood Trend Journey</span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setRightPageTab("vault");
                                }}
                                className={`text-xs font-calibri font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700" : "bg-white border-stone-300 text-stone-800 hover:bg-stone-50"
                                }`}
                              >
                                📜 View Vault
                              </button>
                            </div>
                            <MoodJourneyChart
                              entries={diaryEntries}
                              isDark={isDark}
                              onSelectEntry={(entry) => setSelectedPastEntry(entry)}
                              onAddSampleData={() => {
                                const sample = getInitialSampleEntries();
                                saveToLocalStorage(sample);
                                triggerNotification("Sacred 7-day mood journey loaded!");
                              }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="list-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col min-h-0"
                          >
                            <div className="flex items-center justify-between mb-3 border-b pb-2 dark:border-zinc-800 border-stone-200">
                              <h4 className={`text-lg font-calibri font-bold ${textTitle}`}>
                                Past Reflections
                              </h4>
                            </div>

                            {diaryEntries.length === 0 ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-stone-300 dark:border-zinc-800 rounded-xl my-2">
                                <span className="text-2xl mb-2 filter grayscale-40">🗝️</span>
                                <h5 className="text-xs font-calibri font-bold text-stone-800 dark:text-zinc-200">Vault Currently Empty</h5>
                                <p className="text-[10.5px] text-stone-600 dark:text-zinc-400 font-calibri mt-1 max-w-[200px] mx-auto leading-relaxed">
                                  Your reflections sleep securely. Craft your first entry on the left page, and click turn to chronicle it.
                                </p>
                              </div>
                            ) : (
                              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin max-h-[440px]">
                                {diaryEntries.map((entry) => {
                                  // Pick a decorative emblem matching the mood or status
                                  const moodEmoji = entry.aiAnalysis?.mood === "Anxious" ? "🍃" :
                                                    entry.aiAnalysis?.mood === "Heavy" ? "🕊️" :
                                                    entry.aiAnalysis?.mood === "Grateful" ? "✨" : "🌿";
                                  return (
                                    <button
                                      key={entry.id}
                                      onClick={() => setSelectedPastEntry(entry)}
                                      className={`w-full text-left p-4 rounded-2xl border text-xs font-calibri cursor-pointer hover:scale-[1.015] hover:-translate-y-0.5 active:scale-[0.99] transition-all flex flex-col justify-between gap-1.5 organic-card-shadow ${
                                        isDark 
                                          ? "bg-[#201D25] border-zinc-800 text-zinc-100 hover:bg-[#28242F]" 
                                          : "bg-white border-[#EFE5D8] text-[#292623] hover:bg-[#FFFDF9]"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center w-full text-[11px] text-[#8A8279]">
                                        <span className="font-medium">{entry.date}</span>
                                        <div className="flex items-center gap-1.5 font-bold text-[#244F46] dark:text-[#8BB89A]">
                                          <span>{moodEmoji}</span>
                                          <span>{entry.aiAnalysis?.mood || "Reflection"}</span>
                                        </div>
                                      </div>
                                      <p className="line-clamp-2 text-[#625C56] dark:text-zinc-300 text-xs italic mt-0.5 font-calibri leading-relaxed font-normal">
                                        "{entry.text}"
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                    {/* Right Page Page Number styling */}
                    <div className="pt-4 border-t border-stone-200/50 dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-calibri tracking-widest text-stone-500 dark:text-zinc-400 uppercase font-semibold">
                      <span>Reflections Vault</span>
                      <span>Page {diaryEntries.length * 2 + 2}</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* AI HOPE CONTROLLER PANEL OVERLAY IN PROGRESS */}
            {isSubmittingDiary && (
              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 animate-pulse relative overflow-hidden shadow-sm ${
                isDark ? "bg-zinc-950/85 text-zinc-300 border-zinc-800" : "bg-emerald-50/50 text-slate-800 border-emerald-100"
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl animate-pulse" />
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-calibri font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-450">
                    Sacred Reflection Alchemy Active
                  </h4>
                  <p className="text-xs font-calibri leading-relaxed text-stone-500 dark:text-zinc-400">
                    The AI Hope Whisperer is currently reading between the words of your heart. Aligning corresponding wisdom streams from Gita, Bible, and Granth Sahib verses. Take a single slow deep breath while the scribe is typing...
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* D. PERSONALIZE SECTION */}
        {activeTab === "personalize" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in mt-4">
            {/* Header Jumbotron */}
            <div className="bg-gradient-to-tr from-[#2B1B17] via-[#244F46] to-[#17645F] text-[#FFF8ED] rounded-[32px] p-6 md:p-8 organic-card-shadow relative overflow-hidden border border-white/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F26B5B]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <span className="text-[11px] font-calibri uppercase tracking-wider font-bold text-[#F4C84A]">
                  Tailor Your Sacred Sanctuary
                </span>
                <h3 className="text-2xl md:text-3xl font-calibri font-bold tracking-tight text-white">
                  Craft Your Private Refuge
                </h3>
                <p className="text-xs md:text-sm text-[#EAE2D8] font-calibri leading-relaxed max-w-xl">
                  Personalize your visual atmosphere, tactile themes, and soothing ambient soundscapes. Everything loops smoothly to anchor your deep focus.
                </p>
              </div>
            </div>

            {/* Dynamic Custom Theme Picker Card */}
            <div className={`p-6 md:p-8 rounded-[32px] border organic-card-shadow space-y-5 transition-all duration-300 ${
              isDark ? "bg-[#242129]/95 border-zinc-800" : "bg-[#FFFDF9]/95 border-[#EFE5D8]"
            }`}>
              <div>
                <h4 className={`font-calibri font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-[#292623]"}`}>
                  <span>🎨</span> Tactile Color Palettes
                </h4>
                <p className={`text-xs font-calibri mt-1 ${isDark ? "text-zinc-400" : "text-[#8A8279]"}`}>
                  Choose a calm natural harmony of warm ivory, terracotta, sage green, and honey yellow.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {MASTER_THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        localStorage.setItem("sacred_app_theme", theme.id);
                        triggerNotification(`Sanctuary core theme set to: ${theme.name}!`);
                      }}
                      className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all relative group text-left h-28 organic-card-shadow cursor-pointer ${
                        isSelected
                          ? `border-[#C95D4E] ring-2 ring-[#C95D4E]/30 scale-102 ${isDark ? "bg-zinc-950/80" : "bg-[#FDF0EB]/60"}`
                          : `${isDark ? "bg-[#1E1B23] hover:bg-[#28242F] border-zinc-800" : "bg-white/90 hover:bg-white border-[#EFE5D8]"}`
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-2xl">{theme.icon}</span>
                        {isSelected && (
                          <div className="bg-[#244F46] text-white rounded-full p-0.5 shadow-sm">
                            <Check size={8} className="stroke-[3.5]" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <h5 className={`text-[10px] font-calibri font-bold uppercase tracking-wide truncate ${isDark ? "text-zinc-200" : "text-[#292623]"}`}>
                          {theme.name.split(" (")[0]}
                        </h5>
                        
                        {/* Quick preview palette dots */}
                        <div className="flex gap-1.5 mt-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.primaryBg}`} title="Primary Accent" />
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.gradientTo}`} title="Secondary Accent" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              {/* Left Column: Ambient Music */}
              <div className={`md:col-span-7 p-6 md:p-8 rounded-[32px] border transition-colors duration-300 organic-card-shadow space-y-6 ${
                isDark ? "bg-[#242129]/95 border-zinc-800" : "bg-[#FFFDF9]/95 border-[#EFE5D8]"
              }`}>
                <div>
                  <h4 className={`font-calibri font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-[#292623]"}`}>
                    <Volume2 className={`w-5 h-5 text-[#C95D4E]`} />
                    <span>Atmospheric Soundscapes</span>
                  </h4>
                  <p className={`text-xs font-calibri mt-1 ${isDark ? "text-zinc-400" : "text-[#8A8279]"}`}>
                    Select an organic natural background resonance to soften outside distractions.
                  </p>
                </div>

                {/* Sound Cards Grid */}
                <div className="grid sm:grid-cols-2 gap-3.5 font-sans">
                  {AMBIENT_SOUNDS.map((sound) => {
                    const isSelected = activeSound === sound.id;
                    return (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => handleSelectSound(sound.id)}
                        className={`text-left p-4.5 rounded-2xl border transition-all relative overflow-hidden group flex flex-col justify-between h-34 cursor-pointer organic-card-shadow ${
                          isSelected
                            ? `${isDark ? "bg-[#1E1B23] border-[#C95D4E] ring-2 ring-[#C95D4E]/30" : "bg-[#FDF0EB] border-[#C95D4E] ring-2 ring-[#C95D4E]/30"}`
                            : `${isDark ? "bg-[#1A1820] hover:bg-[#25212B] border-zinc-800" : "bg-white/90 hover:bg-white border-[#EFE5D8]"}`
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-2xl">{sound.icon}</span>
                          {isSelected && sound.id !== "none" && (
                            <div className="flex gap-1 items-end h-3.5">
                              <span className={`w-1 h-3.5 bg-[#C95D4E] rounded-full animate-bounce`} style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                              <span className={`w-1 h-2 bg-[#C95D4E] rounded-full animate-bounce`} style={{ animationDelay: '0.2s', animationDuration: '0.9s' }} />
                              <span className={`w-1 h-4 bg-[#C95D4E] rounded-full animate-bounce`} style={{ animationDelay: '0s', animationDuration: '0.7s' }} />
                              <span className={`w-1 h-2 bg-[#C95D4E] rounded-full animate-bounce`} style={{ animationDelay: '0.3s', animationDuration: '0.5s' }} />
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className={`text-xs font-calibri font-bold uppercase tracking-wide transition-colors ${isDark ? "text-zinc-200" : "text-[#292623]"}`}>
                            {sound.name}
                          </h5>
                          <p className={`text-[11px] font-calibri mt-1 leading-snug line-clamp-2 ${isDark ? "text-zinc-400" : "text-[#8A8279]"}`}>
                            {sound.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Volume Controller Slider */}
                {activeSound !== "none" && (
                  <div className={`p-4.5 rounded-2xl border space-y-3 ${isDark ? "bg-[#18161D] border-zinc-800" : "bg-[#F7EBDD]/60 border-[#EFE5D8]"}`}>
                    <div className={`flex justify-between items-center text-xs font-calibri font-bold ${isDark ? "text-zinc-300" : "text-[#292623]"}`}>
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <Volume2 size={14} className="text-[#C95D4E]" /> Soundscape Volume
                      </span>
                      <span>{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#C95D4E] ${
                        isDark ? "bg-zinc-800" : "bg-stone-300"
                      }`}
                    />
                    <p className={`text-[11px] font-calibri italic text-center ${isDark ? "text-zinc-400" : "text-[#8A8279]"}`}>
                      Tip: Blend soft nature audio into your sacred reading.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Clear Scenic Backgrounds Grid */}
              <div className={`md:col-span-5 p-6 md:p-8 rounded-[32px] border transition-colors duration-300 organic-card-shadow space-y-6 ${
                isDark ? "bg-[#242129]/95 border-zinc-800" : "bg-[#FFFDF9]/95 border-[#EFE5D8]"
              }`}>
                <div>
                  <h4 className={`font-calibri font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-[#292623]"}`}>
                    <span>🌿</span> Artful Tactile Landscapes
                  </h4>
                  <p className={`text-xs font-calibri mt-1 ${isDark ? "text-zinc-400" : "text-[#8A8279]"}`}>
                    Choose from handcrafted 3D diorama environments and high-clarity scenes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {LANDSCAPE_BACKGROUNDS.map((bg) => {
                    const isSelected = currentBg === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleChangeBg(bg.id)}
                        className={`relative h-28 rounded-2xl overflow-hidden group text-left transition-all cursor-pointer ${
                          isSelected ? "ring-3 ring-[#C95D4E] shadow-md scale-98" : "hover:scale-102 border border-[#EFE5D8]"
                        }`}
                        title={`${bg.name} - ${bg.photographer}`}
                      >
                        <img
                          src={bg.url.replace("w=1920", "w=400")}
                          alt={bg.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2.5 text-[10.5px] font-calibri text-white leading-tight font-medium">
                          <p className="truncate font-bold">{bg.name}</p>
                          <p className="text-[9px] text-[#F4C84A] uppercase tracking-wider">{bg.category}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#244F46] text-white rounded-full p-1 shadow-md">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reset sanctuary defaults card */}
                <div className={`p-4.5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2.5 ${
                  isDark ? "bg-[#18161D] border-zinc-800 text-zinc-100" : "bg-[#F7EBDD]/60 border-[#EFE5D8] text-[#292623]"
                }`}>
                  <p className={`text-xs font-calibri ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                    Return to the gentle handcrafted 3D diorama garden?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleChangeBg("organic-diorama-garden");
                      handleSelectSound("none");
                      triggerNotification("Reset sanctuary backdrops and silence restored.");
                    }}
                    className={`px-5 py-2.5 btn-organic-forest text-white rounded-2xl text-xs font-calibri font-bold shadow-sm transition-all text-center cursor-pointer`}
                  >
                    Reset Visual Sanctuary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* E. SUPABASE BACKEND DASHBOARD & SCHEMA */}
        {activeTab === "supabase" && (
          <SupabaseDashboard
            isDark={isDark}
            themeObj={themeObj}
            user={user}
          />
        )}

        {/* F. ABOUT SECTION */}
        {activeTab === "about" && (
          <div className={`max-w-3xl mx-auto p-8 md:p-10 rounded-[32px] organic-card-shadow border mt-4 space-y-6 transition-all duration-300 ${
            isDark ? "bg-[#242129]/95 border-zinc-800 text-zinc-100" : "bg-[#FFFDF9]/95 border-[#EFE5D8] text-[#292623]"
          }`}>
            <div className={`text-center pb-5 border-b ${isDark ? "border-zinc-800" : "border-[#EFE5D8]"}`}>
              <h3 className={`text-2xl md:text-3xl font-calibri font-bold ${isDark ? "text-white" : "text-[#292623]"}`}>
                Inside the Refuge of Harmony
              </h3>
              <p className={`text-xs font-calibri mt-1 text-[#8A8279] font-medium`}>
                Sacred lineages combined for deep, quiet restoration
              </p>
            </div>

            <p className={`text-sm md:text-base font-calibri leading-relaxed ${isDark ? "text-zinc-200" : "text-[#625C56]"}`}>
              Modern life is dominated by constant noise, competition, and severe exhaustion regarding results and human validation. This application brings ancient systems of peace and deep self-compassion to your fingertips.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className={`p-5 rounded-[24px] border organic-card-shadow ${
                isDark ? "bg-[#1E1B23] border-zinc-800 text-zinc-200" : "bg-white border-[#EFE5D8] text-[#292623]"
              }`}>
                <span className={`text-xs font-calibri uppercase tracking-wider font-bold block mb-1 text-[#C95D4E]`}>
                  1. The Bhagavad Gita
                </span>
                <p className={`text-xs font-calibri leading-relaxed ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                  Offers the doctrine of <i>Karma Yoga</i> ─ release attachment to outcomes, focus entirely on the duty at hand, and live from a centered inner sanctuary.
                </p>
              </div>

              <div className={`p-5 rounded-[24px] border organic-card-shadow ${
                isDark ? "bg-[#1E1B23] border-zinc-800 text-zinc-200" : "bg-white border-[#EFE5D8] text-[#292623]"
              }`}>
                <span className={`text-xs font-calibri uppercase tracking-wider font-bold block mb-1 text-[#244F46] dark:text-[#8BB89A]`}>
                  2. Guru Granth Sahib
                </span>
                <p className={`text-xs font-calibri leading-relaxed ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                  Focuses on the state of <i>Anand</i> (quiet bliss), urging us to let go of tomorrow's anxiety and trust completely in the caring life forces of the universe.
                </p>
              </div>

              <div className={`p-5 rounded-[24px] border organic-card-shadow ${
                isDark ? "bg-[#1E1B23] border-zinc-800 text-zinc-200" : "bg-white border-[#EFE5D8] text-[#292623]"
              }`}>
                <span className={`text-xs font-calibri uppercase tracking-wider font-bold block mb-1 text-[#17645F] dark:text-[#6F9B82]`}>
                  3. The Holy Bible
                </span>
                <p className={`text-xs font-calibri leading-relaxed ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                  Reminds us with tender love that we are never alone, that we can surrender our heavy shields, and that grace is ready to support our limits.
                </p>
              </div>

              <div className={`p-5 rounded-[24px] border organic-card-shadow ${
                isDark ? "bg-[#1E1B23] border-zinc-800 text-zinc-200" : "bg-white border-[#EFE5D8] text-[#292623]"
              }`}>
                <span className={`text-xs font-calibri uppercase tracking-wider font-bold block mb-1 text-[#F59B45]`}>
                  4. The Holy Quran
                </span>
                <p className={`text-xs font-calibri leading-relaxed ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                  Reassures us that with every difficulty comes active ease, comforting restless hearts with hope, divine remembrance, and beautiful patience.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-[24px] border mt-6 text-center ${
              isDark ? "bg-[#1B1920] border-zinc-800 text-zinc-200" : "bg-[#F7EBDD]/60 border-[#EFE5D8] text-[#292623]"
            }`}>
              <Sparkles className={`w-6 h-6 mx-auto mb-2 text-[#C95D4E] animate-organic-float`} />
              <h4 className={`font-calibri font-bold text-sm ${isDark ? "text-white" : "text-[#292623]"}`}>Empathetic Companion Architecture</h4>
              <p className={`text-xs font-calibri max-w-lg mx-auto leading-relaxed mt-2 ${isDark ? "text-zinc-300" : "text-[#625C56]"}`}>
                Created as a confidential solace companion. It listens without judgment, suggesting restorative verses from timeless sacred texts and physical grounding exercises to restore your peace.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Elegant Footer with High Contrast Theme Adaptability */}
      <footer className={`border-t py-8 text-center text-xs font-calibri transition-colors duration-300 ${
        isDark ? "bg-zinc-950/95 border-zinc-800 text-zinc-400" : "bg-white/95 border-slate-200 text-slate-600"
      }`}>
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-medium flex items-center justify-center gap-3">
            <span>© 2026 Positron</span>
            <span>·</span>
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="underline hover:opacity-80 transition-opacity cursor-pointer font-bold text-emerald-600 dark:text-emerald-400"
            >
              Download Android App (.APK)
            </button>
            <span>·</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity">Privacy Policy</a>
          </p>
          <p className={`italic font-calibri ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
            "Peace is not the absence of storm, but the steady flame that burns within details."
          </p>
        </div>
      </footer>
      {/* Auth Modal for Firebase Google Login & Profile Sync */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        isDark={isDark}
        onUserChange={(newUser) => setUser(newUser)}
        onToast={triggerNotification}
      />
      {/* Standalone Offline-First Android APK Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
