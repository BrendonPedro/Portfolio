// Joke Generator 3000 — the very serious machine behind the hero joke.

const JOKES = [
  { setup: "Have you heard the joke about the bed?", punchline: "I didn't make it up yet 😅" },
  { setup: "Did you hear the joke about the ball?", punchline: "You won't catch it 😁" },
  { setup: "Did you hear the joke about the pencil?", punchline: "It has no point 😅" },
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs 🐛" },
  { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache 💸" },
  { setup: "How many programmers does it take to change a light bulb?", punchline: "None. That's a hardware problem 💡" },
  { setup: "Why do Java developers wear glasses?", punchline: "Because they don't C# 🤓" },
  { setup: "Did you hear the joke about the roof?", punchline: "Never mind, it's over your head 🏠" },
  { setup: "What do you call a fish with no eyes?", punchline: "A fsh 🐟" },
  { setup: "Why can't you trust an atom?", punchline: "They make up everything ⚛️" },
  { setup: "I told my computer I needed a break...", punchline: "Now it won't stop sending me KitKat ads 🍫" },
  { setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't Node how to Express himself 😢" },
  { setup: "What's a computer's favourite snack?", punchline: "Microchips 🍟" },
  { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field 🌾" },
  { setup: "Did you hear about the claustrophobic astronaut?", punchline: "He just needed a little space 🚀" },
  { setup: "Why don't scientists trust stairs?", punchline: "They're always up to something 🪜" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing. It just waved 🌊" },
  { setup: "Why did the AI cross the road?", punchline: "It was trained to 🤖" },
  { setup: "I would tell you a UDP joke...", punchline: "But you might not get it 📡" },
  { setup: "A SQL query walks into a bar, goes up to two tables and asks...", punchline: "\"Mind if I JOIN you?\" 🍻" },
  { setup: "Why are keyboards always tired?", punchline: "They have two shifts ⌨️" },
  { setup: "What do you call 8 hobbits?", punchline: "A hobbyte 🧙" },
  { setup: "Why did the developer quit his job?", punchline: "He didn't get arrays 📊" },
  { setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus ➕" },
  { setup: "How does a computer get drunk?", punchline: "It takes screenshots 📸" },
];

const setupEl = document.getElementById("joke-setup");
const punchEl = document.getElementById("joke-punchline");
const cursorEl = document.getElementById("joke-cursor");
const btn = document.getElementById("joke-btn");
const meter = document.getElementById("joke-meter");
const rateEish = document.getElementById("rate-eish");
const rateLekker = document.getElementById("rate-lekker");
const countEish = document.getElementById("count-eish");
const countLekker = document.getElementById("count-lekker");

let lastIndex = -1;
let typingTimer = null;
const counts = { eish: 0, lekker: 0 };

function typeText(el, text, speed, done) {
  let i = 0;
  el.textContent = "";
  (function tick() {
    if (i <= text.length) {
      el.textContent = text.substring(0, i);
      i++;
      typingTimer = setTimeout(tick, speed);
    } else if (done) {
      done();
    }
  })();
}

function newJoke() {
  clearTimeout(typingTimer);
  let i;
  do {
    i = Math.floor(Math.random() * JOKES.length);
  } while (i === lastIndex && JOKES.length > 1);
  lastIndex = i;

  const joke = JOKES[i];
  punchEl.textContent = "";
  meter.hidden = true;
  btn.disabled = true;
  cursorEl.classList.add("jokes__cursor--typing");

  typeText(setupEl, "> " + joke.setup, 35, () => {
    typingTimer = setTimeout(() => {
      typeText(punchEl, "> " + joke.punchline, 35, () => {
        btn.disabled = false;
        meter.hidden = false;
        cursorEl.classList.remove("jokes__cursor--typing");
      });
    }, 900);
  });
}

btn.addEventListener("click", newJoke);

rateEish.addEventListener("click", () => {
  counts.eish++;
  countEish.textContent = counts.eish;
});

rateLekker.addEventListener("click", () => {
  counts.lekker++;
  countLekker.textContent = counts.lekker;
});
