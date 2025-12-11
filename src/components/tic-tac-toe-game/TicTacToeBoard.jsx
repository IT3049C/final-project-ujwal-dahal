import { useState } from "react";
import "./styles.css";

function Square({value, whenSquareClicked}) {
    return (
    <button 
        className="square"
        onClick={whenSquareClicked}
    >
        {value}</button>
    ); 
}

function Board({xNext, squares, onPlay}) {
    
    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = "Winner Is: " + winner;
    } else {
        status = "Next player: " + (xNext ? "X" : "O");
    }
        
    function handleClick(index) {
        if (squares[index] || calculateWinner(squares)) {
            return;
        }
        const squareNext = squares.slice();

        if (xNext) {
            squareNext[index] = "X";
        } else {
            squareNext[index] = "O";
        }
        
        onPlay(squareNext);

    }

    return (
            <>
            <div className="status">{status}</div>
            <div className="board-row">
                <Square value={squares[0]} whenSquareClicked={() => handleClick(0)}/>
                <Square value={squares[1]} whenSquareClicked={() => handleClick(1)}/>
                <Square value={squares[2]} whenSquareClicked={() => handleClick(2)}/>
            </div> 
            <div className="board-row">
                <Square value={squares[3]} whenSquareClicked={() => handleClick(3)}/>
                <Square value={squares[4]} whenSquareClicked={() => handleClick(4)}/>
                <Square value={squares[5]} whenSquareClicked={() => handleClick(5)}/>
            </div>
            <div className="board-row">
                <Square value={squares[6]} whenSquareClicked={() => handleClick(6)}/>
                <Square value={squares[7]} whenSquareClicked={() => handleClick(7)}/>
                <Square value={squares[8]} whenSquareClicked={() => handleClick(8)}/>
            </div>
        </>
        );
    }
    export function Game() {
        const [xNext, setXNext] = useState(true);
        const [history, setGameHistory] = useState([Array(9).fill(null)]);
        const currentSquares = history[history.length - 1];

        function handlePlay(squareNext) {
            setGameHistory([...history, squareNext]);
            setXNext(!xNext);
        }

        return (
            
            <div className="game">
                <div className="game-board">
                    <Board xNext={xNext} squares={currentSquares} onPlay={handlePlay}/>
                </div>
                <div className="game-info">
                    <ol></ol>
                </div>
            </div>
        );
    }
        
    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
            for (let k = 0; k < lines.length; k++) {
                const [a,b,c] =lines[k];
                if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                    return squares[a];
                }
            }
        return null;
    }
