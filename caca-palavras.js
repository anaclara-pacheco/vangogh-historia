const GRID_SIZE = 15;
const WORD_GROUPS = {
  places: [
    { label: 'Zundert', answer: 'ZUNDERT' },
    { label: 'Haia', answer: 'HAIA' },
    { label: 'Londres', answer: 'LONDRES' },
    { label: 'Paris', answer: 'PARIS' },
    { label: 'Borinage', answer: 'BORINAGE' },
    { label: 'Nuenen', answer: 'NUENEN' },
    { label: 'Arles', answer: 'ARLES' },
    { label: 'Saint-Rémy', answer: 'SAINTREMY' },
    { label: 'Auvers', answer: 'AUVERS' },
  ],
  artworks: [
    { label: 'Girassóis', answer: 'GIRASSOIS' },
    { label: 'A Noite Estrelada', answer: 'NOITEESTRELADA' },
    { label: 'O Quarto em Arles', answer: 'QUARTOEMARLES' },
    { label: 'Autorretrato', answer: 'AUTORRETRATO' },
    { label: 'Os Comedores de Batata', answer: 'COMEDORESBATATA' },
  ],
};
const ALL_WORDS = [...WORD_GROUPS.places, ...WORD_GROUPS.artworks];
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1],
];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const boardElement = document.querySelector('#wordsearch-board');
const statusElement = document.querySelector('#game-status');
const countElement = document.querySelector('#found-count');
const foundWords = new Set();
let grid = [];
let firstCell = null;
let previewCells = [];
let foundCells = new Map();

function makeGrid() {
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const shuffledWords = [...ALL_WORDS].sort((a, b) => b.answer.length - a.answer.length);

  shuffledWords.forEach(({ answer }) => {
    let placed = false;
    for (let attempt = 0; attempt < 500 && !placed; attempt += 1) {
      const [rowStep, colStep] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const endRow = startRow + rowStep * (answer.length - 1);
      const endCol = startCol + colStep * (answer.length - 1);
      if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;

      const positions = Array.from({ length: answer.length }, (_, index) => [
        startRow + rowStep * index,
        startCol + colStep * index,
      ]);
      if (positions.some(([row, col], index) => grid[row][col] && grid[row][col] !== answer[index])) continue;
      positions.forEach(([row, col], index) => { grid[row][col] = answer[index]; });
      placed = true;
    }
  });

  grid = grid.map((row) => row.map((letter) => letter || ALPHABET[Math.floor(Math.random() * ALPHABET.length)]));
}

function renderWords() {
  Object.entries(WORD_GROUPS).forEach(([group, words]) => {
    const list = document.querySelector(`#${group}-list`);
    list.replaceChildren(...words.map(({ label, answer }) => {
      const item = document.createElement('li');
      item.className = 'word-item';
      item.dataset.answer = answer;
      item.textContent = label;
      return item;
    }));
  });
}

function renderBoard() {
  boardElement.replaceChildren();
  grid.forEach((row, rowIndex) => row.forEach((letter, colIndex) => {
    const cell = document.createElement('button');
    cell.className = 'letter-cell';
    cell.type = 'button';
    cell.textContent = letter;
    cell.dataset.row = rowIndex;
    cell.dataset.col = colIndex;
    cell.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${colIndex + 1}, letra ${letter}`);
    boardElement.append(cell);
  }));
}

function updateBoardHighlights() {
  boardElement.querySelectorAll('.letter-cell').forEach((cell) => {
    const key = `${cell.dataset.row},${cell.dataset.col}`;
    cell.classList.toggle('is-selected', previewCells.includes(key));
    cell.classList.toggle('is-found', foundCells.has(key));
  });
}

function getSelection(start, end) {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;
  const length = Math.max(Math.abs(rowDelta), Math.abs(colDelta)) + 1;
  if (rowDelta !== 0 && colDelta !== 0 && Math.abs(rowDelta) !== Math.abs(colDelta)) return null;

  const rowStep = Math.sign(rowDelta);
  const colStep = Math.sign(colDelta);
  return Array.from({ length }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }));
}

function finishSelection(end) {
  const cells = getSelection(firstCell, end);
  if (!cells) {
    statusElement.textContent = 'Selecione uma linha reta, coluna ou diagonal.';
    return;
  }

  const selectedWord = cells.map(({ row, col }) => grid[row][col]).join('');
  const reversedWord = [...selectedWord].reverse().join('');
  const match = ALL_WORDS.find(({ answer }) =>
    !foundWords.has(answer) && (answer === selectedWord || answer === reversedWord));

  if (match) {
    foundWords.add(match.answer);
    cells.forEach(({ row, col }) => {
      const key = `${row},${col}`;
      if (!foundCells.has(key)) foundCells.set(key, new Set());
      foundCells.get(key).add(match.answer);
    });
    const wordItem = document.querySelector(`[data-answer="${match.answer}"]`);
    wordItem.classList.add('is-found');
    countElement.textContent = `${foundWords.size} / ${ALL_WORDS.length}`;
    statusElement.textContent = foundWords.size === ALL_WORDS.length
      ? 'Parabéns! Você encontrou todas as palavras!'
      : `Boa! Você encontrou: ${match.label}.`;
  } else {
    statusElement.textContent = 'Essa sequência não está na lista. Tente outra palavra.';
  }
}

boardElement.addEventListener('click', (event) => {
  const button = event.target.closest('.letter-cell');
  if (!button) return;
  const cell = { row: Number(button.dataset.row), col: Number(button.dataset.col) };

  if (!firstCell) {
    firstCell = cell;
    previewCells = [`${cell.row},${cell.col}`];
    statusElement.textContent = 'Agora clique na última letra da palavra.';
  } else {
    const cells = getSelection(firstCell, cell);
    if (cells) {
      previewCells = cells.map(({ row, col }) => `${row},${col}`);
      finishSelection(cell);
      firstCell = null;
      window.setTimeout(() => {
        previewCells = [];
        updateBoardHighlights();
      }, 700);
    } else {
      firstCell = cell;
      previewCells = [`${cell.row},${cell.col}`];
      statusElement.textContent = 'A seleção deve ser reta. Escolha a última letra dessa palavra.';
    }
  }
  updateBoardHighlights();
});

document.querySelector('#reset-puzzle').addEventListener('click', () => {
  foundWords.clear();
  foundCells = new Map();
  firstCell = null;
  previewCells = [];
  countElement.textContent = `0 / ${ALL_WORDS.length}`;
  statusElement.textContent = 'Novo jogo! Encontre uma palavra na grade.';
  document.querySelectorAll('.word-item').forEach((item) => item.classList.remove('is-found'));
  makeGrid();
  renderBoard();
});

makeGrid();
renderWords();
renderBoard();
countElement.textContent = `0 / ${ALL_WORDS.length}`;
