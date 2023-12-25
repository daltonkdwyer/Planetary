const leftArrowImage = document.getElementById('leftArrow');
const rightArrowImage = document.getElementById('rightArrow');
const upArrowImage = document.getElementById('upArrow');
const downArrowImage = document.getElementById('downArrow');


document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowLeft') {
    leftArrowImage.style.display = 'block';
  }
  if (event.key === 'ArrowRight') {
    rightArrowImage.style.display = 'block';
  }
  if (event.key === 'ArrowUp') {
    upArrowImage.style.display = 'block';
  }
  if (event.key === 'ArrowDown') {
    downArrowImage.style.display = 'block';
  }
});

document.addEventListener('keyup', function(event) {
  if (event.key === 'ArrowLeft') {
    leftArrowImage.style.display = 'none';
  }
  if (event.key === 'ArrowRight') {
    rightArrowImage.style.display = 'none';
  }
  if (event.key === 'ArrowUp') {
    upArrowImage.style.display = 'none';
  }
  if (event.key === 'ArrowDown') {
    downArrowImage.style.display = 'none';
  }
});