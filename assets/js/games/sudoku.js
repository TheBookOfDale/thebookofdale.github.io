const puzzle = [
  [5,3,null,null,7,null,null,null,null],
  [6,null,null,1,9,5,null,null,null],
  [null,9,8,null,null,null,null,6,null],
  // ... rest of rows
];

function renderSudoku(puzzle) {
  const grid = document.getElementById('sudoku');
  grid.innerHTML = '';
  puzzle.forEach((row, r) => {
    row.forEach((val, c) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.contentEditable = val === null; // allow typing if empty
      cell.textContent = val || '';
      grid.appendChild(cell);
    });
  });
}

renderSudoku(puzzle);