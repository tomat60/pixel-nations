# Fable Full Project Review Brief

Use Fable as an external senior strategy-game director, UX architect, QA lead, and process critic.

Goal: help Pixel Nations become an excellent browser-first strategy game, not merely a polished map demo.

Core concept: finite world of 10,000 lands; Sector A-01 demo; land -> settlement/city -> nation -> empire. This direction is promising but not sacred.

Review focus:

1. Is the current direction strong enough, or should we pivot within Pixel Nations?
2. Are our docs helping us build strategy gameplay, or pushing us toward shallow UI polish?
3. Why have repeated agent/Cursor iterations struggled with mobile /world fullscreen, map shell, and options appearing below the map?
4. What should we learn from Civilization, Crusader Kings, Europa Universalis, Tribal Wars, Anno, Settlers, Factorio, Mindustry, Total War, Clash of Clans, and Boom Beach?
5. What should we avoid because it is too expensive, too generic, or wrong for a tiny-team browser MVP?
6. What is the strongest direction for the next two months?
7. What are the next two implementation sprints?
8. What should Cursor be allowed to do next, and what must it not touch?

Hard rule: mobile /world must behave like a game command shell. The map is the primary surface. Core actions and navigation must live in HUD, tray, drawer, modal, or contextual overlays. No core action may require scrolling below the map.

Required final line:
DECISION: STAY_THE_COURSE / PIVOT_WITHIN_PIXEL_NATIONS / MAJOR_RETHINK_REQUIRED
