function toggle(e) {
  // e.parentNode.previousElementSibling.style.display = ('Undo' === e.innerText) ? "block" : 'none';
  // e.innerText = ('Undo' === e.innerText) ? 'Hide' : 'Undo';
  e.parentNode.previousElementSibling.style.display = "block";
  e.parentNode.removeChild(e); 
}