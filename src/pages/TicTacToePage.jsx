import { useNavigate } from "react-router-dom";
import { Game } from "../components/tic-tac-toe-game/TicTacToeBoard";

export default function TicTacToePage() {
  const navigate = useNavigate();
  return (
    <div className="game-page">
      <h2>Tic-Tac-Toe</h2>
      <div className="game-center">
        <Game />
      </div>
      <button className="back-button" onClick={() => navigate("/")}>← Back to Menu</button>
    </div>
  );
}
