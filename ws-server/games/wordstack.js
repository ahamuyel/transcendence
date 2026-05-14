const crypto = require("crypto")

const GRID_SIZE = 5
const TURN_TIME = 60000
const POINTS_PER_LETTER = 10
const BONUS_THRESHOLD = 6
const BONUS_POINTS = 30

const LETTER_POOL = [
  "A", "A", "A", "A", "A", "A", "A", "A",
  "B", "B",
  "C", "C", "C",
  "D", "D", "D",
  "E", "E", "E", "E", "E", "E", "E", "E", "E", "E",
  "F",
  "G", "G",
  "H", "H",
  "I", "I", "I", "I", "I", "I", "I",
  "J",
  "K",
  "L", "L", "L", "L",
  "M", "M",
  "N", "N", "N", "N", "N",
  "O", "O", "O", "O", "O", "O",
  "P", "P",
  "Q",
  "R", "R", "R", "R", "R",
  "S", "S", "S", "S",
  "T", "T", "T", "T", "T",
  "U", "U", "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]

const SPECIAL_TILES = {
  "★": { type: "double", label: "★", prob: 0.08 },
  "☠": { type: "skull", label: "☠", prob: 0.04 },
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateGrid() {
  const grid = []
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = []
    for (let c = 0; c < GRID_SIZE; c++) {
      const roll = Math.random()
      let special = null
      for (const [sym, cfg] of Object.entries(SPECIAL_TILES)) {
        if (roll < cfg.prob) {
          special = { ...cfg, symbol: sym }
          break
        }
      }
      if (special) {
        row.push({ letter: null, special, r, c })
      } else {
        row.push({ letter: pickRandom(LETTER_POOL), special: null, r, c })
      }
    }
    grid.push(row)
  }
  return grid
}

function isAdjacent(a, b) {
  const dr = Math.abs(a.r - b.r)
  const dc = Math.abs(a.c - b.c)
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)
}

function validatePath(grid, path) {
  if (!path || path.length < 2) return false
  for (let i = 1; i < path.length; i++) {
    if (!isAdjacent(path[i - 1], path[i])) return false
  }
  const seen = new Set()
  for (const cell of path) {
    const key = `${cell.r},${cell.c}`
    if (seen.has(key)) return false
    seen.add(key)
    if (cell.r < 0 || cell.r >= GRID_SIZE || cell.c < 0 || cell.c >= GRID_SIZE) return false
  }
  return true
}

function getWordFromPath(grid, path) {
  const letters = path.map((p) => {
    const cell = grid[p.r][p.c]
    return cell.letter || cell.special?.label || "?"
  })
  return letters.join("").toLowerCase()
}

function calculateScore(grid, path, word) {
  let base = word.length * POINTS_PER_LETTER
  if (word.length >= BONUS_THRESHOLD) base += BONUS_POINTS
  const hasDouble = path.some((p) => grid[p.r][p.c]?.special?.type === "double")
  const hasSkull = path.some((p) => grid[p.r][p.c]?.special?.type === "skull")
  return { base, doubled: hasDouble, skulled: hasSkull, total: hasDouble ? base * 2 : base }
}

const wordCache = new Set()
const MIN_WORD_LENGTH = 3

function isValidWord(word) {
  if (word.length < MIN_WORD_LENGTH) return false
  if (wordCache.has(word)) return true

  try {
    const { execSync } = require("child_process")
    const result = execSync(
      `grep -i "^${word}$" /usr/share/dict/words 2>/dev/null || echo ""`,
      { encoding: "utf8", timeout: 1000 }
    )
    if (result.trim()) {
      wordCache.add(word)
      return true
    }
  } catch {
    // fallback: check for basic patterns
  }

  const commonWords = new Set([
    "cat", "dog", "run", "big", "red", "hat", "sun", "fun", "old", "new",
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "her", "was", "one", "our", "out", "has", "get", "him", "his", "how",
    "its", "may", "see", "she", "two", "use", "way", "who", "ago", "any",
    "bad", "boy", "car", "day", "eat", "end", "far", "few", "got", "hot",
    "let", "man", "men", "own", "put", "ran", "say", "set", "sit", "six",
    "ten", "top", "try", "was", "yes", "yet",
    "able", "also", "away", "back", "ball", "band", "bank", "base", "bath",
    "beat", "been", "bell", "best", "bird", "blow", "blue", "boat", "body",
    "bomb", "bone", "book", "born", "boss", "both", "burn", "busy", "cake",
    "call", "calm", "came", "camp", "card", "care", "cast", "cell", "chat",
    "chip", "city", "club", "coat", "code", "cold", "come", "cook", "cool",
    "copy", "cord", "core", "cost", "crew", "crop", "cure", "dare", "dark",
    "data", "date", "dead", "deal", "dear", "deep", "diet", "disc", "dish",
    "disk", "dock", "does", "done", "door", "dose", "down", "drag", "draw",
    "drop", "drum", "dual", "dull", "dump", "each", "earn", "ease", "east",
    "easy", "edge", "else", "even", "ever", "evil", "exam", "face", "fact",
    "fail", "fair", "fake", "fall", "fame", "farm", "fast", "fate", "fear",
    "feed", "feel", "fell", "fence", "file", "fill", "film", "find", "fine",
    "fire", "firm", "fish", "five", "flag", "flat", "flee", "flow", "fold",
    "folk", "food", "foot", "ford", "form", "fort", "four", "free", "from",
    "fuel", "full", "fund", "fuse", "fuss", "fuzz", "gain", "game", "gang",
    "gate", "gave", "gaze", "gear", "gene", "gift", "girl", "give", "glad",
    "goal", "goat", "goes", "gold", "golf", "gone", "good", "grab", "gray",
    "grew", "grid", "grin", "grip", "grow", "gulf", "guru", "hack", "hair",
    "half", "hall", "hand", "hang", "happ", "hard", "harm", "hate", "haul",
    "have", "head", "hear", "heat", "heel", "held", "hell", "help", "here",
    "hero", "high", "hill", "hint", "hire", "hold", "hole", "holy", "home",
    "hook", "hope", "horn", "host", "hour", "huge", "hull", "hung", "hunt",
    "hurt", "icon", "idea", "inch", "info", "into", "iron", "isle", "item",
    "jack", "jane", "jazz", "jean", "john", "join", "joke", "jump", "june",
    "jury", "just", "keen", "keep", "kept", "kick", "kill", "kind", "king",
    "kiss", "kite", "knee", "knew", "knit", "knob", "knot", "know", "labs",
    "lace", "lack", "lake", "lamp", "land", "lane", "last", "late", "lawn",
    "lead", "leaf", "lean", "left", "lend", "lens", "less", "life", "lift",
    "like", "limb", "lime", "link", "list", "live", "load", "loan", "lock",
    "logo", "long", "look", "lord", "lose", "loss", "lost", "lots", "love",
    "luck", "lump", "lunch", "lung", "made", "mail", "main", "make", "male",
    "mall", "maze", "mass", "mark", "maze", "mean", "meat", "meet", "menu",
    "mere", "mesh", "mess", "mild", "mile", "milk", "mill", "mind", "mine",
    "miss", "mist", "moan", "mode", "mold", "mood", "moon", "more", "moss",
    "most", "move", "much", "must", "myth", "nail", "name", "navy", "near",
    "neat", "neck", "need", "nest", "news", "next", "nice", "nine", "node",
    "none", "noon", "norm", "nose", "note", "noun", "null", "nuts", "oath",
    "obey", "odds", "okay", "once", "only", "onto", "open", "oral", "oven",
    "over", "pace", "pack", "page", "paid", "pain", "pair", "pale", "palm",
    "pane", "park", "part", "pass", "past", "path", "peak", "peer", "pest",
    "pick", "pile", "pine", "pink", "pipe", "plan", "play", "plea", "plot",
    "plug", "plus", "poem", "poet", "pole", "poll", "pond", "pool", "poor",
    "pope", "port", "pose", "post", "pour", "pray", "pull", "pump", "pure",
    "push", "quit", "quiz", "race", "rack", "radar", "rage", "raid", "rail",
    "rain", "rake", "rank", "rare", "rash", "rate", "read", "real", "reap",
    "rear", "reef", "reel", "rein", "rely", "rend", "rent", "rest", "rich",
    "ride", "rift", "ring", "riot", "rise", "risk", "road", "roam", "rock",
    "rode", "role", "roll", "roof", "room", "root", "rope", "rose", "ruin",
    "rule", "rush", "rust", "sack", "safe", "sage", "said", "sail", "sake",
    "sale", "salt", "same", "sand", "sane", "save", "seal", "seat", "seed",
    "seek", "seem", "seen", "self", "sell", "send", "sent", "shed", "ship",
    "shoe", "shop", "shot", "show", "shut", "sick", "side", "sift", "sigh",
    "sign", "silk", "sill", "sing", "sink", "site", "size", "skid", "skim",
    "skin", "skip", "slap", "slid", "slim", "slip", "slot", "slow", "slug",
    "snap", "snow", "soak", "soap", "sock", "soft", "soil", "sold", "sole",
    "some", "song", "soon", "sort", "soul", "sour", "span", "spare", "spark",
    "speak", "spell", "spin", "spit", "spot", "star", "stay", "stem", "step",
    "stir", "stop", "stub", "stud", "stuff", "such", "suit", "sure", "surf",
    "swan", "swap", "swim", "tags", "tail", "take", "tale", "talk", "tall",
    "tank", "tape", "task", "team", "tear", "tell", "tend", "tent", "term",
    "test", "text", "than", "that", "them", "then", "they", "thin", "this",
    "thus", "tick", "tide", "tidy", "tied", "tier", "tile", "till", "time",
    "tiny", "tire", "toad", "toes", "told", "toll", "tomb", "tone", "took",
    "tool", "tops", "tore", "torn", "tour", "town", "trap", "tray", "tree",
    "trim", "trip", "true", "tube", "tuck", "tune", "turf", "turn", "twin",
    "type", "ugly", "undo", "unit", "unto", "upon", "urge", "used", "user",
    "vain", "vale", "vary", "vast", "veil", "vent", "verb", "very", "vest",
    "veto", "vice", "view", "vine", "void", "volt", "vote", "wade", "wage",
    "wait", "wake", "walk", "wall", "want", "ward", "warm", "warn", "warp",
    "wart", "wash", "wave", "wavy", "wax", "weak", "weal", "wean", "wear",
    "weed", "week", "weep", "weld", "well", "went", "were", "west", "what",
    "when", "whim", "whip", "whom", "wick", "wide", "wife", "wild", "will",
    "wilt", "wily", "wind", "wine", "wing", "wink", "wipe", "wire", "wise",
    "wish", "with", "woke", "wolf", "wood", "wool", "word", "wore", "work",
    "worm", "worn", "wrap", "wren", "yank", "yard", "year", "yell", "your",
    "zeal", "zero", "zone", "zoom",
    "about", "above", "abuse", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alien", "align",
    "alive", "alley", "allow", "alone", "along", "alter", "among", "angel",
    "anger", "angle", "angry", "ankle", "apart", "apple", "apply", "arena",
    "argue", "arise", "armor", "array", "aside", "asset", "atlas", "attic",
    "audio", "audit", "avoid", "awake", "award", "aware", "awful", "bacon",
    "badge", "badly", "baker", "basic", "basis", "batch", "beach", "beard",
    "beast", "begin", "being", "below", "bench", "berry", "birth", "black",
    "blade", "blame", "blank", "blast", "blaze", "bleed", "blend", "bless",
    "blind", "blink", "bliss", "block", "blood", "bloom", "blown", "board",
    "bonus", "boost", "booth", "bound", "brain", "brand", "brave", "bread",
    "break", "breed", "brick", "bride", "brief", "bring", "broad", "broke",
    "brook", "brown", "brush", "buddy", "build", "bunch", "burst", "cabin",
    "cable", "candy", "cargo", "carry", "catch", "cause", "cedar", "chain",
    "chair", "chalk", "champ", "chaos", "charm", "chart", "chase", "cheap",
    "check", "cheek", "cheer", "chess", "chest", "chief", "child", "chill",
    "choir", "chord", "chunk", "civic", "civil", "claim", "clash", "class",
    "clean", "clear", "clerk", "click", "cliff", "climb", "cling", "clock",
    "clone", "close", "cloth", "cloud", "coach", "coast", "color", "comet",
    "comic", "coral", "couch", "could", "count", "court", "cover", "crack",
    "craft", "crane", "crash", "crawl", "crazy", "cream", "creek", "crest",
    "crime", "crisp", "cross", "crowd", "crown", "cruel", "crush", "crust",
    "curve", "cycle", "daily", "dance", "debut", "decay", "decor", "delay",
    "delta", "demon", "dense", "depot", "depth", "derby", "desk", "deter",
    "devil", "diary", "dirty", "ditch", "dizzy", "donor", "doubt", "dough",
    "draft", "drain", "drake", "drama", "drank", "drape", "drawl", "drawn",
    "dread", "dream", "dress", "dried", "drift", "drill", "drink", "drive",
    "drone", "drool", "drops", "drove", "drunk", "dryer", "eager", "early",
    "earth", "eaten", "edged", "eight", "elder", "elect", "elite", "ember",
    "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "essay",
    "event", "every", "exact", "exile", "exist", "extra", "fable", "facet",
    "faith", "false", "fancy", "fatal", "fault", "feast", "fence", "ferry",
    "fetch", "fever", "fewer", "fiber", "field", "fierce", "fifth", "fifty",
    "fight", "final", "first", "fixed", "flame", "flash", "fleet", "flesh",
    "float", "flock", "flood", "floor", "flora", "flour", "fluid", "flush",
    "flute", "focal", "focus", "force", "forge", "forth", "forum", "found",
    "frame", "frank", "fraud", "fresh", "front", "frost", "froze", "fruit",
    "fully", "gauge", "ghost", "giant", "given", "glass", "glide", "globe",
    "gloss", "glove", "glow", "going", "grace", "grade", "grain", "grand",
    "grant", "grape", "graph", "grasp", "grass", "grave", "great", "green",
    "greet", "grief", "grill", "grind", "groom", "gross", "group", "grove",
    "grown", "guard", "guess", "guest", "guide", "guild", "guilt", "guise",
    "gulph", "gummy", "habit", "happy", "harsh", "haste", "haunt", "haven",
    "heart", "heavy", "hedge", "hello", "hence", "hiking", "hobby", "honey",
    "honor", "horse", "hotel", "house", "human", "humor", "hurry", "ideal",
    "image", "imply", "index", "indie", "inner", "input", "irony", "ivory",
    "jewel", "joint", "joker", "judge", "juice", "kebab", "knack", "kneel",
    "knife", "knock", "known", "label", "labor", "lance", "large", "laser",
    "later", "laugh", "layer", "learn", "lease", "leave", "legal", "lemon",
    "level", "lever", "light", "limit", "linen", "liner", "liver", "local",
    "logic", "loose", "lover", "lower", "loyal", "lucky", "lunar", "lunch",
    "lying", "macro", "magic", "major", "maker", "manor", "maple", "march",
    "marry", "marsh", "match", "mayor", "media", "mercy", "merit", "metal",
    "meter", "midst", "might", "minor", "minus", "mixed", "model", "money",
    "month", "moral", "motor", "mount", "mouse", "mouth", "movie", "music",
    "naval", "nerve", "never", "newly", "night", "noble", "noise", "north",
    "noted", "novel", "nurse", "nylon", "occur", "ocean", "offer", "often",
    "olive", "onset", "opera", "orbit", "order", "organ", "other", "outer",
    "owner", "oxide", "ozone", "paint", "panel", "panic", "paper", "party",
    "pasta", "paste", "patch", "pause", "peace", "pearl", "penny", "phase",
    "phone", "photo", "piano", "piece", "pilot", "pinch", "pixel", "pizza",
    "place", "plain", "plane", "plant", "plate", "plaza", "plead", "pluck",
    "plumb", "plume", "plump", "plunge", "pocket", "point", "polar", "pound",
    "power", "press", "price", "pride", "prime", "prince", "print", "prior",
    "prize", "probe", "prone", "proof", "prose", "proud", "prove", "pulse",
    "pupil", "purse", "queen", "quest", "queue", "quick", "quiet", "quote",
    "radar", "radio", "raise", "rally", "ranch", "range", "rapid", "ratio",
    "reach", "react", "ready", "realm", "rebel", "refer", "reign", "relax",
    "reply", "rider", "ridge", "rifle", "right", "rigid", "risky", "rival",
    "river", "robot", "rocky", "roman", "rough", "round", "route", "royal",
    "rugby", "ruins", "ruler", "rural", "sadly", "saint", "salad", "salon",
    "sandy", "sauce", "scale", "scare", "scene", "scent", "scope", "score",
    "scout", "scrap", "sense", "serve", "setup", "seven", "shade", "shaft",
    "shake", "shall", "shame", "shape", "share", "shark", "sharp", "sheep",
    "sheer", "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock",
    "shore", "short", "shout", "shove", "sight", "sigma", "silent", "silly",
    "since", "sixth", "sixty", "skill", "skull", "slash", "slate", "slave",
    "sleep", "slice", "slide", "slope", "small", "smart", "smell", "smile",
    "smoke", "snack", "snake", "solar", "solid", "solve", "sorry", "sound",
    "south", "space", "spare", "spark", "speak", "spell", "spend", "spice",
    "spill", "spine", "spite", "split", "spoke", "spoon", "sport", "spray",
    "squad", "stack", "staff", "stage", "stain", "stake", "stale", "stall",
    "stamp", "stand", "stare", "stark", "start", "state", "stays", "steal",
    "steam", "steel", "steep", "steer", "stern", "stick", "stiff", "still",
    "stock", "stole", "stone", "stood", "stool", "store", "storm", "story",
    "stove", "stuff", "stunt", "style", "sugar", "suite", "sunny", "super",
    "surge", "swamp", "swarm", "sweet", "swept", "swift", "swing", "sword",
    "swore", "taste", "teach", "teeth", "tense", "tenth", "theme", "there",
    "thick", "thief", "thing", "think", "third", "thorn", "those", "three",
    "threw", "throw", "thumb", "tiger", "tight", "timer", "tired", "title",
    "toast", "today", "token", "total", "touch", "tough", "towel", "tower",
    "toxic", "trace", "track", "trade", "trail", "train", "trait", "trash",
    "treat", "trend", "trial", "tribe", "trick", "tried", "troop", "truck",
    "truly", "trump", "trunk", "trust", "truth", "tumor", "twice", "twist",
    "uncle", "under", "union", "unite", "unity", "until", "upper", "upset",
    "urban", "usage", "usual", "utter", "valid", "valor", "value", "valve",
    "vault", "venue", "verse", "video", "vigor", "viral", "virus", "visit",
    "vista", "vital", "vivid", "vocal", "vodka", "voice", "voter", "wagon",
    "waist", "waste", "watch", "water", "weary", "weave", "wedge", "weird",
    "whale", "wheat", "wheel", "where", "which", "while", "whine", "white",
    "whole", "whose", "wider", "witch", "woman", "world", "worry", "worse",
    "worst", "worth", "would", "wound", "wrath", "write", "wrong", "wrote",
    "yacht", "yield", "young", "youth", "zebra", "zones",
  ])
  return commonWords.has(word)
}

function createMatch(player1Id, player2Id) {
  const grid = generateGrid()
  return {
    id: crypto.randomUUID(),
    gameType: "wordstack",
    status: "in_progress",
    player1Id,
    player2Id,
    grid,
    currentTurn: player1Id,
    turnStartAt: Date.now(),
    timer: TURN_TIME,
    scores: {
      [player1Id]: 0,
      [player2Id]: 0,
    },
    foundWords: {
      [player1Id]: [],
      [player2Id]: [],
    },
    stolenWords: {
      [player1Id]: [],
      [player2Id]: [],
    },
    consecutiveSkips: {
      [player1Id]: 0,
      [player2Id]: 0,
    },
    status: "in_progress",
    createdAt: Date.now(),
  }
}

function handleSubmitWord(match, userId, { word, path }) {
  if (match.currentTurn !== userId) return { error: "Not your turn" }
  if (match.status !== "in_progress") return { error: "Match is over" }

  if (!word || !path || path.length < 2) {
    return { error: "Invalid word" }
  }

  const normalizedWord = word.toLowerCase()

  if (!validatePath(match.grid, path)) {
    return { error: "Invalid path" }
  }

  const actualWord = getWordFromPath(match.grid, path)
  if (actualWord !== normalizedWord) {
    return { error: "Path does not match word" }
  }

  if (normalizedWord.length < MIN_WORD_LENGTH) {
    return { error: `Word must be at least ${MIN_WORD_LENGTH} letters` }
  }

  const opponentId = userId === match.player1Id ? match.player2Id : match.player1Id

  const alreadyFoundByMe = match.foundWords[userId].some((w) => w.word === normalizedWord)
  const alreadyFoundByOpponent = match.foundWords[opponentId].some((w) => w.word === normalizedWord)

  if (!isValidWord(normalizedWord) && !alreadyFoundByOpponent) {
    return { error: "Not a valid word" }
  }

  if (alreadyFoundByMe) {
    return { error: "You already found this word" }
  }

  let score = calculateScore(match.grid, path, normalizedWord)
  let stolen = false

  if (alreadyFoundByOpponent) {
    // STEAL! Remove from opponent, add to current player
    match.foundWords[opponentId] = match.foundWords[opponentId].filter(
      (w) => w.word !== normalizedWord
    )
    match.scores[opponentId] = Math.max(0, match.scores[opponentId] - score.total)
    match.stolenWords[userId].push({ word: normalizedWord, fromOpponent: true })
    stolen = true
  }

  if (score.skulled) {
    // Skull tile: lose turn, no points
    match.consecutiveSkips[userId] = 0
    match.consecutiveSkips[opponentId] = 0
    match.currentTurn = opponentId
    match.turnStartAt = Date.now()
    return {
      accepted: false,
      skulled: true,
      message: "💀 Skull tile! You lose your turn!",
      nextTurn: match.currentTurn,
      scores: match.scores,
    }
  }

  match.scores[userId] += score.total
  match.foundWords[userId].push({
    word: normalizedWord,
    points: score.total,
    stolen,
    doubled: score.doubled,
  })
  match.consecutiveSkips[userId] = 0
  match.consecutiveSkips[opponentId] = 0

  match.currentTurn = opponentId
  match.turnStartAt = Date.now()

  return {
    accepted: true,
    word: normalizedWord,
    points: score.total,
    doubled: score.doubled,
    stolen,
    scores: match.scores,
    foundWords: match.foundWords,
    nextTurn: match.currentTurn,
  }
}

function handleSkip(match, userId) {
  if (match.currentTurn !== userId) return { error: "Not your turn" }

  const opponentId = userId === match.player1Id ? match.player2Id : match.player1Id
  match.consecutiveSkips[userId] = (match.consecutiveSkips[userId] || 0) + 1

  if (match.consecutiveSkips[userId] >= 3) {
    // Auto-forfeit after 3 consecutive skips
    match.status = "finished"
    match.winnerId = opponentId
    return {
      forfeited: true,
      winner: opponentId,
      reason: "3 consecutive skips",
      scores: match.scores,
    }
  }

  match.currentTurn = opponentId
  match.turnStartAt = Date.now()
  match.consecutiveSkips[opponentId] = 0

  return {
    skipped: true,
    nextTurn: match.currentTurn,
    skipCount: match.consecutiveSkips[userId],
  }
}

function handleGiveUp(match, userId) {
  const opponentId = userId === match.player1Id ? match.player2Id : match.player1Id
  match.status = "finished"
  match.winnerId = opponentId
  return {
    gaveUp: true,
    winner: opponentId,
    loser: userId,
    scores: match.scores,
  }
}

function handleTimeout(match, userId) {
  const opponentId = userId === match.player1Id ? match.player2Id : match.player1Id
  match.consecutiveSkips[userId] = (match.consecutiveSkips[userId] || 0) + 1

  if (match.consecutiveSkips[userId] >= 3) {
    match.status = "finished"
    match.winnerId = opponentId
    return {
      forfeited: true,
      winner: opponentId,
      reason: "timeout (3 skips)",
      scores: match.scores,
    }
  }

  match.currentTurn = opponentId
  match.turnStartAt = Date.now()
  match.consecutiveSkips[opponentId] = 0

  return {
    timeout: true,
    nextTurn: match.currentTurn,
    skipCount: match.consecutiveSkips[userId],
  }
}

module.exports = {
  GRID_SIZE,
  TURN_TIME,
  generateGrid,
  validatePath,
  getWordFromPath,
  calculateScore,
  isValidWord,
  createMatch,
  handleSubmitWord,
  handleSkip,
  handleGiveUp,
  handleTimeout,
}
