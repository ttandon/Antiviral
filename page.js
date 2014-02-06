function toggle(e) {
  e.parentNode.previousElementSibling.style.display = ('Restore' === e.innerText) ? "block" : 'none';
  e.innerText = ('Restore' === e.innerText) ? 'Hide' : 'Restore';
}