"use client";

import { ExternalLink, FileText, QrCode, Image as ImageIcon, Play } from "lucide-react";

const apps = [
  {
    name: "PDF Reader",
    icon: FileText,
    description: "Fast PDF viewer and editor",
    color: "bg-red-500",
  },
  {
    name: "QR Scanner",
    icon: QrCode,
    description: "Quick QR code scanner",
    color: "bg-blue-500",
  },
  {
    name: "Gallery",
    icon: ImageIcon,
    description: "Photo gallery & organizer",
    color: "bg-purple-500",
  },
];

export default function AppBanner() {
  const handleCheckout = () => {
    // Opens Play Store with Codeora Labs developer account
    window.open("https://play.google.com/store/apps/developer?id=Codeora+Labs", "_blank");
  };

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between gap-4 rounded-2xl border border-[#d8cfbd] bg-white px-6 py-4 shadow-md md:gap-6 md:px-10 md:py-5 lg:px-14">
        {/* Left Side - Title & Description */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1f8a70] md:h-14 md:w-14">
            <Play size={16} className="text-white md:h-5 md:w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold leading-tight text-[#161613] md:text-xl lg:text-2xl">
              Explore Our Apps
            </h2>
            <p className="mt-0.5 hidden text-xs leading-tight text-[#5d574c] sm:block md:text-sm">
              Discover more powerful tools from Codeora Labs on the Play Store
            </p>
          </div>
        </div>

        {/* Middle - App Icons */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="group relative flex flex-col items-center justify-center transition-transform hover:scale-110"
                title={app.description}
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${app.color} shadow-md transition-all group-hover:shadow-lg md:h-14 md:w-14`}
                >
                  <Icon className="h-6 w-6 text-white md:h-7 md:w-7" aria-hidden="true" />
                </div>
                <span className="mt-1 text-[10px] font-medium leading-tight text-[#3f392f] md:text-xs">
                  {app.name.split(' ')[0]}
                  <br className="hidden md:block" />
                  <span className="hidden md:inline">{app.name.split(' ')[1]}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side - CTA Button */}
        <div className="flex flex-shrink-0 flex-col items-center justify-center">
          <button
            onClick={handleCheckout}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#161613] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2d2922] hover:shadow-lg active:scale-95 md:gap-3 md:px-6 md:py-3.5 md:text-base"
          >
            <span>Check Out</span>
            <ExternalLink
              size={16}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
          <p className="mt-1 text-center text-[10px] leading-tight text-[#696255] md:text-xs">
            Visit Play Store
          </p>
        </div>
      </div>
    </div>
  );
}
