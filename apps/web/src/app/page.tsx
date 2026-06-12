"use client";

/* eslint-disable @next/next/no-img-element */

import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileVideo,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Smartphone,
  Laptop,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import AppBanner from "@/components/AppBanner";

type Quality = "best" | "medium" | "audio";

type FormatInfo = {
  format_id: string;
  label: string;
  ext?: string | null;
  resolution?: string | null;
  filesize?: number | null;
  vcodec?: string | null;
  acodec?: string | null;
};

type MetadataResponse = {
  title: string;
  webpage_url: string;
  platform: string;
  thumbnail?: string | null;
  duration?: number | null;
  formats: FormatInfo[];
  warnings: string[];
};

type ApiError = {
  detail?: string;
};

// Support both variable names for backward compatibility
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const platforms = [
  { name: "Facebook", match: /facebook\.com|fb\.watch/i, tone: "bg-[#1877f2] text-white" },
  { name: "Instagram", match: /instagram\.com/i, tone: "bg-[#dd2a7b] text-white" },
  { name: "TikTok", match: /tiktok\.com/i, tone: "bg-[#101010] text-white" },
  { name: "YouTube Shorts", match: /youtube\.com\/shorts|youtu\.be/i, tone: "bg-[#ff0033] text-white" },
  { name: "X / Twitter", match: /x\.com|twitter\.com/i, tone: "bg-[#1d9bf0] text-white" },
  { name: "Reddit", match: /reddit\.com/i, tone: "bg-[#ff4500] text-white" },
  { name: "Pinterest", match: /pinterest\.com|pin\.it/i, tone: "bg-[#bd081c] text-white" },
  { name: "Vimeo", match: /vimeo\.com/i, tone: "bg-[#1ab7ea] text-[#071316]" },
  { name: "Dailymotion", match: /dailymotion\.com|dai\.ly/i, tone: "bg-[#00d2f3] text-[#071316]" },
  { name: "LinkedIn", match: /linkedin\.com/i, tone: "bg-[#0a66c2] text-white" },
];

function detectPlatform(url: string) {
  return platforms.find((platform) => platform.match.test(url))?.name || "Other supported URL";
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "Unknown length";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${minutes}:${String(remainder).padStart(2, "0")}`;
  const hours = Math.floor(minutes / 60);
  return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "Size varies";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filenameFromDisposition(header: string | null) {
  if (!header) return "download";
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch) return decodeURIComponent(utfMatch[1]);
  const asciiMatch = header.match(/filename="?([^"]+)"?/i);
  return asciiMatch?.[1] || "download";
}

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiError;
    return payload.detail || "The request failed. Try another public link.";
  } catch {
    return "The request failed. Try another public link.";
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [quality, setQuality] = useState<Quality>("best");
  const [formatId, setFormatId] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"tiktok" | "instagram">("tiktok");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const detectedPlatform = useMemo(() => detectPlatform(url), [url]);
  const selectedFormat = metadata?.formats.find((format) => format.format_id === formatId);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setMetadata(null);
    setFormatId("");

    if (!url.trim()) {
      setError("Paste a public video URL first.");
      return;
    }

    setIsLoadingMetadata(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = (await response.json()) as MetadataResponse;
      setMetadata(payload);
      setSuccess("Link analyzed. Choose a format or download with the default quality.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not analyze this link.");
    } finally {
      setIsLoadingMetadata(false);
    }
  }

  async function pasteFromClipboard() {
    setError("");
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      setError("Clipboard permission is unavailable in this browser.");
    }
  }

  async function downloadVideo() {
    setError("");
    setSuccess("");

    if (!url.trim()) {
      setError("Paste a public video URL first.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          quality,
          format_id: formatId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filenameFromDisposition(response.headers.get("Content-Disposition"));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setSuccess("Download started. Temporary server files will be cleaned automatically.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not download this video.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-[#ded8ca] bg-[#f6f4ef]">
        <div className="mx-auto grid min-h-[92vh] w-full max-w-7xl gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#161613] text-white">
                  <FileVideo size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#776f60]">
                    ReelSave
                  </p>
                  <p className="text-sm text-[#5d574c]">Public social video downloader</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-[#d8cfbd] bg-white px-3 py-2 text-sm text-[#5d574c] shadow-sm sm:flex">
                <ShieldCheck size={16} aria-hidden="true" />
                No login or cookies
              </div>
            </header>

            <div className="max-w-4xl">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-[#161613] sm:text-6xl lg:text-7xl">
                Download public social videos without a messy workflow.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d574c] sm:text-lg">
                Paste a video link, inspect available formats, and save the media through a
                temporary backend job. Private, login-only, DRM, and restricted links stay blocked.
              </p>
            </div>

            <AppBanner />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Public only", "No credential or cookie collection"],
                ["Temporary files", "Downloads are cleaned after streaming"],
                ["Format choice", "Pick exact formats when available"],
                ["Honest errors", "Clear messages when platforms block access"],
              ].map(([title, body]) => (
                <div key={title} className="border-l-2 border-[#1f8a70] bg-white/70 px-4 py-3">
                  <p className="font-semibold text-[#161613]">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-[#696255]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="self-center rounded-lg border border-[#d8cfbd] bg-white p-4 shadow-[0_18px_70px_rgba(57,47,32,0.16)] sm:p-5">
            <form onSubmit={analyze} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#161613]">Analyze link</h2>
                  <p className="text-sm text-[#696255]">{detectedPlatform}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    setMetadata(null);
                    setError("");
                    setSuccess("");
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#ddd4c3] text-[#5d574c] transition hover:bg-[#f5efe2]"
                  aria-label="Reset form"
                  title="Reset form"
                >
                  <RefreshCw size={17} aria-hidden="true" />
                </button>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#3f392f]">Video URL</span>
                <div className="flex overflow-hidden rounded-md border border-[#cfc6b4] bg-white focus-within:border-[#1f8a70] focus-within:ring-2 focus-within:ring-[#1f8a70]/20">
                  <div className="flex w-11 items-center justify-center text-[#776f60]">
                    <Link2 size={18} aria-hidden="true" />
                  </div>
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://www.tiktok.com/@user/video/..."
                    className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none"
                    inputMode="url"
                  />
                  <button
                    type="button"
                    onClick={pasteFromClipboard}
                    className="flex h-12 w-12 items-center justify-center border-l border-[#e5ddce] text-[#5d574c] transition hover:bg-[#f5efe2]"
                    aria-label="Paste from clipboard"
                    title="Paste from clipboard"
                  >
                    <Clipboard size={17} aria-hidden="true" />
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoadingMetadata}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#161613] px-4 font-semibold text-white transition hover:bg-[#2d2922] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMetadata ? (
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                ) : (
                  <Search size={18} aria-hidden="true" />
                )}
                {isLoadingMetadata ? "Analyzing" : "Analyze video"}
              </button>
            </form>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`truncate rounded-md px-3 py-2 text-center text-xs font-semibold ${platform.tone}`}
                  title={platform.name}
                >
                  {platform.name}
                </div>
              ))}
              <div className="rounded-md bg-[#f1eadb] px-3 py-2 text-center text-xs font-semibold text-[#4c4539]">
                Other supported URL
              </div>
            </div>

            {(error || success) && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-md border p-3 text-sm ${
                  error
                    ? "border-[#f0b3a3] bg-[#fff3ef] text-[#8a2d19]"
                    : "border-[#b9dccd] bg-[#eefaf5] text-[#17624f]"
                }`}
              >
                {error ? (
                  <AlertTriangle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                )}
                <p>{error || success}</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="bg-[#fffdfa] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {metadata ? (
              <div className="grid gap-5 rounded-lg border border-[#d8cfbd] bg-white p-4 shadow-sm md:grid-cols-[260px_minmax(0,1fr)]">
                <div className="aspect-video overflow-hidden rounded-md bg-[#ebe4d5]">
                  {metadata.thumbnail ? (
                    <img
                      src={metadata.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#776f60]">
                      <FileVideo size={38} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#e8f4ef] px-3 py-1 text-xs font-semibold text-[#17624f]">
                      {metadata.platform}
                    </span>
                    <span className="rounded-full bg-[#f1eadb] px-3 py-1 text-xs font-semibold text-[#5d574c]">
                      {formatDuration(metadata.duration)}
                    </span>
                  </div>
                  <h2 className="mt-3 break-words text-2xl font-semibold leading-tight text-[#161613]">
                    {metadata.title}
                  </h2>
                  <p className="mt-2 break-all text-sm text-[#696255]">{metadata.webpage_url}</p>

                  {metadata.warnings.length > 0 && (
                    <div className="mt-4 rounded-md border border-[#ead298] bg-[#fff8e4] p-3 text-sm text-[#765313]">
                      {metadata.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#cfc6b4] bg-white p-8 text-center">
                <FileVideo className="mx-auto text-[#776f60]" size={42} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold text-[#161613]">Waiting for a public link</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#696255]">
                  Analyze a URL to preview its metadata and available downloadable formats.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-[#d8cfbd] bg-white p-4">
              <h3 className="font-semibold text-[#161613]">Available formats</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {(metadata?.formats.length ? metadata.formats : []).map((format) => (
                  <button
                    key={format.format_id}
                    type="button"
                    onClick={() => setFormatId(format.format_id)}
                    className={`min-h-24 rounded-md border p-3 text-left transition ${
                      formatId === format.format_id
                        ? "border-[#1f8a70] bg-[#eefaf5] ring-2 ring-[#1f8a70]/20"
                        : "border-[#e1d8c8] hover:bg-[#f8f2e6]"
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold text-[#161613]">
                      {format.label}
                    </span>
                    <span className="mt-2 block text-xs text-[#696255]">
                      ID {format.format_id} · {formatBytes(format.filesize)}
                    </span>
                    <span className="mt-2 block text-xs text-[#8a8172]">
                      {format.vcodec === "none" ? "Audio only" : format.resolution || "Adaptive"}
                    </span>
                  </button>
                ))}
                {!metadata?.formats.length && (
                  <div className="rounded-md border border-[#e1d8c8] bg-[#fbf8f1] p-4 text-sm text-[#696255] sm:col-span-2 xl:col-span-3">
                    Format choices will appear here after analysis. You can still use default quality
                    when the downloader supports the link.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-[#d8cfbd] bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-[#161613]">Download options</h3>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-[#3f392f]">Quality mode</span>
              <select
                value={quality}
                onChange={(event) => setQuality(event.target.value as Quality)}
                className="h-11 w-full rounded-md border border-[#cfc6b4] bg-white px-3 text-sm outline-none focus:border-[#1f8a70] focus:ring-2 focus:ring-[#1f8a70]/20"
              >
                <option value="best">Best available</option>
                <option value="medium">Medium up to 720p</option>
                <option value="audio">Audio track</option>
              </select>
            </label>

            <div className="mt-4 rounded-md bg-[#f7f1e6] p-3 text-sm text-[#5d574c]">
              <p className="font-medium text-[#3f392f]">Selected format</p>
              <p className="mt-1">{selectedFormat ? selectedFormat.label : "Automatic by quality mode"}</p>
            </div>

            <button
              type="button"
              onClick={downloadVideo}
              disabled={isDownloading}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#1f8a70] px-4 font-semibold text-white transition hover:bg-[#176d59] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <Download size={18} aria-hidden="true" />
              )}
              {isDownloading ? "Preparing file" : "Download video"}
            </button>

            <div className="mt-5 space-y-3 text-sm leading-6 text-[#696255]">
              <p className="flex gap-2">
                <ShieldCheck className="mt-1 shrink-0 text-[#1f8a70]" size={16} aria-hidden="true" />
                Public links only. Login-required, private, DRM, and restricted videos are rejected.
              </p>
              <p className="flex gap-2">
                <AlertTriangle className="mt-1 shrink-0 text-[#b06a16]" size={16} aria-hidden="true" />
                Platform changes can temporarily break extraction until yt-dlp updates.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Dynamic guides & SEO FAQ section */}
      <section className="bg-[#fffdfa] border-t border-[#ded8ca] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Do I have to pay to use the TikTok download without watermark service?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, our TikTok video download service is completely free! You can use ReelSave to save TikTok videos without watermark on all modern browsers (Chrome, Safari, Firefox, Edge) without paying a single cent."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do I need to install an extension to use the TikTok Downloader?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely not. To download TikTok videos and remove TikTok watermarks online, all you need is a valid link. Paste it into the input field above, select the appropriate format, and click download. No extension or app installation is required."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Where are TikTok videos saved after downloading?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "When you save TikTok videos without watermark, they are typically saved to your browser's default download location (usually your device's 'Downloads' folder). You can change the destination folder in your browser settings if preferred."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do I need to have a TikTok account to download TikTok videos?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, you do not need a TikTok account. You can save TikTok videos without a watermark using just a link. Simply copy the link, paste it into our TikTok watermark remover tool, and click analyze."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can the HD TikTok Downloader save videos from private accounts?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No. Our TikTok downloader without watermark website can neither access private accounts nor save TikTok videos from there. The target account must be public for videos to be analyzed and saved."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I get a link for TikTok videos?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Open the TikTok app or website and select the video you would like to save. Tap the 'Share' arrow button on the right side of the screen, then select 'Copy Link'. The video URL will be copied to your clipboard."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How to save TikTok video in MP4 on iPhone (iOS)?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "For iPhone (iOS 13 and above), you can use Safari to run the TikTok video download process directly. Simply paste the link, choose the quality, and download. On older iOS versions (iOS 12 and below), you may need a browser with file download support, such as 'Documents by Readdle', to download and convert TikTok to MP4."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I use your TikTok downloader without watermark on my Android phone?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes! You can use ReelSave to download TikTok on Android phones via our web-based tool. It is 100% free, fast, mobile-friendly, and requires no registration or app installs."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How to download TikTok video without watermark in HD?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our tool automatically queries the highest quality links available from TikTok. If a Full HD or 4K resolution version of the video exists, you will get links to save the high-quality TikTok video without watermark. You can also download TikTok photos/slideshows."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is TikTok download available in MP4 format?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, ReelSave downloads TikTok videos in high-quality MP4 format. You can also choose the 'Audio track' option if you wish to download the TikTok audio as an MP3 track."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How can I convert TikTok to MP4 using a TikTok downloader app?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "You don't need a dedicated app! Simply copy the video link from TikTok and paste it into ReelSave's watermark remover tool on our site. Our system converts the TikTok to a clean, watermark-free MP4 file and presents a download link in seconds."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I download Instagram reels or videos?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Copy the link of the Instagram Reel, video, or photo from the Instagram app or website (via the three dots or share menu). Paste the link into our analyzer, select your desired resolution, and click 'Download video'."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is there a limit on the number of videos I can download?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, ReelSave provides unlimited downloads for TikTok, Instagram, Facebook, and other supported platforms. You can download as many videos as you want, completely free."
                    }
                  }
                ]
              })
            }}
          />

          {/* Section 1: SEO Rich Content Introduction */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-[#161613] sm:text-4xl">
              Free TikTok & Instagram Video Downloader
            </h2>
            <p className="text-base text-[#5d574c] leading-7 max-w-2xl mx-auto">
              ReelSave is a free, fast, and secure social media video download tool. 
              Save high-definition videos, reels, photos, and audios from popular platforms 
              like TikTok, Instagram, and Facebook in standard MP4 formats. Our service removes 
              the TikTok watermark online so you can enjoy high-speed downloads on any device 
              without any logos, watermarks, or software installations.
            </p>
          </div>

          {/* Section 2: Interactive Tabs for Download Guides */}
          <div className="border border-[#d8cfbd] bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#161613]">
                Step-by-Step Downloader Guides
              </h3>
              <p className="text-sm text-[#696255] mt-1">
                Select a platform below to see how to quickly extract and save videos.
              </p>
            </div>

            {/* Tab selector buttons */}
            <div className="flex border-b border-[#e5ddce] mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("tiktok")}
                className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition ${
                  activeTab === "tiktok"
                    ? "border-[#1f8a70] text-[#1f8a70] focus:outline-none"
                    : "border-transparent text-[#696255] hover:text-[#161613] focus:outline-none"
                }`}
              >
                TikTok Downloader Guide
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("instagram")}
                className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition ${
                  activeTab === "instagram"
                    ? "border-[#1f8a70] text-[#1f8a70] focus:outline-none"
                    : "border-transparent text-[#696255] hover:text-[#161613] focus:outline-none"
                }`}
              >
                Instagram Downloader Guide
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "tiktok" ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#161613] text-white font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-semibold text-[#161613]">Find a TikTok Video</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Open the TikTok app on your mobile device or desktop. Scroll to locate the video 
                      you wish to save and play it to verify the content.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#161613] text-white font-bold text-sm">
                      2
                    </div>
                    <h4 className="font-semibold text-[#161613]">Copy Video URL</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Tap the &apos;Share&apos; arrow button on the right side of the screen, then choose 
                      &apos;Copy link&apos; from the list of options to save it to your clipboard.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1f8a70] text-white font-bold text-sm">
                      3
                    </div>
                    <h4 className="font-semibold text-[#161613]">Paste & Save MP4</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Paste the link into the URL input at the top of this page. Click &apos;Analyze video&apos;, 
                      choose your format/quality, and click &apos;Download video&apos;.
                    </p>
                  </div>
                </div>
                <div className="text-center p-3 bg-[#eefaf5] text-xs text-[#17624f] rounded-lg border border-[#b9dccd] font-medium flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  Perfect solution for post-editing! TikTok download removes watermarks and logos completely.
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#161613] text-white font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-semibold text-[#161613]">Locate Video or Reel</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Open Instagram on your device or browser and browse to the specific Reel, 
                      story, or video that you want to download.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#161613] text-white font-bold text-sm">
                      2
                    </div>
                    <h4 className="font-semibold text-[#161613]">Copy Share Link</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Click the three-dot menu in the upper corner or tap the share arrow, 
                      then click &apos;Copy link&apos; to copy the video URL to your system clipboard.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f6f4ef] border border-[#e5ddce] text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#1f8a70] text-white font-bold text-sm">
                      3
                    </div>
                    <h4 className="font-semibold text-[#161613]">Download Instantly</h4>
                    <p className="text-xs text-[#5d574c] leading-relaxed">
                      Go to the input analyzer above, paste your Instagram link, hit analyze, 
                      select &apos;Best available&apos;, and download the MP4 file in HD quality.
                    </p>
                  </div>
                </div>
                <div className="text-center p-3 bg-[#eefaf5] text-xs text-[#17624f] rounded-lg border border-[#b9dccd] font-medium flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  Download Reels, IGTV videos, stories, and photo slides in seconds.
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Platform specific Guidelines (Mobile vs Desktop) */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-[#d8cfbd] bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f8a70] text-white">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#161613]">Download on Mobile Devices</h3>
              </div>
              <p className="text-sm text-[#5d574c] leading-relaxed">
                To download videos on Android or iPhone, open the target app (TikTok or Instagram) 
                and select the video. Tap &apos;Share&apos; and copy the link. Open your phone&apos;s browser, 
                navigate to ReelSave, paste the link into the URL field, and tap download. 
                Our service automatically removes the logo watermark. iOS users can download directly 
                using Safari in iOS 13+.
              </p>
            </div>

            <div className="border border-[#d8cfbd] bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f8a70] text-white">
                  <Laptop size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#161613]">Download on PC & Desktop</h3>
              </div>
              <p className="text-sm text-[#5d574c] leading-relaxed">
                ReelSave works seamlessly on desktop computers running Windows, macOS, and Linux. 
                Simply copy the target video&apos;s address from the address bar or the sharing menu. 
                Go back to ReelSave website, paste the URL in the search input at the top of the 
                main page, and click &apos;Save&apos;. Desktop users are not required to install any browser extensions 
                or third-party apps.
              </p>
            </div>
          </div>

          {/* Section 4: Premium FAQ Accordion */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 id="faq" className="text-2xl font-bold text-[#161613] sm:text-3xl">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-sm text-[#696255]">
                Find detailed answers to common questions about using our video downloader and watermark remover tool.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Do I have to pay to use the TikTok download without watermark service?",
                  a: "No, our TikTok video download service is completely free! You can use ReelSave to save TikTok videos without watermark on all modern browsers (Chrome, Safari, Firefox, Edge) without paying a single cent."
                },
                {
                  q: "Do I need to install an extension to use the TikTok Downloader?",
                  a: "Absolutely not. To download TikTok videos and remove TikTok watermarks online, all you need is a valid link. Paste it into the input field above, select the appropriate format, and click download. No extension or app installation is required."
                },
                {
                  q: "Where are TikTok videos saved after downloading?",
                  a: "When you save TikTok videos without watermark, they are typically saved to your browser's default download location (usually your device's 'Downloads' folder). You can change the destination folder in your browser settings if preferred."
                },
                {
                  q: "Do I need to have a TikTok account to download TikTok videos?",
                  a: "No, you do not need a TikTok account. You can save TikTok videos without a watermark using just a link. Simply copy the link, paste it into our TikTok watermark remover tool, and click analyze."
                },
                {
                  q: "Can the HD TikTok Downloader save videos from private accounts?",
                  a: "No. Our TikTok downloader without watermark website can neither access private accounts nor save TikTok videos from there. The target account must be public for videos to be analyzed and saved."
                },
                {
                  q: "How do I get a link for TikTok videos?",
                  a: "Open the TikTok app or website and select the video you would like to save. Tap the 'Share' arrow button on the right side of the screen, then select 'Copy Link'. The video URL will be copied to your clipboard."
                },
                {
                  q: "How to save TikTok video in MP4 on iPhone (iOS)?",
                  a: "For iPhone (iOS 13 and above), you can use Safari to run the TikTok video download process directly. Simply paste the link, choose the quality, and download. On older iOS versions (iOS 12 and below), you may need a browser with file download support, such as 'Documents by Readdle', to download and convert TikTok to MP4."
                },
                {
                  q: "Can I use your TikTok downloader without watermark on my Android phone?",
                  a: "Yes! You can use ReelSave to download TikTok on Android phones via our web-based tool. It is 100% free, fast, mobile-friendly, and requires no registration or app installs."
                },
                {
                  q: "How to download TikTok video without watermark in HD?",
                  a: "Our tool automatically queries the highest quality links available from TikTok. If a Full HD or 4K resolution version of the video exists, you will get links to save the high-quality TikTok video without watermark. You can also download TikTok photos/slideshows."
                },
                {
                  q: "Is TikTok download available in MP4 format?",
                  a: "Yes, ReelSave downloads TikTok videos in high-quality MP4 format. You can also choose the 'Audio track' option if you wish to download the TikTok audio as an MP3 track."
                },
                {
                  q: "How can I convert TikTok to MP4 using a TikTok downloader app?",
                  a: "You don't need a dedicated app! Simply copy the video link from TikTok and paste it into ReelSave's watermark remover tool on our site. Our system converts the TikTok to a clean, watermark-free MP4 file and presents a download link in seconds."
                },
                {
                  q: "How do I download Instagram reels or videos?",
                  a: "Copy the link of the Instagram Reel, video, or photo from the Instagram app or website (via the three dots or share menu). Paste the link into our analyzer, select your desired resolution, and click 'Download video'."
                },
                {
                  q: "Is there a limit on the number of videos I can download?",
                  a: "No, ReelSave provides unlimited downloads for TikTok, Instagram, Facebook, and other supported platforms. You can download as many videos as you want, completely free."
                }
              ].map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-[#d8cfbd] bg-white transition-all shadow-sm hover:border-[#1f8a70]/50"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-[#161613] hover:text-[#1f8a70] focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#776f60] transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#1f8a70]" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="border-t border-[#f1eadb] p-5 text-sm leading-6 text-[#5d574c] bg-[#fffaf0]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
