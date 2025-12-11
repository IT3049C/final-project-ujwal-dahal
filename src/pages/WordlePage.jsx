import { useNavigate } from "react-router-dom";
import WordleGame from "../components/wordle-game/WordleGame";

export default function WordlePage() {
  const navigate = useNavigate();
  return (
    <div className="wordle-page">
      <WordleGame />
      <button className="back-button" onClick={() => navigate("/")}>← Back to Menu</button>
    </div>
  );
}
