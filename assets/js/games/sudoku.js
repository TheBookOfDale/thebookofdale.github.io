console.log("Sudoku JS file loaded!");

const puzzle = [
  [5,3,null,null,7,null,null,null,null],
  [6,null,null,1,9,5,null,null,null],
  [null,9,8,null,null,null,null,6,null],
  [8,null,null,null,6,null,null,null,3],
  [4,null,null,8,null,3,null,null,1],
  [7,null,null,null,2,null,null,null,6],
  [null,6,null,null,null,null,2,8,null],
  [null,null,null,4,1,9,null,null,5],
  [null,null,null,null,8,null,null,7,9]
];

function renderSudoku(puzzle) {
  const container = document.getElementById('sudoku');
  container.innerHTML = ''; // clear any previous grid

  const grid = document.createElement('div');
  grid.className = 'sudoku-grid';

  puzzle.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (val !== null) {
        cell.textContent = val;
        cell.classList.add('prefilled');
      } else {
        cell.contentEditable = true;
      }

      grid.appendChild(cell);
    });
  });

  container.appendChild(grid);
}

function checkSudoku() {
  const cells = document.querySelectorAll('.cell:not(.prefilled)');
  cells.forEach(cell => cell.classList.remove('error'));

  cells.forEach(cell => {
    const val = cell.textContent.trim();
    if (val && !/^[1-9]$/.test(val)) {
      cell.classList.add('error');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSudoku(puzzle);
});