'use strict'

var score = Infinity;
var gBestScore;
var gMmanualBombCnt = 0;
var manualBombs = false;
var bombPlaced = false;
var gSafeCnt = 3;
var gBestTime = 0;
var gLifeCnt = 2;
var gTimer;
var gCurrTimer;
var gFirstTime;
var winCheckerInterval;
var gBoard = [];
var gCellClicksCnt = 0;
var isHint = false;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var holdCells = [];
function varsReset() {
    if (gLevel.SIZE >= 8) {
        gLifeCnt = 3;
    }
    else {
        gLifeCnt = 2;
    }
    gGame.isOn = true;
    gSafeCnt = 3;
    gCellClicksCnt = 0;
    bombPlaced = false;
    var winCheckerInterval = setInterval(checkWin, 500);
    document.querySelector('.safeClick').innerHTML = `Safe Click`;
    document.querySelector('.timer').innerHTML = 'Be fast! 00:00';
    document.querySelector('.hintBtn1').style.display = 'block';
    document.querySelector('.hintBtn2').style.display = 'block';
    document.querySelector('.hintBtn3').style.display = 'block';
    document.querySelector('.smiley').innerHTML = '😀';
    document.querySelector('.winModalWraper').style.display = 'none';
    document.querySelector('.bestShow').innerHTML = localStorage.getItem('bestScore');
}
function initGame() {
    buildBoard();
    varsReset();
    clearInterval(gTimer);
    renderLifes();
    renderBoard();
}
function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return gBoard;
}
function renderLifes() {
    if (gLevel.SIZE === 4) {
        document.querySelector('.lifes').innerHTML = '💖 ' + '💖';
    }
    else {
        document.querySelector('.lifes').innerHTML = '💖 ' + '💖' + '💖';
    }
}
function renderBoard() {
    var table = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j);
            if (gBoard[i][j].isMine && gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                strHTML += `<td class="bomb" data-i="${i}" data-j="${j}" onclick="cellClicked(event,${i},${j})" onmousedown="mouseEvent(this,event,${i},${j})">💣</td>`;
            }
            else if (gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                strHTML += `<td class="opentd" data-i="${i}" data-j="${j}" onclick="cellClicked(event,${i},${j})" onmousedown="mouseEvent(this,event,${i},${j})">${gBoard[i][j].minesAroundCount}</td>`;
            }
            else if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                strHTML += `<td data-i="${i}" data-j="${j}" onclick="cellClicked(event,${i},${j})" onmousedown="mouseEvent(this,event,${i},${j})"></td>`;
            }
            else if (gBoard[i][j].isMarked) {
                strHTML += `<td data-i="${i}" data-j="${j}" onclick="cellClicked(event,${i},${j})" onmousedown="mouseEvent(this,event,${i},${j})">🚩</td>`;
            }
        }
        strHTML += `<tr>`;
    }
    table.innerHTML = strHTML;
}
function bombsGenerate() {
    for (var i = 0; i < gLevel.MINES;) {
        var rndCell = gBoard[Math.floor(Math.random() * gBoard.length)][Math.floor(Math.random() * gBoard.length)];
        if (!rndCell.isMine && !rndCell.isShown) {
            rndCell.isMine = true;
            i++;
        }
    }
}
function boardSizeChange(elBtn) {
    if (elBtn.innerHTML == 'Easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLifeCnt = 2;
        gBoard = [] ;
        initGame();
    }
    else if (elBtn.innerHTML == 'Medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gLifeCnt = 3;
        gBoard = [] ;
        initGame();
    }
    else if (elBtn.innerHTML == 'Hard') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gLifeCnt = 3;
        gBoard = [] ;
        initGame();
    }
}
function manuallBombs(elBtn) {
    manualBombs = true;
    var tdsHolder = document.querySelectorAll('td');
    for (var i = 0; i < tdsHolder.length; i++) {
        tdsHolder[i].style.borderColor = "yellow";
        tdsHolder[i].style.cursor = 'pointer' ; 
        tdsHolder[i].innerHTML = '💣';
    }
}
function mouseEvent(elBtn, event, i, j) {
    var currI = parseInt(i);
    var currj = parseInt(j);

    if (isHint) {
        openNegHint(i, j);
        isHint = false;
    }
    if (!gGame.isOn) {
        return;
    }
    if (manualBombs) {
        gMmanualBombCnt++;
        bombPlaced = true;
        gBoard[i][j].isMine = true;
        renderBoard();
        document.querySelector(`[data-i="${i}"][data-j="${j}"]`).innerHTML = '💣' ;
        document.querySelector(`[data-i="${i}"][data-j="${j}"]`).style.borderColor = "red";
        setTimeout(function(){ renderBoard(); }, 1000);
        manualBombs = false;
        return;
    }
    if (event.button === 2) {
        if (!gCellClicksCnt) {
            alert('First click cant be Flag!');
            return;
        }
        if (!gBoard[currI][currj].isMarked) {
            gBoard[currI][currj].isMarked = true;
        }
        else {
            gBoard[currI][currj].isMarked = false;
        }
    }
    else if (event.button === 0) {
        gCellClicksCnt++;
        var currI = parseInt(i);
        var currJ = parseInt(j);
        //=================================
     
        if (gBoard[currI][currJ].minesAroundCount === 0 ) {
            expandShown(currI, currJ);
        }
        if (gBoard[currI][currJ].isMarked) return;
        if (gCellClicksCnt == 1) {
            startTimer();
            gBoard[currI][currJ].isShown = true;
            if (bombPlaced) {
                renderBoard();
                return;
            }
            else {
                bombsGenerate();
                renderBoard();
            }
        }
        if (gBoard[currI][currJ].isMine) {
            gLifeCnt--;
            console.log(gLifeCnt);
            document.querySelector('.smiley').innerHTML = '😭';
            if (gLifeCnt === 2) {
                document.querySelector('.lifes').innerHTML = '💔 ' + '💔';
                document.querySelector('.smiley').innerHTML = '😭';
                setTimeout(function () { document.querySelector('.smiley').innerHTML = '🤪'; }, 3000);
            }
            else if (gLifeCnt === 1) {
                document.querySelector('.lifes').innerHTML = 'Last life, stay strong..🖤';
                document.querySelector('.smiley').innerHTML = '😵';
            }
            if (!gLifeCnt) {
                document.querySelector('.smiley').innerHTML = '😭';
                document.querySelector('.lifes').innerHTML = 'You lost, try again! its free.';
                gGame.isOn = false;
                gameOver();
                return;
            }
        }
        gBoard[currI][currJ].isShown = true;
    }
    renderBoard();
}
function checkWin() {
    var markedCnt = 0;
    var openCellsCnt = 0;
    var openBombs = 0;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMarked) {
                markedCnt++;
            }
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
                openBombs++;
            }
            if (!gBoard[i][j].isMine && gBoard[i][j].isShown) {
                openCellsCnt++;
            }
        }
    }
    if ((gLevel.SIZE * gLevel.SIZE - gLevel.MINES) === openCellsCnt && markedCnt + openBombs === gLevel.MINES) {
        clearInterval(winCheckerInterval);
        bestScore();
        document.querySelector('.winModalWraper').style.display = 'block';
    }
}
function bestScore() {
    if (gCurrTimer < localStorage.getItem('bestScore')) {
        score = gCurrTimer;
        localStorage.setItem('bestScore', score);
    }
    document.querySelector('.bestShow').innerHTML = localStorage.getItem('bestScore');
}
function gameOver() {
    clearInterval(gTimer);
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderBoard();
                gGame.isOn = false;
            }
        }
    }
}
function setMinesNegsCount(row, col) {
    var cnt = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isMine) {
                cnt++;
            }
        }
    }
    return cnt;
}
function safeClick(elBtn) {
    if (gSafeCnt === 0) return;
    var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
    var j = getRandomIntInclusive(0, gLevel.SIZE - 1);
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
        var cellHolder = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
        cellHolder.style.backgroundColor = '#E85A12';
        setTimeout(function () { cellHolder.style.backgroundColor = '#161616'; }, 1200);
        gSafeCnt--;
    }
    else {
        safeClick();
    }
    document.querySelector('.safeClick').innerHTML = `${gSafeCnt} Clicks Left!`
}
function expandShown(currI, currJ) {
    for (var i = currI - 1; i <= currI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = currJ - 1; j <= currJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
           gBoard[i][j].isShown = true ;
        //     if(gBoard[i][j].minesAroundCount && !gBoard[i][j].isShown){
        //         gBoard[i][j].isShown = true;
        //     }
        //     if(gBoard[i][j].minesAroundCount == 0 && !gBoard[i][j].isShown){
        //         gBoard[i][j].isShown = true ;
        //         expandShown(i,j);
        //     }
        }
        renderBoard();
    }
}
function hintActive(btn) {
    isHint = true;
    var tdsHolder = document.querySelectorAll('td');
    for (var i = 0; i < tdsHolder.length; i++) {
        tdsHolder[i].style.borderColor = "yellow";
        tdsHolder[i].style.cursor = 'pointer' ; 
        tdsHolder[i].innerHTML = '💡';
    }
    btn.style.display = 'none';
}
function openNegHint(currI, currJ) {
    for (var i = currI - 1; i <= currI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = currJ - 1; j <= currJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            holdCells.push(gBoard[i][j]);
            renderBoard();
            setTimeout(function () { hideHints(); }, 1500);
        }
    }
}
function hideHints() {
    for (var x = 0; x < holdCells.length; x++) {
        holdCells[x].isShown = false;
        renderBoard();
        holdCells.splice(x, 1);
    }
}
function startTimer() {
    gFirstTime = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimer = setInterval(function () {
        gCurrTimer = (Date.now() - gFirstTime) / 1000
        elTimer.innerText = `Your Time: ${gCurrTimer}s`;
    }, 55);
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}