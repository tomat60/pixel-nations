"use client";

import { useMemo, useState } from "react";
import { canClaimSector, expansionInfluenceCost, getClaimableSectorIds, getEmpireDeclaration, getFrontierIntent, getFrontierObjectiveSecured, getNationDecision, getNationReady, getOwnedSectorIds, type FrontierObjective, type PlayAction, type PlayState, type RetentionRecord } from "../lib/play-state";
import { LANDS_PER_SECTOR, SECTOR_COUNT, WORLD_LANDS } from "../lib/world-engine";
import { buildWorldMapModel, getSectorLandSamples, type SectorKind, type WorldMapSector } from "./world-map-selectors";

type SectorControl = "owned" | "claimable" | "locked";
type InstitutionWorldSignal = { label: string; district: string; mapEffect: string };
type EmpireFoundingConsequence = { id: "order" | "expansion" | "prosperity"; label: string; short: string; worldEffect: string; mandateId: "charter-courts" | "frontier-writs" | "basin-ledgers"; mandateLabel: string; mandateWorldEffect: string };

const kindLabels: Record<SectorKind, string> = {
  origin: "Player origin",
  rival: "Rival realm",
  danger: "High danger",
  trade: "Trade-rich",
  frontier: "Frontier",
};

const kindClasses: Record<SectorKind, string> = {
  origin: "border-amber-200 bg-amber-300/30 text-amber-50 shadow-[0_0_28px_rgba(251,191,36,.35)]",
  rival: "border-slate-100/60 bg-slate-300/18 text-slate-50",
  danger: "border-red-300/60 bg-red-500/16 text-red-50",
  trade: "border-sky-200/60 bg-sky-400/16 text-sky-50",
  frontier: "border-emerald-100/20 bg-emerald-400/10 text-emerald-50",
};

const controlClasses: Record<SectorControl, string> = {
  owned: "ring-2 ring-amber-200 border-amber-100 bg-amber-300/30",
  claimable: "ring-2 ring-lime-200/70 border-lime-200 bg-lime-300/18",
  locked: "opacity-55 saturate-75",
};

function getEmpireFoundingConsequence(empireDeclaration: ReturnType<typeof getEmpireDeclaration>): EmpireFoundingConsequence | null {
  if (!empireDeclaration) return null;
  if (empireDeclaration.id === "frontier-crown") return { id: "expansion", label: "Expansion Mandate", short: "The empire is judged by the next frontier it can hold.", worldEffect: "World priority: extend the border before rivals harden their claims.", mandateId: "frontier-writs", mandateLabel: "Frontier Writs", mandateWorldEffect: "Border claims are now framed as written rights, not only military pressure." };
  if (empireDeclaration.id === "basin-hegemony") return { id: "prosperity", label: "Prosperity Pact", short: "The empire is judged by the wealth it can organize inside the basin.", worldEffect: "World priority: turn held sectors into trade and production corridors.", mandateId: "basin-ledgers", mandateLabel: "Basin Ledgers", mandateWorldEffect: "Held sectors can later attach trade, tax and production signals to this ledger." };
  return { id: "order", label: "Imperial Order", short: "The empire is judged by the stability of its charter.", worldEffect: "World priority: stabilize laws and institutions before the first conflict system.", mandateId: "charter-courts", mandateLabel: "Charter Courts", mandateWorldEffect: "The capital now projects law outward; future disputes and legitimacy can attach here." };
}

function getInstitutionSignals(records: RetentionRecord[]): InstitutionWorldSignal[] {
  return records.slice(0, 3).map((record) => {
    if (record.decisionId === "grain-levy") {
      return record.choiceId === "authority"
        ? { label: "Granary Authority", district: "Granary District", mapEffect: "capital stores marked" }
        : { label: "Commons Stores", district: "Civic Commons", mapEffect: "shared stores marked" };
    }
    if (record.decisionId === "open-roads") {
      return record.choiceId === "authority"
        ? { label: "Border Road Ward", district: "Guard Road", mapEffect: "warded border route" }
        : { label: "Open Market Road", district: "Market Street", mapEffect: "trade route brightened" };
    }
    return record.choiceId === "authority"
      ? { label: "Scribe House", district: "Law Hall", mapEffect: "law seat visible" }
      : { label: "First Foundries", district: "Workshop Row", mapEffect: "workshop smoke visible" };
  });
}

export function WorldMapScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const model = useMemo(() => buildWorldMapModel(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = model.sectors[selectedIndex] ?? model.sectors[0];
  const samples = useMemo(() => getSectorLandSamples(selected.index), [selected.index]);
  const ownedSectorIds = getOwnedSectorIds(state);
  const claimableSectorIds = getClaimableSectorIds(state);
  const institutionSignals = getInstitutionSignals(state.retentionRecords);
  const institutionCount = institutionSignals.length;
  const nationReady = getNationReady(state);
  const nationDecision = getNationDecision(state);
  const nationFounded = Boolean(nationDecision);
  const frontierObjective = getFrontierIntent(state);
  const frontierTargetSectorId = frontierObjective?.targetSectorId ?? null;
  const frontierTargetSector = frontierTargetSectorId ? model.sectors.find((sector) => sector.id === frontierTargetSectorId) ?? null : null;
  const frontierObjectiveComplete = getFrontierObjectiveSecured(state);
  const empireDeclaration = getEmpireDeclaration(state);
  const empireConsequence = getEmpireFoundingConsequence(empireDeclaration);
  const selectedExpansion = canClaimSector(state, selected.id);
  const selectedControl = getSectorControl(selected.id, ownedSectorIds, claimableSectorIds);
  const nextGoal = empireConsequence ? empireConsequence.mandateLabel : empireDeclaration ? empireDeclaration.label : frontierObjectiveComplete && frontierObjective ? `${frontierObjective.target} secured` : frontierObjective ? frontierObjective.target : nationDecision ? nationDecision.label : nationReady ? "Choose founding doctrine" : `${Math.max(0, 3 - ownedSectorIds.length)} more sector${3 - ownedSectorIds.length === 1 ? "" : "s"} to found a nation`;

  return (
    <section data-qa="world-map-scene" data-owned-count={ownedSectorIds.length} data-influence={state.resources.influence} data-nation-ready={nationReady ? "true" : "false"} data-nation-decision={nationDecision?.id ?? "none"} data-nation-founded={nationFounded ? "true" : "false"} data-frontier-intent={frontierObjective?.id ?? "none"} data-frontier-target-sector={frontierTargetSectorId ?? "none"} data-frontier-objective-complete={frontierObjectiveComplete ? "true" : "false"} data-empire-declaration={empireDeclaration?.id ?? "none"} data-empire-consequence={empireConsequence?.id ?? "none"} data-imperial-mandate={empireConsequence?.mandateId ?? "none"} data-retention-count={state.retentionRecords.length} data-institution-count={institutionCount} data-world-lands={WORLD_LANDS} data-sector-count={SECTOR_COUNT} data-lands-per-sector={LANDS_PER_SECTOR} className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,.14),transparent_26%),linear-gradient(180deg,#07111b_0%,#030708_100%)]">
      <div data-qa="world-panel" className="pointer-events-none absolute inset-0" />
      <div data-qa="expansion-hud" className="absolute left-4 right-4 top-[5.7rem] z-10 flex flex-col gap-3 md:left-6 md:right-6 md:top-[6.6rem] lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[720px] rounded-3xl border border-sky-100/18 bg-black/42 p-3 shadow-2xl backdrop-blur-md md:p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">Expansion / Nation Loop v1</p>
          <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">WorldMapScene · 10,000 lands</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">Claim adjacent sectors with Influence. Each strategic sector expands into 100 generated lands, proving the 10,000-land world without rendering every land as a global node.</p>
          {nationDecision ? <p data-qa="nation-world-banner" className="mt-3 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">⚑ Aurelian Nation founded · {nationDecision.label} · {ownedSectorIds.length} sectors</p> : null}
          {frontierObjective ? <p data-qa="world-frontier-objective-banner" data-frontier-intent={frontierObjective.id} data-frontier-target-sector={frontierTargetSectorId ?? "none"} className="mt-2 rounded-2xl border border-orange-200/35 bg-orange-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-100">★ Frontier objective · {frontierObjective.target}{frontierTargetSector ? ` · sector ${frontierTargetSector.id}` : ""}</p> : null}
          {frontierObjectiveComplete && frontierObjective ? <p data-qa="world-frontier-objective-complete" data-frontier-intent={frontierObjective.id} data-frontier-target-sector={frontierTargetSectorId ?? "none"} className="mt-2 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">✓ Objective secured · {frontierObjective.secured}</p> : null}
          {empireDeclaration ? <p data-qa="world-empire-banner" data-empire-declaration={empireDeclaration.id} className="mt-2 rounded-2xl border border-amber-200/45 bg-amber-300/16 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-100">♛ Empire seed · {empireDeclaration.title}</p> : null}
          {empireConsequence ? <p data-qa="world-empire-consequence-banner" data-empire-consequence={empireConsequence.id} className="mt-2 rounded-2xl border border-amber-100/35 bg-amber-100/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-50">◆ Founding consequence · {empireConsequence.label}</p> : null}
          {empireConsequence ? <p data-qa="world-imperial-mandate-banner" data-imperial-mandate={empireConsequence.mandateId} className="mt-2 rounded-2xl border border-amber-50/35 bg-amber-50/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-50">◇ First mandate · {empireConsequence.mandateLabel}</p> : null}
          {institutionCount > 0 ? <p data-qa="world-institution-indicator" data-institution-count={institutionCount} className="mt-2 rounded-2xl border border-purple-200/35 bg-purple-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-purple-100">City institutions visible · {institutionCount}/3 district signal{institutionCount === 1 ? "" : "s"} now mark the capital sector</p> : null}
        </div>
        <div className="grid grid-cols-5 gap-1.5 text-center lg:min-w-[460px]">
          <Metric label="Owned" value={ownedSectorIds.length} />
          <Metric label="Influence" value={state.resources.influence} />
          <Metric label="Cost" value={expansionInfluenceCost} />
          <Metric label="Claimable" value={claimableSectorIds.length} />
          <Metric label="Goal" value={nextGoal} />
        </div>
      </div>

      <div className="absolute bottom-[5.2rem] left-3 right-3 top-[14.8rem] flex flex-col gap-3 overflow-y-auto pb-6 md:bottom-[6.2rem] md:left-6 md:right-6 md:top-[13.8rem] lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:overflow-hidden lg:pb-0">
        <div className="shrink-0 rounded-[2rem] border border-sky-100/16 bg-black/28 p-3 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-sm md:p-4 lg:min-h-0">
          <WorldScaleProof ownedSectorIds={ownedSectorIds} selected={selected} />
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">Generated sectors</p>
            <Legend label="Owned" tone="border-amber-200/80 bg-amber-300/20 text-amber-50" />
            <Legend label="Claimable" tone="border-lime-200/80 bg-lime-300/18 text-lime-50" />
            <Legend label="Locked" tone="border-slate-200/20 bg-slate-300/8 text-slate-100/65" />
            {nationFounded ? <Legend label="Nation" tone="border-emerald-200/80 bg-emerald-300/18 text-emerald-50" /> : null}
            {empireDeclaration ? <Legend label="Empire" tone="border-amber-200/80 bg-amber-300/20 text-amber-50" /> : null}
            {empireConsequence ? <Legend label="Mandate" tone="border-amber-100/80 bg-amber-100/18 text-amber-50" /> : null}
            {frontierObjective ? <Legend label={frontierObjectiveComplete ? "Objective held" : "Objective"} tone={frontierObjectiveComplete ? "border-emerald-200/80 bg-emerald-300/18 text-emerald-50" : "border-orange-200/80 bg-orange-300/18 text-orange-50"} /> : null}
            {institutionCount > 0 ? <Legend label="Institutions" tone="border-purple-200/80 bg-purple-300/18 text-purple-50" /> : null}
          </div>
          <div className="grid h-[380px] grid-cols-10 grid-rows-10 gap-1.5 md:h-[470px] md:gap-2 lg:h-[calc(100%-7.2rem)] lg:min-h-[300px]">
            {model.sectors.map((sector) => (
              <SectorTile key={sector.id} sector={sector} control={getSectorControl(sector.id, ownedSectorIds, claimableSectorIds)} selected={sector.index === selected.index} nationFounded={nationFounded} institutionCount={institutionCount} objectiveTarget={sector.id === frontierTargetSectorId} objectiveComplete={frontierObjectiveComplete} onSelect={() => setSelectedIndex(sector.index)} canClaim={canClaimSector(state, sector.id).ok} />
            ))}
          </div>
        </div>

        <aside data-qa="world-sector-inspect" data-sector-control={selectedControl} className="shrink-0 rounded-[2rem] border border-amber-100/16 bg-black/48 p-3 shadow-2xl backdrop-blur-md md:p-4 lg:min-h-0 lg:overflow-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/60">Sector inspect</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-amber-50">{selected.id}</h3>
              <p className="mt-1 text-sm font-black text-amber-100/80">{selected.name}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${kindClasses[selected.kind]}`}>{kindLabels[selected.kind]}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric label="Biome" value={selected.biome} />
            <Metric label="Danger" value={selected.danger} />
            <Metric label="Trade" value={selected.trade} />
          </div>
          {frontierObjective ? <WorldFrontierObjectiveSignal objective={frontierObjective} targetSector={frontierTargetSector} complete={frontierObjectiveComplete} /> : null}
          <div data-qa="sector-land-scale-card" data-sector-id={selected.id} data-land-count={LANDS_PER_SECTOR} className="mt-3 rounded-2xl border border-sky-200/20 bg-sky-300/8 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/60">100 internal lands</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/62">This selected sector is one tile on the strategic map, but it contains a full 10×10 local land grid: PN-{String(selected.index * LANDS_PER_SECTOR + 1).padStart(5, "0")} → PN-{String((selected.index + 1) * LANDS_PER_SECTOR).padStart(5, "0")}.</p>
            <LocalLandGrid selected={selected} samples={samples} />
          </div>
          <div data-qa="expansion-status" data-expansion-status={selectedExpansion.ok ? "claimable" : selectedExpansion.reason ?? "blocked"} className={`mt-3 rounded-2xl border p-3 ${selectedExpansion.ok ? "border-lime-200/35 bg-lime-300/10" : "border-amber-100/14 bg-amber-100/8"}`}>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/55">Expansion status</p>
            <p className="mt-1 text-sm font-black text-amber-50">{selectedControl === "owned" ? "Inside your borders" : selectedExpansion.ok ? "Adjacent and affordable" : expansionStatusCopy(selectedExpansion.reason)}</p>
            <button data-qa="claim-sector-button" disabled={!selectedExpansion.ok} onClick={() => dispatch({ type: "claimSector", sectorId: selected.id })} className="mt-3 w-full rounded-2xl bg-lime-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35">Claim sector · {expansionInfluenceCost} Influence</button>
          </div>
          {empireDeclaration ? <div data-qa="world-empire-effect" data-empire-declaration={empireDeclaration.id} className="mt-3 rounded-2xl border border-amber-200/40 bg-amber-300/14 p-3"><p className="text-sm font-black text-amber-50">{empireDeclaration.title}</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{empireDeclaration.effect}</p></div> : null}
          {empireConsequence ? <div data-qa="world-empire-consequence" data-empire-consequence={empireConsequence.id} className="mt-3 rounded-2xl border border-amber-100/30 bg-amber-100/10 p-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/60">Empire founding consequence</p><p className="mt-1 text-sm font-black text-amber-50">{empireConsequence.label}</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{empireConsequence.worldEffect}</p></div> : null}
          {empireConsequence ? <div data-qa="world-imperial-mandate" data-imperial-mandate={empireConsequence.mandateId} className="mt-3 rounded-2xl border border-amber-50/30 bg-amber-50/10 p-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/60">First imperial mandate</p><p className="mt-1 text-sm font-black text-amber-50">{empireConsequence.mandateLabel}</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{empireConsequence.mandateWorldEffect}</p></div> : null}
          {nationDecision ? <div data-qa="nation-world-effect" className="mt-3 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 p-3"><p className="text-sm font-black text-amber-50">Aurelian Nation controls the border ring</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{nationDecision.label}: {nationDecision.effect}</p></div> : nationReady ? <div data-qa="nation-affordance" className="mt-3 rounded-2xl border border-amber-200/35 bg-amber-300/12 p-3"><p className="text-sm font-black text-amber-50">Nation threshold reached</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">Three sectors now answer to your council. Open Council to choose the founding doctrine.</p></div> : null}
          {institutionCount > 0 ? <WorldInstitutionSignals signals={institutionSignals} /> : null}
          {state.retentionRecords.length > 0 ? <WorldRetentionEffects state={state} /> : null}
          <p className="mt-3 text-xs leading-relaxed text-amber-50/58">Land samples stay in this drawer while the world map remains visible. Neighbors: {selected.neighbors.join(", ") || "edge"}.</p>
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Generated land samples</p>
          <div className="mt-2 space-y-2">{samples.map((land) => <div key={land.pnid} data-qa="world-land-sample" className="rounded-2xl border border-amber-100/10 bg-amber-100/7 p-2"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-amber-50">{land.name}</p><p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/50">{land.pnid}</p></div><p className="mt-1 text-[11px] text-amber-50/55">{land.role} · {land.faction} · D{land.danger} / F{land.fertility} / T{land.trade} / I{land.influence}</p></div>)}</div>
          <button onClick={() => dispatch({ type: "setView", view: "council" })} className="mt-4 w-full rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
        </aside>
      </div>
    </section>
  );
}

function WorldFrontierObjectiveSignal({ objective, targetSector, complete }: { objective: FrontierObjective; targetSector: WorldMapSector | null; complete: boolean }) {
  return (
    <div data-qa="world-frontier-objective-signal" data-frontier-intent={objective.id} data-frontier-target-sector={targetSector?.id ?? "none"} data-frontier-complete={complete ? "true" : "false"} className={`mt-3 rounded-2xl border p-3 ${complete ? "border-emerald-200/35 bg-emerald-300/12" : "border-orange-200/35 bg-orange-300/12"}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${complete ? "text-emerald-100/65" : "text-orange-100/65"}`}>{complete ? "Secured frontier objective" : "Recorded frontier objective"}</p>
      <p className="mt-1 text-sm font-black text-amber-50">{objective.target}{targetSector ? ` · ${targetSector.id} ${targetSector.name}` : ""}</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{complete ? objective.secured : objective.reason}</p>
    </div>
  );
}

function WorldInstitutionSignals({ signals }: { signals: InstitutionWorldSignal[] }) {
  return (
    <div data-qa="world-institution-signals" data-institution-count={signals.length} className="mt-3 rounded-2xl border border-purple-200/35 bg-purple-300/12 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-100/65">City institutions on map</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">The capital sector now carries visible district signals derived from the first era.</p>
      <div className="mt-2 space-y-1.5">
        {signals.map((signal) => (
          <div key={signal.label} data-qa="world-institution-signal" data-institution-label={signal.label} data-institution-district={signal.district} className="rounded-xl border border-purple-100/16 bg-black/24 px-2 py-1.5 text-[11px] font-bold text-amber-50/72">
            {signal.district}: {signal.mapEffect}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldRetentionEffects({ state }: { state: PlayState }) {
  return (
    <div data-qa="world-retention-effects" className="mt-3 rounded-2xl border border-sky-200/35 bg-sky-300/12 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/65">Season consequences</p>
      <div className="mt-2 space-y-1.5">
        {state.retentionRecords.map((record) => (
          <div key={`${record.decisionId}-${record.choiceId}`} data-qa="world-retention-marker" data-world-marker={record.worldMarker} data-choice-id={record.choiceId} className="rounded-xl border border-sky-100/14 bg-black/24 px-2 py-1.5 text-[11px] font-bold text-amber-50/72">
            Season {record.season}: {record.worldMarker}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldScaleProof({ ownedSectorIds, selected }: { ownedSectorIds: string[]; selected: WorldMapSector }) {
  const controlledLands = ownedSectorIds.length * LANDS_PER_SECTOR;
  return (
    <div data-qa="world-scale-proof" data-world-lands={WORLD_LANDS} data-sector-count={SECTOR_COUNT} data-lands-per-sector={LANDS_PER_SECTOR} data-controlled-lands={controlledLands} className="mb-3 grid gap-2 rounded-3xl border border-sky-200/18 bg-sky-400/8 p-3 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">World scale proof</p>
        <p className="mt-1 text-sm font-black text-amber-50">100 sectors × 100 lands = 10,000 generated lands</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/58">Selected sector {selected.id} is one strategic tile. The drawer shows its local 10×10 land grid while the global map stays playable.</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center md:min-w-[250px]">
        <Metric label="World" value={WORLD_LANDS.toLocaleString("en-US")} />
        <Metric label="Sector" value={LANDS_PER_SECTOR} />
        <Metric label="Held lands" value={controlledLands} />
      </div>
    </div>
  );
}

function LocalLandGrid({ selected, samples }: { selected: WorldMapSector; samples: ReturnType<typeof getSectorLandSamples> }) {
  const sampleIds = new Set(samples.map((land) => land.id));
  const sectorStart = selected.index * LANDS_PER_SECTOR + 1;
  return (
    <div data-qa="sector-local-grid" data-sector-id={selected.id} data-local-grid="10x10" className="mt-3 grid grid-cols-10 gap-1 rounded-2xl border border-sky-100/10 bg-black/30 p-2">
      {Array.from({ length: LANDS_PER_SECTOR }, (_, offset) => {
        const landId = sectorStart + offset;
        const isSample = sampleIds.has(landId);
        const isHomelandCore = selected.index === 0 && offset < 3;
        const isTradeLane = offset % 17 === 0 || offset === 12;
        return (
          <span key={landId} data-qa="sector-local-land" data-land-id={landId} data-land-sample={isSample ? "true" : "false"} title={`PN-${String(landId).padStart(5, "0")}`} className={`aspect-square rounded-[0.28rem] border ${isSample ? "border-amber-100 bg-amber-200 shadow-[0_0_10px_rgba(251,191,36,.35)]" : isHomelandCore ? "border-emerald-100/65 bg-emerald-300/70" : isTradeLane ? "border-sky-100/45 bg-sky-300/42" : "border-white/8 bg-white/12"}`} />
        );
      })}
    </div>
  );
}

function getSectorControl(sectorId: string, owned: string[], claimable: string[]): SectorControl {
  if (owned.includes(sectorId)) return "owned";
  if (claimable.includes(sectorId)) return "claimable";
  return "locked";
}

function expansionStatusCopy(reason?: string) {
  if (reason === "no-homeland") return "Claim a homeland first";
  if (reason === "already-owned") return "Already owned";
  if (reason === "insufficient-influence") return "Need more Influence";
  if (reason === "not-adjacent") return "Locked: not adjacent";
  return "Blocked";
}

function SectorTile({ sector, control, selected, nationFounded, institutionCount, objectiveTarget, objectiveComplete, onSelect, canClaim }: { sector: WorldMapSector; control: SectorControl; selected: boolean; nationFounded: boolean; institutionCount: number; objectiveTarget: boolean; objectiveComplete: boolean; onSelect: () => void; canClaim: boolean }) {
  const foundedOwned = nationFounded && control === "owned";
  const institutionCapital = institutionCount > 0 && sector.isOrigin && control === "owned";
  return <button type="button" data-qa="world-sector-tile" data-sector-id={sector.id} data-sector-x={sector.x} data-sector-y={sector.y} data-sector-kind={sector.kind} data-sector-control={control} data-sector-can-claim={canClaim ? "true" : "false"} data-sector-origin={sector.isOrigin ? "true" : "false"} data-sector-rival={sector.isRival ? "true" : "false"} data-sector-trade={sector.isTradeRich ? "true" : "false"} data-sector-danger={sector.isHighDanger ? "true" : "false"} data-nation-founded-owned={foundedOwned ? "true" : "false"} data-institution-capital={institutionCapital ? "true" : "false"} data-frontier-objective={objectiveTarget ? "true" : "false"} data-frontier-objective-complete={objectiveTarget && objectiveComplete ? "true" : "false"} aria-label={`Inspect sector ${sector.id} ${sector.name}`} onClick={onSelect} className={`relative overflow-hidden rounded-xl border p-1 text-left transition hover:scale-[1.02] hover:border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/80 ${kindClasses[sector.kind]} ${controlClasses[control]} ${selected ? "ring-2 ring-white" : ""} ${foundedOwned ? "outline outline-2 outline-emerald-200/80 shadow-[0_0_24px_rgba(52,211,153,.28)]" : ""} ${institutionCapital ? "after:absolute after:inset-0 after:rounded-xl after:border-2 after:border-purple-200/80 after:shadow-[inset_0_0_18px_rgba(216,180,254,.28)]" : ""} ${objectiveTarget ? objectiveComplete ? "outline outline-2 outline-emerald-200/90 shadow-[0_0_26px_rgba(52,211,153,.34)]" : "outline outline-2 outline-orange-200/90 shadow-[0_0_26px_rgba(251,146,60,.34)]" : ""}`}><span className="block text-[9px] font-black leading-none md:text-xs">{sector.id}</span><span className="mt-0.5 hidden truncate text-[8px] opacity-70 md:block">{sector.biome}</span><span className="absolute bottom-1 right-1 text-[8px] font-black opacity-70">{sector.trade}</span>{control === "claimable" ? <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-lime-200" /> : null}{sector.isHighDanger ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-300" /> : null}{foundedOwned ? <span className="absolute bottom-1 left-1 rounded-full bg-emerald-200 px-1 text-[8px] font-black text-stone-950">⚑</span> : null}{objectiveTarget ? <span data-qa="world-frontier-objective-marker" className={`${objectiveComplete ? "bg-emerald-200" : "bg-orange-200"} absolute left-1 top-1 rounded-full px-1 text-[8px] font-black text-stone-950`}>{objectiveComplete ? "✓" : "★"}</span> : null}{institutionCapital ? <span data-qa="world-institution-capital-marker" className="absolute left-1 top-1 rounded-full bg-purple-200 px-1 text-[8px] font-black text-stone-950">{institutionCount}</span> : null}</button>;
}

function Legend({ label, tone }: { label: string; tone: string }) { return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${tone}`}>{label}</span>; }
function Metric({ label, value }: { label: string | number; value: string | number }) { return <div className="rounded-2xl border border-sky-100/12 bg-black/30 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-200/50">{label}</p><p className="truncate text-xs font-black text-amber-50 md:text-sm">{value}</p></div>; }
