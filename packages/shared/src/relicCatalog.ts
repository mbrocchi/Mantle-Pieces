import { RELIC_FOOTPRINT } from "./constants";
import type { RelicTier, RelicType } from "./types";

interface RelicSeed {
  id: string;
  tier: RelicTier;
  name: string;
  loreText: string;
  artAssetKey: string;
}

/**
 * Static, seeded content catalog — one entry per illustrated relic in /public/relics.
 * w/h are derived from RELIC_FOOTPRINT[tier] rather than repeated per entry.
 */
const RELIC_SEEDS: RelicSeed[] = [
  // ---- common (1x1) ----
  { id: "painted-shard-triangle", tier: "common", name: "Triangle-Banded Shard", loreText: "A fragment of painted pottery, its triangle motif hinting at a much larger, still-buried vessel.", artAssetKey: "/relics/Fragment1.png" },
  { id: "painted-shard-spiral", tier: "common", name: "Spiral-Painted Shard", loreText: "A curl of glazed clay, the spiral pattern trailing off where the pot once broke.", artAssetKey: "/relics/Fragment2.png" },
  { id: "painted-shard-chevron", tier: "common", name: "Chevron Shard", loreText: "A weathered sliver of pottery banded in faded chevrons, cool to the touch even in the sun.", artAssetKey: "/relics/Fragment3.png" },
  { id: "painted-shard-nested-chevron", tier: "common", name: "Nested Chevron Shard", loreText: "Layers of hand-painted chevrons ring this shard, each one a little smaller than the last.", artAssetKey: "/relics/Fragment4.png" },
  { id: "laureled-gold-coin", tier: "common", name: "Laureled Gold Coin", loreText: "A gold coin stamped with a laureled profile, its inscription worn past reading.", artAssetKey: "/relics/Coin1.png" },
  { id: "bearded-bronze-coin", tier: "common", name: "Bearded Bronze Coin", loreText: "A green-patinaed coin bearing a bearded ruler no history book remembers.", artAssetKey: "/relics/Coin2.png" },
  { id: "twin-profile-coin", tier: "common", name: "Twin-Profile Coin", loreText: "A silver coin struck with two facing profiles, minted to celebrate an alliance long since forgotten.", artAssetKey: "/relics/Coin3.png" },
  { id: "heart-bow-key", tier: "common", name: "Heart-Warded Key", loreText: "An iron key with a heart-shaped bow, its lock lost generations before the key itself was buried.", artAssetKey: "/relics/Key1.png" },
  { id: "gilded-scarab", tier: "common", name: "Gilded Scarab", loreText: "A gold scarab amulet, carried once as a promise of rebirth.", artAssetKey: "/relics/Scarab1.png" },
  { id: "polished-scarab", tier: "common", name: "Polished Scarab", loreText: "A scarab amulet buffed smooth by centuries of sand, its wings still faintly etched.", artAssetKey: "/relics/Scarab2.png" },
  { id: "knotwork-pin", tier: "common", name: "Knotwork Cloak Pin", loreText: "A bronze cloak pin engraved with interlocking knots, its clasp still faintly springy.", artAssetKey: "/relics/Pin1.png" },
  { id: "leaf-spearhead", tier: "common", name: "Leaf-Bladed Spearhead", loreText: "A leaf-shaped spearhead, its wooden shaft long rotted away, the bronze edge still keen.", artAssetKey: "/relics/Spearhead1.png" },
  { id: "ankh-seal-token", tier: "common", name: "Ankh-Carved Seal", loreText: "A stone seal carved with a symbol of life, once pressed into wax on documents no one alive can read.", artAssetKey: "/relics/Token1.png" },
  { id: "medallion-keepsake-box", tier: "common", name: "Medallion Keepsake Box", loreText: "A small carved box, its floral medallion lid still hiding a faint trace of what it once held.", artAssetKey: "/relics/Box1.png" },

  // ---- rare (2x2) ----
  { id: "whispering-oil-lamp", tier: "rare", name: "Whispering Oil Lamp", loreText: "A brass oil lamp, its wick somehow still able to catch a light after all these centuries.", artAssetKey: "/relics/Lamp1.png" },
  { id: "sultans-oil-lamp", tier: "rare", name: "Sultan's Oil Lamp", loreText: "An ornately engraved oil lamp, said to have lit a vizier's private study.", artAssetKey: "/relics/Lamp2.png" },
  { id: "ember-lit-oil-lamp", tier: "rare", name: "Ember-Lit Oil Lamp", loreText: "A well-worn oil lamp, its curved spout blackened from years of steady flame.", artAssetKey: "/relics/Lamp3.png" },
  { id: "banded-amphora", tier: "rare", name: "Banded Amphora", loreText: "A two-handled amphora ringed with a geometric band, remarkably intact for its age.", artAssetKey: "/relics/Vase1.png" },
  { id: "weathered-amphora", tier: "rare", name: "Weathered Amphora", loreText: "A cracked amphora, its handles worn smooth by hands that carried it centuries ago.", artAssetKey: "/relics/Vase2.png" },
  { id: "wave-band-amphora", tier: "rare", name: "Wave-Banded Amphora", loreText: "An amphora circled by a painted wave pattern, its surface glossy despite the years underground.", artAssetKey: "/relics/Vase3.png" },
  { id: "leaf-band-vase", tier: "rare", name: "Leaf-Banded Vase", loreText: "A single-handled vase decorated with a running leaf motif, its foot still standing steady.", artAssetKey: "/relics/Vase4.png" },
  { id: "chevron-band-amphora", tier: "rare", name: "Chevron-Banded Amphora", loreText: "An amphora painted in bold zigzags, its handles arched like a dancer's arms.", artAssetKey: "/relics/Vase5.png" },
  { id: "sunburst-amphora", tier: "rare", name: "Sunburst Amphora", loreText: "A cracked amphora painted with radiating sunbursts, pieced back together by careful hands.", artAssetKey: "/relics/Vase6.png" },
  { id: "floral-urn", tier: "rare", name: "Floral Urn", loreText: "A rounded urn banded in painted leaves, its surface webbed with old fracture lines.", artAssetKey: "/relics/Vase7.png" },
  { id: "cuneiform-tablet", tier: "rare", name: "Cuneiform Tablet", loreText: "A clay tablet pressed with wedge-shaped script, its message lost to a language no one speaks anymore.", artAssetKey: "/relics/Tablet1.png" },
  { id: "runic-tablet", tier: "rare", name: "Fractured Runic Tablet", loreText: "A cracked stone tablet carved with an unfamiliar runic script, broken clean through its middle.", artAssetKey: "/relics/Tablet2.png" },
  { id: "hieroglyph-tablet", tier: "rare", name: "Hieroglyph Tablet", loreText: "A stone tablet etched in careful rows of hieroglyphs, each symbol a small story in itself.", artAssetKey: "/relics/Tablet3.png" },
  { id: "astronomical-clockwork", tier: "rare", name: "Astronomical Clockwork", loreText: "A geared bronze device on a stand, its dial once used to track the turning sky.", artAssetKey: "/relics/Mech1.png" },
  { id: "mossy-gearwheel", tier: "rare", name: "Moss-Grown Gearwheel", loreText: "A flat mechanism of interlocking gears, half-swallowed by moss before it was dug free.", artAssetKey: "/relics/Mech2.png" },
  { id: "cross-gear-mechanism", tier: "rare", name: "Cross-Gear Mechanism", loreText: "A cluster of bronze gears built around a cross-shaped wheel, its purpose still a mystery.", artAssetKey: "/relics/Mech3.png" },
  { id: "bronze-astrolabe", tier: "rare", name: "Bronze Astrolabe", loreText: "A navigator's astrolabe, its rings still able to trace a path by the stars.", artAssetKey: "/relics/Dial1.png" },
  { id: "engraved-sky-disc", tier: "rare", name: "Engraved Sky Disc", loreText: "A circular bronze disc engraved with radiating markings, thought to have charted the heavens.", artAssetKey: "/relics/IncaPlate1.png" },
  { id: "smoking-censer", tier: "rare", name: "Smoking Censer", loreText: "A three-legged censer, its perforated lid still faintly perfumed with old incense.", artAssetKey: "/relics/Incense1.png" },
  { id: "continent-map-scroll", tier: "rare", name: "Continent Map Scroll", loreText: "A parchment scroll charting coastlines that don't quite match any map drawn since.", artAssetKey: "/relics/Map1.png" },
  { id: "scorched-map-fragment", tier: "rare", name: "Scorched Map Fragment", loreText: "A scrap of parchment bearing a single burned mark, all that survives of whatever map it was torn from.", artAssetKey: "/relics/Map2.png" },
  { id: "gemmed-pendant-necklace", tier: "rare", name: "Gemmed Pendant Necklace", loreText: "A gold pendant set with cabochon stones, its chain still supple despite the centuries.", artAssetKey: "/relics/Necklace1.png" },
  { id: "carved-mask-pendant", tier: "rare", name: "Carved Mask Pendant", loreText: "A wooden pendant carved into a watchful face, worn smooth at the edges by a thumb that once traced it.", artAssetKey: "/relics/Necklace2.png" },
  { id: "bone-totem-pendant", tier: "rare", name: "Bone Totem Pendant", loreText: "A bone pendant carved with a guardian's face, strung on a cord replaced more than once.", artAssetKey: "/relics/Necklace3.png" },
  { id: "rune-stone-pendant", tier: "rare", name: "Rune Stone Pendant", loreText: "A single rune scratched into river-worn stone, hung as a charm against something long forgotten.", artAssetKey: "/relics/Necklace4.png" },
  { id: "beaded-treasure-necklace", tier: "rare", name: "Beaded Treasure Necklace", loreText: "A necklace strung with colored beads, each one likely traded from somewhere further away than the last.", artAssetKey: "/relics/Necklace5.png" },
  { id: "obsidian-teardrop-pendant", tier: "rare", name: "Obsidian Teardrop Pendant", loreText: "A teardrop of polished obsidian, cool and dark, worn as a charm on a simple cord.", artAssetKey: "/relics/Necklace6.png" },
  { id: "beaded-treasure-bracelet", tier: "rare", name: "Beaded Treasure Bracelet", loreText: "A bracelet of mismatched beads, each stone likely gathered on a different journey.", artAssetKey: "/relics/Bracelet1.png" },
  { id: "emerald-hilted-dagger", tier: "rare", name: "Emerald-Hilted Dagger", loreText: "A ceremonial dagger set with a single green stone, too delicate for anything but ritual.", artAssetKey: "/relics/Dagger1.png" },
  { id: "turquoise-pommel-dagger", tier: "rare", name: "Turquoise-Pommel Dagger", loreText: "A dagger banded in gold with a turquoise pommel, its edge never sharpened for war.", artAssetKey: "/relics/Dagger2.png" },
  { id: "rose-gem-dagger", tier: "rare", name: "Rose-Gem Dagger", loreText: "A dagger inlaid with rose-colored stones, likely a gift rather than a weapon.", artAssetKey: "/relics/Dagger3.png" },
  { id: "ruby-pommel-shortsword", tier: "rare", name: "Ruby-Pommel Shortsword", loreText: "A short sword with a ruby set in its pommel, its blade barely nicked despite its age.", artAssetKey: "/relics/Sword1.png" },
  { id: "turquoise-banded-sword", tier: "rare", name: "Turquoise-Banded Sword", loreText: "A long sword banded in gold and turquoise, kept more for ceremony than combat.", artAssetKey: "/relics/Sword2.png" },
  { id: "engraved-battle-axe", tier: "rare", name: "Engraved Battle Axe", loreText: "A double-bladed axe etched with looping patterns, its edge still holding a wicked curve.", artAssetKey: "/relics/BattleAxe1.png" },
  { id: "weathered-battle-axe", tier: "rare", name: "Weathered Battle Axe", loreText: "A plain, well-used battle axe, its wooden haft replaced at least once in its working life.", artAssetKey: "/relics/BattleAxe2.png" },

  // ---- heirloom (4x4) ----
  { id: "serene-goddess-bust", tier: "heirloom", name: "Serene Goddess Bust", loreText: "A marble bust of a goddess, her expression untouched by the ages that wore away her pedestal.", artAssetKey: "/relics/Bust1.png" },
  { id: "philosophers-bust", tier: "heirloom", name: "Philosopher's Bust", loreText: "A bearded marble bust, carved with the furrowed brow of someone mid-argument.", artAssetKey: "/relics/Bust2.png" },
  { id: "senators-bust", tier: "heirloom", name: "Senator's Bust", loreText: "A marble bust of a stern official, commissioned by someone who clearly thought highly of him.", artAssetKey: "/relics/Bust3.png" },
  { id: "youthful-maiden-bust", tier: "heirloom", name: "Youthful Maiden Bust", loreText: "A marble bust of a young woman, her curls carved so finely they seem to move in the light.", artAssetKey: "/relics/Bust4.png" },
  { id: "noble-youth-bust", tier: "heirloom", name: "Noble Youth Bust", loreText: "A marble bust of a clean-shaven young noble, likely set once in a family shrine.", artAssetKey: "/relics/Bust5.png" },
  { id: "temple-maiden-bust", tier: "heirloom", name: "Temple Maiden Bust", loreText: "A marble bust with a serene, centered gaze, the kind reserved for temple offerings.", artAssetKey: "/relics/Bust6.png" },
  { id: "fanged-jade-idol", tier: "heirloom", name: "Fanged Jade Idol", loreText: "A seated jade idol bearing fangs and folded hands, carved to be feared and worshipped in equal measure.", artAssetKey: "/relics/Statue1.png" },
  { id: "seated-jade-guardian", tier: "heirloom", name: "Seated Jade Guardian", loreText: "A jade figure seated in quiet vigilance, hands resting on its knees as if waiting out the centuries.", artAssetKey: "/relics/Statue2.png" },
  { id: "stone-household-idol", tier: "heirloom", name: "Stone Household Idol", loreText: "A simple stone idol, the kind likely kept close to a hearth rather than a temple.", artAssetKey: "/relics/Statue3.png" },
  { id: "gilded-pharaoh-mask", tier: "heirloom", name: "Gilded Pharaoh's Mask", loreText: "A gold death mask striped in lapis blue, crafted to carry a king's face into the next world.", artAssetKey: "/relics/Pharoh1.png" },
  { id: "royal-burial-mask", tier: "heirloom", name: "Royal Burial Mask", loreText: "A burial mask of beaten gold, its serene expression meant to outlast the ruler it once covered.", artAssetKey: "/relics/Pharoh2.png" },
  { id: "sunset-pharaoh-mask", tier: "heirloom", name: "Sunset Pharaoh's Mask", loreText: "A pharaoh's funerary mask, gold catching the light the way it must have in torchlit tombs.", artAssetKey: "/relics/Pharoh3.png" },
];

export const RELIC_CATALOG: RelicType[] = RELIC_SEEDS.map((seed) => ({
  ...seed,
  vaultThemeIndex: 0,
  w: RELIC_FOOTPRINT[seed.tier],
  h: RELIC_FOOTPRINT[seed.tier],
}));

export function catalogForVaultTheme(vaultThemeIndex: number): RelicType[] {
  const themed = RELIC_CATALOG.filter((r) => r.vaultThemeIndex === vaultThemeIndex);
  return themed.length > 0 ? themed : RELIC_CATALOG.filter((r) => r.vaultThemeIndex === 0);
}

export function findRelicType(relicTypeId: string): RelicType | undefined {
  return RELIC_CATALOG.find((r) => r.id === relicTypeId);
}
