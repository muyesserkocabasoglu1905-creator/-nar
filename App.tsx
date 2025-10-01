import React, { useState, useEffect, useCallback } from 'react';

type Player = 'X' | 'O' | null;
type GameMode = null | 'vsPlayer' | 'vsComputer';
type Difficulty = null | 'easy' | 'medium' | 'hard';

const Square: React.FC<{ value: Player; onClick: () => void; isWinning: boolean }> = ({ value, onClick, isWinning }) => {
  const char = value || '';
  const isX = char === 'X';
  const isO = char === 'O';

  // 3D Text Style
  const threeDStyleX = {
    textShadow: `
      1px 1px 0 #0077b6, 2px 2px 0 #006a9e, 3px 3px 0 #005c86, 4px 4px 0 #004f6e,
      5px 5px 10px rgba(0,0,0,0.5)
    `,
  };

  const threeDStyleO = {
    textShadow: `
      1px 1px 0 #d00070, 2px 2px 0 #b80063, 3px 3px 0 #a00056, 4px 4px 0 #880049,
      5px 5px 10px rgba(0,0,0,0.5)
    `,
  };

  return (
    <button
      className={`w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg flex items-center justify-center text-5xl md:text-7xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg
        ${isWinning ? 'bg-green-500' : 'hover:bg-gray-700'}
        ${isX ? 'text-blue-400' : ''}
        ${isO ? 'text-pink-500' : ''}
      `}
      onClick={onClick}
      aria-label={`Square ${value || 'empty'}`}
      style={isX ? threeDStyleX : isO ? threeDStyleO : {}}
    >
      {char}
    </button>
  );
};


const Board: React.FC<{ squares: Player[]; onClick: (i: number) => void; winningLine: number[] | null }> = ({ squares, onClick, winningLine }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {squares.map((square, i) => (
        <Square
          key={i}
          value={square}
          onClick={() => onClick(i)}
          isWinning={winningLine ? winningLine.includes(i) : false}
        />
      ))}
    </div>
  );
};

const calculateWinner = (squares: Player[]) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
};

// Minimax algorithm for the "Hard" AI
const minimax = (newBoard: Player[], player: 'X' | 'O'): { score: number, index?: number } => {
    const availSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];

    const winnerInfo = calculateWinner(newBoard);
    if (winnerInfo?.winner === 'X') {
        return { score: -10 };
    } else if (winnerInfo?.winner === 'O') {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves: { index: number; score: number }[] = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move: { index: number; score: number } = { index: -1, score: 0};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }
        newBoard[availSpots[i]] = null;
        moves.push(move);
    }

    let bestMove = -1;
    let bestScore = player === 'O' ? -10000 : 10000;

    for (let i = 0; i < moves.length; i++) {
        if (player === 'O') {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        } else {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}


const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [view, setView] = useState<'menu' | 'difficulty' | 'game'>('menu');

  const winnerInfo = calculateWinner(board);
  const winner = winnerInfo?.winner;
  const isBoardFull = board.every(square => square !== null);

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };
  
  const handleMainMenu = () => {
    handlePlayAgain();
    setGameMode(null);
    setDifficulty(null);
    setView('menu');
  }

  const handleClick = (i: number) => {
    if (winner || board[i]) {
      return;
    }
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const getComputerMove = useCallback((currentBoard: Player[], currentDifficulty: Difficulty): number => {
    const emptySquares = currentBoard
      .map((val, idx) => (val === null ? idx : -1))
      .filter(val => val !== -1);
    
    if (emptySquares.length === 0) return -1;

    // Easy: Random move
    if (currentDifficulty === 'easy') {
      const randomIndex = Math.floor(Math.random() * emptySquares.length);
      return emptySquares[randomIndex];
    }

    // Hard: Minimax move
    if (currentDifficulty === 'hard') {
        const bestMove = minimax(currentBoard, 'O');
        return bestMove.index ?? emptySquares[0];
    }
    
    // Medium: Strategic move
    // 1. Check for a winning move
    for (const move of emptySquares) {
      const boardCopy = [...currentBoard];
      boardCopy[move] = 'O';
      if (calculateWinner(boardCopy)?.winner === 'O') {
        return move;
      }
    }

    // 2. Check to block player's winning move
    for (const move of emptySquares) {
      const boardCopy = [...currentBoard];
      boardCopy[move] = 'X';
      if (calculateWinner(boardCopy)?.winner === 'X') {
        return move;
      }
    }

    // 3. Take the center if available
    if (emptySquares.includes(4)) {
      return 4;
    }

    // 4. Take a corner
    const corners = [0, 2, 6, 8].filter(corner => emptySquares.includes(corner));
    if (corners.length > 0) {
      const randomIndex = Math.floor(Math.random() * corners.length);
      return corners[randomIndex];
    }
    
    // 5. Take any remaining square
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];

  }, []);

  useEffect(() => {
    if (gameMode === 'vsComputer' && !isXNext && !winner && !isBoardFull) {
        const thinkingTimeout = setTimeout(() => {
            const move = getComputerMove(board, difficulty);
            if (move !== -1) {
              handleClick(move);
            }
        }, 500); // 0.5s delay
        return () => clearTimeout(thinkingTimeout);
    }
  }, [isXNext, board, gameMode, winner, isBoardFull, difficulty, getComputerMove, handleClick]);


  const getStatus = () => {
    if (winner) return `Kazanan: ${winner}`;
    if (isBoardFull) return 'Berabere!';
    if (gameMode === 'vsPlayer') return `Sıradaki: ${isXNext ? 'X' : 'O'}`;
    if (gameMode === 'vsComputer') {
        return isXNext ? 'Sıra Sende' : 'Bilgisayar Düşünüyor...';
    }
    return '';
  };

  const renderContent = () => {
    if (view === 'menu') {
      return (
        <div className="flex flex-col space-y-4">
            <h1 className="text-5xl font-bold text-center text-white mb-4">Tic Tac Toe</h1>
            <button
            onClick={() => {
                setGameMode('vsComputer');
                setView('difficulty');
            }}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
            Bilgisayara Karşı Oyna
            </button>
            <button
            onClick={() => {
                setGameMode('vsPlayer');
                setView('game');
            }}
            className="px-8 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-colors"
            >
            İki Kişilik Oyna
            </button>
        </div>
      );
    }
    if (view === 'difficulty') {
        return (
            <div className="flex flex-col space-y-4">
                <h2 className="text-4xl font-bold text-center text-white mb-4">Zorluk Seç</h2>
                <button onClick={() => { setDifficulty('easy'); setView('game'); }} className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">Kolay</button>
                <button onClick={() => { setDifficulty('medium'); setView('game'); }} className="px-8 py-4 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-colors">Orta</button>
                <button onClick={() => { setDifficulty('hard'); setView('game'); }} className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">Zor</button>
                <button onClick={() => setView('menu')} className="mt-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">Geri</button>
            </div>
        )
    }
    if (view === 'game') {
      return (
        <div className="flex flex-col items-center">
            <div className="mb-6 text-2xl font-semibold text-white h-8">{getStatus()}</div>
            <Board squares={board} onClick={handleClick} winningLine={winnerInfo?.line || null} />
            {(winner || isBoardFull) && (
                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={handlePlayAgain}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                        Tekrar Oyna
                    </button>
                    <button
                        onClick={handleMainMenu}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                    >
                        Ana Menü
                    </button>
                </div>
            )}
        </div>
      );
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {renderContent()}
    </div>
  );
};

export default App;
