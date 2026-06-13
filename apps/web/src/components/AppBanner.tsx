"use client";

import { ExternalLink, LayoutGrid, FileText, QrCode, Image as ImageIcon } from "lucide-react";

const apps = [
  {
    name: "PDF Reader",
    icon: FileText,
    description: "Fast PDF viewer and editor",
    color: "bg-[#ef4444]",
  },
  {
    name: "QR Scanner",
    icon: QrCode,
    description: "Quick QR code scanner",
    color: "bg-[#8b5cf6]",
  },
  {
    name: "Gallery",
    icon: ImageIcon,
    description: "Photo gallery & organizer",
    color: "bg-[#d946ef]",
  },
];

export default function AppBanner() {
  const handleCheckout = () => {
    // Opens Play Store with Codeora Labs developer account
    window.open("https://play.google.com/store/apps/developer?id=Codeora+Labs", "_blank");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-transparent bg-white px-6 py-6 shadow-sm sm:flex-row sm:flex-wrap sm:justify-between md:gap-8 md:px-10 md:py-8 lg:flex-nowrap lg:px-12 xl:px-14">
        {/* Left Side - Title & Description */}
        <div className="flex flex-1 items-center gap-4 md:gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#4f46e5] md:h-16 md:w-16">
            <LayoutGrid size={24} className="text-white md:h-8 md:w-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold leading-tight text-[#161613] md:text-2xl">
              Explore Our Apps
            </h2>
            <p className="mt-1 hidden text-sm leading-relaxed text-[#5d574c] sm:block">
              Discover more powerful tools from Codeora Labs on the<br />
              Play Store, designed to make your mobile life easier.
            </p>
          </div>
        </div>

        {/* Middle - App Icons */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="group relative flex flex-col items-center justify-center transition-transform hover:scale-105"
                title={app.description}
              >
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${app.color} shadow-sm transition-all md:h-16 md:w-16`}
                >
                  <Icon className="h-7 w-7 text-white md:h-8 md:w-8" aria-hidden="true" />
                </div>
                <span className="mt-2 text-center text-[11px] font-semibold leading-tight text-[#161613] md:text-xs">
                  {app.name.split(' ')[0]}
                  <br />
                  <span>{app.name.split(' ')[1]}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side - CTA Button */}
        <div className="flex flex-shrink-0 items-center justify-center border-l border-[#e5e7eb] pl-4 md:pl-6 lg:pl-8">
          <button
            onClick={handleCheckout}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#161613] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2d2922] active:scale-95 md:gap-3 md:px-8 md:py-4 md:text-base"
          >
            <span>Check Out</span>
            <ExternalLink
              size={18}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
