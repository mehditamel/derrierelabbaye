"use client";

import { useId } from "react";
import type { Flavour } from "@/lib/ticket-or/types";
import styles from "./TicketOr.module.css";

export const INSPIRATIONS: Record<
  Flavour,
  { title: string; note: string; colour: string; light: string }
> = {
  agrumes: {
    title: "Éclat d’agrumes",
    note: "Vif, frais, tout en lumière.",
    colour: "#df9a36",
    light: "#ffe0a0",
  },
  fruits: {
    title: "Velours fruité",
    note: "Rond, gourmand, plein de douceur.",
    colour: "#c96579",
    light: "#ffbdc4",
  },
  herbes: {
    title: "Jardin de nuit",
    note: "Végétal, parfumé, singulier.",
    colour: "#8da571",
    light: "#d9e8b6",
  },
};

export function CocktailPreview({ flavour, alcohol }: { flavour: Flavour; alcohol: boolean }) {
  const id = useId();
  const inspiration = INSPIRATIONS[flavour];
  return (
    <figure className={styles.cocktailPreview} data-flavour={flavour}>
      <div className={styles.cocktailStage} aria-hidden="true">
        <svg viewBox="0 0 260 250" focusable="false">
          <defs>
            <linearGradient id={id + "-glass"} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#fff5da" stopOpacity=".24" />
              <stop offset=".42" stopColor="#fff5da" stopOpacity=".025" />
              <stop offset="1" stopColor="#fff5da" stopOpacity=".18" />
            </linearGradient>
            <linearGradient id={id + "-drink"} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={inspiration.light} stopOpacity=".95" />
              <stop offset="1" stopColor={inspiration.colour} stopOpacity=".7" />
            </linearGradient>
            <radialGradient id={id + "-glow"}>
              <stop stopColor={inspiration.colour} stopOpacity=".23" />
              <stop offset="1" stopColor={inspiration.colour} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="130" cy="133" rx="125" ry="115" fill={`url(#${id}-glow)`} />
          <circle cx="130" cy="115" r="89" fill="none" stroke="#d0b478" strokeOpacity=".16" />
          <path d="M130 17v8M130 205v8M32 115h8M220 115h8" stroke="#d0b478" strokeOpacity=".55" />
          <ellipse cx="130" cy="225" rx="62" ry="7" fill="#000" opacity=".25" />
          <path
            d="M125 157h10v55q0 4 23 7q10 4-28 5q-38-1-28-5q23-3 23-7z"
            fill={`url(#${id}-glass)`}
            stroke="#ecdbb8"
            strokeOpacity=".55"
          />
          <path
            d="M52 84Q56 153 130 159Q204 153 208 84Z"
            fill={`url(#${id}-glass)`}
            stroke="#f4e3bd"
            strokeOpacity=".65"
          />
          <g key={flavour} className={styles.drinkReveal}>
            <path d="M62 105Q79 150 130 153Q181 150 198 105Z" fill={`url(#${id}-drink)`} />
            <ellipse cx="130" cy="105" rx="68" ry="12" fill={inspiration.light} fillOpacity=".78" />
            <ellipse cx="130" cy="105" rx="59" ry="8" fill={inspiration.colour} fillOpacity=".2" />
            {flavour === "agrumes" && (
              <g transform="rotate(24 188 84)">
                <circle cx="188" cy="84" r="26" fill="#e9b254" stroke="#ffdf9a" strokeWidth="3" />
                <circle cx="188" cy="84" r="21" fill="#f2c974" stroke="#fff0c6" />
                <path
                  d="M188 63v42M167 84h42M173 69l30 30M173 99l30-30"
                  stroke="#fff0c6"
                  strokeWidth="1.5"
                />
              </g>
            )}
            {flavour === "fruits" && (
              <g>
                <path d="M72 90l124-20" stroke="#e4cc9e" strokeWidth="2" strokeLinecap="round" />
                <circle cx="175" cy="80" r="12" fill="#b94d67" stroke="#f3a7b4" />
                <circle cx="195" cy="77" r="10" fill="#ae455f" stroke="#f3a7b4" />
                <path
                  d="M176 68q3-16 14-21M195 67q0-12-5-20"
                  fill="none"
                  stroke="#b6bd80"
                  strokeWidth="2"
                />
                <circle cx="172" cy="77" r="2.5" fill="#ffd0d6" fillOpacity=".7" />
              </g>
            )}
            {flavour === "herbes" && (
              <g stroke="#c6d6a6" strokeWidth="1">
                <path d="M168 105q8-33 26-60" fill="none" strokeWidth="2" />
                <path
                  d="M181 77q-26-4-19-24q24 4 19 24M186 66q-1-24 19-25q3 19-19 25M174 91q-25 0-23-18q21-1 23 18M180 81q22 4 27-14q-21-6-27 14"
                  fill="#91a975"
                />
              </g>
            )}
            <g fill="#fff0ce" fillOpacity=".5">
              <circle cx="106" cy="122" r="2" />
              <circle cx="147" cy="133" r="1.5" />
              <circle cx="159" cy="116" r="2" />
            </g>
          </g>
          <ellipse
            cx="130"
            cy="84"
            rx="78"
            ry="15"
            fill="none"
            stroke="#f6e8ca"
            strokeOpacity=".65"
          />
          <path
            d="M63 92q6 35 37 48"
            fill="none"
            stroke="#fff5dd"
            strokeOpacity=".5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M45 46v10m-5-5h10M217 159v8m-4-4h8" stroke="#d0b478" strokeOpacity=".65" />
        </svg>
      </div>
      <figcaption>
        <span className={styles.creationLabel}>L’inspiration du moment</span>
        <h3>{inspiration.title}</h3>
        <p>{inspiration.note}</p>
        <span className={styles.creationVersion}>
          {alcohol ? "Avec alcool · 18+" : "Sans alcool"}
        </span>
      </figcaption>
    </figure>
  );
}
