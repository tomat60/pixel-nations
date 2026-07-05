export type View = "map" | "orders" | "realm" | "chronicle" | "world";
export type Terrain = "plains" | "forest" | "mountain" | "coast" | "basin" | "ruins" | "marsh";

export type Parcel = {
  id: string;
  name: string;
  region: string;
  terrain: Terrain;
  resources: [string, string];
  d: string;
  cx: number;
  cy: number;
  starter?: boolean;
  rival?: boolean;
};

export type OrderId = "expand" | "develop" | "secure" | "scout" | "trade";

export const parcels: Parcel[] = [
  { id: "ironstrand", name: "Ironstrand", region: "Iron Coast", terrain: "coast", resources: ["Fish", "Ore"], d: "M70 248 L155 220 L206 288 L164 358 L78 345 Z", cx: 134, cy: 292, rival: true },
  { id: "westwatch", name: "Westwatch", region: "Iron Coast", terrain: "coast", resources: ["Salt", "Trade"], d: "M82 350 L164 358 L196 439 L134 505 L60 464 Z", cx: 132, cy: 421 },
  { id: "harborfen", name: "Harborfen", region: "Iron Coast", terrain: "marsh", resources: ["Reeds", "Fish"], d: "M135 506 L196 439 L278 492 L254 590 L154 595 Z", cx: 208, cy: 524 },
  { id: "northpass", name: "Northpass", region: "North Frontier", terrain: "mountain", resources: ["Stone", "Defense"], d: "M229 92 L331 70 L401 119 L361 199 L242 202 L188 144 Z", cx: 298, cy: 139, rival: true },
  { id: "frostgate", name: "Frostgate", region: "North Frontier", terrain: "mountain", resources: ["Iron", "Snowmelt"], d: "M401 119 L502 84 L589 132 L557 211 L449 219 L361 199 Z", cx: 480, cy: 155 },
  { id: "crownridge", name: "Crownridge", region: "Crownlands", terrain: "mountain", resources: ["Gold", "Stone"], d: "M589 132 L704 136 L782 208 L732 292 L615 271 L557 211 Z", cx: 663, cy: 211 },
  { id: "highmere", name: "Highmere", region: "Crownlands", terrain: "plains", resources: ["Horses", "Influence"], d: "M704 136 L820 176 L905 270 L842 344 L732 292 L782 208 Z", cx: 803, cy: 251, rival: true },
  { id: "pinewatch", name: "Pinewatch", region: "North Frontier", terrain: "forest", resources: ["Timber", "Cover"], d: "M242 202 L361 199 L390 289 L316 360 L206 288 Z", cx: 300, cy: 278 },
  { id: "elderwood", name: "Elderwood", region: "North Frontier", terrain: "forest", resources: ["Timber", "Game"], d: "M361 199 L449 219 L478 319 L390 289 Z", cx: 420, cy: 256 },
  { id: "riverbend", name: "Riverbend", region: "Aurelia", terrain: "plains", resources: ["Water", "Grain"], d: "M449 219 L557 211 L615 271 L572 368 L478 319 Z", cx: 535, cy: 287, starter: true },
  { id: "stonefall", name: "Stonefall", region: "Crownlands", terrain: "mountain", resources: ["Stone", "Ore"], d: "M615 271 L732 292 L736 396 L624 428 L572 368 Z", cx: 663, cy: 350 },
  { id: "silvermark", name: "Silvermark", region: "Crownlands", terrain: "plains", resources: ["Silver", "Influence"], d: "M732 292 L842 344 L816 464 L736 396 Z", cx: 785, cy: 378 },
  { id: "greenvale", name: "Greenvale", region: "Aurelia", terrain: "plains", resources: ["Food", "Growth"], d: "M316 360 L390 289 L478 319 L456 429 L342 455 Z", cx: 398, cy: 369, starter: true },
  { id: "newaurelia", name: "New Aurelia", region: "Aurelia", terrain: "plains", resources: ["Grain", "People"], d: "M478 319 L572 368 L552 470 L456 429 Z", cx: 514, cy: 392, starter: true },
  { id: "oldford", name: "Oldford", region: "Aurelia", terrain: "plains", resources: ["Crossing", "Trade"], d: "M456 429 L552 470 L531 568 L411 552 L342 455 Z", cx: 459, cy: 494 },
  { id: "copperfield", name: "Copperfield", region: "Aurelia", terrain: "plains", resources: ["Copper", "Grain"], d: "M196 439 L316 360 L342 455 L278 492 Z", cx: 286, cy: 431 },
  { id: "sunmeadow", name: "Sunmeadow", region: "Aurelia", terrain: "plains", resources: ["Food", "Morale"], d: "M552 470 L624 428 L736 396 L728 514 L639 587 L531 568 Z", cx: 630, cy: 501 },
  { id: "kingsroad", name: "Kingsroad", region: "Aurelia", terrain: "plains", resources: ["Roads", "Influence"], d: "M278 492 L342 455 L411 552 L352 642 L254 590 Z", cx: 337, cy: 550 },
  { id: "relicfen", name: "Relicfen", region: "Ember Basin", terrain: "ruins", resources: ["Relics", "Unrest"], d: "M411 552 L531 568 L506 676 L352 642 Z", cx: 443, cy: 616 },
  { id: "mistmarsh", name: "Mistmarsh", region: "Ember Basin", terrain: "marsh", resources: ["Herbs", "Risk"], d: "M531 568 L639 587 L620 688 L506 676 Z", cx: 570, cy: 625 },
  { id: "emberfall", name: "Emberfall", region: "Ember Basin", terrain: "basin", resources: ["Clay", "Heat"], d: "M639 587 L728 514 L842 566 L801 674 L620 688 Z", cx: 720, cy: 614, rival: true },
  { id: "goldcoast", name: "Goldcoast", region: "Iron Coast", terrain: "coast", resources: ["Trade", "Gold"], d: "M842 344 L924 420 L897 562 L842 566 L728 514 L816 464 Z", cx: 839, cy: 475 },
  { id: "saltmere", name: "Saltmere", region: "Iron Coast", terrain: "coast", resources: ["Salt", "Ships"], d: "M897 562 L930 641 L801 674 L842 566 Z", cx: 866, cy: 616 },
  { id: "ashgrove", name: "Ashgrove", region: "Ember Basin", terrain: "forest", resources: ["Charcoal", "Game"], d: "M154 595 L254 590 L352 642 L289 704 L162 690 Z", cx: 249, cy: 644 },
  { id: "redbarrow", name: "Redbarrow", region: "Ember Basin", terrain: "ruins", resources: ["Relics", "Omen"], d: "M289 704 L352 642 L506 676 L486 736 L344 752 Z", cx: 411, cy: 700, rival: true },
  { id: "lowmarket", name: "Lowmarket", region: "Aurelia", terrain: "plains", resources: ["Trade", "Food"], d: "M620 688 L801 674 L763 748 L486 736 L506 676 Z", cx: 639, cy: 708 },
  { id: "eastwatch", name: "Eastwatch", region: "Crownlands", terrain: "mountain", resources: ["Watch", "Stone"], d: "M842 344 L905 270 L960 350 L924 420 Z", cx: 908, cy: 352 },
  { id: "deepgrove", name: "Deepgrove", region: "North Frontier", terrain: "forest", resources: ["Timber", "Mystery"], d: "M188 144 L242 202 L206 288 L155 220 Z", cx: 199, cy: 215 },
  { id: "whitefalls", name: "Whitefalls", region: "North Frontier", terrain: "plains", resources: ["Water", "Faith"], d: "M502 84 L612 76 L704 136 L589 132 Z", cx: 603, cy: 110 },
  { id: "crownhold", name: "Crownhold", region: "Crownlands", terrain: "ruins", resources: ["Crown", "Legacy"], d: "M820 176 L930 238 L960 350 L905 270 Z", cx: 899, cy: 255, rival: true },
];

export const views: { id: View; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "map", label: "Map" },
  { id: "realm", label: "Age" },
  { id: "chronicle", label: "Banner" },
  { id: "world", label: "Profile" },
];

export const terrainFill: Record<Terrain, string> = {
  plains: "#c8a55c",
  forest: "#3f7a45",
  mountain: "#81705c",
  coast: "#bd8d58",
  basin: "#9d5f3f",
  ruins: "#897666",
  marsh: "#667b56",
};

export const terrainLine: Record<Terrain, string> = {
  plains: "Fields, room to grow, easy to defend badly.",
  forest: "Timber, cover, and secrets under the canopy.",
  mountain: "Stone, hard borders, and slow expansion.",
  coast: "Trade winds, wealth, and open water.",
  basin: "Heat, clay, old fires, and heavy consequences.",
  ruins: "Power left behind by somebody who failed first.",
  marsh: "Useful, unstable, and never fully still.",
};
