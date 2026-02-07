"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";

interface WalkingBidoofProps {
  src: string;
  alt: string;
  index: number;
}

export const WalkingBidoof = ({ src, alt, index }: WalkingBidoofProps) => {
  const [position, setPosition] = useState({
    x: Math.random() * 70 + 10, // Start between 10% and 80% of screen width
    y: Math.random() * 70 + 10, // Start between 10% and 80% of screen height
  });
  
  const [velocity, setVelocity] = useState({
    x: (Math.random() - 0.5) * 0.5, // Random velocity between -0.25 and 0.25
    y: (Math.random() - 0.5) * 0.5,
  });

  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        // Bounce off edges and change direction randomly
        if (newX <= 0 || newX >= 90) {
          newVelocityX = -newVelocityX * (0.8 + Math.random() * 0.4);
          newX = Math.max(0, Math.min(90, newX));
          setDirection(newVelocityX > 0 ? "right" : "left");
        }
        if (newY <= 0 || newY >= 90) {
          newVelocityY = -newVelocityY * (0.8 + Math.random() * 0.4);
          newY = Math.max(0, Math.min(90, newY));
        }

        // Randomly change direction occasionally
        if (Math.random() < 0.02) {
          newVelocityX = (Math.random() - 0.5) * 0.8;
          newVelocityY = (Math.random() - 0.5) * 0.8;
          setDirection(newVelocityX > 0 ? "right" : "left");
        }

        if (newVelocityX !== velocity.x || newVelocityY !== velocity.y) {
          setVelocity({ x: newVelocityX, y: newVelocityY });
        }

        return { x: newX, y: newY };
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <img
      src={src}
      alt={alt}
      style={{
        position: "fixed",
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: "120px",
        height: "120px",
        objectFit: "contain",
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        transition: "transform 0.3s ease",
        zIndex: 10 + index,
        pointerEvents: "none",
        imageRendering: "pixelated",
      }}
    />
  );
};

