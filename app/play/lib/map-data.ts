export type Terrain = "grassland" | "forest" | "river" | "hill" | "ruins" | "coast" | "marsh" | "field";

export type Plot = {
  id: string;
  name: string;
  region: string;
  terrain: Terrain;
  resources: string[];
  d: string;
  cx: number;
  cy: number;
  starter?: boolean;
  rival?: boolean;
};

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

export const plots: Plot[] = [
  { id: "greenvale", name: "Greenvale", region: "Aurelian Heart", terrain: "grassland", resources: ["grain", "water"], starter: true, d: "M286 242 L365 214 L438 254 L424 332 L340 356 L278 315 Z", cx: 354, cy: 285 },
  { id: "riverbend", name: "Riverbend", region: "Aurelian Heart", terrain: "river", resources: ["fish", "clay"], starter: true, d: "M438 254 L522 238 L586 286 L558 366 L478 386 L424 332 Z", cx: 506, cy: 310 },
  { id: "highmere", name: "Highmere", region: "North Ridge", terrain: "hill", resources: ["stone", "goats"], starter: true, d: "M420 122 L526 104 L604 166 L586 286 L522 238 L438 254 Z", cx: 516, cy: 188 },
  { id: "saltwind", name: "Saltwind", region: "Western Coast", terrain: "coast", resources: ["salt", "fish"], d: "M156 292 L278 315 L340 356 L330 448 L210 478 L128 398 Z", cx: 235, cy: 386 },
  { id: "old-road", name: "Old Road", region: "Aurelian Heart", terrain: "field", resources: ["trade", "grain"], d: "M340 356 L424 332 L478 386 L462 478 L358 506 L330 448 Z", cx: 404, cy: 420 },
  { id: "wolfpine", name: "Wolfpine", region: "Northwood", terrain: "forest", resources: ["timber", "herbs"], d: "M226 120 L330 86 L420 122 L438 254 L365 214 L270 222 Z", cx: 330, cy: 166 },
  { id: "bracken", name: "Bracken", region: "Northwood", terrain: "forest", resources: ["timber", "game"], d: "M92 206 L226 120 L270 222 L278 315 L156 292 L84 270 Z", cx: 180, cy: 230 },
  { id: "crownstone", name: "Crownstone", region: "North Ridge", terrain: "hill", resources: ["iron", "stone"], rival: true, d: "M526 104 L658 120 L728 210 L682 302 L586 286 L604 166 Z", cx: 636, cy: 204 },
  { id: "eastfold", name: "Eastfold", region: "Eastern Farms", terrain: "field", resources: ["grain", "horses"], d: "M586 286 L682 302 L744 384 L704 482 L594 462 L558 366 Z", cx: 646, cy: 386 },
  { id: "sunbarrow", name: "Sunbarrow", region: "Eastern Farms", terrain: "grassland", resources: ["grain", "clay"], d: "M704 482 L774 538 L728 644 L604 640 L566 548 L594 462 Z", cx: 666, cy: 558 },
  { id: "whisper-ruins", name: "Whisper Ruins", region: "Old Kingdom", terrain: "ruins", resources: ["relics", "stone"], d: "M462 478 L566 548 L604 640 L498 710 L390 646 L358 506 Z", cx: 482, cy: 590 },
  { id: "lowmarsh", name: "Lowmarsh", region: "South Fen", terrain: "marsh", resources: ["reeds", "fish"], d: "M210 478 L330 448 L358 506 L390 646 L256 664 L168 566 Z", cx: 286, cy: 558 },
  { id: "reedgate", name: "Reedgate", region: "South Fen", terrain: "marsh", resources: ["reeds", "clay"], d: "M256 664 L390 646 L498 710 L424 796 L276 784 Z", cx: 374, cy: 722 },
  { id: "iron-coast", name: "Iron Coast", region: "Western Coast", terrain: "coast", resources: ["ore", "fish"], rival: true, d: "M72 420 L128 398 L210 478 L168 566 L88 616 L42 528 Z", cx: 114, cy: 512 },
  { id: "stormcap", name: "Stormcap", region: "North Ridge", terrain: "hill", resources: ["stone", "eagles"], d: "M658 120 L784 168 L834 284 L744 384 L682 302 L728 210 Z", cx: 748, cy: 260 },
  { id: "ashwood", name: "Ashwood", region: "Eastwood", terrain: "forest", resources: ["timber", "charcoal"], d: "M744 384 L854 420 L860 548 L774 538 L704 482 Z", cx: 794, cy: 468 },
  { id: "glasswater", name: "Glasswater", region: "Riverlands", terrain: "river", resources: ["fish", "trade"], d: "M478 386 L558 366 L594 462 L566 548 L462 478 Z", cx: 528, cy: 456 },
  { id: "marefield", name: "Marefield", region: "Eastern Farms", terrain: "field", resources: ["horses", "grain"], d: "M774 538 L862 620 L804 738 L728 644 Z", cx: 790, cy: 640 },
  { id: "duskhollow", name: "Duskhollow", region: "Old Kingdom", terrain: "ruins", resources: ["relics", "herbs"], d: "M604 640 L728 644 L804 738 L702 812 L598 782 L498 710 Z", cx: 656, cy: 720 },
  { id: "westwatch", name: "Westwatch", region: "Western Coast", terrain: "hill", resources: ["stone", "watch"], d: "M84 270 L156 292 L128 398 L72 420 L32 334 Z", cx: 96, cy: 346 },
  { id: "meadowrun", name: "Meadowrun", region: "Aurelian Heart", terrain: "grassland", resources: ["grain", "flowers"], d: "M330 448 L462 478 L358 506 Z", cx: 386, cy: 478 },
  { id: "northgate", name: "Northgate", region: "North Road", terrain: "grassland", resources: ["trade", "grain"], d: "M330 86 L476 46 L526 104 L420 122 Z", cx: 438, cy: 88 },
  { id: "bluefen", name: "Bluefen", region: "South Fen", terrain: "river", resources: ["fish", "reeds"], d: "M168 566 L256 664 L276 784 L144 730 L88 616 Z", cx: 190, cy: 668 },
  { id: "last-light", name: "Last Light", region: "South Coast", terrain: "coast", resources: ["fish", "salt"], d: "M424 796 L598 782 L702 812 L620 884 L460 884 Z", cx: 552, cy: 832 },
];

export const starterPlotId = "greenvale";
