console.log("CHIMPANZEE")

document.addEventListener('keydown', function(event) {
    // Get the arrow key code
    // Javascript is starting to deprecate(?) the below functions which is why they're crossed out
    const keyCode = event.keyCode || event.which;

    // Display the corresponding arrow
    switch (keyCode) {
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
        case 68:
            showArrow('disarm')
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
    if (arrowId === 'disarm'){
        const textDiv = document.getElementById('arrowContainer')
        if (textDiv){
            textDiv.textContent = "Disarm!"
        }

    }
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
    const textDiv = document.getElementById('arrowContainer')
    if (textDiv){
        textDiv.textContent = ""
    }

}