"use client";

import {
  getPostCrisisCountermove,
  type PostCrisisCountermoveOrigin,
  type PostCrisisResponseId,
} from "../lib/post-crisis-countermove";

type PostCrisisCountermovePanelProps = {
  origin: PostCrisisCountermoveOrigin;
  onRespond: (responseId: PostCrisisResponseId) => void;
};

export function PostCrisisCountermovePanel({ origin, onRespond }: PostCrisisCountermovePanelProps) {
  const countermove = getPostCrisisCountermove(origin);

  if (!countermove) return null;

  return (
    <section
      className="rounded-2xl border border-amber-300/30 bg-slate-950/90 p-5 shadow-2xl"
      data-qa="post-crisis-countermove"
      data-countermove-origin={origin}
      aria-labelledby="post-crisis-countermove-title"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
        Rival counter-move
      </p>
      <h2 id="post-crisis-countermove-title" className="mt-2 text-2xl font-semibold text-white">
        {countermove.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{countermove.prompt}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
        {countermove.worldMarker}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {countermove.responses.map((response) => (
          <button
            key={response.id}
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-amber-300/60 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            data-qa="post-crisis-response"
            data-post-crisis-response={response.id}
            onClick={() => onRespond(response.id)}
          >
            <span className="block text-base font-semibold text-white">{response.label}</span>
            <span className="mt-2 block text-sm leading-5 text-slate-300">{response.short}</span>
            <span className="mt-3 block text-xs leading-5 text-amber-200">{response.effect}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
