import { dragAndDrop } from './dragAndDrop.min.js';

const REPO = '/event-calendar';

const selectUser = document.getElementById('userSelect');

const createError = document.querySelector('.create-error');
const closeBtn = document.querySelector('.btn-close');

const helperText = document.querySelector('.helper-text');
const createBtn = document.querySelector('.btn-create');

const confirmModal = document.getElementById('confirm');
const confirmText = document.querySelector('.confirm-text');
const noBtn = document.querySelector('.btn-no');
const yesBtn = document.querySelector('.btn-yes');

const form = document.getElementById('create');
  
let store = JSON.parse(localStorage.getItem('events')) || [];
console.log('store',store);

function renderEvents(data) {
  const tableTd = document.querySelectorAll('td');
  tableTd.forEach(item => {
    item.innerHTML = '';
    item.style.cssText = '';
  });

  data.forEach( item => {
    const tdAttribute = `td[data-id='${item.id}']`;
    const td = document.querySelector(tdAttribute);
    
    td.innerHTML = `
      <div class="cell-wrap" draggable="true">
        <p>${item.eventName}</p>
        <button class="btn-delete" data-cell="${item.id}">&otimes;</button>
      </div>
    `;
    
    td.setAttribute('title', `${item.participants}`);
    
    const deleteBtn = document.querySelector(`button[data-cell='${item.id}']`);
    deleteBtn.addEventListener('click', e => {
      
      confirmModal.style.display = 'block';
      
      let choseEventName = e.target.previousElementSibling.textContent;
      confirmText.innerText = `Are you shure you want to delete "${choseEventName}" events?`;
      yesBtn.setAttribute('data-id', `${e.target.dataset.cell}`);
      
    });    
  })
};  

function deleteEvent(id) {
  const selectedTd = document.querySelector(`td[data-id='${id}']`);
  selectedTd.innerHTML = '';
  selectedTd.style.cssText = '';

  store = JSON.parse(localStorage.getItem('events')) || [];  
  store = store.filter( item => item.id !== id);
  localStorage.setItem('events', JSON.stringify(store));
}

function getEventData() {
  const formData = new FormData(form);    
  let eventData = {}; 
  let members = [];
  for(let pair of formData.entries()) { 
    if(pair[0] === 'participants' && pair[1] !== '') {

      members.push(pair[1]);
    } else {
      eventData[pair[0]] = pair[1];        
    }         
  };
  
  
  if(members.length > 0) {
    eventData.participants = members;
  } else {
    helperText.innerText = 'Choose some members';
    helperText.style.color = 'red';
    return;
  };

  if(!eventData.eventName) {
    helperText.innerText = 'Write event name';
    helperText.style.color = 'red';
    helperText.style.display = 'block';
    return;
  };

  helperText.style.display = ''; 
  eventData.id = `${eventData.day.toLowerCase()+eventData.time}`;
  delete eventData.day;
  delete eventData.time;


  let bookedSlot = store.find(item => item.id === eventData.id);
  if(bookedSlot) {
    createError.style.display = 'flex';
    return;
  };
  
  store = [...store, eventData];  
  localStorage.setItem('events', JSON.stringify(store));      
  form.reset();
  window.location.pathname = '/';  
};

function sortByUser(user) {
  let userEvents = store.filter(item => item.participants.includes(user));

  renderEvents(userEvents);    
};

function init() {
  if(window.location.pathname === REPO + '/') {    
    renderEvents(store);
    dragAndDrop();

    noBtn.addEventListener('click', () => {
      confirmModal.style.display = '';
    });

    yesBtn.addEventListener('click', (e) => {
      deleteEvent(e.target.dataset.id);
      confirmModal.style.display = '';
    });
    
    selectUser.addEventListener('change', () => {
      let user = selectUser.value;
      user === 'all' ? renderEvents(store) : sortByUser(user);
    });

  } else if(window.location.pathname === REPO + '/create-event.html') {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        getEventData();      
      });

      closeBtn.addEventListener('click', () => {
        createError.style.display = '';
      });    
  }  
};

init();










