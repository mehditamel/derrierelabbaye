"use client";
import { useEffect, useRef } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import styles from "./TicketOr.module.css";

export function ScratchTicket({ onReveal }: { onReveal: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const revealed = useRef(false);
  const visited = useRef(new Set<number>());
  const previous = useRef<{ x: number; y: number } | null>(null);
  const finish = () => {
    if (!revealed.current) {
      revealed.current = true;
      onReveal();
    }
  };

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const paint = () => {
      const { width, height } = el.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      el.width = width * scale;
      el.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const gold = ctx.createLinearGradient(0, 0, width, height);
      gold.addColorStop(0, "#b18a49");
      gold.addColorStop(0.3, "#f0da9e");
      gold.addColorStop(0.52, "#c9a45f");
      gold.addColorStop(0.75, "#ead197");
      gold.addColorStop(1, "#a78342");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gold;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(71,49,18,.10)";
      ctx.lineWidth = 0.5;
      for (let i = -height; i < width; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(71,49,18,.45)";
      ctx.strokeRect(13, 13, width - 26, height - 26);
      ctx.textAlign = "center";
      ctx.fillStyle = "#392911";
      ctx.font = "12px Georgia";
      ctx.fillText("D E R R I È R E   L ’ A B B A Y E", width / 2, height / 2 - 30);
      ctx.font = "italic 44px Georgia";
      ctx.fillText("À vous de jouer.", width / 2, height / 2 + 22);
      ctx.font = "11px Arial";
      ctx.fillText("G R A T T E Z   L A   S U R F A C E", width / 2, height / 2 + 55);
      visited.current.clear();
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    const el = event.currentTarget;
    if (!el.hasPointerCapture(event.pointerId)) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left,
      y = event.clientY - rect.top;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 46;
    ctx.lineCap = "round";
    const start = previous.current ?? { x, y };
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    const steps = Math.max(1, Math.ceil(Math.hypot(x - start.x, y - start.y) / 10));
    for (let i = 0; i <= steps; i++) {
      const px = start.x + ((x - start.x) * i) / steps,
        py = start.y + ((y - start.y) * i) / steps;
      for (let row = 0; row < 12; row++)
        for (let col = 0; col < 24; col++)
          if (
            Math.hypot(
              ((col + 0.5) * rect.width) / 24 - px,
              ((row + 0.5) * rect.height) / 12 - py
            ) < 26
          )
            visited.current.add(row * 24 + col);
    }
    previous.current = { x, y };
    if (visited.current.size / 288 > 0.35) finish();
  }

  return (
    <div className={styles.scratchWrap}>
      <div className={styles.scratchSurface}>
        <div className={styles.scratchUnder} aria-hidden="true">
          <Sparkles size={40} strokeWidth={1} />
          <span>Le secret se dévoile…</span>
        </div>
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={styles.scratchCanvas}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            previous.current = null;
            scratch(event);
          }}
          onPointerMove={scratch}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            previous.current = null;
          }}
          onPointerCancel={() => {
            previous.current = null;
          }}
        />
      </div>
      <p className={styles.hint}>
        Effleurez l’or du bout du doigt, ou révélez votre ticket d’un clic.
      </p>
      <button className={styles.textButton} type="button" onClick={finish}>
        Révéler mon ticket <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
