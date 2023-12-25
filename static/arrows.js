document.addEventListener('keydown', function(event) {
    // Get the arrow key code
    const keyName = event.key

    // Display the corresponding arrow
    switch (keyName) {
        case 37: // Left Arrow
            showArrow('leftArrow');
            break;
        case 38: // Up Arrow
            showArrow('upArrow');
            break;
        case 39: // Right Arrow
            showArrow('rightArrow');
            break;
        case 40: // Down Arrow
            showArrow('downArrow');
            break;
    }
});

document.addEventListener('keyup', function(event) {
    // Hide all arrows on keyup
    hideAllArrows();
});

function showArrow(arrowId) {
    // Hide all arrows first
    hideAllArrows();

    // Display the specified arrow
    const arrowElement = document.getElementById(arrowId);
    if (arrowElement) {
        arrowElement.style.display = 'block';
    }
}

function hideAllArrows() {
    // Hide all arrow elements
    const arrows = document.querySelectorAll('.arrow');
    arrows.forEach(function(arrow) {
        arrow.style.display = 'none';
    });
}