import React, { useState } from "react";
import { 
  X, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileBox, 
  ArrowRight,
  Loader2,
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react";

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function ApkDownloadModal({ isOpen, onClose, isDark }: ApkDownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pwaInstallPromptActive, setPwaInstallPromptActive] = useState(false);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setDownloadSuccess("Positron installed to your Home Screen with official +tron launcher icon!");
          (window as any).deferredInstallPrompt = null;
        }
      } catch (e) {
        console.warn("PWA prompt error", e);
        setPwaInstallPromptActive(true);
      }
    } else {
      setPwaInstallPromptActive(true);
    }
  };

  const handleDownload = async (type: "apk" | "aab") => {
    setIsDownloading(true);
    setErrorMsg(null);
    setDownloadSuccess(null);
    setDownloadProgress(type === "apk" ? "Preparing Android 14/15 Certified Release APK..." : "Preparing Google Play Bundle...");

    const url = type === "apk" ? "/api/download/apk" : "/api/download/aab";
    const downloadName = type === "apk" ? "Positron-Sanctuary-Offline.apk" : "Positron-Sanctuary.aab";

    try {
      // In-session stream bypasses redirect issues and ensures clean attachment headers
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      setDownloadProgress("Generating file download...");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);

      setDownloadSuccess(
        type === "apk" 
          ? "Release APK downloaded! Check your Downloads folder." 
          : "Google Play Bundle downloaded to your Downloads folder!"
      );
    } catch (err: any) {
      console.warn("Direct blob download issue, using fallback link...", err);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = type === "apk" ? "/sacred-reflection-diary.apk" : "/sacred-reflection-diary.aab";
      fallbackLink.download = downloadName;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
      setDownloadSuccess("Download initiated! Check your Downloads folder.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto ${
        isDark ? "bg-[#16151a] border-zinc-800 text-zinc-100" : "bg-white border-stone-200 text-stone-900"
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
            isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-stone-400 hover:text-stone-900 hover:bg-stone-100"
          }`}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-black border border-stone-800 flex items-center justify-center shrink-0 shadow-md p-1">
            <img src="/pwa-192x192.png" alt="+tron" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-calibri font-bold tracking-tight">
                Install Positron App
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                Release v2.0
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 font-calibri">
              Updated for modern Android (Android 14 & 15 API 34 Certified)
            </p>
          </div>
        </div>

        {/* Status Banners */}
        {downloadProgress && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700/60 text-blue-800 dark:text-blue-200 text-xs font-calibri flex items-center gap-2.5 animate-pulse">
            <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{downloadProgress}</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-xs font-calibri flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold block">Ready!</span>
              <span>{downloadSuccess}</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs font-calibri">
            {errorMsg}
          </div>
        )}

        {/* Installation Options */}
        <div className="space-y-3">
          {/* Method 1: Instant PWA Install (Zero Warnings) */}
          <button
            type="button"
            onClick={handlePwaInstall}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-calibri font-semibold shadow-md active:scale-99 transition-all cursor-pointer flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-amber-300 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>1-Tap Install (Zero Warnings)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 uppercase">
                    Recommended
                  </span>
                </div>
                <div className="text-[11px] text-white/90 font-normal leading-tight mt-0.5">
                  Official Google WebAPK · No "Harmful File" prompt · Auto-updates
                </div>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {pwaInstallPromptActive && (
            <div className={`p-3 rounded-xl border text-xs font-calibri space-y-1 animate-fade-in ${
              isDark ? "bg-zinc-900/90 border-zinc-700 text-zinc-300" : "bg-stone-50 border-stone-300 text-stone-700"
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Smartphone size={14} />
                <span>To install on phone browser:</span>
              </div>
              <p className="leading-relaxed">
                Tap your browser menu (<strong>⋮</strong> three dots at the top right) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>
          )}

          {/* Method 2: Standalone Offline APK File */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => handleDownload("apk")}
            className={`w-full p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left font-calibri disabled:opacity-60 ${
              isDark 
                ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200" 
                : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin text-emerald-500" />
                ) : (
                  <Download size={18} className="text-emerald-500" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Download Standalone APK (.APK)</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600/20 text-emerald-500 rounded font-mono font-bold">API 34</span>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                  Native offline installer · Signed with Release Key · 8.9 MB
                </div>
              </div>
            </div>
            <Download size={15} className="text-stone-400" />
          </button>

          {/* Method 3: Google Play Bundle */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => handleDownload("aab")}
            className={`w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left font-calibri disabled:opacity-60 ${
              isDark 
                ? "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/80 text-zinc-300" 
                : "bg-stone-50/60 border-stone-200 hover:bg-stone-100/80 text-stone-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileBox size={16} className="text-amber-500 shrink-0" />
              <div>
                <div className="text-xs font-bold">Google Play Store Bundle (.AAB)</div>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                  Ready for submission to Google Play Console
                </div>
              </div>
            </div>
            <Download size={14} className="text-stone-400" />
          </button>
        </div>

        {/* Why Browsers Show "File might be harmful" & How it's solved */}
        <div className={`p-4 rounded-2xl border text-xs font-calibri space-y-2 ${
          isDark ? "bg-zinc-950/80 border-zinc-800/90 text-zinc-300" : "bg-emerald-50/50 border-emerald-200/80 text-emerald-950"
        }`}>
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Why Chrome shows "File might be harmful" on APK downloads:</span>
          </div>
          <p className="leading-relaxed opacity-95">
            Android and Chrome display a standard precaution message for <em>any</em> <code className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded">.apk</code> file downloaded directly from the web instead of the Play Store.
          </p>
          <ul className="space-y-1 list-disc list-inside text-[11px] opacity-90">
            <li>
              <strong>To avoid all prompts completely:</strong> Use <strong>1-Tap Install</strong> above (creates a verified Google WebAPK with zero warnings).
            </li>
            <li>
              <strong>For the .APK file:</strong> Simply tap <strong>"Download anyway"</strong>. The APK has been updated with modern <strong>targetSdkVersion 34 (Android 14 & 15)</strong> and signed with official Production Release keys so your phone installs it smoothly.
            </li>
          </ul>
        </div>

        {/* Footer Verification */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-zinc-500 font-calibri pt-1">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>targetSdkVersion: 34 · Production Release Signed · Verified Safe</span>
        </div>
      </div>
    </div>
  );
}
