// Cape Town Slang Translator — plain vanilla JS, no frameworks, just vibes.

const DICTIONARY = [
  { word: "Aweh", meaning: "Hello! / Yes! / I acknowledge you, friend.", example: "Aweh bru, long time!", vibe: "The universal Cape Town greeting. Works anywhere, anytime." },
  { word: "Howzit", meaning: "Hi, how are you? (No actual answer expected.)", example: "Howzit my bru, all good?", vibe: "Say it fast. It's one word." },
  { word: "Lekker", meaning: "Nice, great, delicious, excellent.", example: "That braai was lekker, hey.", vibe: "The highest compliment available in the Cape." },
  { word: "Kief", meaning: "Cool, awesome, very nice.", example: "Kief tekkies, where'd you get them?", vibe: "Surfer-approved since forever." },
  { word: "Bru", meaning: "Brother, friend, any human being.", example: "No ways, bru.", vibe: "Gender-neutral in practice. Everyone is bru." },
  { word: "Boet", meaning: "Brother — affectionate term for a mate.", example: "Boet, you won't believe this.", vibe: "Slightly more heartfelt than bru." },
  { word: "China", meaning: "Friend, mate (from Cockney 'china plate' = mate).", example: "My china, help me quick.", vibe: "Old-school but still going strong." },
  { word: "Now-now", meaning: "Soon-ish. Anywhere from 5 minutes to 2 hours.", example: "I'll be there now-now.", vibe: "Sooner than 'just now', later than 'now'. Trust the system." },
  { word: "Just now", meaning: "At some point. Possibly today. Possibly never.", example: "I'll do the dishes just now.", vibe: "The most flexible unit of time known to science." },
  { word: "Jol", meaning: "A party / to have a good time.", example: "It was a proper jol last night.", vibe: "Can be a noun, a verb, and a lifestyle." },
  { word: "Eish", meaning: "Oh dear / yikes / that's rough.", example: "Eish, petrol went up again.", vibe: "Sigh in word form." },
  { word: "Sarmie", meaning: "A sandwich.", example: "Pack me a cheese sarmie for the road.", vibe: "Peak lunchbox technology." },
  { word: "Gatsby", meaning: "A giant Cape Town sandwich stuffed with chips and everything else.", example: "One full gatsby, four friends, no regrets.", vibe: "Not the novel. Better than the novel." },
  { word: "Robot", meaning: "A traffic light.", example: "Turn left at the second robot.", vibe: "Confuses every tourist. Delights every local." },
  { word: "Bakkie", meaning: "A pickup truck.", example: "Load the surfboards on the bakkie.", vibe: "Half vehicle, half national treasure." },
  { word: "Braai", meaning: "A barbecue — the event AND the fire itself.", example: "Come over for a braai on Saturday.", vibe: "Sacred. Do not call it a BBQ to a local's face." },
  { word: "Yoh", meaning: "Wow / whoa / expression of surprise.", example: "Yoh, did you see that wave?", vibe: "Stretch the 'o' for extra emphasis: yooooh." },
  { word: "Shame", meaning: "Aww / sympathy — usually a GOOD thing here.", example: "Shame, look how cute the puppy is!", vibe: "Not actually shaming anyone. Confusing, we know." },
  { word: "Is it", meaning: "Oh really? / Is that so? (No question mark needed.)", example: "— I got a new job. — Is it?", vibe: "The all-purpose response when you're only half listening." },
  { word: "Hectic", meaning: "Intense, wild, a lot to process.", example: "Load shedding again? Hectic, bru.", vibe: "Cape Town's favourite adjective for literally everything." },
  { word: "Babbelas", meaning: "A hangover.", example: "That jol gave me a moerse babbelas.", vibe: "Pronounced 'bub-buh-luss'. Felt everywhere." },
  { word: "Dop", meaning: "A drink (usually alcoholic).", example: "Come have a dop with us.", vibe: "One dop is never one dop." },
  { word: "Smaak", meaning: "To like / to fancy something (or someone).", example: "I smaak that new bakkie stukkend.", vibe: "From Afrikaans 'to taste'. Chef's kiss." },
  { word: "Stukkend", meaning: "Broken / 'very much' when paired with smaak.", example: "My phone is stukkend again.", vibe: "Things in Cape Town are either lekker or stukkend." },
  { word: "Kwaai", meaning: "Cool / great (literally 'angry' in Afrikaans).", example: "That's a kwaai sunset, nè?", vibe: "Angry word, happy meaning. Don't overthink it." },
  { word: "Duidelik", meaning: "Awesome / crystal clear / sorted.", example: "Duidelik, see you at six.", vibe: "Say it with confidence: 'day-duh-lik'." },
  { word: "Ag man", meaning: "Oh man / ah well.", example: "Ag man, the wind is pumping again.", vibe: "Best delivered with a small shrug." },
  { word: "Mos", meaning: "Obviously / as you know (sentence seasoning).", example: "You know mos how it goes.", vibe: "Adds flavour. Grammatically optional, culturally mandatory." },
  { word: "Tekkies", meaning: "Sneakers / trainers.", example: "New tekkies, who dis?", vibe: "White tekkies must stay white. It's the law." },
  { word: "Vrot", meaning: "Rotten / terrible / really bad at something.", example: "I'm vrot at chess, bru.", vibe: "Harsh but fair." },
];

const input = document.getElementById("slang-input");
const form = document.getElementById("slang-form");
const chips = document.getElementById("slang-chips");
const result = document.getElementById("slang-result");
const randomBtn = document.getElementById("random-btn");
const datalist = document.getElementById("slang-words");

let lastIndex = -1;

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z\s-]/g, "").trim();
}

function findEntry(query) {
  const q = normalize(query);
  if (!q) return null;
  return (
    DICTIONARY.find((e) => normalize(e.word) === q) ||
    DICTIONARY.find((e) => normalize(e.word).startsWith(q)) ||
    DICTIONARY.find((e) => q.includes(normalize(e.word))) ||
    null
  );
}

function render(entry, query) {
  if (!entry) {
    const suggestion = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
    result.innerHTML = `
      <p class="slang__result-miss">Eish&hellip; &ldquo;${escapeHtml(query)}&rdquo; isn't in my kop yet.</p>
      <p class="slang__result-hint">Try &ldquo;${suggestion.word}&rdquo; maybe? Or roll the dice.</p>`;
    return;
  }
  result.innerHTML = `
    <p class="slang__result-word">${entry.word}</p>
    <p class="slang__result-meaning">${entry.meaning}</p>
    <p class="slang__result-example">&ldquo;${entry.example}&rdquo;</p>
    <p class="slang__result-vibe">${entry.vibe}</p>`;
  result.classList.remove("slang__result--pop");
  // restart the pop animation
  void result.offsetWidth;
  result.classList.add("slang__result--pop");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  render(findEntry(input.value), input.value);
});

randomBtn.addEventListener("click", () => {
  let i;
  do {
    i = Math.floor(Math.random() * DICTIONARY.length);
  } while (i === lastIndex && DICTIONARY.length > 1);
  lastIndex = i;
  input.value = DICTIONARY[i].word;
  render(DICTIONARY[i], DICTIONARY[i].word);
});

DICTIONARY.forEach((entry) => {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "slang__chip";
  chip.textContent = entry.word;
  chip.addEventListener("click", () => {
    input.value = entry.word;
    render(entry, entry.word);
  });
  chips.appendChild(chip);

  const opt = document.createElement("option");
  opt.value = entry.word;
  datalist.appendChild(opt);
});
