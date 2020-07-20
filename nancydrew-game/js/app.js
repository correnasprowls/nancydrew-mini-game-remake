const lvls = {
    1: [[2,1,0,1,0,0,1,3],
        [0,1,0,0,0,0,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,1,1,0,1,1],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,0,0,1,0,1,0],
        [0,1,0,0,0,0,0,4]],

    2: [[0,0,0,0,0,0,0,0],
        [0,1,1,0,0,1,1,0],
        [2,0,1,0,0,1,0,0],
        [1,0,1,0,0,1,0,1],
        [0,0,0,0,0,0,0,4],
        [1,0,3,1,1,0,3,1],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0]],

    3: [[0,0,0,0,0,0,0,1],
        [1,1,0,0,0,0,1,4],
        [2,0,0,0,0,0,0,0],
        [0,0,0,1,1,0,0,1],
        [0,1,0,1,1,3,0,0],
        [3,0,0,0,0,0,0,0],
        [0,1,0,0,1,0,1,1],
        [0,0,0,0,1,0,0,0]],
        
    4: [[0,0,0,0,0,0,0,1],
        [1,1,0,0,0,0,1,4],
        [2,0,0,0,0,0,0,0],
        [0,0,0,1,1,3,0,1],
        [0,1,0,1,1,0,0,0],
        [3,0,0,0,0,0,0,0],
        [0,1,0,0,1,0,1,1],
        [0,0,0,0,1,0,0,0]]
}
let currentLevel = 1;                  

document.addEventListener('DOMContentLoaded', () => {
    createGrid();

    document.querySelector('body').addEventListener('keydown', handleInput, event);

    document.getElementById('resetButton').addEventListener('click', (event) => {
        resetGame();
        event.preventDefault();
    });
    buildLvl(currentLevel);
});

function handleInput (event) {
    let canMoveWolf = false;
    // make move ship return true or false if it moved
    if (event.key === 'ArrowRight') {
        canMoveWolf = moveShip('right');
    }
    if (event.key === 'ArrowLeft') {
        canMoveWolf = moveShip('left');
    }
    if (event.key === 'ArrowDown') {
        canMoveWolf = moveShip('down');
    }
    if (event.key === 'ArrowUp') {
        canMoveWolf = moveShip('up');
    }
    if (canMoveWolf) {
     
        let wolfElements = getWolfLocation();
        for (let wolfElement of wolfElements ) {
            moveWolf(wolfElement, getWolfMoveDirection(wolfElement));
        }
    }
}

function getElementFromDirection( sourceElement, direction ) {
    switch (direction) {
        case "up": 
            return getUpperOrLowerElementAtIndex(sourceElement, sourceElement.parentElement.previousElementSibling);
            break;
        case "down": 
            return getUpperOrLowerElementAtIndex(sourceElement, sourceElement.parentElement.nextElementSibling);
            break;
        case "left": 
            return sourceElement.previousElementSibling;
            break;
        case "right":  
            return sourceElement.nextElementSibling;
            break;
        case "stay":
            return sourceElement;
    }
}


function moveShip( direction ) {
    const ship = getShipLocation();
    const newElement = getElementFromDirection(ship, direction);
    if (canMoveToElement(newElement, ship)) {
        ship.classList.remove('boat');
        newElement.classList.add('boat');
        if (isWin(newElement)) {
            win();
            return false;
        } 
        return true;
    }
    return false;
}

function getShipLocation() {
    return document.getElementById('frame').querySelector('.boat');
}

function moveWolf( wolfElement, direction ) {
    const newElement = getElementFromDirection(wolfElement, direction );
    if (canMoveToElement(newElement, wolfElement)) {
        wolfElement.classList.remove('wolf');
        newElement.classList.add('wolf');
        if(isLoseWolf(newElement)) {
            lose();
        }
    }
    
}

function getWolfMoveDirection( wolfElement) {
    const shipElement = getShipLocation();
    const holeElement = getHoleLocation();
    let shipCoordinates = [getX(shipElement), getY(shipElement)];
    let holeCoordinates = [getX(holeElement), getY(holeElement)];
    let wolfCoordinates = [getX(wolfElement), getY(wolfElement)];
    let wolfUp = [wolfCoordinates[0], wolfCoordinates[1] - 1];
    let wolfDown = [wolfCoordinates[0], wolfCoordinates[1] +1];
    let wolfLeft = [wolfCoordinates[0] - 1, wolfCoordinates[1]];
    let wolfRight = [wolfCoordinates[0] + 1, wolfCoordinates[1]];
    let choices = {
        'stay': wolfCoordinates,
    }
    if( canMoveToElement(getElementFromDirection(wolfElement, 'up'), wolfElement)) {
        choices['up'] = wolfUp;
    }
    if( canMoveToElement(getElementFromDirection(wolfElement, 'down'), wolfElement)) {
        choices['down'] = wolfDown;
    }
    if( canMoveToElement(getElementFromDirection(wolfElement, 'left'), wolfElement)) {
        choices['left'] = wolfLeft;
    }
    if( canMoveToElement(getElementFromDirection(wolfElement, 'right'), wolfElement)) {
        choices['right'] = wolfRight;
    }
    let bestOptionKey = 'stay';
    let holeOption = 'stay';
    let holeDistance = distanceBetweenPoints(holeCoordinates, choices[bestOptionKey]);
    for (let key of Object.keys(choices)) {
        
        let currentDistance = distanceBetweenPoints(holeCoordinates, choices[key]);
        if (holeDistance > currentDistance) {
            holeOption = key;
            bestOptionKey = key;
            holeDistance = currentDistance;
        }
    }        
    console.log('holeOption ' + holeOption);
    
    let bestDistance = distanceBetweenPoints(shipCoordinates, choices[bestOptionKey]);
    for (let key of Object.keys(choices)) {
        let currentDistance = distanceBetweenPoints(shipCoordinates, choices[key]);
        if (bestDistance >= currentDistance || (bestOptionKey == 'stay' && currentDistance < bestDistance + 1)) {
            bestOptionKey = key;
            bestDistance = currentDistance;
        }

    
    } 
    console.log('bestOption ' + bestOptionKey);
    if (bestDistance != 0 && holeOption != bestOptionKey && holeDistance < bestDistance + 1 & holeDistance > 3.4) {
        bestOptionKey = holeOption;
        wentForHole = true;
    }


    return bestOptionKey;
}

function getWolfLocation() {
    return Array.from(document.getElementById('frame').getElementsByClassName('wolf'));

}

function getHoleLocation() {

    return document.getElementById('frame').querySelector('.treasure');

}

function getUpperOrLowerElementAtIndex(ship, newElement) {
    let elementAtIndex = null;
    if (newElement != null) {
        const index = getX(ship);
        elementAtIndex = newElement.childNodes[index];
    }
    return elementAtIndex;
}

function getY(element) {
    const row = element.parentNode;
    const rowArr = Array.from(row.parentNode.children);
    return rowArr.indexOf(row);
}

function getX(element) {
    return Array.from(element.parentNode.children).indexOf(element);
}

function distanceBetweenPoints( arr1, arr2) {
    distanceX = arr1[0] - arr2[0];
    distanceY = arr1[1] - arr2[1];
    return Math.sqrt(Math.pow(distanceX, 2)+ Math.pow(distanceY, 2));
}

function canMoveToElement(element, movingElement) {
    if(movingElement.classList.contains('wolf')) {
        return !(element == null || element.classList.contains('pirate') || (element.classList.contains('wolf') && movingElement!=element));
    }
    return !(element == null || element.classList.contains('pirate'));

}

function isLoseWolf(nextElement) {
    return nextElement.classList.contains("boat");
}

function isWin(nextElement) {
    return nextElement.classList.contains("treasure");
}

function lose() {
    const announce = document.querySelector('.announce');
    announce.classList.add('winText');
    announce.innerText = "You Lose!";
    getShipLocation().classList.remove('boat');
    setTimeout(() => {  resetGame(); }, 2000);
}

function win() {
    const announce = document.querySelector('.announce');
    announce.classList.add('winText');
    announce.innerText = "You Win!";
    getShipLocation().classList.remove('boat');
    currentLevel += 1;
    if ( currentLevel <= Object.keys(lvls).length) {
        setTimeout(() => {
             buildLvl(currentLevel);
             announce.classList.remove('winText');
             announce.innerText = "Level " + currentLevel ;
            }, 2000);
       
        
    }
    //win win goes here
}

function resetGame( ) {
    const ship = getShipLocation();
    if (ship != null) {
        ship.classList.remove('boat');
    }

    const announce = document.querySelector('.announce');
    if (announce.classList.contains('winText')) {
        announce.classList.remove('winText');
    }
    
    announce.innerText = "Get to safety!";
    buildLvl(currentLevel);
}

function createGrid() {
    const frame = document.getElementById('frame');
    
    for (let i = 0; i < 8 ; i++) {
        buildRow(frame); 
    }
    resetGame();
}

function buildRow(frame) {
    const row = document.createElement('div');
    row.classList.add('row');
    frame.insertAdjacentElement('beforeend', row);
    for (let i = 0; i < 8 ; i++) {
        buildSquare(row, i); 
    }    
}

function buildSquare(row, count) {
    const container = document.createElement('div');
    container.classList.add('square');
    row.insertAdjacentElement('beforeend', container);
}

function buildLvl( level ) {
    let arr = lvls[level];
    let frame = document.querySelector('#frame');
    let rows = Array.from(frame.children);
    for (let i = 0; i < rows.length; i++) {
        let row =  rows[i].children;
        let rowDetermined = arr[i];
        for (let j = 0; j < row.length; j++) {
            
            row[j].classList.remove('pirate');
            row[j].classList.remove('boat');
            row[j].classList.remove('wolf');
            row[j].classList.remove('treasure');

            if (rowDetermined[j] === 1) {  
                row[j].classList.add('pirate');
            } else if (rowDetermined[j] === 2) {
                row[j].classList.add('boat');
            } else if (rowDetermined[j] === 3) {
                row[j].classList.add('wolf');
            } else if (rowDetermined[j] === 4) {
                row[j].classList.add('treasure');
            }

        }
    }
}



