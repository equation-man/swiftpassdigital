"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, MessageCircle, Link2, Share2 } from "lucide-react";

export default function ShareButton({ title, shareUrl, message }) {
  const [showFallback, setShowFallback] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: message || `Check this out: ${title}`,
          url: shareUrl,
        });
        console.log("Shared successfully!");
      } catch (err) {
        console.warn("Share cancelled or failed:", err);
      }
    } else {
      setShowFallback(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch {
      alert("Failed to copy link.");
    }
  };

  const encodedURL = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(message || `Check this out: ${title}`);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedURL}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`,
    linkedin: `https://www.linkedin.com/shareArticle?url=${encodedURL}&title=${encodedText}`,
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1 rounded-md transition-all"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showFallback && (
        <div className="flex items-center gap-3 mt-2">
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 text-green-600 hover:scale-110 transition" />
          </a>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
            <Twitter className="w-5 h-5 text-sky-500 hover:scale-110 transition" />
          </a>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
            <Facebook className="w-5 h-5 text-blue-600 hover:scale-110 transition" />
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-5 h-5 text-blue-800 hover:scale-110 transition" />
          </a>

          <button onClick={handleCopy} title="Copy link">
            <Link2 className="w-5 h-5 text-gray-600 hover:scale-110 transition" />
          </button>
        </div>
      )}
    </div>
  );
}

