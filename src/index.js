import initScrollReveal from "./scripts/scrollReveal";
import initTiltEffect from "./scripts/tiltAnimation";
import { targetElements, defaultProps } from "./data/scrollRevealConfig";

initScrollReveal(targetElements, defaultProps);
initTiltEffect();

const heroTitle = document.querySelector('.hero-title');
const staticText = heroTitle.innerHTML;

// Object containing setup and punchline pairs
const jokes = [
  {
    setup: "Have you heard the joke about the bed? ⚆_⚆ ",
    punchline: "I didn't make it up yet😅! "
  },
  {
    setup: "Did you hear the joke about the ball? ⚆_⚆ ",
    punchline: "You won't catch it 😁"
  },
  {
    setup: "Did you hear the joke about the pencil? ⚆_⚆ ",
    punchline: "It has no point 😅"
  }
];

// Get today's joke based on the date
function getTodaysJoke() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return jokes[dayOfYear % jokes.length];
}

const todaysJoke = getTodaysJoke();
const phrases = [
  todaysJoke.setup,
  todaysJoke.punchline,
  "I'm a developer, not a jokesmith... lol."
];

const finalLine = "Let's build something cool together! ^_^"

let phraseIndex = 0;
let charIndex = 0;
let isTyping = true;

function typewriteEffect() {
  if (phraseIndex < phrases.length) {
    if (isTyping) {
      if (charIndex < phrases[phraseIndex].length) {
        heroTitle.innerHTML = staticText + '<span class="dynamic-text">' + phrases[phraseIndex].substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typewriteEffect, 75);
      } else {
        isTyping = false;
        setTimeout(typewriteEffect, 1500);
      }
    } else {
      if (charIndex > 0) {
        charIndex--;
        heroTitle.innerHTML = staticText + '<span class="dynamic-text">' + phrases[phraseIndex].substring(0, charIndex);
        setTimeout(typewriteEffect, 20);
      } else {
        phraseIndex++;
        if (phraseIndex < phrases.length) {
          isTyping = true;
          setTimeout(typewriteEffect, 500);
        } else {
          charIndex = 0;
          setTimeout(typeFinalLine, 500);
        }
      }
    }
  }
}

function typeFinalLine() {
  if (charIndex < finalLine.length) {
    heroTitle.innerHTML = staticText + '<span class="final-line">' + finalLine.substring(0, charIndex + 1) + '</span>';
    charIndex++;
    setTimeout(typeFinalLine, 100);
  }
}

// Initial call
typewriteEffect();