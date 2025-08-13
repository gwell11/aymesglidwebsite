
"use client";
import React, { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

export default function Mascot({ full = false }: { full?: boolean }) {
  const mascotRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Mascot movement variables
  let x = Math.random() * (window.innerWidth - 120);
  let y = Math.random() * (window.innerHeight - 120);
    let angle = Math.random() * 2 * Math.PI;
  const speed = 1; // slower mascot
    let raf: number;

    const move = () => {
      if (!mascotRef.current) return;
      // Move in the current direction
      x += Math.cos(angle) * speed;
      y += Math.sin(angle) * speed;

      // Bounce off the edges
      if (x < 0) {
        x = 0;
        angle = Math.PI - angle + (Math.random() - 0.5) * 0.5;
      }
      if (x > window.innerWidth - 120) {
        x = window.innerWidth - 120;
        angle = Math.PI - angle + (Math.random() - 0.5) * 0.5;
      }
      if (y < 0) {
        y = 0;
        angle = -angle + (Math.random() - 0.5) * 0.5;
      }
      if (y > window.innerHeight - 120) {
        y = window.innerHeight - 120;
        angle = -angle + (Math.random() - 0.5) * 0.5;
      }

      mascotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(move);
    };
    raf = requestAnimationFrame(move);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={mascotRef}
      style={{ position: "fixed", left: 0, top: 0, zIndex: 50, width: 120, height: 120, cursor: "pointer" }}
      onClick={() => router.push("/secret")}
    >
      <img
        src={full ? "/wineglassFull.png" : "/wineglass.png"}
        alt={full ? "Full Wine Glass Mascot" : "Wine Glass Mascot"}
        width={120}
        height={120}
        style={{ width: 120, height: 120 }}
      />
    </div>
  );
}
