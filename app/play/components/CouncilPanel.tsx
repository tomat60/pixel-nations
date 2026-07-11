import { empireDeclarations, frontierObjectives, getDevelopmentScore, getEmpireDeclaration, getEmpireReady, getFirstEraComplete, getFrontierIntent, getFrontierObjectiveSecured, getNationDecision, getNationReady, getNextRetentionDecision, getOwnedPlot, getOwnedSectorIds, getPhase, getPopulation, getRivalPressure, nationDecisions, nationSectorThreshold, type FrontierObjective, type PlayAction, type PlayState, type RetentionRecord } from "../lib/play-state";

function isCitySeed(state: PlayState) {
  const phase = getPhase(state);
  return phase === "city-seed" || phase === "nation-seed";
}

type InstitutionSeed = { label: string; district: string; workers: string; law: string };

function getInstitutionSeeds(records: RetentionRecord[]): InstitutionSeed[] {
  return records.slice(0, 3).map((record) => {
    if (record.decisionId === "grain-levy") {
      return record.choiceId === "authority"
        ? { label: "Granary Authority", district: "Granary District", workers: "levy stewards", law: "crown supply rights" }
        : { label: "Commons Stores", district: "Civic Commons", workers: "store keepers", law: "free household stores" };
    }
    if (record.decisionId === "open-roads") {
      return record.choiceId === "authority"
        ? { label: "Border Road Ward", district: "Guard Road", workers: "road wardens", law: "fortified passage" }
        : { label: "Open Market Road", district: "Market Street", workers: "caravan brokers", law: "open trade passage" };
    }
    return record.choiceId === "authority"
      ? { label: "Scribe House", district: "Law Hall", workers: "civic scribes", law: "written council record" }
      : { label: "First Foundries", district: "Workshop Row", workers: "foundry crews", law: "chartered workshops" };
  });
}

const roadmap = [
  { label: "Land", detail: "claim one homeland", done: (state: PlayState) => state.ownedPlotIds.length > 0 },
  { label: "Settlement", detail: "raise shelter + storehouse", done: (state: PlayState) => state.settlementMarkers.includes("shelter") && state.settlementMarkers.includes("storehouse") },
  { label: "Village", detail: "market + council + watch", done: (state: PlayState) => state.settlementMarkers.includes("market") && state.settlementMarkers.includes("council") && state.settlementMarkers.includes("watch") },
  { label: "City", detail: "city seed: civic core, market route and defended streets", done: isCitySeed },
  { label: "Nation", detail: "hold 3 sectors, then choose a founding doctrine", done: (state: PlayState) => Boolean(state.nationDecisionId) },
  { label: "Era", detail: "resolve 3 post-founding seasons", done: (state: PlayState) => getFirstEraComplete(state) },
  { label: "Empire", detail: "secure a frontier objective, then declare the empire seed", done: (state: PlayState) => Boolean(state.empireDeclarationId) },
];

export function CouncilPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const phase = getPhase(state);
  const pressure = getRivalPressure(state);
  const score = getDevelopmentScore(state);
  const population = getPopulation(state);
  const ownedSectors = getOwnedSectorIds(state);
  const nationReady = getNationReady(state);
  const nationDecision = getNationDecision(state);
  const frontierObjective = getFrontierIntent(state);
  const frontierObjectiveSecured = getFrontierObjectiveSecured(state);
  const empireReady = getEmpireReady(state);
  const empireDeclaration = getEmpireDeclaration(state);
  const capital = getOwnedPlot(state)?.name ?? "Aurelian Basin";
  const completed = roadmap.filter((item) => item.done(state)).length;
  const firstEraComplete = getFirstEraComplete(state);
  const citySeed = isCitySeed(state);
  const rivalFrontierVisible = firstEraComplete && Boolean(nationDecision);

  return (
    <aside data-qa="council-panel" data-nation-decision={nationDecision?.id ?? "none"} data-retention-count={state.retentionRecords.length} data-era-complete={firstEraComplete ? "true" : "false"} data-city-institutions={firstEraComplete ? "true" : "false"} data-rival-frontier={rivalFrontierVisible ? "true" : "false"} data-frontier-intent={state.frontierIntentId ?? "none"} data-frontier-secured={frontierObjectiveSecured ? "true" : "false"} data-empire-ready={empireReady ? "true" : "false"} data-empire-declaration={state.empireDeclarationId ?? "none"} className="absolute bottom-[4.7rem] right-3 z-20 max-h-[calc(100%-10rem)] w-[min(560px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-amber-100/20 bg-black/66 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:right-5 md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Council chamber</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-amber-50 md:text-4xl">From land to empire</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">This screen now turns border growth into the first permanent nation-scale decision.</p>
        </div>
        <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{completed}/7</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Metric label="Phase" value={phase} />
        <Metric label="People" value={population} />
        <Metric label="Sectors" value={`${ownedSectors.length}/${nationSectorThreshold}`} />
        <Metric label="Rivals" value={`${pressure}%`} />
      </div>

      {citySeed ? (
        <div data-qa="city-seed-milestone" className="mt-4 rounded-2xl border border-sky-200/35 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.18),transparent_36%),rgba(14,165,233,.10)] p-3 shadow-[0_0_34px_rgba(56,189,248,.12)]">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/70">City Seed</p>
          <p className="mt-1 text-sm font-black text-amber-50">The village has a civic core, a market route and defended streets.</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/62">This is not a full city yet, but it is no longer just a settlement. The next large layer can add districts, workers and laws.</p>
        </div>
      ) : null}

      {nationDecision ? (
        <div data-qa="council-nation-founded" className="mt-4 overflow-hidden rounded-2xl border border-emerald-200/40 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,.22),transparent_36%),rgba(16,185,129,.12)] p-3 shadow-[0_0_42px_rgba(16,185,129,.14)]">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100/35 bg-black/28 text-2xl">⚑</div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100/70">Nation founded</p>
              <p className="mt-1 text-lg font-black text-amber-50">Aurelian Nation · {nationDecision.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/62">Capital: {capital}. Controlled sectors: {ownedSectors.join(" · ")}. {nationDecision.effect}</p>
            </div>
          </div>
        </div>
      ) : nationReady ? (
        <div data-qa="council-nation-ready" className="mt-4 rounded-2xl border border-amber-200/35 bg-amber-300/12 p-3">
          <p className="text-sm font-black text-amber-50">Choose the founding doctrine</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/62">Three connected sectors now answer to your council. Pick one doctrine; it persists and changes the run.</p>
          <div className="mt-3 grid gap-2">
            {nationDecisions.map((decision) => (
              <button key={decision.id} type="button" data-qa="found-nation-choice" data-decision-id={decision.id} onClick={() => dispatch({ type: "foundNation", decisionId: decision.id })} className="rounded-2xl border border-amber-100/18 bg-white/8 p-3 text-left transition hover:bg-amber-200/12">
                <span className="block text-sm font-black text-amber-50">{decision.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-amber-50/62">{decision.short}</span>
                <span className="mt-1 block text-[11px] font-bold text-emerald-100/70">{decision.effect}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-100/14 bg-amber-100/8 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Next strategic goal</p>
          <p className="mt-1 text-sm font-black text-amber-50">Claim {Math.max(0, nationSectorThreshold - ownedSectors.length)} more connected sector{nationSectorThreshold - ownedSectors.length === 1 ? "" : "s"}</p>
        </div>
      )}

      {rivalFrontierVisible ? <RivalFrontierSeed pressure={pressure} ownedSectors={ownedSectors.length} selectedObjective={frontierObjective} objectiveSecured={frontierObjectiveSecured} dispatch={dispatch} /> : null}
      {empireReady ? <EmpireDeclarationSeed state={state} capital={capital} ownedSectors={ownedSectors} nationDecision={nationDecision} frontierObjective={frontierObjective} empireDeclaration={empireDeclaration} dispatch={dispatch} /> : null}
      {firstEraComplete ? <CityInstitutionsSeed records={state.retentionRecords} /> : null}
      {nationDecision && state.foundingCeremonySeen ? (
        <SeasonLoop state={state} dispatch={dispatch} complete={firstEraComplete} />
      ) : null}

      <div className="mt-4 space-y-2">
        {roadmap.map((item) => {
          const done = item.done(state);
          return (
            <div key={item.label} data-qa={`roadmap-${item.label.toLowerCase()}`} className={`rounded-2xl border p-3 ${done ? "border-emerald-200/30 bg-emerald-300/10" : "border-amber-100/12 bg-white/5"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-amber-50">{item.label}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${done ? "text-emerald-100" : "text-amber-100/45"}`}>{done ? "done" : "next"}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{item.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100/14 bg-amber-100/8 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest chronicle</p>
        <p className="mt-1 text-sm font-black text-amber-50">{state.chronicle[0]?.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{state.chronicle[0]?.body}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button data-qa="council-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">Issue orders</button>
        <button data-qa="council-open-world" onClick={() => dispatch({ type: "setView", view: "world" })} className="rounded-2xl border border-amber-100/18 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">World map</button>
      </div>
    </aside>
  );
}

function SeasonLoop({ state, dispatch, complete }: { state: PlayState; dispatch: (action: PlayAction) => void; complete: boolean }) {
  const decision = getNextRetentionDecision(state);

  if (complete) {
    return (
      <div data-qa="first-era-complete" className="mt-4 rounded-3xl border border-sky-200/35 bg-sky-300/12 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/65">First Era Complete</p>
        <p className="mt-1 text-lg font-black text-amber-50">The nation remembers its first three seasons.</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/62">A council chronicle now records what changed in the village and across the world map.</p>
        <div className="mt-3 space-y-2">
          {state.retentionRecords.map((record) => <RetentionRecordLine key={`${record.decisionId}-${record.choiceId}`} record={record} />)}
        </div>
      </div>
    );
  }

  if (!decision) return null;

  return (
    <div data-qa="season-decision-panel" data-season-decision={decision.id} className="mt-4 overflow-hidden rounded-3xl border border-amber-200/35 bg-amber-300/12">
      <div className="border-b border-amber-100/14 bg-black/22 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-100/65">Council decision · Season {decision.season}/3</p>
        <p className="mt-1 text-lg font-black leading-tight text-amber-50">{decision.title}</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-50/68 md:text-sm">{decision.prompt}</p>
      </div>
      <div className="grid gap-2 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Choose one season order</p>
        {decision.choices.map((choice) => (
          <button key={choice.id} type="button" data-qa="season-choice" data-decision-id={decision.id} data-choice-id={choice.id} onClick={() => dispatch({ type: "advanceSeason", decisionId: decision.id, choiceId: choice.id })} className="rounded-2xl border border-amber-100/20 bg-black/22 p-3 text-left transition hover:border-amber-200/45 hover:bg-amber-200/12">
            <span className="block text-sm font-black text-amber-50">{choice.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-amber-50/58">{choice.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmpireDeclarationSeed({ state, capital, ownedSectors, nationDecision, frontierObjective, empireDeclaration, dispatch }: { state: PlayState; capital: string; ownedSectors: string[]; nationDecision: ReturnType<typeof getNationDecision>; frontierObjective: ReturnType<typeof getFrontierIntent>; empireDeclaration: ReturnType<typeof getEmpireDeclaration>; dispatch: (action: PlayAction) => void }) {
  if (empireDeclaration) {
    return (
      <div data-qa="empire-declaration-recorded" data-empire-declaration={empireDeclaration.id} className="mt-4 rounded-3xl border border-amber-200/45 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,.24),transparent_36%),rgba(180,83,9,.16)] p-3 shadow-[0_0_44px_rgba(251,191,36,.18)]">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-100/75">Empire Seed Declared</p>
        <p className="mt-1 text-xl font-black text-amber-50">{empireDeclaration.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/66">Founder record: {capital} → Aurelian Nation → {frontierObjective?.target ?? "frontier secured"} → {empireDeclaration.label}.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric label="Sectors" value={ownedSectors.length} />
          <Metric label="Doctrine" value={nationDecision?.label ?? "Nation"} />
          <Metric label="Score" value={getDevelopmentScore(state)} />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-amber-50/58">{empireDeclaration.effect}</p>
      </div>
    );
  }

  return (
    <div data-qa="empire-declaration-options" className="mt-4 rounded-3xl border border-amber-200/40 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,.20),transparent_36%),rgba(120,53,15,.14)] p-3 shadow-[0_0_38px_rgba(251,191,36,.12)]">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-100/70">Empire Declaration Seed</p>
      <p className="mt-1 text-lg font-black text-amber-50">The secured frontier can become an empire claim.</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">This is still not a full empire system. It is the first ceremonial payoff that closes the demo arc from one land to empire.</p>
      <div className="mt-3 grid gap-2">
        {empireDeclarations.map((declaration) => (
          <button key={declaration.id} type="button" data-qa="empire-declaration-choice" data-empire-declaration={declaration.id} onClick={() => dispatch({ type: "declareEmpire", declarationId: declaration.id })} className="rounded-2xl border border-amber-100/20 bg-black/24 p-3 text-left transition hover:border-amber-100/50 hover:bg-amber-200/10">
            <span className="block text-sm font-black text-amber-50">{declaration.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-amber-50/58">{declaration.short}</span>
            <span className="mt-1 block text-[11px] font-bold text-amber-100/70">{declaration.effect}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CityInstitutionsSeed({ records }: { records: RetentionRecord[] }) {
  const institutions = getInstitutionSeeds(records);
  return (
    <div data-qa="city-institutions-seed" className="mt-4 rounded-3xl border border-purple-200/35 bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,.18),transparent_36%),rgba(168,85,247,.10)] p-3 shadow-[0_0_34px_rgba(168,85,247,.12)]">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-100/70">City Institutions Seed</p>
      <p className="mt-1 text-lg font-black text-amber-50">Districts, workers and laws emerge from the first era.</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">These are not full systems yet. They are the visible city foundations created by the nation’s first three seasonal choices.</p>
      <div className="mt-3 grid gap-2">
        {institutions.map((institution) => (
          <div key={institution.label} data-qa="city-institution-card" data-district={institution.district} className="rounded-2xl border border-purple-100/18 bg-black/24 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-amber-50">{institution.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-50/58">{institution.district} · {institution.workers}</p>
              </div>
              <span className="rounded-full border border-purple-100/20 bg-purple-200/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-purple-100/70">law seed</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-amber-50/55">Law: {institution.law}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RivalFrontierSeed({ pressure, ownedSectors, selectedObjective, objectiveSecured, dispatch }: { pressure: number; ownedSectors: number; selectedObjective: FrontierObjective | null; objectiveSecured: boolean; dispatch: (action: PlayAction) => void }) {
  return (
    <div data-qa="rival-frontier-seed" data-rival-pressure={pressure} data-frontier-secured={objectiveSecured ? "true" : "false"} className="mt-4 rounded-3xl border border-red-200/35 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,.20),transparent_36%),rgba(127,29,29,.16)] p-3 shadow-[0_0_34px_rgba(248,113,113,.10)]">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-100/70">Rival Frontier Seed</p>
      <p className="mt-1 text-lg font-black text-amber-50">The frontier is no longer passive.</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">Neighboring powers have noticed the Aurelian Nation. Border pressure is now a reason to keep expanding, not a combat system.</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Pressure" value={`${pressure}%`} />
        <Metric label="Sectors" value={ownedSectors} />
        <Metric label="Next" value={objectiveSecured ? "Secured" : selectedObjective ? "Chosen" : "Choose"} />
      </div>
      {selectedObjective ? (
        <div data-qa="frontier-objective-recorded" data-frontier-intent={selectedObjective.id} className="mt-3 rounded-2xl border border-red-100/20 bg-black/26 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-100/60">Expansion intent recorded</p>
          <p className="mt-1 text-sm font-black text-amber-50">{selectedObjective.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/58">{selectedObjective.target} · {objectiveSecured ? selectedObjective.secured : selectedObjective.result}</p>
        </div>
      ) : (
        <div data-qa="frontier-objective-options" className="mt-3 grid gap-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-100/60">Choose the next expansion objective</p>
          {frontierObjectives.map((objective) => (
            <button key={objective.id} type="button" data-qa="frontier-objective-choice" data-frontier-intent={objective.id} onClick={() => dispatch({ type: "setFrontierIntent", intentId: objective.id })} className="rounded-2xl border border-red-100/20 bg-black/24 p-3 text-left transition hover:border-red-100/45 hover:bg-red-200/10">
              <span className="block text-sm font-black text-amber-50">{objective.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-amber-50/58">{objective.target} · {objective.reason}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RetentionRecordLine({ record }: { record: RetentionRecord }) {
  return (
    <div data-qa="retention-record" data-decision-id={record.decisionId} data-choice-id={record.choiceId} data-village-marker={record.villageMarker} data-world-marker={record.worldMarker} className="rounded-2xl border border-sky-100/18 bg-black/22 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/55">Season {record.season}</p>
          <p className="mt-1 text-sm font-black text-amber-50">{record.label}</p>
        </div>
        <span className="rounded-full border border-sky-100/20 bg-sky-200/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-sky-100/70">recorded</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-amber-50/55">Village: {record.villageMarker} · World: {record.worldMarker}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string | number; value?: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-sm font-black text-amber-50 md:text-base">{value}</p>
    </div>
  );
}
