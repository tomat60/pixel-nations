# Pixel Nations Multiscale Visual System — V1

Status: `BINDING_FOR_AURELIAN_BASIN_REBUILD`

This document keeps the land, settlement/city, nation and world views inside one visual universe. It does not authorize Village or World implementation during Sprint #285; it defines the shared grammar those later slices must inherit.

## Shared constants

Across every scale:

- fixed or deliberately stepped orthographic framing rather than unrelated camera languages;
- warm natural light, painterly low-poly materials and restrained atmosphere;
- muted olive terrain, ochre roads, cool stone, teal water, antique-gold interaction accents;
- deep Aurelian red plus gold for founder identity;
- geography and physical change before UI explanation;
- the same founder flag, heraldry, road language and regional names;
- black/gold used as UI framing, not as a blanket terrain treatment.

## Scale 1 — Land / Aurelian Basin

Player question: **Where does my history begin?**

- Full Sector A-01 basin remains readable in one frame.
- Seven lands are implied by geography and clustered terrain composition.
- One land, Hearthmeadow, is discoverable and claimable.
- Claim places a persistent founder flag and a three-building settlement footprint.
- UI is one sector title and one contextual land card.

## Scale 2 — Settlement and city

Player question: **What is growing on my land?**

- Reuse the same azimuth and terrain palette; zoom closer instead of switching art style.
- Growth stages must be physical: camp/hamlet → settlement → town → city.
- Roads, farms, workshops and civic buildings should appear in the same spatial logic visible on the land map.
- The founder flag remains the visual anchor.
- Building silhouettes and banner colour must remain legible when the camera later pulls back.

## Scale 3 — Nation

Player question: **How do my lands become one polity?**

- Pull back to show connected lands, routes and the capital.
- Borders use restrained antique-gold/cloth-map language, never neon outlines.
- Claimed land colours derive from heraldry, not arbitrary UI status colours.
- Capital hierarchy is shown by settlement scale, roads and banners before labels.

## Scale 4 — World atlas

Player question: **Where is my nation in the 10,000-land world?**

- Atlas shows the finite 100×100 world truth and locates Sector A-01 honestly.
- The world is not rendered as 10,000 equal dashboard cells.
- Region colours, coastlines, routes and founder heraldry must match the closer scales.
- The atlas may simplify geometry, but may not invent a different palette or icon system.

## Transition rules

Later transitions should feel like changing strategic altitude over one world:

1. Preserve north orientation and broad camera azimuth.
2. Preserve major river, ridge, road and coast landmarks.
3. Preserve land and settlement names.
4. Preserve founder flag/banner identity.
5. Replace detail progressively; do not crossfade into an unrelated illustration.

## Current sprint boundary

Sprint #285 implements only Scale 1 and the claimed-state settlement footprint needed to prove continuity toward Scale 2. Settlement gameplay, nation and world implementation remain blocked until the Basin passes mechanical and visual acceptance.
