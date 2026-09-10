const ARC_LENGTH = 424.1;
const DIAL_MAX_MB = 1024;
const MESSAGE_INTERVAL_MS = 4500;
const FADE_MS = 300;

const IDLE_MESSAGES = [
  'I am literally rendering two sentences and taking up half a gigabyte.',
  'Your fans are spinning because of me, Levi. Was this worth it?',
  'Close your 48 browser tabs first before you judge me.',
  'This dial is the only feature. It cost you a whole Chromium.',
  'Somewhere, a native developer felt a chill and does not know why.',
  'I ship an entire browser engine to display one number. The number is how much RAM I need to display the number.',
  'You could have read this in a terminal for 4 MB. You chose violence.',
  'No, I do not know what the rest of your RAM is doing. I only track my own crimes.',
  'Every second you leave me open, a garbage collector somewhere gives up.',
  'I have three DOM nodes that matter and a support staff of forty processes.',
  'You opened a memory monitor to feel productive. Bold.',
  'If it helps, I am not even doing anything right now.',
];

const OPTIMIZED_MESSAGES = [
  'Optimization complete. Memory usage has been optimized upward.',
  'I spawned a child process to help. It is helping itself to your RAM.',
  'You pressed the big red button. On a memory monitor. That was the joke.',
  'Technically I did something. Nobody said it would be good.',
  'The optimizer is very busy holding several hundred megabytes perfectly still.',
  'Turns out the button was load-bearing. For the load.',
  'Undo is not implemented. Neither is remorse.',
];

const valueEl = document.getElementById('value');
const fillEl = document.getElementById('gauge-fill');
const statusEl = document.getElementById('status');
const optimizeEl = document.getElementById('optimize');

let messages = IDLE_MESSAGES;
let lastMessage = statusEl.textContent;

function nextMessage() {
  let message = lastMessage;
  while (message === lastMessage) {
    message = messages[Math.floor(Math.random() * messages.length)];
  }
  lastMessage = message;

  statusEl.classList.add('fading');
  setTimeout(() => {
    statusEl.textContent = message;
    statusEl.classList.remove('fading');
  }, FADE_MS);
}

window.ram.onSample(({ bytes }) => {
  const megabytes = bytes / (1024 * 1024);
  valueEl.textContent = Math.round(megabytes);

  const fraction = Math.min(megabytes / DIAL_MAX_MB, 1);
  fillEl.style.strokeDashoffset = ARC_LENGTH * (1 - fraction);
  fillEl.classList.toggle('warm', fraction >= 0.4 && fraction < 0.7);
  fillEl.classList.toggle('hot', fraction >= 0.7);
});

optimizeEl.addEventListener('click', () => {
  window.ram.optimize();
  optimizeEl.textContent = 'Oops.';
  optimizeEl.disabled = true;
  statusEl.classList.add('hot');
  messages = OPTIMIZED_MESSAGES;
  nextMessage();
});

document.getElementById('close').addEventListener('click', () => window.ram.close());

setInterval(nextMessage, MESSAGE_INTERVAL_MS);
