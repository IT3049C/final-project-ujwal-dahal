import { useNavigate } from "react-router-dom";
import { GameView } from "../components/rps/GameView";

export default function RPSPage() {
  const navigate = useNavigate();
  return (
    <div className="rps-page">
      <h2>Rock Paper Scissors</h2>
      <GameView />
      <button className="back-button" onClick={() => navigate("/")}>← Back to Menu</button>
    </div>
  );
}
