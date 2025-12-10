import { PokemonSpecies } from './types';

// Helper to generate sprite URL. Handles special characters for PokeAPI.
const getSprite = (id: number, name: string) => {
  // Fix naming for sprites (e.g. Nidoran)
  let spriteId = id;
  // PokeAPI uses standard IDs, so just using ID is usually safest.
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`;
};

// Raw list of names provided
const NAMES = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise",
  "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu",
  "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking",
  "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
  "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio",
  "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine",
  "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp",
  "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem",
  "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd",
  "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster",
  "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode",
  "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
  "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan",
  "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime", "Scyther", "Jynx",
  "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto",
  "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl",
  "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew",
  // Gen 2
  "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr",
  "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat",
  "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu",
  "Mareep", "Flaaffy", "Ampharos", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed",
  "Hoppip", "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Quagsire",
  "Espeon", "Umbreon", "Murkrow", "Slowking", "Misdreavus", "Unown", "Wobbuffet", "Girafarig",
  "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish",
  "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring", "Slugma", "Magcargo",
  "Swinub", "Piloswine", "Corsola", "Remoraid", "Octillery", "Delibird", "Mantine", "Skarmory",
  "Houndour", "Houndoom", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle",
  "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey",
  "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar", "Tyranitar", "Lugia", "Ho-oh", "Celebi",
  // Gen 3
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert",
  "Poochyena", "Mightyena", "Zigzagoon", "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox",
  "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper",
  "Ralts", "Kirlia", "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", "Slaking",
  "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama",
  "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon", "Aggron",
  "Meditite", "Medicham", "Electrike", "Manectric", "Plusle", "Minun", "Volbeat", "Illumise",
  "Roselia", "Gulpin", "Swalot", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt",
  "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne",
  "Swablu", "Altaria", "Zangoose", "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash",
  "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith", "Armaldo",
  "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Duskull", "Dusclops",
  "Tropius", "Chimecho", "Absol", "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein",
  "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence",
  "Beldum", "Metang", "Metagross", "Regirock", "Regice", "Registeel", "Latias", "Latios",
  "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys",
  // Gen 4
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon",
  "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray",
  "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim",
  "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon",
  "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Mismagius", "Honchkrow", "Glameow", "Purugly",
  "Chingling", "Stunky", "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny", "Chatot", "Spiritomb",
  "Gible", "Gabite", "Garchomp", "Munchlax", "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion",
  "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow",
  "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega",
  "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass", "Dusknoir", "Froslass",
  "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia",
  "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus",
  // Gen 5
  "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott",
  "Patrat", "Watchog", "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage", "Simisage",
  "Pansear", "Simisear", "Panpour", "Simipour", "Munna", "Musharna", "Pidove", "Tranquill", "Unfezant",
  "Blitzle", "Zebstrika", "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur", "Excadrill",
  "Audino", "Timburr", "Gurdurr", "Conkeldurr", "Tympole", "Palpitoad", "Seismitoad", "Thro", "Sawk",
  "Sewaddle", "Swadloon", "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott",
  "Petilil", "Lilligant", "Basculin", "Sandile", "Krokorok", "Krookodile", "Darumaka", "Darmanitan",
  "Maractus", "Dwebble", "Crustle", "Scraggy", "Scrafty", "Sigilyph", "Yamask", "Cofagrigus",
  "Tirtouga", "Carracosta", "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zoroark",
  "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus",
  "Ducklett", "Swanna", "Vanillite", "Vanillish", "Vanilluxe", "Deerling", "Sawsbuck", "Emolga",
  "Karrablast", "Escavalier", "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola",
  "Joltik", "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang", "Tynamo", "Eelektrik", "Eelektross",
  "Elgyem", "Beheeyem", "Litwick", "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo", "Beartic",
  "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Mienfoo", "Mienshao", "Druddigon", "Golett", "Golurk",
  "Pawniard", "Bisharp", "Bouffalant", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Heatmor", "Durant",
  "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona", "Cobalion", "Terrakion", "Virizion",
  "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect"
];

const FAMILY_MAPPINGS: number[][] = [
  [1,2,3], [4,5,6], [7,8,9], [10,11,12], [13,14,15], [16,17,18], [19,20], [21,22], [23,24], [25,26,172],
  [27,28], [29,30,31], [32,33,34], [35,36,173], [37,38], [39,40,174], [41,42,169], [43,44,45,182],
  [46,47], [48,49], [50,51], [52,53], [54,55], [56,57], [58,59], [60,61,62,186], [63,64,65], [66,67,68],
  [69,70,71], [72,73], [74,75,76], [77,78], [79,80,199], [81,82,199], [83], [84,85], [86,87], [88,89], [90,91],
  [92,93,94], [95,208], [96,97], [98,99], [100,101], [102,103], [104,105], [106,107,236,237],
  [108], [109,110], [111,112,464], [113,242], [114,465], [115], [116,117,230], [118,119], [120,121], [122],
  [123,212], [124], [125,239,466], [126,467], [127], [128], [129,130], [131], [132],
  [133,134,135,136,196,197,470,471],
  [137,233,474], [138,139], [140,141], [142], [143,446], [144], [145], [146], [147,148,149], [150], [151],
  [152,153,154], [155,156,157], [158,159,160], [161,162], [163,164], [165,166], [167,168], 
  [170,171], [175,176,468], [177,178], [179,180,181], [183,184], [185], [187,188,189], [190,424],
  [191,192], [193], [194,195], [198], [200], [201], [202], [203], [204,205], [206], [207,472],
  [209,210], [211], [213], [214], [215,461], [216,217], [218,219], [220,221,473], [222], [223,224], [225], [226], [227],
  [228,229], [231,232], [234], [235], [238], [240], [241], [243], [244], [245], [246,247,248], [249], [250], [251],
  [252,253,254], [255,256,257], [258,259,260], [261,262], [263,264], [265,266,267,268,269], [270,271,272],
  [273,274,275], [276,277], [278,279], [280,281,282,475], [283,284], [285,286], [287,288,289], [290,291,292],
  [293,294,295], [296,297], [298], [299,476], [300,301], [302], [303], [304,305,306], [307,308], [309,310], [311,312],
  [313], [314], [315,407], [316,317], [318,319], [320,321], [322,323], [324], [325,326], [327], [328,329,330],
  [331,332], [333,334], [335], [336], [337], [338], [339,340], [341,342], [343,344], [345,346], [347,348], [349,350],
  [351], [352], [353,354], [355,356,477], [357], [358], [359], [360,361,362], [363,364,365], [366,367,368], [369], [370],
  [371,372,373], [374,375,376], [377], [378], [379], [380], [381], [382], [383], [384], [385], [386],
  [387,388,389], [390,391,392], [393,394,395], [396,397,398], [399,400], [401,402], [403,404,405], [406,407],
  [408,409], [410,411], [412,413,414], [415,416], [417], [418,419], [420,421], [422,423], [425,426], [427,428], [429],
  [430], [431,432], [433], [434,435], [436,437], [438], [439], [440], [441], [442], [443,444,445], [447,448], [449,450],
  [451,452], [453,454], [455], [456,457], [458], [459,460], [462], [463], [469], [478], [479], [480], [481], [482], [483],
  [484], [485], [486], [487], [488], [489], [490], [491], [492], [493],
  [494,495,496], [497,498,499], [500,501,502], [503,504,505], [506,507,508], [509,510], [511,512,513], [514,515,516],
  [517,518], [519,520,521], [522,523], [524,525,526], [527,528], [529,530], [531], [532,533,534], [535,536,537], [538,539],
  [540,541,542], [543,544,545], [546,547], [548,549], [550], [551,552,553], [554,555], [556], [557,558], [559,560], [561],
  [562,563], [564,565], [566,567], [568,569], [570,571], [572,573], [574,575,576], [577,578,579], [580,581], [582,583,584],
  [585,586], [587], [588,589], [590,591], [592,593], [594], [595,596], [597,598], [599,600,601], [602,603,604],
  [605,606], [607,608,609], [610,611,612], [613,614], [615], [616,617], [618], [619,620], [621], [622,623], [624,625],
  [626], [627,628], [629,630], [631], [632], [633,634,635], [636,637], [638], [639], [640], [641], [642], [643], [644],
  [645], [646], [647], [648], [649]
];

// Reconstruct the DB
export const POKEMON_DB: PokemonSpecies[] = [];

// Helper map to identify which family an ID belongs to
const ID_TO_FAMILY_MAP = new Map<number, number[]>();
FAMILY_MAPPINGS.forEach(family => {
  family.forEach(id => {
    ID_TO_FAMILY_MAP.set(id, family);
  });
});

NAMES.forEach((name, index) => {
  const id = index + 1;
  const family = ID_TO_FAMILY_MAP.get(id) || [id];
  
  // Base ID is the first in the family array, unless we want to link strictly by lowest.
  const sortedFamily = [...family].sort((a,b) => a - b);
  const familyId = sortedFamily[0];
  
  // Determine Stage
  const stageIndex = sortedFamily.indexOf(id);
  const stage = (stageIndex >= 0 && stageIndex < 3) ? (stageIndex + 1) as 1|2|3 : 1;
  
  // Determine Evolution (Standard Linear)
  const evolutionId = (stageIndex >= 0 && stageIndex < sortedFamily.length - 1) 
    ? sortedFamily[stageIndex + 1] 
    : undefined;

  POKEMON_DB.push({
    id,
    name,
    type: ["Normal"],
    sprite: getSprite(id, name),
    stage,
    evolutionId,
    familyId
  });
});

// Manual Overrides for Branching Evolutions and Corrections
const MANUAL_OVERRIDES: Record<number, Partial<PokemonSpecies>> = {
  // Oddish (43) -> Gloom (44). Gloom branches.
  44: { branchEvolutions: [45, 182], evolutionId: undefined }, // Gloom -> Vileplume / Bellossom
  45: { evolutionId: undefined }, // Vileplume stops
  182: { evolutionId: undefined }, // Bellossom stops
  
  // Poliwag (60) -> Poliwhirl (61). Poliwhirl branches.
  61: { branchEvolutions: [62, 186], evolutionId: undefined }, // Poliwhirl -> Poliwrath / Politoed
  62: { evolutionId: undefined }, // Poliwrath stops
  186: { evolutionId: undefined }, // Politoed stops

  // Slowpoke (79) -> Slowbro (80) OR Slowking (199)
  // Note: Standard generation made 79->80->199 which is wrong.
  79: { branchEvolutions: [80, 199], evolutionId: undefined },
  80: { evolutionId: undefined }, // Slowbro stops
  199: { evolutionId: undefined }, // Slowking stops

  // Eevee (133)
  133: { branchEvolutions: [134, 135, 136, 196, 197, 470, 471], evolutionId: undefined },
  
  // Tyrogue (236) -> Hitmonlee (106), Hitmonchan (107), Hitmontop (237)
  236: { branchEvolutions: [106, 107, 237], evolutionId: undefined },
  
  // Wurmple (265) -> Silcoon (266) OR Cascoon (268)
  265: { branchEvolutions: [266, 268], evolutionId: undefined },
  
  // Ralts (280) -> Kirlia (281). Kirlia branches.
  281: { branchEvolutions: [282, 475], evolutionId: undefined }, // Kirlia -> Gardevoir / Gallade
  282: { evolutionId: undefined }, // Gardevoir stops
  475: { evolutionId: undefined }, // Gallade stops

  // Nincada (290) -> Ninjask (291) / Shedinja (292)
  290: { branchEvolutions: [291, 292], evolutionId: undefined },
  
  // Snorunt (361) -> Glalie (362) / Froslass (478)
  361: { branchEvolutions: [362, 478], evolutionId: undefined },
  362: { evolutionId: undefined }, // Glalie stops
  478: { evolutionId: undefined }, // Froslass stops

  // Clamperl (366) -> Huntail (367) / Gorebyss (368)
  366: { branchEvolutions: [367, 368], evolutionId: undefined },
  
  // Burmy (412) -> Wormadam (413) / Mothim (414)
  412: { branchEvolutions: [413, 414], evolutionId: undefined },
};

// Apply Overrides
POKEMON_DB.forEach(p => {
  if (MANUAL_OVERRIDES[p.id]) {
    Object.assign(p, MANUAL_OVERRIDES[p.id]);
  }
});

// Manual Type Overrides (Keeping the examples)
const typeUpdates: Record<number, string[]> = {
  1: ["Grass", "Poison"], 4: ["Fire"], 7: ["Water"], 25: ["Electric"],
  92: ["Ghost", "Poison"], 133: ["Normal"], 149: ["Dragon", "Flying"], 150: ["Psychic"]
};

POKEMON_DB.forEach(p => {
  if (typeUpdates[p.id]) {
    p.type = typeUpdates[p.id];
  }
});
