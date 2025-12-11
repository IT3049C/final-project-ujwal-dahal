import { useNavigate } from "react-router-dom";

export default function WordlePage() {
  const navigate = useNavigate();
  return (
    <div className="wordle-page">
      <h2>Wordle</h2>
      <div className="wordle-container">
        <iframe
          src="/final-project-ujwal-dahal/wordle/index.html"
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
            borderRadius: "8px",
            maxWidth: "100%",
            display: "block",
          }}
          title="Wordle Game"
        />
      </div>
      <button className="back-button" onClick={() => navigate("/")}>← Back to Menu</button>
    </div>
  );
}
