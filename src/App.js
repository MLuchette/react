import React, {useState} from 'react';

function Square ({value, onSquareClick, winning}) {
  return <button className={`square ${winning ? 'winning' : ''}`}
          onClick={onSquareClick}>
            {value}
        </button>
}

function Board({xIsNext, squares, onPlay, currentMove}) {
  const onSquareClick = (i) => () => handleClick(i);
  const winningLine = calculateWinner(squares);
  const winner = winningLine ? squares[winningLine[0]] : null;
  let status;

  if (winner) {
    status = `Winner: ${winner}`;
  } else if (currentMove === squares.length) {
    status = 'Draw!';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  function handleClick (i) {
    if (squares[i] || calculateWinner(squares).length) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  function makeSquare(i, winning) {
    return <Square key={i} value={squares[i]} onSquareClick={onSquareClick(i)} winning={winning}/>
  }

  function makeSquares(rows, columns, winningLine=[]) {
    let squares = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        let squarePosition = squares.length;
        let winner = winningLine.includes(squarePosition);
        squares.push(makeSquare(squarePosition, winner));
      }
    }
    return squares;
  }

  const boardSquares = makeSquares(3, 3, winningLine);

  return <React.Fragment>
    <div className="status">{status}</div>
    <div className="board-row">
      {boardSquares.slice(0, 3)}
    </div>
    <div className="board-row">
      {boardSquares.slice(3, 6)}
    </div>
    <div className="board-row">
      {boardSquares.slice(6)}
    </div>
  </React.Fragment>;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleSort () {
    setSortAsc(!sortAsc);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  let moves = history.map((squares, move) => {
    let lastMove = '';
    if (move > 0) {
      const lastBoard = history[move - 1];
      const currentBoard = history[move];
      const previousMove = currentBoard.findIndex((player, position) => player !== lastBoard[position]);
      const base = previousMove / 3;
      let row = Math.floor(base);
      let column = Math.round((base - row) * 3);
      lastMove = `(${currentBoard[previousMove]} to (${column + 1}, ${row + 1}))`
    }
    let description = move === 0 ? 'Go to game start' : `Go to move # ${move} ${lastMove}`;
    function getMove () {
      if (move === currentMove) {
        return move === 0 ? 'You are at game start' : `You are at move #${currentMove} ${lastMove}`;
      }
      return <button onClick={() => jumpTo(move)}>{description}</button>;
    }

    return (
      <li key={move}>{getMove()}</li>
    );
  });

  if (!sortAsc) moves = moves.reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} currentMove={currentMove}/>
      </div>
      <div className="game-info">
        <ul>
          <li key="sort">
            <button onClick={handleSort}>{`Sort moves ${sortAsc ? 'descending' : 'ascending'}`}</button>
          </li>
          {moves}
        </ul>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal down
    [2, 4, 6], // diagonal up
  ];

  for (let i = 0; i < lines.length; i++) {
    const lineIndices = lines[i];
    const line = lineIndices.map(i => squares[i]);
    const winningPlayer = line[0];
    if (line.every(square => !!square && square === winningPlayer)) {
      return lineIndices;
    }
  }
  return [];
}
