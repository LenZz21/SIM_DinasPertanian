"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";

type NewsShareButtonsProps = {
  title: string;
};

const buttonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-[#d9edf3] bg-white text-[10px] font-black text-[#17231d] shadow-sm transition hover:bg-[#25576a] hover:text-white";

export function NewsShareButtons({ title }: NewsShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(`${title} ${currentUrl}`);

  const links = useMemo(
    () => [
      {
        label: "WA",
        title: "Bagikan ke WhatsApp",
        href: `https://wa.me/?text=${shareText}`,
      },
      {
        label: "f",
        title: "Bagikan ke Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        label: "x",
        title: "Bagikan ke X",
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      },
      {
        label: "in",
        title: "Bagikan ke LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      },
    ],
    [encodedTitle, encodedUrl, shareText],
  );

  async function handleNativeShare() {
    if (!currentUrl) return;

    if (navigator.share) {
      await navigator.share({ title, url: currentUrl });
      return;
    }

    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      {links.map((item) => (
        <a
          key={item.label}
          href={currentUrl ? item.href : "#"}
          target="_blank"
          rel="noreferrer"
          className={buttonClass}
          aria-label={item.title}
          title={item.title}
        >
          {item.label}
        </a>
      ))}
      <button
        type="button"
        onClick={handleNativeShare}
        className={buttonClass}
        aria-label={copied ? "Link disalin" : "Bagikan atau salin link"}
        title={copied ? "Link disalin" : "Bagikan atau salin link"}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    </>
  );
}
