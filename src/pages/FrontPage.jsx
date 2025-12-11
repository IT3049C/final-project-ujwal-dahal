import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadSettings, saveSettings } from "../logic/settings";
import { avatars } from "../logic/avatars";
import "../App.css";

const GAMES = [
  {
    key: "wordle",
    name: "Wordle",
    path: "/game/wordle",
    description: "Guess the word in 6 tries",
  },
  {
    key: "rps",
    name: "Rock Paper Scissors",
    path: "/game/rps",
    description: "Challenge the computer in RPS",
  },
  {
    key: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    path: "/game/tic-tac-toe",
    description: "Play a game of Tic-Tac-Toe",
  },
];

export default function FrontPage() {
  const existing = loadSettings() || {};
  const [name, setName] = useState(existing.name || "");
  const [avatar, setAvatar] = useState(existing.avatar || avatars[0].key);

  useEffect(() => {
    // keep local state in sync with storage if changed elsewhere
    const s = loadSettings();
    if (s) {
      if (s.name && s.name !== name) setName(s.name);
      if (s.avatar && s.avatar !== avatar) setAvatar(s.avatar);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings({ name, avatar });
    alert("Settings saved — avatar and name stored locally.");
  };

  return (
    <main className="frontpage">
      <header className="front-header">
        <div>
          <h1>Playground</h1>
          <p className="muted">Choose a game and pick your avatar</p>
        </div>
        <div className="avatar-preview">
          {
            (() => {
              const current = avatars.find((a) => a.key === avatar);
              return current ? (
                <img src={current.image} alt={avatar} className="avatar-img" />
              ) : (
                <div className="avatar-circle">{name ? name[0].toUpperCase() : "?"}</div>
              );
            })()
          }
        </div>
      </header>

      <section className="content-grid">
        <section className="card settings-card">
          <h2>Player Setup</h2>
          <form onSubmit={handleSave} className="settings-form">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>

            <fieldset>
              <legend>Pick an avatar</legend>
              <div className="avatar-options">
                {avatars.map((a) => (
                  <label key={a.key} className={`avatar-option ${avatar === a.key ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="avatar"
                      value={a.key}
                      checked={avatar === a.key}
                      onChange={() => setAvatar(a.key)}
                    />
                    <img src={a.image} alt={a.key} className="avatar-img small" />
                    <span className="avatar-label">{a.key}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn-primary">Save Player</button>
          </form>
        </section>

        <section className="card games-card">
          <h2>Games</h2>
          <div className="games-grid">
            {GAMES.map((g) => (
                <article className="game-card" key={g.key}>
                <h3>{g.name}</h3>
                <p className="muted">{g.description}</p>
                {g.path && g.path.startsWith("/") ? (
                  <Link className="btn-link" to={g.path}>Open</Link>
                ) : (
                  <a className="btn-link" href={g.path} target="_blank" rel="noreferrer">Open</a>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
