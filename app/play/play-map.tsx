import { parcels, terrainFill } from "./play-data";
import type { Phase, PlayAction, PlayState } from "./play-state";

type MapStageProps = {
  state: PlayState;
  phase: Phase;
  capitalId?: string;
  dispatch: (action: PlayAction) => void;
};

export function PlayMapStage({ state, phase, capitalId, dispatch }: MapStageProps) {
  const capital = parcels.find((parcel) => parcel.id === capitalId) ?? null;

  return (
    <svg viewBox="0 0 1000 760" className="absolute inset-0 h-full w-full" role="img" aria-label="Aurelian Basin 30 parcel strategy map">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.42" />
        </filter>
        <linearGradient id="sea" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#16374a" />
          <stop offset="100%" stopColor="#0d5868" />
        </linearGradient>
      </defs>
      <rect width="1000" height="760" fill="url(#sea)" />
      <path d="M0 530 C 110 468 190 520 276 489 C 408 441 520 472 620 438 C 776 385 862 444 1000 374 L1000 760 L0 760 Z" fill="#0b5264" opacity="0.78" />
      <path d="M86 210 C 167 70 322 43 482 64 C 628 83 777 123 898 267 C 1017 409 931 632 802 716 C 673 799 411 755 256 731 C 101 707 25 591 39 451 C 48 356 48 276 86 210 Z" fill="#a78a4d" filter="url(#softShadow)" opacity="0.48" />

      {parcels.map((parcel) => {
        const active = parcel.id === state.selectedId;
        const isOwned = state.owned.includes(parcel.id);
        const isScouted = state.scouted.includes(parcel.id) || isOwned || parcel.starter;
        return (
          <g key={parcel.id} data-qa={`parcel-${parcel.id}`} onClick={() => dispatch({ type: "select", parcelId: parcel.id })} className="cursor-pointer">
            <path d={parcel.d} fill={terrainFill[parcel.terrain]} opacity={isScouted ? 0.92 : 0.46} stroke={active ? "#fff2ad" : "#382a1a"} strokeWidth={active ? 6 : 2.3} />
            {parcel.rival && <path d={parcel.d} fill="#5f6670" opacity="0.28" stroke="#cbd5e1" strokeWidth="2" />}
            {parcel.starter && phase === "unclaimed" && <circle cx={parcel.cx} cy={parcel.cy} r="36" fill="none" stroke="#ffe39a" strokeWidth="5" opacity="0.6" />}
            {isOwned && <path d={parcel.d} fill="#f8d36d" opacity="0.20" stroke="#ffe39a" strokeWidth="6" />}
            {capital?.id === parcel.id && (
              <>
                <circle cx={parcel.cx} cy={parcel.cy} r={state.influenceRadius} fill="#f8d36d" opacity="0.13" stroke="#ffe39a" strokeWidth="4" />
                <DevelopmentMarker x={parcel.cx} y={parcel.cy - 18} level={state.developmentLevel} />
              </>
            )}
            {parcel.rival && <RivalBanner x={parcel.cx} y={parcel.cy - 22} />}
            {isScouted && (
              <text x={parcel.cx} y={parcel.cy + 24} textAnchor="middle" fontSize="16" fontWeight="800" fill="#24180d" stroke="#f7ead2" strokeWidth="3" paintOrder="stroke">
                {parcel.name}
              </text>
            )}
          </g>
        );
      })}

      <path d="M470 78 C 438 170 520 244 487 344 C 461 433 397 512 430 724" fill="none" stroke="#65d8ff" strokeWidth="18" strokeLinecap="round" opacity="0.58" />
      <path d="M506 81 C 478 177 548 244 526 350 C 501 464 438 536 468 724" fill="none" stroke="#d4f8ff" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
      <path d="M138 444 C 302 399 520 408 866 612" fill="none" stroke="#3b2d1d" strokeWidth="8" strokeDasharray="14 16" opacity={phase === "unclaimed" ? 0.22 : 0.54} />
      {state.tradeRoute && capital && <path d={`M${capital.cx} ${capital.cy} C 530 420 650 466 866 612`} fill="none" stroke="#ffe39a" strokeWidth="7" strokeDasharray="18 12" opacity="0.88" />}
      <path d="M598 145 L632 75 L672 162 L704 100 L754 216 Z" fill="#6b5d4f" />
      <path d="M608 141 L632 75 L657 141 Z M690 148 L704 100 L732 198 Z" fill="#f8eed9" opacity="0.78" />
      <path d="M212 275 q33 -62 76 0 q-42 -22 -76 0Z M248 323 q36 -72 86 0 q-44 -26 -86 0Z M168 366 q41 -80 94 0 q-48 -28 -94 0Z" fill="#1f6b42" opacity="0.9" />
    </svg>
  );
}

function DevelopmentMarker({ x, y, level }: { x: number; y: number; level: number }) {
  const symbols = ["⚑", "⛺", "⌂", "▣", "♜", "♛"];
  return (
    <g data-qa={`dev-marker-level-${level}`} transform={`translate(${x} ${y})`}>
      <circle r="22" fill="#f8d36d" stroke="#fff6c7" strokeWidth="4" />
      <text y="8" textAnchor="middle" fontSize="25" fontWeight="900" fill="#24180d">{symbols[level]}</text>
    </g>
  );
}

function RivalBanner({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -22 L0 18" stroke="#cbd5e1" strokeWidth="4" />
      <path d="M0 -22 L28 -14 L0 -6 Z" fill="#94a3b8" />
    </g>
  );
}
