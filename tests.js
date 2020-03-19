    var cnt = 0;
        for (var i = currI - 1; i <= currI + 1; i++) {
            if (i < 0 || i >= gLevel.SIZE) continue;
            for (var j = currJ - 1; j <= currJ + 1; j++) {
                if (j < 0 || j >= gLevel.SIZE) continue;
                if (gBoard[i][j].minesAroundCount && gBoard[i][j].isShown === false) {
                    gBoard[i][j].isShown = true;
                    numsCellsLeft--;
                    cnt++;
                } else if (gBoard[i][j].isShown === false) {
                    gBoard[i][j].isShown = true;
                    numsCellsLeft--;
                    cnt++;
                    if (cnt > 0) expandShown(i, j);
                }
            }
        }
