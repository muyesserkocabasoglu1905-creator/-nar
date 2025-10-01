import React, { useState, useEffect } from 'react';

type GameMode = 'menu' | 'difficultySelection' | 'vsComputer' | 'vsPlayer';
type Difficulty = 'easy' | 'medium' | 'hard';

// Kazananı ve kazanma çizgisini belirleyen yardımcı fonksiyon
const calculateWinner = (squares: Array<string | null>): { winner: string | null; line: number[] | null } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
};

// Kare bileşeni
interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  isWinning: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick, isWinning }) => {
  const valueClass = value === 'X'
    ? 'text-blue-400 shadow-blue-800 [text-shadow:1px_1px_0_var(--tw-shadow-color),2px_2px_0_var(--tw-shadow-color),3px_3px_0_var(--tw-shadow-color),4px_4px_8px_rgba(0,0,0,0.4)]'
    : 'text-pink-400 shadow-pink-800 [text-shadow:1px_1px_0_var(--tw-shadow-color),2px_2px_0_var(--tw-shadow-color),3px_3px_0_var(--tw-shadow-color),4px_4px_8px_rgba(0,0,0,0.4)]';
  
  const winningClass = isWinning ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700';
  const cursorClass = value ? 'cursor-not-allowed' : '';

  return (
    <button
      className={`w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-lg shadow-lg transition-all duration-200 ${winningClass} ${cursorClass}`}
      onClick={onSquareClick}
      aria-label={`Square ${value || 'empty'}`}
    >
      <span className={`text-6xl md:text-7xl font-bold ${valueClass}`}>
        {value}
      </span>
    </button>
  );
};

// Ana App bileşeni
const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);

  const { winner, line: winningLine } = calculateWinner(board);
  const isDraw = board.every(square => square !== null) && !winner;

  // Minimax algoritması (Zor Seviye)
  const minimax = (newBoard: Array<string | null>, player: 'X' | 'O'): { score: number, index?: number } => {
    const emptySpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    
    const { winner } = calculateWinner(newBoard);
    if (winner === 'X') return { score: -10 };
    if (winner === 'O') return { score: 10 };
    if (emptySpots.length === 0) return { score: 0 };

    const moves: {index: number, score: number}[] = [];
    for (const spot of emptySpots) {
        if (spot === null) continue;
        const move: {index: number, score: number} = { index: spot, score: 0 };
        newBoard[spot] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }
        newBoard[spot] = null;
        moves.push(move);
    }

    let bestMove: number = -1;
    let bestScore = player === 'O' ? -10000 : 10000;

    for (const move of moves) {
        if (player === 'O') {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move.index;
            }
        } else {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move.index;
            }
        }
    }
    return { score: bestScore, index: bestMove };
  };

  // Bilgisayar için en iyi hamleyi bulan fonksiyon
  const findBestMove = (currentBoard: Array<string | null>, currentDifficulty: Difficulty): number => {
    const emptySquares = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];

    switch (currentDifficulty) {
      case 'easy':
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      
      case 'hard':
         const move = minimax(currentBoard.slice(), 'O');
         return move.index ?? -1;

      case 'medium':
      default:
        // 1. Kazanma hamlesini kontrol et ('O' için)
        for (let i = 0; i < 9; i++) {
          if (!currentBoard[i]) {
            const tempBoard = currentBoard.slice();
            tempBoard[i] = 'O';
            if (calculateWinner(tempBoard).winner === 'O') return i;
          }
        }
        // 2. Engelleme hamlesini kontrol et ('X' için)
        for (let i = 0; i < 9; i++) {
          if (!currentBoard[i]) {
            const tempBoard = currentBoard.slice();
            tempBoard[i] = 'X';
            if (calculateWinner(tempBoard).winner === 'X') return i;
          }
        }
        // 3. Merkezi al
        if (!currentBoard[4]) return 4;
        // 4. Boş bir köşe al
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => !currentBoard[i]);
        if (availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        // 5. Boş bir kenar al
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(i => !currentBoard[i]);
        if (availableSides.length > 0) return availableSides[Math.floor(Math.random() * availableSides.length)];
        
        return emptySquares[0]; // Fallback
    }
  };

  const handleClick = (i: number) => {
    if (board[i] || winner || isDraw || (gameMode === 'vsComputer' && !isXNext)) return;
    const nextBoard = board.slice();
    nextBoard[i] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };
  
  useEffect(() => {
    if (gameMode === 'vsComputer' && !isXNext && !winner && !isDraw && difficulty) {
      setIsComputerThinking(true);
      const computerMove = findBestMove(board, difficulty);
      
      setTimeout(() => {
        if (computerMove !== -1) {
          const nextBoard = board.slice();
          if(!nextBoard[computerMove]) {
            nextBoard[computerMove] = 'O';
            setBoard(nextBoard);
          }
        }
        setIsXNext(true);
        setIsComputerThinking(false);
      }, 700);
    }
  }, [isXNext, board, winner, isDraw, gameMode, difficulty]);

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setIsComputerThinking(false);
  };

  const handleBackToMenu = () => {
    handleReset();
    setDifficulty(null);
    setGameMode('menu');
  };
  
  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
  };
  
  const handleDifficultySelect = (level: Difficulty) => {
    setDifficulty(level);
    setGameMode('vsComputer');
  };

  // Menü ekranı
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 antialiased">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-100 tracking-tight">Tic Tac Toe</h1>
          <p className="text-xl text-gray-400 mt-2">Oyun Modunu Seç</p>
        </header>
        <div className="flex flex-col space-y-4">
           <button onClick={() => handleModeSelect('difficultySelection')} className="px-12 py-4 text-xl font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Bilgisayara Karşı Oyna
           </button>
           <button onClick={() => handleModeSelect('vsPlayer')} className="px-12 py-4 text-xl font-semibold text-white bg-pink-600 rounded-lg shadow-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition duration-150 ease-in-out">
              İki Kişilik Oyna
           </button>
        </div>
      </div>
    );
  }

  // Zorluk seçim ekranı
  if (gameMode === 'difficultySelection') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 antialiased">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-100 tracking-tight">Zorluk Seç</h1>
        </header>
        <div className="flex flex-col space-y-4">
           <button onClick={() => handleDifficultySelect('easy')} className="px-12 py-4 text-xl font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition">
             Kolay
           </button>
           <button onClick={() => handleDifficultySelect('medium')} className="px-12 py-4 text-xl font-semibold text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 transition">
             Orta
           </button>
           <button onClick={() => handleDifficultySelect('hard')} className="px-12 py-4 text-xl font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition">
             Zor
           </button>
           <button onClick={() => handleModeSelect('menu')} className="mt-8 px-8 py-3 text-lg font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition">
             Geri
           </button>
        </div>
      </div>
    );
  }

  // Oyun ekranı
  let status;
  if (winner) {
    status = gameMode === 'vsComputer' 
      ? (winner === 'X' ? "Kazandın!" : "Bilgisayar Kazandı!")
      : `Kazanan: ${winner}!`;
  } else if (isDraw) {
    status = "Berabere!";
  } else {
    if (gameMode === 'vsComputer') {
        status = isXNext ? "Sıra Sende (X)" : "Bilgisayar Düşünüyor...";
    } else {
        status = `Sıra ${isXNext ? 'X' : 'O'}'de`;
    }
  }

  const renderSquare = (i: number) => {
    const isWinning = winningLine ? winningLine.includes(i) : false;
    return <Square key={i} value={board[i]} onSquareClick={() => handleClick(i)} isWinning={isWinning} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 antialiased">
      <header className="text-center mb-8"><h1 className="text-5xl font-bold text-gray-100 tracking-tight">Tic Tac Toe</h1></header>
      <main className="flex flex-col items-center">
        <div className="text-2xl font-semibold text-gray-300 mb-4 h-8" role="status">{status}</div>
        <div className="grid grid-cols-3 gap-2 bg-gray-900 p-2 rounded-lg">{Array(9).fill(null).map((_, i) => renderSquare(i))}</div>
        {(winner || isDraw) && (
          <div className="mt-8 flex space-x-4">
            <button onClick={handleReset} className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition">
              Tekrar Oyna
            </button>
            <button onClick={handleBackToMenu} className="px-8 py-3 text-lg font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition">
              Ana Menü
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;