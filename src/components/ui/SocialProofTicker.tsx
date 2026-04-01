"use client";
import { useEffect, useState } from "react";

const proofs = [
  "Rahul from Delhi just enquired about this",
  "Priya from Mumbai is viewing this product",
  "Arjun from Bangalore ordered 2 hours ago",
  "Sneha from Chennai just added this to wishlist",
  "Vikram from Hyderabad enquired 30 mins ago",
];

export default function SocialProofTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % proofs.length);
        setVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-hidden h-5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
      <p
        className="text-[10px] text-white/50 uppercase tracking-[0.08em] transition-opacity duration-300 whitespace-nowrap"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {proofs[index]}
      </p>
    </div>
  );
}
