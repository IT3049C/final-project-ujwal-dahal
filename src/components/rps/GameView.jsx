import { useState } from "react";
import { decideWinner, getCpuMove, nextScore } from "../../logic/rpsGame";
import { loadSettings } from "../../logic/settings";

export function GameView({ settings: providedSettings }) {
  const settings = providedSettings || loadSettings();
  const [score, setScore] = useState({ player: 0, cpu: 0, ties: 0 });
  const [history, setHistory] = useState([]);

  function handleMove(playerMove) {
    const cpuMove = getCpuMove({ difficulty: settings?.difficulty, lastPlayerMove: playerMove });
    const outcome = decideWinner(playerMove, cpuMove);
    setScore((s) => nextScore(s, outcome));
    setHistory((h) => [`Player(${playerMove}) vs CPU(${cpuMove}) -> ${outcome}`, ...h]);
  }

  function resetGame() {
    setScore({ player: 0, cpu: 0, ties: 0 });
    setHistory([]);
  }

  return (
    <main className="card">
      <header>
        <h2>Rock Paper Scissors</h2>
        <div role="status" aria-live="polite" data-testid="greeting">
          {settings?.name ? `Welcome, ${settings.name}!` : ""}
        </div>
        <div id="current-difficulty">{settings?.difficulty || "normal"}</div>
      </header>

      <section className="moves">
        <button data-move="rock" onClick={() => handleMove("rock")}>Rock</button>
        <button data-move="paper" onClick={() => handleMove("paper")}>Paper</button>
        <button data-move="scissors" onClick={() => handleMove("scissors")}>Scissors</button>
      </section>

      <section className="scores">
        <div id="score-player">{score.player}</div>
        <div id="score-cpu">{score.cpu}</div>
        <div id="score-ties">{score.ties}</div>
      </section>

      <section>
        <h3>History</h3>
        <ul id="history">
          {history.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      <button id="reset-game" onClick={resetGame}>Reset</button>
    </main>
  );
}
