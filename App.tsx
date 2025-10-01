import React, { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type GameState = 'menu' | 'difficulty' | 'playing' | 'gameOver';
type GameMode = 'cpu' | 'player';
type Difficulty = 'easy' | 'medium' | 'hard';

const Square: React.FC<{ value: Player; onClick: () => void }> = ({ value, onClick }) => (
  <button
    className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg flex items-center justify-center text-5xl md:text-6xl font-bold shadow-lg transform transition-transform hover:scale-105"
    onClick={onClick}
    aria-label={`Square ${value ? `with ${value}` : 'empty'}`}
  >
    {value === 'X' && <span className="text-blue-400" style={{ textShadow: '0 0 5px #60a5fa, 0 0 10px #60a5fa, 2px 2px 2px #1e3a8a, 4px 4px 4px #1e3a8a' }}>X</span>}
    {value === 'O' && <span className="text-pink-400" style={{ textShadow: '0 0 5px #f472b6, 0 0 10px #f472b6, 2px 2px 2px #831843, 4px 4px 4px #831843' }}>O</span>}
  </button>
);

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Berabere'>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('cpu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const calculateWinner = (squares: Player[]): Player | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'cpu' && !isPlayerNext)) return;

    const newBoard = board.slice();
    newBoard[index] = isPlayerNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsPlayerNext(!isPlayerNext);
  };
  
  const computerMove = (currentBoard: Player[]): number => {
      // Easy: Random move
      if (difficulty === 'easy') {
          let emptySquares = currentBoard.map((sq, i) => sq === null ? i : -1).filter(i => i !== -1);
          return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      }

      // Hard: Minimax Algorithm
      if (difficulty === 'hard') {
          const bestMove = minimax(currentBoard, 'O');
          return bestMove.index;
      }
      
      // Medium: Strategic move
      // 1. Check for winning move
      for (let i = 0; i < 9; i++) {
          if (currentBoard[i] === null) {
              const testBoard = currentBoard.slice();
              testBoard[i] = 'O';
              if (calculateWinner(testBoard) === 'O') {
                  return i;
              }
          }
      }
      // 2. Check to block player's winning move
      for (let i = 0; i < 9; i++) {
          if (currentBoard[i] === null) {
              const testBoard = currentBoard.slice();
              testBoard[i] = 'X';
              if (calculateWinner(testBoard) === 'X') {
                  return i;
              }
          }
      }
      // 3. Take center
      if (currentBoard[4] === null) return 4;
      // 4. Take corners
      const corners = [0, 2, 6, 8];
      const emptyCorners = corners.filter(i => currentBoard[i] === null);
      if (emptyCorners.length > 0) {
          return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }
      // 5. Take sides
      const sides = [1, 3, 5, 7];
      const emptySides = sides.filter(i => currentBoard[i] === null);
      if (emptySides.length > 0) {
          return emptySides[Math.floor(Math.random() * emptySides.length)];
      }
      return -1; // Should not happen
  };

  const minimax = (newBoard: Player[], player: Player): { score: number, index: number } => {
      let emptySpots = newBoard.map((sq, i) => sq === null ? i : -1).filter(i => i !== -1);

      if (calculateWinner(newBoard) === 'X') {
          return { score: -10, index: -1 };
      } else if (calculateWinner(newBoard) === 'O') {
          return { score: 10, index: -1 };
      } else if (emptySpots.length === 0) {
          return { score: 0, index: -1 };
      }

      let moves: { score: number, index: number }[] = [];
      for (let i = 0; i < emptySpots.length; i++) {
          let move: { score: number, index: number } = { score: 0, index: emptySpots[i] };
          newBoard[emptySpots[i]] = player;

          if (player === 'O') {
              let result = minimax(newBoard, 'X');
              move.score = result.score;
          } else {
              let result = minimax(newBoard, 'O');
              move.score = result.score;
          }
          newBoard[emptySpots[i]] = null;
          moves.push(move);
      }

      let bestMove = 0;
      if (player === 'O') {
          let bestScore = -10000;
          for (let i = 0; i < moves.length; i++) {
              if (moves[i].score > bestScore) {
                  bestScore = moves[i].score;
                  bestMove = i;
              }
          }
      } else {
          let bestScore = 10000;
          for (let i = 0; i < moves.length; i++) {
              if (moves[i].score < bestScore) {
                  bestScore = moves[i].score;
                  bestMove = i;
              }
          }
      }
      return moves[bestMove];
  }


  useEffect(() => {
    const gameWinner = calculateWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameState('gameOver');
    } else if (!board.includes(null)) {
      setWinner('Berabere');
      setGameState('gameOver');
    } else if (gameMode === 'cpu' && !isPlayerNext && gameState === 'playing') {
      const timeoutId = setTimeout(() => {
        const move = computerMove(board);
        if (move !== -1) {
            handleSquareClick(move);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [board, isPlayerNext, gameMode, gameState]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerNext(true);
    setWinner(null);
    setGameState('playing');
  };

  const goToMenu = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerNext(true);
    setWinner(null);
    setGameState('menu');
  }
  
  const selectGameMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'player') {
      setGameState('playing');
    } else {
      setGameState('difficulty');
    }
  };

  const selectDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    setGameState('playing');
  };
  
  const getStatus = () => {
    if (winner) {
        return winner === 'Berabere' ? "Oyun Berabere!" : `Kazanan: ${winner}`;
    }
    if (gameState !== 'playing') return "";
    if (gameMode === 'cpu') {
        return isPlayerNext ? "Sıra Sende" : "Bilgisayar Düşünüyor...";
    }
    return `Sıra: ${isPlayerNext ? 'X' : 'O'}`;
  }

  const renderMenu = () => (
    <div className="text-center">
      <h1 className="text-5xl font-bold mb-8">Tic Tac Toe</h1>
      <div className="space-y-4">
        <button onClick={() => selectGameMode('cpu')} className="w-64 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
          Bilgisayara Karşı Oyna
        </button>
        <button onClick={() => selectGameMode('player')} className="w-64 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
          İki Kişilik Oyna
        </button>
      </div>
    </div>
  );

  const renderDifficultyMenu = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Zorluk Seviyesi Seç</h1>
      <div className="space-y-4">
        <button onClick={() => selectDifficulty('easy')} className="w-64 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
          Kolay
        </button>
        <button onClick={() => selectDifficulty('medium')} className="w-64 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
          Orta
        </button>
        <button onClick={() => selectDifficulty('hard')} className="w-64 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
          Zor
        </button>
      </div>
       <button onClick={goToMenu} className="mt-8 text-gray-400 hover:text-white transition duration-300">
        &larr; Geri
      </button>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-6 h-10">{getStatus()}</h2>
        <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 bg-gray-900 rounded-xl shadow-2xl">
          {board.map((_, i) => (
            <Square key={i} value={board[i]} onClick={() => handleSquareClick(i)} />
          ))}
        </div>
        {gameState === 'gameOver' && (
            <div className="mt-8 flex space-x-4">
                <button onClick={resetGame} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
                    Tekrar Oyna
                </button>
                 <button onClick={goToMenu} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
                    Ana Menü
                </button>
            </div>
        )}
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        {gameState === 'menu' && renderMenu()}
        {gameState === 'difficulty' && renderDifficultyMenu()}
        {(gameState === 'playing' || gameState === 'gameOver') && renderGame()}
    </div>
  );
};

export default App;
