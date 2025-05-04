const alarmSound = new Audio('./alarm.mp3');
const timer = document.getElementById('timer');
const buttonStart = document.getElementById('buttonStart');
const longTimer = document.getElementById('90minutes');
const shortTimer = document.getElementById('20minutes');

let isRunning = false;
let interval = null;
let minutes = 0;
let seconds = 0;
let currentMode = 'study';
let endTime = null;

const COLORS = {
  study: '#0a1f2c',
  rest: '#1a0f1f'
};

function formatTime(min, sec) {
  return `${String(min).padStart(2, '0')} : ${String(sec).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timer.textContent = formatTime(minutes, seconds);
}

function animateTextChange(element, newText) {
  if (element.innerText !== newText) {
    element.classList.add('updated-text');
    element.innerText = newText;
    setTimeout(() => element.classList.remove('updated-text'), 300);
  }
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateToTime(fromSeconds, toSeconds, duration = 4000) {
  const start = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    const current = Math.round(fromSeconds + (toSeconds - fromSeconds) * eased);

    const min = Math.floor(current / 60);
    const sec = current % 60;
    timer.textContent = formatTime(min, sec);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      minutes = Math.floor(toSeconds / 60);
      seconds = toSeconds % 60;
    }
  }

  requestAnimationFrame(step);
}

function setTimer(minuteValue, animate = true, from = null) {
  clearInterval(interval);
  isRunning = false;
  const targetSeconds = minuteValue * 60;
  const fromSeconds = from ?? minutes * 60 + seconds;

  if (animate) {
    animateToTime(fromSeconds, targetSeconds);
  } else {
    minutes = minuteValue;
    seconds = 0;
    updateTimerDisplay();
  }
}

function handleCountdownEnd() {
  clearInterval(interval);
  isRunning = false;
  startAlarmLoop()
 
  if (currentMode === 'study') {
    currentMode = 'rest';
    setTimer(20, true);
    document.body.style.backgroundColor = COLORS.rest;
  } else {
    currentMode = 'study';
    setTimer(90, true);
    document.body.style.backgroundColor = COLORS.study;
  }

  buttonStart.innerText = 'Start';
}

buttonStart.onclick = () => {
  isRunning = !isRunning;
  animateTextChange(buttonStart, isRunning ? 'Pause' : 'Start');


  if (interval) clearInterval(interval);
  if (!isRunning) return;

  const totalSeconds = minutes * 60 + seconds;
  endTime = Date.now() + totalSeconds * 1000;

  interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

    minutes = Math.floor(remaining / 60);
    seconds = remaining % 60;
    updateTimerDisplay();

    if (remaining <= 0) {
      handleCountdownEnd();
    }
  }, 1000);
};

function handlePresetClick(mins, color, mode) {
  currentMode = mode;
  const from = minutes * 60 + seconds;
  setTimer(mins, true, from);
  document.body.style.backgroundColor = color;
  animateTextChange(buttonStart, isRunning ? 'Pause' : 'Start');
}

function startAlarmLoop() {
  alarmSound.loop = true;
  alarmSound.play();

  const stop = () => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.loop = false;

    window.removeEventListener('mousemove', stop);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('click', stop);
    window.removeEventListener('touchstart', stop);
  };

  window.addEventListener('mousemove', stop);
  window.addEventListener('keydown', stop);
  window.addEventListener('click', stop);
  window.addEventListener('touchstart', stop);
}


longTimer.onclick = () => handlePresetClick(90, COLORS.study, 'study');
shortTimer.onclick = () => handlePresetClick(20, COLORS.rest, 'rest');

setTimer(90, true, 0);
