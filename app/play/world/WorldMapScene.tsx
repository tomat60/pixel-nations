"use client";

import { useMemo, useState } from "react";
import {
  canClaimSector,
  expansionInfluenceCost,
  getBorderHostStandoff,
  getClaimableSectorIds,
  getConflictEscalation,
  getConflictEscalationDecision,
  getCourtCaseDecision,
  getEmpireDeclaration,
  getFrontierIntent,
  getFrontierObjectiveSecured,
  getImperialCourtCase,
  getImperialTurnNumber,
  getLatestImperialTurnAction,
  getNationDecision,
  getNationReady,
  getObsidianPressureState,
  getOwnedSectorIds,
  getPostCrisisFrontierPayoffTarget,
  getRivalPressure,
  getRivalResponse,
  getRivalResponseDecision,
  getStandoffDecision,
  getStrategicPosture,
  type FrontierObjective,
  type PlayAction,
  type PlayState,
  type RetentionRecord,
} from "../lib/play-state";
import { LANDS_PER_SECTOR, SECTOR_COUNT, WORLD_LANDS } from "../lib/world-engine";
import { buildWorldMapModel, getSectorLandSamples, type SectorKind, type WorldMapSector } from "./world-map-selectors";
import { WorldTerrainRegion } from "./WorldTerrainRegion";

type SectorControl = "owned" | "claimable" | "locked";
type InstitutionWorldSignal = { label: string; district: string; mapEffect: string };
type EmpireFoundingConsequence = { id: "order" | "expansion" | "prosperity"; label: string; worldEffect: string; mandateId: "charter-courts" | "frontier-writs" | "basin-ledgers"; mandateLabel: string; mandateWorldEffect: string };

const kindLabels: Record<SectorKind, string> = { origin: "Player origin", rival: "Rival realm", danger: "High danger", trade: "Trade-rich", frontier: "Frontier" };
const kindClasses: Record<SectorKind, string> = { origin: "border-amber-200 bg-amber-300/30 text-amber-50", rival: "border-slate-100/60 bg-slate-300/18 text-slate-50", danger: "border-red-300/60 bg-red-500/16 text-red-50", trade: "border-sky-200/60 bg-sky-400/16 text-sky-50", frontier: "border-emerald-100/20 bg-emerald-400/10 text-emerald-50" };
const controlClasses: Record<SectorControl, string> = { owned: "ring-2 ring-amber-200 border-amber-100 bg-amber-300/30", claimable: "ring-2 ring-lime-200/70 border-lime-200 bg-lime-300/18", locked: "opacity-55 saturate-75" };

function getEmpireFoundingConsequence(empireDeclaration: ReturnType<typeof getEmpireDeclaration>): EmpireFoundingConsequence | null {
  if (!empireDeclaration) return null;
  if (empireDeclaration.id === "frontier-crown") return { id: "expansion", label: "Expansion Mandate", worldEffect: "World priority: extend the border before rival claims harden.", mandateId: "frontier-writs", mandateLabel: "Frontier Writs", mandateWorldEffect: "Border claims are now framed as written rights." };
  if (empireDeclaration.id === "basin-hegemony") return { id: "prosperity", label: "Prosperity Pact", worldEffect: "World priority: organize trade and production corridors.", mandateId: "basin-ledgers", mandateLabel: "Basin Ledgers", mandateWorldEffect: "Held sectors can later attach trade and production signals." };
  return { id: "order", label: "Imperial Order", worldEffect: "World priority: stabilize laws and institutions.", mandateId: "charter-courts", mandateLabel: "Charter Courts", mandateWorldEffect: "The capital projects law outward." };
}

function getInstitutionSignals(records: RetentionRecord[]): InstitutionWorldSignal[] {
  return records.slice(0, 3).map((record) => {
    if (record.decisionId === "grain-levy") return record.choiceId === "authority" ? { label: "Granary Authority", district: "Granary District", mapEffect: "capital stores marked" } : { label: "Commons Stores", district: "Civic Commons", mapEffect: "shared stores marked" };
    if (record.decisionId === "open-roads") return record.choiceId === "authority" ? { label: "Border Road Ward", district: "Guard Road", mapEffect: "warded border route" } : { label: "Open Market Road", district: "Market Street", mapEffect: "trade route brightened" };
    return record.choiceId === "authority" ? { label: "Scribe House", district: "Law Hall", mapEffect: "law seat visible" } : { label: "First Foundries", district: "Workshop Row", mapEffect: "workshop smoke visible" };
  });
}

export function WorldMapScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const model = useMemo(() => buildWorldMapModel(), []);
  const regionalSectors = useMemo(() => model.sectors.filter((sector) => sector.x < 5 && sector.y < 5), [model]);
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
  const courtCase = getImperialCourtCase(state);
  const courtDecision = getCourtCaseDecision(state);
  const rivalResponse = getRivalResponse(state);
  const rivalResponseDecision = getRivalResponseDecision(state);
  const conflictEscalation = getConflictEscalation(state);
  const conflictEscalationDecision = getConflictEscalationDecision(state);
  const standoff = getBorderHostStandoff(state);
  const standoffDecision = getStandoffDecision(state);
  const strategicPosture = getStrategicPosture(state);
  const imperialTurnNumber = getImperialTurnNumber(state);
  const latestImperialAction = getLatestImperialTurnAction(state);
  const obsidianPressure = getObsidianPressureState(state);
  const pressure = getRivalPressure(state);
  const selectedExpansion = canClaimSector(state, selected.id);
  const postCrisisFrontierPayoffTarget = getPostCrisisFrontierPayoffTarget(state);
  const postCrisisFrontierPayoffSecured = state.postCrisisFrontierPayoffSecured;
  const selectedControl = getSectorControl(selected.id, ownedSectorIds, claimableSectorIds);
  const nextGoal = latestImperialAction
    ? latestImperialAction.label
    : strategicPosture && standoffDecision
      ? imperialTurnNumber >= 3 ? "Imperial cycle complete" : `Imperial Turn ${imperialTurnNumber + 1}/3`
      : standoffDecision
        ? standoffDecision.label
        : standoff
          ? standoff.title
          : conflictEscalationDecision
            ? conflictEscalationDecision.label
            : conflictEscalation
              ? conflictEscalation.title
              : rivalResponseDecision
                ? rivalResponseDecision.label
                : rivalResponse
                  ? rivalResponse.title
                  : courtDecision
                    ? courtDecision.label
                    : courtCase
                      ? courtCase.title
                      : empireConsequence
                        ? empireConsequence.mandateLabel
                        : empireDeclaration
                          ? empireDeclaration.label
                          : frontierObjectiveComplete && frontierObjective
                            ? `${frontierObjective.target} secured`
                            : frontierObjective
                              ? frontierObjective.target
                              : nationDecision
                                ? nationDecision.label
                                : nationReady
                                  ? "Choose founding doctrine"
                                  : `${Math.max(0, 3 - ownedSectorIds.length)} more sectors to found a nation`;

  return (
    <section
      data-qa="world-map-scene"
      data-owned-count={ownedSectorIds.length}
      data-influence={state.resources.influence}
      data-nation-ready={nationReady ? "true" : "false"}
      data-nation-decision={nationDecision?.id ?? "none"}
      data-nation-founded={nationFounded ? "true" : "false"}
      data-frontier-intent={frontierObjective?.id ?? "none"}
      data-frontier-target-sector={frontierTargetSectorId ?? "none"}
      data-frontier-objective-complete={frontierObjectiveComplete ? "true" : "false"}
      data-empire-declaration={empireDeclaration?.id ?? "none"}
      data-empire-consequence={empireConsequence?.id ?? "none"}
      data-imperial-mandate={empireConsequence?.mandateId ?? "none"}
      data-court-case={courtCase?.id ?? "none"}
      data-court-case-decision={state.courtCaseDecisionId ?? "none"}
      data-rival-response={rivalResponse?.id ?? "none"}
      data-rival-response-decision={state.rivalResponseDecisionId ?? "none"}
      data-conflict-escalation={conflictEscalation?.id ?? "none"}
      data-conflict-escalation-decision={state.conflictEscalationDecisionId ?? "none"}
      data-standoff={standoff?.id ?? "none"}
      data-standoff-decision={state.standoffDecisionId ?? "none"}
      data-strategic-posture={strategicPosture?.postureId ?? "none"}
      data-imperial-turn={imperialTurnNumber}
      data-obsidian-pressure={obsidianPressure}
      data-retention-count={state.retentionRecords.length}
      data-institution-count={institutionCount}
      data-world-lands={WORLD_LANDS}
      data-sector-count={SECTOR_COUNT}
      data-visible-sector-count={regionalSectors.length}
      data-regional-map="terrain-first"
      data-lands-per-sector={LANDS_PER_SECTOR}
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,.14),transparent_26%),linear-gradient(180deg,#07111b_0%,#030708_100%)]"
    >
      <div data-qa="expansion-hud" className="absolute left-3 right-3 top-[8.75rem] z-10 flex flex-col gap-1.5 md:left-4 md:right-4 md:top-[4.6rem] lg:flex-row lg:items-start lg:justify-between lg:gap-3">
        <div className="max-w-[720px] rounded-xl border border-sky-100/18 bg-black/42 px-3 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-sky-200/65">Aurelian regional command</p>
            <h2 className="text-sm font-black text-amber-50 md:text-base">Aurelian Region · 25 visible sectors</h2>
          </div>
          <p className="mt-0.5 hidden text-[11px] leading-snug text-amber-50/65 sm:block">Command the readable Aurelian region. The underlying world still contains 100 sectors and 10,000 generated lands.</p>

          {strategicPosture ? (
            <div data-qa="world-history-summary" data-posture={strategicPosture.postureId} className="mt-1.5 rounded-lg border border-amber-100/22 bg-black/28 px-2 py-1.5">
              <p className="text-[7px] font-black uppercase tracking-[0.16em] text-amber-100/55">Empire history compressed</p>
              <p className="mt-0.5 text-xs font-black text-amber-50">Aurelian Nation → {empireDeclaration?.title ?? "Empire"} → {empireConsequence?.mandateLabel ?? "Mandate"} → {strategicPosture.label}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-amber-50/58">The full founding chain remains recorded in Council and Chronicle; World now prioritizes the current strategic state.</p>
            </div>
          ) : (
            <>
              {nationDecision ? <Banner qa="nation-world-banner" text={`⚑ Aurelian Nation founded · ${nationDecision.label} · ${ownedSectorIds.length} sectors`} tone="emerald" /> : null}
              {frontierObjective ? <p data-qa="world-frontier-objective-banner" data-frontier-intent={frontierObjective.id} data-frontier-target-sector={frontierTargetSectorId ?? "none"} className="mt-1 rounded-lg border border-orange-200/35 bg-orange-300/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">★ Frontier objective · {frontierObjective.target}{frontierTargetSector ? ` · sector ${frontierTargetSector.id}` : ""}</p> : null}
              {frontierObjectiveComplete && frontierObjective ? <p data-qa="world-frontier-objective-complete" data-frontier-intent={frontierObjective.id} data-frontier-target-sector={frontierTargetSectorId ?? "none"} className="mt-1 rounded-lg border border-emerald-200/35 bg-emerald-300/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">✓ Objective secured · {frontierObjective.secured}</p> : null}
              {empireDeclaration ? <p data-qa="world-empire-banner" data-empire-declaration={empireDeclaration.id} className="mt-1 rounded-lg border border-amber-200/45 bg-amber-300/16 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">♛ Empire seed · {empireDeclaration.title}</p> : null}
              {empireConsequence ? <p data-qa="world-empire-consequence-banner" data-empire-consequence={empireConsequence.id} className="mt-1 rounded-lg border border-amber-100/35 bg-amber-100/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-50">◆ Founding consequence · {empireConsequence.label}</p> : null}
              {empireConsequence ? <p data-qa="world-imperial-mandate-banner" data-imperial-mandate={empireConsequence.mandateId} className="mt-1 rounded-lg border border-amber-50/35 bg-amber-50/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-50">◇ First mandate · {empireConsequence.mandateLabel}</p> : null}
              {courtDecision ? <p data-qa="world-court-case-banner" data-court-case-decision={courtDecision.id} className="mt-1 rounded-lg border border-emerald-200/35 bg-emerald-300/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">⚖ Court ruling · {courtDecision.label}</p> : courtCase ? <p data-qa="world-court-case-ready" data-court-case={courtCase.id} className="mt-1 rounded-lg border border-emerald-200/30 bg-emerald-300/8 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">⚖ Court case pending · {courtCase.title}</p> : null}
              {rivalResponseDecision ? <p data-qa="world-rival-response-banner" data-rival-response-decision={rivalResponseDecision.id} className="mt-1 rounded-lg border border-red-200/40 bg-red-500/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-100">⚔ Rival Response · {rivalResponseDecision.label}</p> : rivalResponse ? <p data-qa="world-rival-response-ready" data-rival-response={rivalResponse.id} className="mt-1 rounded-lg border border-red-200/30 bg-red-500/8 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-100">⚔ Rival response pending · {rivalResponse.title}</p> : null}
              {conflictEscalationDecision ? <p data-qa="world-conflict-escalation-banner" data-conflict-escalation-decision={conflictEscalationDecision.id} className="mt-1 rounded-lg border border-orange-200/45 bg-orange-500/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">⚑ Conflict escalation · {conflictEscalationDecision.label}</p> : conflictEscalation ? <p data-qa="world-conflict-escalation-ready" data-conflict-escalation={conflictEscalation.id} className="mt-1 rounded-lg border border-orange-200/30 bg-orange-500/8 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">⚑ Escalation pending · {conflictEscalation.title}</p> : null}
            </>
          )}

          {obsidianPressure !== "none" ? <p data-qa="map-obsidian-pressure" data-obsidian-pressure={obsidianPressure} data-standoff-decision={state.standoffDecisionId ?? "none"} className="mt-1 rounded-lg border border-red-200/45 bg-red-500/16 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-100">◆ Obsidian pressure · {obsidianPressure === "active" ? "active at North Ridge" : "contained at North Ridge"}</p> : null}
          {postCrisisFrontierPayoffTarget ? (
            <p
              data-qa="world-post-crisis-payoff"
              data-frontier-payoff-origin={postCrisisFrontierPayoffTarget.id}
              className={`mt-1 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${postCrisisFrontierPayoffSecured ? "border-emerald-200/45 bg-emerald-300/16 text-emerald-100" : "border-emerald-100/30 bg-emerald-300/8 text-emerald-100"}`}
            >
              {postCrisisFrontierPayoffSecured ? "✓ Frontier payoff secured" : "◇ Frontier payoff available"} · {postCrisisFrontierPayoffTarget.label}
            </p>
          ) : null}
          {standoffDecision ? <p data-qa="world-standoff-outcome" data-standoff-decision={standoffDecision.id} className="mt-1 rounded-lg border border-red-100/45 bg-red-400/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-50">⚔ Strategic outcome · {standoffDecision.label}</p> : standoff ? <p data-qa="world-standoff-ready" data-standoff={standoff.id} className="mt-1 rounded-lg border border-red-100/30 bg-red-400/8 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-50">⚔ Standoff pending · {standoff.title}</p> : null}
          {institutionCount > 0 ? <p data-qa="world-institution-indicator" data-institution-count={institutionCount} className="mt-1 rounded-lg border border-purple-200/35 bg-purple-300/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-purple-100">City institutions visible · {institutionCount}/3 district signals</p> : null}
        </div>
        <div className="grid grid-cols-4 gap-1 text-center sm:flex sm:flex-wrap"><Metric label="Owned" value={ownedSectorIds.length} /><Metric label="Influence" value={state.resources.influence} /><Metric label="Pressure" value={`${pressure}%`} /><Metric label="Claimable" value={claimableSectorIds.length} /><div className="hidden sm:block"><Metric label="Goal" value={nextGoal} /></div></div>
      </div>

      <div className="absolute bottom-[4.6rem] left-2 right-2 top-[13rem] flex flex-col gap-2 overflow-y-auto pb-6 md:bottom-[5.6rem] md:left-3 md:right-3 md:top-[9.2rem] lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden lg:pb-0">
        <div className="shrink-0 rounded-xl border border-sky-100/10 bg-black/12 p-2 md:p-2.5 lg:min-h-0">
          <WorldScaleProof ownedSectorIds={ownedSectorIds} selected={selected} visibleCount={regionalSectors.length} />
          <div className="mb-2 flex flex-wrap items-center gap-1.5"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-sky-100/60">Aurelian region · 25 of 100 sectors</p><Legend label="Owned" tone="border-amber-200/80 bg-amber-300/20 text-amber-50" /><Legend label="Claimable" tone="border-lime-200/80 bg-lime-300/18 text-lime-50" /><Legend label="Locked" tone="border-slate-200/20 bg-slate-300/8 text-slate-100/65" />{nationFounded ? <Legend label="Nation" tone="border-emerald-200/80 bg-emerald-300/18 text-emerald-50" /> : null}{empireDeclaration ? <Legend label="Empire" tone="border-amber-200/80 bg-amber-300/20 text-amber-50" /> : null}{rivalResponseDecision ? <Legend label="Rival" tone="border-red-200/80 bg-red-300/18 text-red-50" /> : null}{conflictEscalationDecision ? <Legend label="Escalation" tone="border-orange-200/80 bg-orange-300/18 text-orange-50" /> : null}{obsidianPressure !== "none" ? <Legend label="Obsidian" tone="border-red-100/80 bg-red-400/20 text-red-50" /> : null}</div>
          <WorldTerrainRegion sectors={regionalSectors} selectedSectorId={selected.id} ownedSectorIds={ownedSectorIds} claimableSectorIds={claimableSectorIds} canClaimSectorIds={regionalSectors.filter((sector) => canClaimSector(state, sector.id).ok).map((sector) => sector.id)} nationFounded={nationFounded} institutionCount={institutionCount} frontierTargetSectorId={frontierTargetSectorId} frontierObjectiveComplete={frontierObjectiveComplete} obsidianPressure={obsidianPressure} onSelect={(sector) => setSelectedIndex(sector.index)} />
        </div>
        <aside data-qa="world-sector-inspect" data-sector-control={selectedControl} className="shrink-0 rounded-xl border border-amber-100/14 bg-black/40 p-2.5 shadow-lg backdrop-blur-md md:p-3 lg:min-h-0 lg:overflow-auto">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-200/60">Sector inspect</p><div className="mt-1.5 flex items-start justify-between gap-2"><div><h3 className="text-lg font-black text-amber-50">{selected.id}</h3><p className="mt-0.5 text-xs font-black text-amber-100/80">{selected.name}</p></div><span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] ${kindClasses[selected.kind]}`}>{kindLabels[selected.kind]}</span></div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center"><Metric label="Biome" value={selected.biome} /><Metric label="Danger" value={selected.danger} /><Metric label="Trade" value={selected.trade} /></div>
          {frontierObjective ? <WorldFrontierObjectiveSignal objective={frontierObjective} targetSector={frontierTargetSector} complete={frontierObjectiveComplete} /> : null}
          <div data-qa="sector-land-scale-card" data-sector-id={selected.id} data-land-count={LANDS_PER_SECTOR} className="mt-2 rounded-xl border border-sky-200/20 bg-sky-300/8 p-2"><p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/60">100 internal lands</p><p className="mt-0.5 text-[11px] leading-snug text-amber-50/62">This selected sector contains a 10×10 local land grid.</p><LocalLandGrid selected={selected} samples={samples} /></div>
          <div data-qa="expansion-status" data-expansion-status={selectedExpansion.ok ? "claimable" : selectedExpansion.reason ?? "blocked"} className={`mt-2 rounded-xl border p-2 ${selectedExpansion.ok ? "border-lime-200/35 bg-lime-300/10" : "border-amber-100/14 bg-amber-100/8"}`}><p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/55">Expansion status</p><p className="mt-0.5 text-xs font-black text-amber-50">{selectedControl === "owned" ? "Inside your borders" : selectedExpansion.ok ? "Adjacent and affordable" : expansionStatusCopy(selectedExpansion.reason)}</p><button data-qa="claim-sector-button" disabled={!selectedExpansion.ok} onClick={() => dispatch({ type: "claimSector", sectorId: selected.id })} className="mt-2 w-full rounded-xl bg-lime-200 px-3 py-2 text-xs font-black text-stone-950 shadow-md shadow-black/30 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35">Claim sector · {expansionInfluenceCost} Influence</button></div>
          {empireDeclaration ? <Effect qa="world-empire-effect" attrs={{ "data-empire-declaration": empireDeclaration.id }} title={empireDeclaration.title} body={empireDeclaration.effect} /> : null}
          {empireConsequence ? <Effect qa="world-empire-consequence" attrs={{ "data-empire-consequence": empireConsequence.id }} eyebrow="Empire founding consequence" title={empireConsequence.label} body={empireConsequence.worldEffect} /> : null}
          {empireConsequence ? <Effect qa="world-imperial-mandate" attrs={{ "data-imperial-mandate": empireConsequence.mandateId }} eyebrow="First imperial mandate" title={empireConsequence.mandateLabel} body={empireConsequence.mandateWorldEffect} /> : null}
          {courtDecision ? <Effect qa="world-court-ruling" attrs={{ "data-court-case": courtCase?.id ?? "none", "data-court-case-decision": courtDecision.id }} eyebrow="Court ruling on the map" title={courtDecision.label} body={courtDecision.worldEffect} tone="emerald" /> : null}
          {rivalResponseDecision ? <Effect qa="world-rival-response" attrs={{ "data-rival-response": rivalResponse?.id ?? "none", "data-rival-response-decision": rivalResponseDecision.id }} eyebrow="Rival response on the map" title={rivalResponseDecision.label} body={rivalResponseDecision.worldEffect} tone="red" /> : null}
          {conflictEscalationDecision ? <Effect qa="world-conflict-escalation" attrs={{ "data-conflict-escalation": conflictEscalation?.id ?? "none", "data-conflict-escalation-decision": conflictEscalationDecision.id }} eyebrow="Conflict escalation on the map" title={conflictEscalationDecision.label} body={conflictEscalationDecision.worldEffect} tone="orange" /> : null}
          {obsidianPressure !== "none" ? <Effect qa="map-obsidian-pressure" attrs={{ "data-obsidian-pressure": obsidianPressure, "data-standoff-decision": state.standoffDecisionId ?? "none" }} eyebrow="Obsidian pressure on the map" title={obsidianPressure === "active" ? "Active at North Ridge" : "Contained at North Ridge"} body={obsidianPressure === "active" ? "The pass is contested while the Border Host forms." : "The first strategic outcome contains the pressure while imperial turns continue."} tone="red" /> : null}
          {standoffDecision ? <Effect qa="world-standoff-outcome" attrs={{ "data-standoff": standoff?.id ?? "none", "data-standoff-decision": standoffDecision.id }} eyebrow="Strategic outcome on the map" title={standoffDecision.label} body={standoffDecision.worldEffect} tone="red" /> : null}
          {nationDecision ? <Effect qa="nation-world-effect" title="Aurelian Nation controls the border ring" body={`${nationDecision.label}: ${nationDecision.effect}`} tone="emerald" /> : nationReady ? <Effect qa="nation-affordance" title="Nation threshold reached" body="Three sectors now answer to your council. Open Council to choose the founding doctrine." /> : null}
          {institutionCount > 0 ? <WorldInstitutionSignals signals={institutionSignals} /> : null}
          {state.retentionRecords.length > 0 ? <WorldRetentionEffects state={state} /> : null}
          <p className="mt-3 text-xs leading-relaxed text-amber-50/58">Land samples stay in this drawer while the regional map remains visible. Neighbors: {selected.neighbors.join(", ") || "edge"}.</p><p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Generated land samples</p><div className="mt-2 space-y-2">{samples.map((land) => <div key={land.pnid} data-qa="world-land-sample" className="rounded-2xl border border-amber-100/10 bg-amber-100/7 p-2"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-amber-50">{land.name}</p><p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/50">{land.pnid}</p></div><p className="mt-1 text-[11px] text-amber-50/55">{land.role} · {land.faction} · D{land.danger} / F{land.fertility} / T{land.trade} / I{land.influence}</p></div>)}</div><button onClick={() => dispatch({ type: "setView", view: "council" })} className="mt-4 w-full rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
        </aside>
      </div>
    </section>
  );
}

function WorldFrontierObjectiveSignal({ objective, targetSector, complete }: { objective: FrontierObjective; targetSector: WorldMapSector | null; complete: boolean }) { return <div data-qa="world-frontier-objective-signal" data-frontier-intent={objective.id} data-frontier-target-sector={targetSector?.id ?? "none"} data-frontier-complete={complete ? "true" : "false"} className={`mt-3 rounded-2xl border p-3 ${complete ? "border-emerald-200/35 bg-emerald-300/12" : "border-orange-200/35 bg-orange-300/12"}`}><p className={`text-[9px] font-black uppercase tracking-[0.18em] ${complete ? "text-emerald-100/65" : "text-orange-100/65"}`}>{complete ? "Secured frontier objective" : "Recorded frontier objective"}</p><p className="mt-1 text-sm font-black text-amber-50">{objective.target}{targetSector ? ` · ${targetSector.id} ${targetSector.name}` : ""}</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{complete ? objective.secured : objective.reason}</p></div>; }
function WorldInstitutionSignals({ signals }: { signals: InstitutionWorldSignal[] }) { return <div data-qa="world-institution-signals" data-institution-count={signals.length} className="mt-3 rounded-2xl border border-purple-200/35 bg-purple-300/12 p-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-100/65">City institutions on map</p><div className="mt-2 space-y-1.5">{signals.map((signal) => <div key={signal.label} data-qa="world-institution-signal" data-institution-label={signal.label} data-institution-district={signal.district} className="rounded-xl border border-purple-100/16 bg-black/24 px-2 py-1.5 text-[11px] font-bold text-amber-50/72">{signal.district}: {signal.mapEffect}</div>)}</div></div>; }
function WorldRetentionEffects({ state }: { state: PlayState }) { return <div data-qa="world-retention-effects" className="mt-3 rounded-2xl border border-sky-200/35 bg-sky-300/12 p-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/65">Season consequences</p><div className="mt-2 space-y-1.5">{state.retentionRecords.map((record) => <div key={`${record.decisionId}-${record.choiceId}`} data-qa="world-retention-marker" data-world-marker={record.worldMarker} data-choice-id={record.choiceId} className="rounded-xl border border-sky-100/14 bg-black/24 px-2 py-1.5 text-[11px] font-bold text-amber-50/72">Season {record.season}: {record.worldMarker}</div>)}</div></div>; }
function WorldScaleProof({ ownedSectorIds, selected, visibleCount }: { ownedSectorIds: string[]; selected: WorldMapSector; visibleCount: number }) { const controlledLands = ownedSectorIds.length * LANDS_PER_SECTOR; return <div data-qa="world-scale-proof" data-world-lands={WORLD_LANDS} data-sector-count={SECTOR_COUNT} data-visible-sector-count={visibleCount} data-lands-per-sector={LANDS_PER_SECTOR} data-controlled-lands={controlledLands} className="mb-2 grid gap-2 rounded-2xl border border-sky-200/18 bg-sky-400/8 p-2 sm:rounded-3xl sm:p-3 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-[8px] font-black uppercase tracking-[0.18em] text-sky-100/60">World scale</p><p className="mt-0.5 text-xs font-black text-amber-50 sm:text-sm">{visibleCount} visible sectors · {SECTOR_COUNT} total · {WORLD_LANDS.toLocaleString("en-US")} lands</p><p className="mt-1 hidden text-xs leading-relaxed text-amber-50/58 sm:block">Selected sector {selected.id} expands into its own 100-land local grid.</p></div><div className="grid grid-cols-3 gap-1 text-center md:min-w-[250px]"><Metric label="World" value={WORLD_LANDS.toLocaleString("en-US")} /><Metric label="Sector" value={LANDS_PER_SECTOR} /><Metric label="Held" value={controlledLands} /></div></div>; }
function LocalLandGrid({ selected, samples }: { selected: WorldMapSector; samples: ReturnType<typeof getSectorLandSamples> }) { const sampleIds = new Set(samples.map((land) => land.id)); const sectorStart = selected.index * LANDS_PER_SECTOR + 1; return <div data-qa="sector-local-grid" data-sector-id={selected.id} data-local-grid="10x10" className="mt-3 grid grid-cols-10 gap-1 rounded-2xl border border-sky-100/10 bg-black/30 p-2">{Array.from({ length: LANDS_PER_SECTOR }, (_, offset) => { const landId = sectorStart + offset; const isSample = sampleIds.has(landId); const isHomelandCore = selected.index === 0 && offset < 3; const isTradeLane = offset % 17 === 0 || offset === 12; return <span key={landId} data-qa="sector-local-land" data-land-id={landId} data-land-sample={isSample ? "true" : "false"} title={`PN-${String(landId).padStart(5, "0")}`} className={`aspect-square rounded-[0.28rem] border ${isSample ? "border-amber-100 bg-amber-200" : isHomelandCore ? "border-emerald-100/65 bg-emerald-300/70" : isTradeLane ? "border-sky-100/45 bg-sky-300/42" : "border-white/8 bg-white/12"}`} />; })}</div>; }
function getSectorControl(sectorId: string, owned: string[], claimable: string[]): SectorControl { if (owned.includes(sectorId)) return "owned"; if (claimable.includes(sectorId)) return "claimable"; return "locked"; }
function expansionStatusCopy(reason?: string) { if (reason === "no-homeland") return "Claim a homeland first"; if (reason === "already-owned") return "Already owned"; if (reason === "insufficient-influence") return "Need more Influence"; if (reason === "not-adjacent") return "Locked: not adjacent"; return "Blocked"; }
function SectorTile({ sector, control, selected, nationFounded, institutionCount, objectiveTarget, objectiveComplete, obsidianPressure, onSelect, canClaim }: { sector: WorldMapSector; control: SectorControl; selected: boolean; nationFounded: boolean; institutionCount: number; objectiveTarget: boolean; objectiveComplete: boolean; obsidianPressure: "none" | "active" | "contained"; onSelect: () => void; canClaim: boolean }) { const foundedOwned = nationFounded && control === "owned"; const institutionCapital = institutionCount > 0 && sector.isOrigin && control === "owned"; const obsidianTarget = obsidianPressure !== "none" && sector.id === "A-04"; return <button type="button" data-qa="world-sector-tile" data-sector-id={sector.id} data-sector-x={sector.x} data-sector-y={sector.y} data-sector-kind={sector.kind} data-sector-control={control} data-sector-can-claim={canClaim ? "true" : "false"} data-sector-origin={sector.isOrigin ? "true" : "false"} data-sector-rival={sector.isRival ? "true" : "false"} data-sector-trade={sector.isTradeRich ? "true" : "false"} data-sector-danger={sector.isHighDanger ? "true" : "false"} data-nation-founded-owned={foundedOwned ? "true" : "false"} data-institution-capital={institutionCapital ? "true" : "false"} data-frontier-objective={objectiveTarget ? "true" : "false"} data-frontier-objective-complete={objectiveTarget && objectiveComplete ? "true" : "false"} data-obsidian-pressure={obsidianTarget ? obsidianPressure : "none"} aria-label={`Inspect sector ${sector.id} ${sector.name}`} onClick={onSelect} className={`relative overflow-hidden rounded-xl border p-2 text-left transition hover:scale-[1.02] hover:border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/80 ${kindClasses[sector.kind]} ${controlClasses[control]} ${selected ? "ring-2 ring-white" : ""} ${foundedOwned ? "outline outline-2 outline-emerald-200/80" : ""} ${institutionCapital ? "after:absolute after:inset-0 after:rounded-xl after:border-2 after:border-purple-200/80" : ""} ${objectiveTarget ? objectiveComplete ? "outline outline-2 outline-emerald-200/90" : "outline outline-2 outline-orange-200/90" : ""} ${obsidianTarget ? "outline outline-4 outline-red-300/80" : ""}`}><span className="block text-xs font-black leading-none md:text-sm">{sector.id}</span><span className="mt-1 block truncate text-[8px] opacity-75 md:text-[10px]">{sector.biome}</span><span className="absolute bottom-1.5 right-1.5 text-[9px] font-black opacity-70">T{sector.trade}</span>{control === "claimable" ? <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-lime-200" /> : null}{sector.isHighDanger ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-300" /> : null}{foundedOwned ? <span className="absolute bottom-1.5 left-1.5 rounded-full bg-emerald-200 px-1 text-[8px] font-black text-stone-950">⚑</span> : null}{objectiveTarget ? <span data-qa="world-frontier-objective-marker" className={`${objectiveComplete ? "bg-emerald-200" : "bg-orange-200"} absolute left-1.5 top-1.5 rounded-full px-1 text-[8px] font-black text-stone-950`}>{objectiveComplete ? "✓" : "★"}</span> : null}{institutionCapital ? <span data-qa="world-institution-capital-marker" className="absolute left-1.5 top-1.5 rounded-full bg-purple-200 px-1 text-[8px] font-black text-stone-950">{institutionCount}</span> : null}{obsidianTarget ? <span data-qa="map-obsidian-pressure" data-obsidian-pressure={obsidianPressure} className="absolute right-1.5 top-1.5 rounded-full bg-red-200 px-1 text-[8px] font-black text-stone-950">◆</span> : null}</button>; }
function Effect({ qa, attrs, eyebrow, title, body, tone = "amber" }: { qa: string; attrs?: Record<string, string>; eyebrow?: string; title: string; body: string; tone?: "amber" | "emerald" | "red" | "orange" }) { const cls = tone === "emerald" ? "border-emerald-200/35 bg-emerald-300/12" : tone === "red" ? "border-red-200/35 bg-red-500/12" : tone === "orange" ? "border-orange-200/40 bg-orange-500/12" : "border-amber-100/30 bg-amber-100/10"; return <div data-qa={qa} {...attrs} className={`mt-3 rounded-2xl border p-3 ${cls}`}><p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/60">{eyebrow ?? "World effect"}</p><p className="mt-1 text-sm font-black text-amber-50">{title}</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{body}</p></div>; }
function Banner({ qa, text, tone }: { qa: string; text: string; tone: "emerald" }) { return <p data-qa={qa} data-tone={tone} className="mt-3 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">{text}</p>; }
function Legend({ label, tone }: { label: string; tone: string }) { return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${tone}`}>{label}</span>; }
function Metric({ label, value }: { label: string | number; value: string | number }) { return <div className="rounded-2xl border border-sky-100/12 bg-black/30 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-200/50">{label}</p><p className="truncate text-xs font-black text-amber-50 md:text-sm">{value}</p></div>; }
