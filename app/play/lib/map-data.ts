export type Terrain = "grassland" | "forest" | "river" | "hill" | "ruins" | "coast" | "marsh" | "field";
export type PlotRole = "starter" | "local" | "rival" | "trade" | "frontier" | "mystery";

export type Plot = {
  id: string;
  pnid: string;
  name: string;
  region: string;
  terrain: Terrain;
  role: PlotRole;
  resources: string[];
  strategicValue: string;
  d: string;
  cx: number;
  cy: number;
  starter?: boolean;
  rival?: boolean;
  trade?: boolean;
};

export const sectorName = "Sector A-01 / Aurelian Basin";
export const chartedLands = 30;
export const worldLands = 10000;

export const terrainFill: Record<Terrain, string> = {
  grassland: "#7f9f55",
  forest: "#27633f",
  river: "#4fb9d8",
  hill: "#8f7445",
  ruins: "#7b6a57",
  coast: "#b89553",
  marsh: "#507b5d",
  field: "#b9a35b",
};

export const terrainLine: Record<Terrain, string> = {
  grassland: "Open founding ground with room to grow.",
  forest: "Woodland shelter and early building material.",
  river: "Water access and future trade pressure.",
  hill: "Defensible high ground and stone.",
  ruins: "Old marks of a forgotten age.",
  coast: "Sea edge, fishing, routes and risk.",
  marsh: "Hard land, but rich and protective.",
  field: "Food base for a first settlement.",
};

export const roleLine: Record<PlotRole, string> = {
  starter: "Suggested first homeland.",
  local: "Nearby land for village expansion.",
  rival: "Known rival banner in the wider basin.",
  trade: "Future route or market endpoint.",
  frontier: "Outer direction for scouting and pressure.",
  mystery: "Unsettled old-world clue for later exploration.",
};

export const plots: Plot[] = [
  { id: "greenvale", pnid: "PN-A01-001", name: "Greenvale", region: "Homeland Ring", terrain: "grassland", role: "starter", resources: ["grain", "water"], strategicValue: "Safest first settlement: food, water and open build space.", starter: true, d: "M286 242 L365 214 L438 254 L424 332 L340 356 L278 315 Z", cx: 354, cy: 285 },
  { id: "riverbend", pnid: "PN-A01-002", name: "Riverbend", region: "Homeland Ring", terrain: "river", role: "starter", resources: ["fish", "clay"], strategicValue: "Best early river start for trade pressure and clay buildings.", starter: true, trade: true, d: "M438 254 L522 238 L586 286 L558 366 L478 386 L424 332 Z", cx: 506, cy: 310 },
  { id: "highmere", pnid: "PN-A01-003", name: "Highmere", region: "Homeland Ring", terrain: "hill", role: "starter", resources: ["stone", "goats"], strategicValue: "Defensible start with stone for civic upgrades.", starter: true, d: "M420 122 L526 104 L604 166 L586 286 L522 238 L438 254 Z", cx: 516, cy: 188 },
  { id: "meadowrun", pnid: "PN-A01-004", name: "Meadowrun", region: "Local Fields", terrain: "grassland", role: "local", resources: ["grain", "flowers"], strategicValue: "First cheap expansion from the homeland ring.", d: "M330 448 L462 478 L358 506 Z", cx: 386, cy: 478 },
  { id: "old-road", pnid: "PN-A01-005", name: "Old Road", region: "Local Fields", terrain: "field", role: "local", resources: ["trade", "grain"], strategicValue: "Turns a village into a connector settlement.", trade: true, d: "M340 356 L424 332 L478 386 L462 478 L358 506 L330 448 Z", cx: 404, cy: 420 },
  { id: "glasswater", pnid: "PN-A01-006", name: "Glasswater", region: "Local River", terrain: "river", role: "local", resources: ["fish", "trade"], strategicValue: "Local water route for future markets.", trade: true, d: "M478 386 L558 366 L594 462 L566 548 L462 478 Z", cx: 528, cy: 456 },
  { id: "wolfpine", pnid: "PN-A01-007", name: "Wolfpine", region: "Northwood", terrain: "forest", role: "local", resources: ["timber", "herbs"], strategicValue: "Timber source for the first camp and hamlet.", d: "M226 120 L330 86 L420 122 L438 254 L365 214 L270 222 Z", cx: 330, cy: 166 },
  { id: "bracken", pnid: "PN-A01-008", name: "Bracken", region: "Northwood", terrain: "forest", role: "frontier", resources: ["timber", "game"], strategicValue: "Outer forest buffer before rival pressure.", d: "M92 206 L226 120 L270 222 L278 315 L156 292 L84 270 Z", cx: 180, cy: 230 },
  { id: "saltwind", pnid: "PN-A01-009", name: "Saltwind", region: "Western Coast", terrain: "coast", role: "trade", resources: ["salt", "fish"], strategicValue: "First coastal trade direction from the homeland.", trade: true, d: "M156 292 L278 315 L340 356 L330 448 L210 478 L128 398 Z", cx: 235, cy: 386 },
  { id: "westwatch", pnid: "PN-A01-010", name: "Westwatch", region: "Western Coast", terrain: "hill", role: "frontier", resources: ["stone", "watch"], strategicValue: "Coastal watchpoint that reveals western movement.", d: "M84 270 L156 292 L128 398 L72 420 L32 334 Z", cx: 96, cy: 346 },
  { id: "iron-coast", pnid: "PN-A01-011", name: "Iron Coast", region: "Western Coast", terrain: "coast", role: "rival", resources: ["ore", "fish"], strategicValue: "Rival shore holding with iron access.", rival: true, d: "M72 420 L128 398 L210 478 L168 566 L88 616 L42 528 Z", cx: 114, cy: 512 },
  { id: "bluefen", pnid: "PN-A01-012", name: "Bluefen", region: "South Fen", terrain: "river", role: "frontier", resources: ["fish", "reeds"], strategicValue: "Southern river bend for scouting and wetland control.", d: "M168 566 L256 664 L276 784 L144 730 L88 616 Z", cx: 190, cy: 668 },
  { id: "lowmarsh", pnid: "PN-A01-013", name: "Lowmarsh", region: "South Fen", terrain: "marsh", role: "local", resources: ["reeds", "fish"], strategicValue: "Difficult but protective land near the first village.", d: "M210 478 L330 448 L358 506 L390 646 L256 664 L168 566 Z", cx: 286, cy: 558 },
  { id: "reedgate", pnid: "PN-A01-014", name: "Reedgate", region: "South Fen", terrain: "marsh", role: "frontier", resources: ["reeds", "clay"], strategicValue: "Southern gate between village land and unknown marsh.", d: "M256 664 L390 646 L498 710 L424 796 L276 784 Z", cx: 374, cy: 722 },
  { id: "last-light", pnid: "PN-A01-015", name: "Last Light", region: "South Coast", terrain: "coast", role: "trade", resources: ["fish", "salt"], strategicValue: "Far southern sea endpoint for a future route.", trade: true, d: "M424 796 L598 782 L702 812 L620 884 L460 884 Z", cx: 552, cy: 832 },
  { id: "whisper-ruins", pnid: "PN-A01-016", name: "Whisper Ruins", region: "Old Kingdom", terrain: "ruins", role: "mystery", resources: ["relics", "stone"], strategicValue: "Old-world clue that can later unlock chronicle choices.", d: "M462 478 L566 548 L604 640 L498 710 L390 646 L358 506 Z", cx: 482, cy: 590 },
  { id: "duskhollow", pnid: "PN-A01-017", name: "Duskhollow", region: "Old Kingdom", terrain: "ruins", role: "mystery", resources: ["relics", "herbs"], strategicValue: "Second ruin node for future identity and lore pressure.", d: "M604 640 L728 644 L804 738 L702 812 L598 782 L498 710 Z", cx: 656, cy: 720 },
  { id: "eastfold", pnid: "PN-A01-018", name: "Eastfold", region: "Eastern Farms", terrain: "field", role: "trade", resources: ["grain", "horses"], strategicValue: "Eastern food and horse route target.", trade: true, d: "M586 286 L682 302 L744 384 L704 482 L594 462 L558 366 Z", cx: 646, cy: 386 },
  { id: "sunbarrow", pnid: "PN-A01-019", name: "Sunbarrow", region: "Eastern Farms", terrain: "grassland", role: "frontier", resources: ["grain", "clay"], strategicValue: "Outer farmland between local growth and rival roads.", d: "M704 482 L774 538 L728 644 L604 640 L566 548 L594 462 Z", cx: 666, cy: 558 },
  { id: "marefield", pnid: "PN-A01-020", name: "Marefield", region: "Eastern Farms", terrain: "field", role: "trade", resources: ["horses", "grain"], strategicValue: "Horse market endpoint for mobility and influence.", trade: true, d: "M774 538 L862 620 L804 738 L728 644 Z", cx: 790, cy: 640 },
  { id: "ashwood", pnid: "PN-A01-021", name: "Ashwood", region: "Eastwood", terrain: "forest", role: "frontier", resources: ["timber", "charcoal"], strategicValue: "Eastern forest that can fuel production later.", d: "M744 384 L854 420 L860 548 L774 538 L704 482 Z", cx: 794, cy: 468 },
  { id: "crownstone", pnid: "PN-A01-022", name: "Crownstone", region: "North Ridge", terrain: "hill", role: "rival", resources: ["iron", "stone"], strategicValue: "Northern rival banner with a defensible ridge claim.", rival: true, d: "M526 104 L658 120 L728 210 L682 302 L586 286 L604 166 Z", cx: 636, cy: 204 },
  { id: "stormcap", pnid: "PN-A01-023", name: "Stormcap", region: "North Ridge", terrain: "hill", role: "rival", resources: ["stone", "eagles"], strategicValue: "Mountain rival pressure on the basin edge.", rival: true, d: "M658 120 L784 168 L834 284 L744 384 L682 302 L728 210 Z", cx: 748, cy: 260 },
  { id: "northgate", pnid: "PN-A01-024", name: "Northgate", region: "North Road", terrain: "grassland", role: "trade", resources: ["trade", "grain"], strategicValue: "Northern road into the larger world map.", trade: true, d: "M330 86 L476 46 L526 104 L420 122 Z", cx: 438, cy: 88 },
  { id: "crowmere", pnid: "PN-A01-025", name: "Crowmere", region: "North Road", terrain: "marsh", role: "rival", resources: ["reeds", "watch"], strategicValue: "Small rival village controlling a cold crossing.", rival: true, d: "M126 54 L226 120 L92 206 L34 142 Z", cx: 126, cy: 138 },
  { id: "gilded-ford", pnid: "PN-A01-026", name: "Gilded Ford", region: "Riverlands", terrain: "river", role: "trade", resources: ["fish", "market"], strategicValue: "Future bridge market between local realm and east routes.", trade: true, d: "M558 366 L586 286 L682 302 L744 384 L704 482 L594 462 Z", cx: 632, cy: 382 },
  { id: "redwillow", pnid: "PN-A01-027", name: "Redwillow", region: "Eastwood", terrain: "forest", role: "rival", resources: ["timber", "herbs"], strategicValue: "Forest rival camp that can become an ally or pressure point later.", rival: true, d: "M854 420 L946 500 L904 626 L862 620 L860 548 Z", cx: 884, cy: 534 },
  { id: "blackfen", pnid: "PN-A01-028", name: "Blackfen", region: "South Fen", terrain: "marsh", role: "mystery", resources: ["peat", "relics"], strategicValue: "Remote wetland mystery for later scouting.", d: "M144 730 L276 784 L424 796 L460 884 L252 890 Z", cx: 280, cy: 824 },
  { id: "ember-hill", pnid: "PN-A01-029", name: "Ember Hill", region: "East Ridge", terrain: "hill", role: "frontier", resources: ["stone", "coal"], strategicValue: "Far production ridge that hints at future industry.", d: "M804 738 L914 750 L878 868 L702 812 Z", cx: 820, cy: 804 },
  { id: "veil-harbor", pnid: "PN-A01-030", name: "Veil Harbor", region: "South Coast", terrain: "coast", role: "rival", resources: ["fish", "ships"], strategicValue: "Distant coastal rival city-seed for future diplomacy and expansion.", rival: true, trade: true, d: "M620 884 L702 812 L878 868 L820 900 L620 900 Z", cx: 734, cy: 866 },
];

export const starterPlotId = "greenvale";
