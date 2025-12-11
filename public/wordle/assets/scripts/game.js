const gridEl = document.getElementById('wordle-grid');

const gameConfig = {
  rows: 6,
  cols: 5
};

const gameState = {
  word: '',
  currentAttempt: 0,
  currentPosition: 0,
  grid: [],
  finished: false
};

function addBoxToGrid(row, col) {
  const cell = document.createElement('div');
  cell.className = 'letter';
  cell.id = `cell-${row}-${col}`;
  if (gridEl) {
    gridEl.appendChild(cell);
  }
  if (!gameState.grid[row]) gameState.grid[row] = [];
  gameState.grid[row][col] = '';
  return cell;
}

function setupGrid() {
  if (!gridEl) {
    console.warn('wordle-grid element not found');
    return;
  }
  gridEl.innerHTML = '';
  gameState.grid = [];

  for (let r = 0; r < gameConfig.rows; r++) {
    for (let c = 0; c < gameConfig.cols; c++) {
      addBoxToGrid(r, c);
    }
  }
  console.log('Grid setup complete:', gameConfig.rows, 'x', gameConfig.cols);
}

function addLetterToCell(row, col, letter) {
  const id = `cell-${row}-${col}`;
  const cell = document.getElementById(id);
  if (!cell) {
    console.warn('Cell not found:', id);
    return;
  }
  cell.textContent = String(letter).toLowerCase();
  cell.classList.add('animate__animated', 'animate__bounceIn');
  cell.style.setProperty('--animate-duration', '0.5s');
  function handleAnimationEnd() {
    cell.classList.remove('animate__animated', 'animate__bounceIn');
    cell.style.removeProperty('--animate-duration');
    cell.removeEventListener('animationend', handleAnimationEnd);
  }
  cell.addEventListener('animationend', handleAnimationEnd);
  if (!gameState.grid[row]) gameState.grid[row] = [];
  gameState.grid[row][col] = letter;
  gameState.currentPosition = col;
  gameState.currentAttempt = row;
}

function shakeRow(row) {
  for (let c = 0; c < gameConfig.cols; c++) {
    const id = `cell-${row}-${c}`;
    const cell = document.getElementById(id);
    if (!cell) continue;
    cell.classList.add('animate__animated', 'animate__shakeX');
    cell.style.setProperty('--animate-duration', '0.5s');
    setTimeout(() => {
      cell.classList.remove('animate__animated', 'animate__shakeX');
      cell.style.removeProperty('--animate-duration');
    }, 700);
  }
}

function shakeMissingCells(row) {
  const pos = gameState.currentPosition;
  for (let c = pos; c < gameConfig.cols; c++) {
    const id = `cell-${row}-${c}`;
    const cell = document.getElementById(id);
    if (!cell) continue;
    cell.classList.add('animate__animated', 'animate__shakeX');
    cell.style.setProperty('--animate-duration', '0.5s');
    setTimeout(() => {
      cell.classList.remove('animate__animated', 'animate__shakeX');
      cell.style.removeProperty('--animate-duration');
    }, 700);
  }
}

setupGrid();

window._game = {
  config: gameConfig,
  state: gameState,
  addBoxToGrid,
  setupGrid,
  addLetterToCell
};

const WORD_LIST = [
  'APPLE', 'BANJO', 'CRANE', 'TRACK', 'GHOST', 'PLANT', 'BRICK', 'LIGHT', 'STONE', 'HOUSE'
];

async function isWordValid(word) {
  if (!word || typeof word !== 'string') return false;
  const upper = word.toUpperCase();
  if (WORD_LIST.includes(upper)) return true;

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      return true;
    }
    if (res.status === 404) return false;
    return WORD_LIST.includes(upper);
  } catch (err) {
    console.warn('isWordValid fetch failed, falling back to local list', err);
    return WORD_LIST.includes(upper);
  }
}

async function getRandomWord() {
  try {
    const res = await fetch('https://it3049c-hangman.fly.dev');
    if (res.ok) {
      const text = await res.text();
      const word = String(text).trim();
      if (word.length === gameConfig.cols) return word.toUpperCase();
    }
  } catch (err) {
    console.warn('getRandomWord: project API failed', err);
  }

  try {
    const url = `https://random-word-api.herokuapp.com/word?length=${gameConfig.cols}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return String(data[0]).toUpperCase();
    }
  } catch (err) {
    console.warn('getRandomWord: random-word-api failed', err);
  }

  const candidates = WORD_LIST.filter(w => w.length === gameConfig.cols);
  if (candidates.length > 0) {
    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx].toUpperCase();
  }
  return WORD_LIST[0];
}

function checkWord(guess) {
  const target = gameState.word.toUpperCase();
  const g = guess.toUpperCase();
  const result = new Array(g.length).fill('incorrect');

  const targetUsed = new Array(target.length).fill(false);

  for (let i = 0; i < g.length; i++) {
    if (g[i] === target[i]) {
      result[i] = 'correct';
      targetUsed[i] = true;
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < target.length; j++) {
      if (targetUsed[j]) continue;
      if (g[i] === target[j]) {
        result[i] = 'misplaced';
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

function revealAttemptResult() {
  const row = gameState.currentAttempt;
  const guessArr = gameState.grid[row] || [];
  const guess = guessArr.join('').toUpperCase();
  const result = checkWord(guess);
  for (let c = 0; c < result.length; c++) {
    const id = `cell-${row}-${c}`;
    const cell = document.getElementById(id);
    if (!cell) continue;
    const status = result[c];
    cell.classList.remove('correct', 'misplaced', 'incorrect');
    if (status === 'correct') cell.classList.add('correct');
    if (status === 'misplaced') cell.classList.add('misplaced');
    if (status === 'incorrect') cell.classList.add('incorrect');
  }
  return result;
}

async function submitGuess() {
  const row = gameState.currentAttempt;
  if (gameState.currentPosition < gameConfig.cols) {
    console.log('Word not complete');
    shakeMissingCells(row);
    return;
  }
  const guessArr = gameState.grid[row] || [];
  const guess = guessArr.join('').toUpperCase();
  const valid = await isWordValid(guess);
  if (!valid) {
    console.log('Word is not valid:', guess);
    shakeRow(row);
    return;
  }

  const result = revealAttemptResult();
  const won = result.every((s) => s === 'correct');
  if (won) {
    console.log('You win!');
    gameState.finished = true;
    return;
  }

  if (gameState.currentAttempt + 1 >= gameConfig.rows) {
    console.log('Game over. The word was:', gameState.word);
    gameState.finished = true;
    // show a game result element for tests
    let resultEl = document.getElementById('game-result');
    if (!resultEl) {
      resultEl = document.createElement('div');
      resultEl.id = 'game-result';
      resultEl.textContent = 'Game Over!';
      document.body.appendChild(resultEl);
    } else {
      resultEl.textContent = 'Game Over!';
    }
    return;
  }
  gameState.currentAttempt += 1;
  gameState.currentPosition = 0;
}

async function initGame() {
  setupGrid();
  try {
    gameState.word = await getRandomWord();
    console.log('Puzzle word (for dev):', gameState.word);
  } catch (err) {
    console.warn('Failed to fetch puzzle word, using local fallback', err);
    gameState.word = WORD_LIST[0];
  }
}

initGame();

window._game.isWordValid = isWordValid;
window._game.getRandomWord = getRandomWord;
window._game.checkWord = checkWord;
window._game.revealAttemptResult = revealAttemptResult;
window._game.submitGuess = submitGuess;

function isLetter(letter) {
  return letter.length === 1 && letter.match(/[a-z]/i);
}

function addLetterToGrid(letter) {
  if (gameState.currentPosition >= gameConfig.cols) return;
  const row = gameState.currentAttempt;
  const col = gameState.currentPosition;
  const up = letter.toUpperCase();
  if (!gameState.grid[row]) gameState.grid[row] = [];
  gameState.grid[row][col] = up;
  addLetterToCell(row, col, up);
  gameState.currentPosition = col + 1;
}

function removeLetterFromGrid() {
  const row = gameState.currentAttempt;
  let col = gameState.currentPosition;
  if (col === 0) return;
  col = col - 1;
  const id = `cell-${row}-${col}`;
  const cell = document.getElementById(id);
  if (cell) cell.textContent = '';
  if (!gameState.grid[row]) gameState.grid[row] = [];
  gameState.grid[row][col] = '';
  gameState.currentPosition = col;
}



document.addEventListener('keydown', async (event) => {
  if (gameState.finished) return;
  const key = event.key;
  if (isLetter(key)) {
    addLetterToGrid(key);
    console.log('letter:', key);
    return;
  }
  if (key === 'Backspace') {
    removeLetterFromGrid();
    console.log('backspace');
    return;
  }
  if (key === 'Enter') {
    await submitGuess();
    console.log('enter');
    return;
  }
});

window._game.isLetter = isLetter;
window._game.addLetterToGrid = addLetterToGrid;
window._game.removeLetterFromGrid = removeLetterFromGrid;
window._game.submitGuess = submitGuess;
