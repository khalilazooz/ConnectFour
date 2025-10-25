let Moves = []
// let Moves = [
//     "C1",
//     "C2",
//     "C4",
//     "C5",
//     "C6",
//     "C7",
//     "C6",
//     "C4",
//     "C3"
// ] // for test
let movesCount = 0;
const boardColumns = 7;
const startColor = 'r';
function cleanGameBoard()
{
    UpdatedValue = "";
    UpdatedValue = UpdatedValue + "<tbody>"
    for (var i = 0; i < 6; i++)
    {
        UpdatedValue =  UpdatedValue + "<tr>";
        for (var j = 0; j < 7; j++)
        {
            UpdatedValue =  UpdatedValue + "<td>";
            UpdatedValue =  UpdatedValue + "</td>";
        }
        UpdatedValue =  UpdatedValue + "</tr>";
    }
    UpdatedValue = UpdatedValue + "</tbody>"
    document.getElementById("gameBoard").innerHTML = UpdatedValue;
}
function checkWinner(columns , NoMark=false) {
  const ROWS = 6;
  const COLS = 7;

  // Convert from column-based to row-based representation
  const board = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => columns[c][ROWS - 1 - r] || "")
  );

  const directions = [
    { dr: 0, dc: 1 },   // →
    { dr: 1, dc: 0 },   // ↓
    { dr: 1, dc: 1 },   // ↘
    { dr: 1, dc: -1 }   // ↙
  ];

  const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;

      for (const { dr, dc } of directions) {
        const positions = [{ r, c }];
        let nr = r + dr;
        let nc = c + dc;

        while (inBounds(nr, nc) && board[nr][nc] === cell) {
          positions.push({ r: nr, c: nc });
          if (positions.length === 4) {
            if(!NoMark)
            {
                // mark winning cells in the *original columns* array
                const mark = cell === "r" ? "wr" : "wy";
                for (const p of positions) {
                const col = p.c;
                const rowInCol = ROWS - 1 - p.r;
                columns[col][rowInCol] = mark;
                }
            }
            return cell;
          }
          nr += dr;
          nc += dc;
        }
      }
    }
  }

  return null;
}

function CreateBoardFromMoves(Moves)
{
    let list = [...Array(boardColumns)].map(() => []);
    let colorTurn = startColor;
    let MovesAsNumbers = Moves.map(item => Number(item.replace("C", "")));
    MovesAsNumbers.forEach(move => {
        list[(move-1)].push(colorTurn);
        if (colorTurn == "r") {colorTurn = "y"}else{colorTurn = "r"}
    });
    return list;
}
function play(move)
{
    Moves.push(move);
}
function undo()
{
    Moves.pop();
}
function UpdateGameBoard(moves)
{
    // y => yellow
    // r => red
    let boardList = CreateBoardFromMoves(moves);
    checkWinner(boardList);
    
    UpdatedValue = "";
    var error = false;

    UpdatedValue = UpdatedValue + "<tbody>"
    for (var i = 0; i < 6; i++)
    {
        if(boardList[i] !== undefined)
        {
            UpdatedValue =  UpdatedValue + "<tr>";
            for (var j = 0; j < boardColumns; j++)
            {
                UpdatedValue =  UpdatedValue + "<td onclick='play(\"C"+String((j+1))+"\")'>";
                if(boardList[j][5-i] !== undefined)
                {
                    if(boardList[j][5-i]== "r")
                    {
                        UpdatedValue =  UpdatedValue + '<div class="redPeice"></div>'
                    }
                    else if(boardList[j][5-i]== "y")
                    {
                        UpdatedValue =  UpdatedValue + '<div class="yellowPeice"></div>'
                    }
                    else if(boardList[j][5-i]== "wr")
                    {
                        UpdatedValue =  UpdatedValue + '<div class="WinnerRedPeice"></div>'
                    }
                    else if(boardList[j][5-i]== "wy")
                    {
                        UpdatedValue =  UpdatedValue + '<div class="WinnerYellowPeice"></div>'
                    }
                    else
                    {
                        error = true;
                        break; 
                    }
                }
                UpdatedValue =  UpdatedValue + "</td>";
            }
            UpdatedValue =  UpdatedValue + "</tr>";
        }
    }
    UpdatedValue = UpdatedValue + "</tbody>"

    if(!error)
    {
        document.getElementById("gameBoard").innerHTML = UpdatedValue;
    }
}
function UpdateMovesName(moves)
{
    html = ""
    for (let i = 0; i < moves.length; i += 2) {
        let index = Math.floor(i / 2) + 1;
        let move1 = moves[i] || "";
        let move2 = moves[i + 1] || "";
        html += `
        <tr>
            <td>${index}</td>
            <td>${move1}</td>
            <td>${move2}</td>
        </tr>`;
    }

    document.getElementById("MoveNames").innerHTML = document.getElementById("MoveNames").innerHTML + html;
}



UpdateGameBoard([]);
const intervalID = setInterval(UpdateIntval, 300);

function UpdateIntval() {
    if(Moves.length != movesCount)
    {
        const nextTurn = (Moves.length % 2 === 0) ? startColor : (startColor === "r" ? "y" : "r");
        const best = getBestMove(Moves, nextTurn, 8);
        // document.getElementById("MoveNames").innerHTML = ""/*`<tr>
        //     <td>${0}</td>
        //     <td>${best}</td>
        //     <td>C2</td>
        // </tr>`;*/
        play(best);
        UpdateGameBoard(Moves)
        movesCount = Moves.length
        UpdateMovesName(Moves);
    }
}

// Make a clean columns array from Moves but avoid the winner marks (only 'r'/'y')
function makeColumnsFromMovesPlain(Moves) {
  const cols = [...Array(boardColumns)].map(() => []);
  let colorTurn = startColor;
  for (let i = 0; i < Moves.length; i++) {
    const move = Moves[i];
    const n = Number(move.replace("C", ""));
    if (!Number.isFinite(n) || n < 1 || n > boardColumns) continue;
    cols[n - 1].push(colorTurn);
    colorTurn = (colorTurn === "r") ? "y" : "r";
  }
  return cols;
}

// Utility: list valid columns (0-based) where a piece can be dropped
function validColumns(columns) {
  const valid = [];
  for (let c = 0; c < boardColumns; c++) {
    if (columns[c].length < 6) valid.push(c);
  }
  return valid;
}

// Heuristic: score a 4-cell window for a given player
function evaluateWindow(windowArr, player) {
  const opponent = player === "r" ? "y" : "r";
  let score = 0;
  const playerCount = windowArr.filter(x => x === player).length;
  const emptyCount = windowArr.filter(x => x === "").length;
  const oppCount = windowArr.filter(x => x === opponent).length;

  if (playerCount === 4) score += 10000;
  else if (playerCount === 3 && emptyCount === 1) score += 50;
  else if (playerCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 3 && emptyCount === 1) score -= 80;
  return score;
}

// Evaluate board for `player` - higher means better for player
function scorePosition(columns, player) {
  const ROWS = 6, COLS = 7;
  // Build row-based board
  const board = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (columns[c][ROWS - 1 - r] || ""))
  );

  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) if (board[r][centerCol] === player) centerCount++;
  score += centerCount * 6;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const windowArr = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(windowArr, player);
    }
  }
  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const windowArr = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(windowArr, player);
    }
  }
  // Positive diagonal
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const windowArr = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(windowArr, player);
    }
  }
  // Negative diagonal
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const windowArr = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(windowArr, player);
    }
  }

  return score;
}

// Drop piece in columns (mutates)
function dropPiece(columns, col, piece) {
  columns[col].push(piece);
}

// Undo last piece in a column (mutates)
function undoPiece(columns, col) {
  return columns[col].pop();
}

// Terminal test: winner or full board
function isTerminalNode(columns) {
  const winner = checkWinner(columns, true);
  if (winner) return true;
  const full = validColumns(columns).length === 0;
  return full;
}

// Minimax with alpha-beta pruning
function minimax(columns, depth, alpha, beta, maximizingPlayer, player) {
  // player = the player for whom we are computing best move (root player)
  const opponent = player === "r" ? "y" : "r";
  const winner = checkWinner(columns , true);
  if (depth === 0 || winner || validColumns(columns).length === 0) {
    if (winner === player) return { score: Infinity };
    else if (winner === opponent) return { score: -Infinity };
    else return { score: scorePosition(columns, player) };
  }

  const validCols = validColumns(columns);

  // Preference order: center-first to improve pruning & quality
  validCols.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));

  if (maximizingPlayer) {
    let value = -Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      dropPiece(columns, col, player);
      const newScore = minimax(columns, depth - 1, alpha, beta, false, player).score;
      undoPiece(columns, col);
      if (newScore > value) {
        value = newScore; bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { score: value, column: bestCol };
  } else {
    let value = Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      dropPiece(columns, col, opponent);
      const newScore = minimax(columns, depth - 1, alpha, beta, true, player).score;
      undoPiece(columns, col);
      if (newScore < value) {
        value = newScore; bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { score: value, column: bestCol };
  }
}

function getBestMove(MovesArray, player, depth = 5) {
  const columns = makeColumnsFromMovesPlain(MovesArray);
  const validCols = validColumns(columns);
  if (validCols.length === 0) return null;

  const opponent = player === "r" ? "y" : "r";

  // 1️⃣ Check if we can win immediately
  for (const col of validCols) {
    dropPiece(columns, col, player);
    if (checkWinner(columns, true) === player) {
      undoPiece(columns, col);
      return "C" + (col + 1);
    }
    undoPiece(columns, col);
  }

  // 2️⃣ Check if opponent has an immediate win — block it
  for (const col of validCols) {
    dropPiece(columns, col, opponent);
    if (checkWinner(columns, true) === opponent) {
      undoPiece(columns, col);
      return "C" + (col + 1);
    }
    undoPiece(columns, col);
  }

  // 3️⃣ Check if we can create a two-sided win (fork)
  for (const col of validCols) {
    dropPiece(columns, col, player);
    const nextValid = validColumns(columns);
    let futureWins = 0;
    for (const nextCol of nextValid) {
      dropPiece(columns, nextCol, player);
      if (checkWinner(columns, true) === player) futureWins++;
      undoPiece(columns, nextCol);
    }
    undoPiece(columns, col);

    if (futureWins >= 2) {
      // A move that gives us at least two winning moves next turn
      return "C" + (col + 1);
    }
  }

  // 4️⃣ Otherwise use minimax for positional decision
  const result = minimax(columns, depth, -Infinity, Infinity, true, player);
  return "C" + (result.column + 1);
}