export const dragAndDrop = () => {
  
  const dndCells = document.querySelectorAll('.dnd');
  const dndCellContents = document.querySelectorAll('.cell-wrap');

  let currentCell;
  let prevSlot;

  function dragStart(e) { 
    prevSlot = e.target.closest('td');
    currentCell = e.target; 
    setTimeout(() => {
      e.target.classList.add('dnd-hide');
    }, 0);
  };

  function dragEnd(e) {    
    e.target.classList.remove('dnd-hide');
  };

  function dragOver(e) {
    e.preventDefault();
  };

  function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('dnd-hovered');
  };

  function dragLeave(e) {
    e.target.classList.remove('dnd-hovered');
  };

  function dragDrop(e) {
    if(e.target.textContent) {
      e.target.removeEventListener('drop', dragDrop);
      e.target.classList.remove('dnd-hovered');
      
      console.log('Booked slot');
      return;
    };
    
    let currentCellId = currentCell.closest('td').dataset.id;
    
    let delBtn = currentCell.querySelector('.btn-delete');
    
    delBtn.setAttribute('data-cell', e.target.dataset.id);
    
    let store = JSON.parse(localStorage.getItem('events'));
    let dragEventData = store.find( evn => evn.id === currentCellId);
    let renewEvent = {
      ...dragEventData,
      id: e.target.dataset.id
    };
    store = store.filter( evn => evn.id !== currentCellId);
    
    store.push(renewEvent);
    localStorage.setItem('events', JSON.stringify(store));
    e.target.classList.remove('dnd-hovered');
    e.target.append(currentCell);
    prevSlot.textContent = '';
    
  };

  dndCellContents.forEach( evContent => {
    evContent.addEventListener('dragstart', dragStart);
    evContent.addEventListener('dragend', dragEnd);
  });

  dndCells.forEach(cell => {
    cell.addEventListener('dragover', dragOver);
    cell.addEventListener('dragenter', dragEnter);
    cell.addEventListener('dragleave', dragLeave);
    cell.addEventListener('drop', dragDrop);

  })
}