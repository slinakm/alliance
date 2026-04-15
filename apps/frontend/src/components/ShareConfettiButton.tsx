import { cn } from "@alliance/shared/styles/util";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ConfettiPiece = {
  id: string;
  color: string;
  dx: number;
  dy: number;
  rotation: number;
  delay: number;
  size: number;
  shape: "circle" | "bar";
};

type ConfettiBurst = {
  id: number;
  pieces: ConfettiPiece[];
};

export interface ShareConfettiButtonProps {
  onClick: () => void;
  label: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

const CONFETTI_COLORS = [
  "#22c55e",
  "#fb7185",
  "#f59e0b",
  "#38bdf8",
  "#a78bfa",
  "#f97316",
] as const;

const BURST_LIFETIME_MS = 900;

function createConfettiPieces(seed: number): ConfettiPiece[] {
  return Array.from({ length: 14 }, (_, index) => {
    const angle = (-100 + index * 15 + seed * 11) * (Math.PI / 180);
    const distance = 22 + ((index + seed) % 4) * 7;
    const verticalLift = 12 + ((index * 3 + seed) % 18);
    return {
      id: `${seed}-${index}`,
      color: CONFETTI_COLORS[(index + seed) % CONFETTI_COLORS.length],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - verticalLift,
      rotation: -180 + ((index * 47 + seed * 29) % 360),
      delay: index % 2 === 0 ? 0 : 40,
      size: 5 + ((index + seed) % 4),
      shape: index % 3 === 0 ? "circle" : "bar",
    };
  });
}

const confettiStyles = `
@keyframes share-confetti-pop {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.35) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform:
      translate3d(var(--confetti-x), var(--confetti-y), 0)
      scale(1)
      rotate(var(--confetti-rotate));
  }
}
`;

export default function ShareConfettiButton({
  onClick,
  label,
  icon: Icon,
  className,
  iconClassName,
  labelClassName,
}: ShareConfettiButtonProps) {
  const burstIdRef = useRef(0);
  const [bursts, setBursts] = useState<ConfettiBurst[]>([]);

  useEffect(() => {
    if (bursts.length === 0) {
      return;
    }

    const cleanup = window.setTimeout(() => {
      setBursts((current) => current.slice(1));
    }, BURST_LIFETIME_MS);

    return () => window.clearTimeout(cleanup);
  }, [bursts]);

  const handleClick = () => {
    onClick();

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    burstIdRef.current += 1;
    const burstId = burstIdRef.current;
    const burst = { id: burstId, pieces: createConfettiPieces(burstId) };
    setBursts((current) => [...current.slice(-1), burst]);
  };

  return (
    <>
      <style>{confettiStyles}</style>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative isolate overflow-visible",
          "flex items-center gap-x-1 transition-colors",
          className,
        )}
      >
        <span className="pointer-events-none absolute inset-0 overflow-visible">
          {bursts.map((burst) =>
            burst.pieces.map((piece) => (
              <span
                key={`${burst.id}-${piece.id}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  animationName: "share-confetti-pop",
                  animationDuration: "700ms",
                  animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                  animationFillMode: "forwards",
                  animationDelay: `${piece.delay}ms`,
                  backgroundColor: piece.color,
                  borderRadius: piece.shape === "circle" ? "9999px" : "2px",
                  height: piece.shape === "circle" ? `${piece.size}px` : "4px",
                  width: piece.shape === "circle" ? `${piece.size}px` : `${piece.size + 3}px`,
                  marginLeft:
                    piece.shape === "circle"
                      ? `${piece.size / -2}px`
                      : `${(piece.size + 3) / -2}px`,
                  marginTop:
                    piece.shape === "circle" ? `${piece.size / -2}px` : "-2px",
                  ["--confetti-x" as string]: `${piece.dx}px`,
                  ["--confetti-y" as string]: `${piece.dy}px`,
                  ["--confetti-rotate" as string]: `${piece.rotation}deg`,
                }}
              />
            )),
          )}
        </span>
        <Icon className={iconClassName} />
        <span className={labelClassName}>{label}</span>
      </button>
    </>
  );
}
