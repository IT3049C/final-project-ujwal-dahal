import { useState, useEffect, useRef } from 'react';
import './WordleGame.css';

const WORD_LIST = [
  'APPLE', 'BANJO', 'CRANE', 'TRACK', 'GHOST', 'PLANT', 'BRICK', 'LIGHT', 'STONE', 'HOUSE'
];

const GAME_CONFIG = {
  rows: 6,
  cols: 5
};

export default function WordleGame() {
  const [gameState, setGameState] = useState({
    word: '',
    currentAttempt: 0,
    currentPosition: 0,
    grid: Array(GAME_CONFIG.rows).fill(null).map(() => Array(GAME_CONFIG.cols).fill('')),
    finished: false,
    cellStatuses: Array(GAME_CONFIG.rows).fill(null).map(() => Array(GAME_CONFIG.cols).fill(''))
  });

  const [gameMessage, setGameMessage] = useState('');
  const gridRef = useRef(null);

  useEffect(() => {
    initGame();
  }, []);

  const getRandomWord = async () => {
    try {
      const res = await fetch('https://it3049c-hangman.fly.dev');
      if (res.ok) {
        const text = await res.text();
        const word = String(text).trim();
        if (word.length === GAME_CONFIG.cols) return word.toUpperCase();
      }
    } catch (err) {
      console.warn('getRandomWord: project API failed', err);
    }

    try {
      const url = `https://random-word-api.herokuapp.com/word?length=${GAME_CONFIG.cols}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return String(data[0]).toUpperCase();
      }
    } catch (err) {
      console.warn('getRandomWord: random-word-api failed', err);
    }

    const candidates = WORD_LIST.filter(w => w.length === GAME_CONFIG.cols);
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      return candidates[idx].toUpperCase();
    }
    return WORD_LIST[0];
  };

  const initGame = async () => {
    const word = await getRandomWord();
    setGameState(prev => ({
      ...prev,
      word: word,
      currentAttempt: 0,
      currentPosition: 0,
      finished: false,
      grid: Array(GAME_CONFIG.rows).fill(null).map(() => Array(GAME_CONFIG.cols).fill('')),
      cellStatuses: Array(GAME_CONFIG.rows).fill(null).map(() => Array(GAME_CONFIG.cols).fill(''))
    }));
  };

  const isWordValid = async (word) => {
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
  };

  const checkWord = (guess, target) => {
    const g = guess.toUpperCase();
    const t = target.toUpperCase();
    const result = new Array(g.length).fill('incorrect');

    const targetUsed = new Array(t.length).fill(false);

    for (let i = 0; i < g.length; i++) {
      if (g[i] === t[i]) {
        result[i] = 'correct';
        targetUsed[i] = true;
      }
    }

    for (let i = 0; i < g.length; i++) {
      if (result[i] === 'correct') continue;
      for (let j = 0; j < t.length; j++) {
        if (targetUsed[j]) continue;
        if (g[i] === t[j]) {
          result[i] = 'misplaced';
          targetUsed[j] = true;
          break;
        }
      }
    }

    return result;
  };

  const submitGuess = async () => {
    const row = gameState.currentAttempt;
    if (gameState.currentPosition < GAME_CONFIG.cols) {
      setGameMessage('Word not complete');
      return;
    }

    const guess = gameState.grid[row].join('').toUpperCase();
    const valid = await isWordValid(guess);
    if (!valid) {
      setGameMessage('Word is not valid');
      return;
    }

    const result = checkWord(guess, gameState.word);
    const newCellStatuses = [...gameState.cellStatuses];
    newCellStatuses[row] = result;

    const won = result.every((s) => s === 'correct');
    if (won) {
      setGameState(prev => ({
        ...prev,
        cellStatuses: newCellStatuses,
        finished: true
      }));
      setGameMessage('You win!');
      return;
    }

    if (gameState.currentAttempt + 1 >= GAME_CONFIG.rows) {
      setGameState(prev => ({
        ...prev,
        cellStatuses: newCellStatuses,
        finished: true
      }));
      setGameMessage(`Game Over! The word was: ${gameState.word}`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentAttempt: prev.currentAttempt + 1,
      currentPosition: 0,
      cellStatuses: newCellStatuses
    }));
    setGameMessage('');
  };

  const addLetterToGrid = (letter) => {
    if (gameState.finished || gameState.currentPosition >= GAME_CONFIG.cols) return;

    const row = gameState.currentAttempt;
    const col = gameState.currentPosition;
    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = letter.toUpperCase();

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      currentPosition: col + 1
    }));
  };

  const removeLetterFromGrid = () => {
    if (gameState.finished || gameState.currentPosition === 0) return;

    const row = gameState.currentAttempt;
    const col = gameState.currentPosition - 1;
    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = '';

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      currentPosition: col
    }));
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (gameState.finished) return;

      const key = e.key;
      if (/^[a-z]$/i.test(key)) {
        e.preventDefault();
        addLetterToGrid(key);
      } else if (key === 'Backspace') {
        e.preventDefault();
        removeLetterFromGrid();
      } else if (key === 'Enter') {
        e.preventDefault();
        await submitGuess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="wordle-game">
      <header className="wordle-header">
        <h1>Wordle</h1>
      </header>

      <div className="wordle-container">
        <div className="wordle-grid" ref={gridRef}>
          {gameState.grid.map((row, rowIdx) => (
            <div key={rowIdx} className="wordle-row">
              {row.map((letter, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`wordle-cell ${gameState.cellStatuses[rowIdx]?.[colIdx] || ''}`}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="wordle-message">
          {gameMessage && <p>{gameMessage}</p>}
        </div>

        {gameState.finished && (
          <button className="wordle-reset-btn" onClick={() => initGame()}>
            New Game
          </button>
        )}
      </div>
    </div>
  );
}
