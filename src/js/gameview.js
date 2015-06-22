goog.provide('tictactoe.GameView');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Button');
goog.require('lime.RoundedRect');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Resize');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.ColorTo');

/**
 * @constructor
 */
tictactoe.GameView = function() {
    'use strict';

    var that = this;

    lime.Scene.call(this);

    if (tictactoe.configs.useCanvas) {
        this.setRenderer(lime.Renderer.CANVAS);
    }

    this.leftPlayerName = new lime.Label('')
        .setFontSize(18)
        .setFontColor('#336633')
        .setSize(25, 14)
        .setPosition(66, 41)
        .setAnchorPoint(0, 1)
        .setAlign('left');
    this.appendChild(this.leftPlayerName);

    this.rightPlayerName = new lime.Label('')
        .setFontSize(18)
        .setFontColor('#336633')
        .setSize(150, 14)
        .setPosition(244, 41)
        .setAnchorPoint(1, 1)
        .setAlign('right');
    this.appendChild(this.rightPlayerName);

    this.leftPlayerRank = new lime.Label('')
        .setFontSize(15)
        .setFontColor('#514f4b')
        .setSize(85, 14)
        .setPosition(66, 57)
        .setAnchorPoint(0, 1)
        .setAlign('left');
    this.appendChild(this.leftPlayerRank);

    this.rightPlayerRank = new lime.Label('')
        .setFontSize(15)
        .setFontColor('#514f4b')
        .setSize(85, 14)
        .setPosition(244, 57)
        .setAnchorPoint(1, 1)
        .setAlign('right');
    this.appendChild(this.rightPlayerRank);

    this.leftPlayerProgress = new lime.Sprite()
        .setSize(54, 54)
        .setPosition(33, 42);
    this.appendChild(this.leftPlayerProgress);

    this.rightPlayerProgress = new lime.Sprite()
        .setSize(54, 54)
        .setPosition(277, 42);
    this.appendChild(this.rightPlayerProgress);

    this.leftPlayerAvatar = new lime.Circle()
        .setSize(40, 40)
        .setPosition(33, 42);
    this.appendChild(this.leftPlayerAvatar);

    this.rightPlayerAvatar = new lime.Circle()
        .setSize(40, 40)
        .setPosition(277, 42);
    this.appendChild(this.rightPlayerAvatar);

    this.leftAvatarOverlay = new lime.Circle()
        .setSize(40, 40)
        .setPosition(33, 42)
        .setFill('#000000')
        .setOpacity(0);
    this.appendChild(this.leftAvatarOverlay);

    this.rightAvatarOverlay = new lime.Circle()
        .setSize(40, 40)
        .setPosition(277, 42)
        .setFill('#000000')
        .setOpacity(0);
    this.appendChild(this.rightAvatarOverlay);

    this.leftTimer = new lime.Label('')
        .setFontSize(28)
        .setFontColor('#00ff00')
        .setSize(40, 40)
        .setPosition(33, 45)
        .setOpacity(0);
    this.appendChild(this.leftTimer);

    this.rightTimer = new lime.Label('')
        .setFontSize(28)
        .setFontColor('#00ff00')
        .setSize(40, 40)
        .setPosition(277, 45)
        .setOpacity(0);
    this.appendChild(this.rightTimer);

    this.winnerIndicator = new lime.Sprite()
        .setSize(20, 20)
        .setFill('img/header-crown' + tictactoe.configs.retinaPrefix + '.png')
        .setHidden(true);
    this.appendChild(this.winnerIndicator);

    var grid = new lime.Layer().setPosition(154, 275);
    grid.appendChild(this.buildRoundedLine(266, 4, '#94d4ed').setPosition(0, -45));
    grid.appendChild(this.buildRoundedLine(266, 4, '#94d4ed').setPosition(0, 44));
    grid.appendChild(this.buildRoundedLine(266, 4, '#94d4ed').setPosition(-44, 0).setRotation(90));
    grid.appendChild(this.buildRoundedLine(266, 4, '#94d4ed').setPosition(45, 0).setRotation(90));
    this.appendChild(grid);

    this.gameboard = new lime.Layer();

    this.gameboard.gamePosition = [];

    var onClick = function(e) {
        //https://github.com/digitalfruit/limejs/pull/108
        if(e.event === undefined) {
            that.handleClick(this.posX, this.posY);
        }
    };

    for (var i = 0; i < 3; i++) {
        this.gameboard.gamePosition[i] = [];
        for (var j = 0; j < 3; j++) {

            this.gameboard.gamePosition[i][j] = new lime.Button(
                new lime.Sprite().setSize(86, 86), //.setFill('#ff0000').setOpacity(0.5).setStroke(1,'#000000'),
                new lime.Sprite().setSize(86, 86)).setPosition(64 + i * 90, 184 + j * 90);
            this.gameboard.gamePosition[i][j].posX = i;
            this.gameboard.gamePosition[i][j].posY = j;
            goog.events.listen(this.gameboard.gamePosition[i][j], lime.Button.Event.CLICK, onClick);

            this.gameboard.appendChild(this.gameboard.gamePosition[i][j]);
        }
    }

    this.victoryline = this.buildRoundedLine(12, 12, '#f09600').setOpacity(0.3).setHidden(true);
    this.gameboard.appendChild(this.victoryline);

    this.appendChild(this.gameboard);

    //pages shadow
    this.appendChild(new lime.Sprite()
        .setSize(312, 26)
        .setPosition(156, 554)
        .setFill('img/notepad-pages-shadow' + tictactoe.configs.retinaPrefix + '.png'));
};

goog.inherits(tictactoe.GameView, lime.Scene);

tictactoe.GameView.prototype.handleClick = function(posX, posY) {
    'use strict';

    this.lastTimeLeft = this.timeLeft;

    tictactoe.gameController.dispatchEvent({
        type: 'move',
        posX: posX,
        posY: posY
    });
};

tictactoe.GameView.prototype.buildRoundedLine = function(width, lineWidth, fill) {
    'use strict';

    return new lime.RoundedRect()
        .setSize(width, lineWidth)
        .setRadius(lineWidth / 2)
        .setFill(fill);
};

tictactoe.GameView.prototype.prepareGame = function(player, opponent, deviceType) {
    'use strict';

    this.player = player;
    this.opponent = opponent;

    this.useFirstSymbol = tictactoe.configs.allwaysUseSameSymbol ? true : player.id < opponent.id;

    this.leftPlayerName.setText('Me');
    if (typeof player.user.ranking !== 'undefined') {
        this.leftPlayerRank.setText('#' + player.user.ranking);
    } else {
        this.leftPlayerRank.setText('--');
    }
    this.leftPlayerAvatar.setFill(player.user.avatar);

    if(opponent.user.nickname.length > 9) {
        this.rightPlayerName.setText(opponent.user.nickname.slice(0, 8) + '…');
    } else {
        this.rightPlayerName.setText(opponent.user.nickname);
    }
    if (typeof opponent.user.ranking !== 'undefined') {
        this.rightPlayerRank.setText('#' + opponent.user.ranking);
    } else {
        this.rightPlayerRank.setText('--');
    }
    this.rightPlayerAvatar.setFill(opponent.user.avatar);

    //draw progress bars
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        startAngle = Math.PI / 2 * 3,
        width = tictactoe.configs.retinaImages ? 108 : 54,
        radius = tictactoe.configs.retinaImages ? 50 : 25,
        lineWidth = tictactoe.configs.retinaImages ? 8 : 4;

    canvas.width = width;
    canvas.height = width;

    context.lineWidth = lineWidth;
    if (player.user.progress !== 0) {
        context.beginPath();
        context.arc(width / 2, width / 2, radius, startAngle, player.user.progress  - Math.PI / 2, false);
        context.strokeStyle = '#6c6';
        context.stroke();
    }
    context.beginPath();
    context.arc(width / 2, width / 2, radius, player.user.progress  - Math.PI / 2, startAngle, false);
    context.strokeStyle = '#d5d5d5';
    context.stroke();

    this.leftPlayerProgress.setFill(canvas.toDataURL());

    context.clearRect(0,0,canvas.width,canvas.height);

    context.lineWidth = lineWidth;
    if (opponent.user.progress !== 0) {
        context.beginPath();
        context.arc(width / 2, width / 2, radius, startAngle, opponent.user.progress - Math.PI / 2, false);
        context.strokeStyle = '#6c6';
        context.stroke();
    }
    context.beginPath();
    context.arc(width / 2, width / 2, radius, opponent.user.progress - Math.PI / 2, startAngle, false);
    context.strokeStyle = '#d5d5d5';
    context.stroke();

    this.rightPlayerProgress.setFill(canvas.toDataURL());

    if (deviceType === 'TV') {
        this.cursorPos = [1, 1];

        this.cursor = new lime.Layer().setAnchorPoint(0.5, 0.5).setHidden(true);
        var cursorElements = [];
        cursorElements.push(new lime.Sprite().setSize(7, 25).setPosition(-36.5, -26.5));
        cursorElements.push(new lime.Sprite().setSize(7, 25).setPosition(36.5, -26.5));
        cursorElements.push(new lime.Sprite().setSize(7, 25).setPosition(-36.5, 26.5));
        cursorElements.push(new lime.Sprite().setSize(7, 25).setPosition(36.5, 26.5));
        cursorElements.push(new lime.Sprite().setSize(25, 7).setPosition(-26.5, -36.5));
        cursorElements.push(new lime.Sprite().setSize(25, 7).setPosition(26.5, -36.5));
        cursorElements.push(new lime.Sprite().setSize(25, 7).setPosition(-26.5, 36.5));
        cursorElements.push(new lime.Sprite().setSize(25, 7).setPosition(26.5, 36.5));

        this.cursor.setColor = function(color) {
            for (var i = cursorElements.length - 1; i >= 0; i--) {
                cursorElements[i].setFill(color);
            }
            return this;
        };

        for (var i = cursorElements.length - 1; i >= 0; i--) {
            this.cursor.appendChild(cursorElements[i]);
        }

        this.appendChild(this.cursor);
    } else {
        this.menuButton = new lime.Button(
            new lime.Sprite().setFill('img/game-button-options-0' + tictactoe.configs.retinaPrefix + '.png').setSize(65, 47).setAnchorPoint(0, 0),
            new lime.Sprite().setFill('img/game-button-options-1' + tictactoe.configs.retinaPrefix + '.png').setSize(65, 47).setAnchorPoint(0, 0))
            .setPosition(238, 473);

        goog.events.listen(this.menuButton, lime.Button.Event.CLICK, function(e) {
            //https://github.com/digitalfruit/limejs/pull/108
            if(e.event === undefined) {
                tictactoe.gameController.dispatchEvent({
                    type: 'showMenu'
                });
            }
        });

        this.appendChild(this.menuButton);
    }
};

tictactoe.GameView.prototype.startGame = function(playerToStart, moveTimeout) {
    'use strict';
    this.timeout = moveTimeout / 1000;
    this.switchPlayer(playerToStart);
};

tictactoe.GameView.prototype.doMove = function(currentPlayer, posX, posY) {
    'use strict';

    var piece, bar1, bar2;

    if ((currentPlayer && this.useFirstSymbol) || (!currentPlayer && !this.useFirstSymbol)) {
        piece = new lime.Layer().setAnchorPoint(0.5, 0.5);

        bar1 = this.buildRoundedLine(55, 12, '#514f4b').setRotation(45);
        bar2 = this.buildRoundedLine(55, 12, '#514f4b').setRotation(-45);

        piece.appendChild(bar1);
        piece.appendChild(bar2);

        piece.setFill = function(fill) {
            bar1.setFill(fill);
            bar2.setFill(fill);
            return this;
        };
    } else {
        piece = new lime.Circle().setSize(55 / 1.15, 55 / 1.15).setStroke(10, '#514f4b');

        piece.setFill = function(fill) {
            return this.setStroke(10, fill);
        };
    }

    this.lastPiece = piece;

    if (typeof this.gameboard.gamePosition[posX][posY].piece !== 'undefined') { //to undo moves on the same cell
        this.gameboard.gamePosition[posX][posY].lastPiece = this.gameboard.gamePosition[posX][posY].piece;
    }

    this.gameboard.gamePosition[posX][posY].piece = piece;

    this.gameboard.gamePosition[posX][posY].appendChild(piece);

    if (typeof this.cursor !== 'undefined') {
        this.cursor.setHidden(true);
    }
};

tictactoe.GameView.prototype.undoLastMove = function(posX, posY) {
    'use strict';
    this.gameboard.gamePosition[posX][posY].piece = this.gameboard.gamePosition[posX][posY].lastPiece;
    this.gameboard.gamePosition[posX][posY].removeChild(this.lastPiece);
    return this.lastTimeLeft;
};

tictactoe.GameView.prototype.endGame = function(currentPlayer, endCondition) {
    'use strict';

    var animation, pieces;

    this.leftTimer.setHidden(true);
    this.rightTimer.setHidden(true);
    clearInterval(this.intervalId);

    if (currentPlayer) {
        this.rightAvatarOverlay.setHidden(true);
    } else {
        this.leftAvatarOverlay.setHidden(true);
    }

    if (endCondition !== 9) {
        switch (endCondition) {
        //vertical line
        case 0:
        case 1:
        case 2:
            this.victoryline.setAnchorPoint(1, 0.5)
                .setRotation(90)
                .setPosition(64 + 90 * endCondition, 153);
            pieces = [
                this.gameboard.gamePosition[endCondition][0].piece,
                this.gameboard.gamePosition[endCondition][1].piece,
                this.gameboard.gamePosition[endCondition][2].piece
            ];
            animation = new lime.animation.Resize(241, 12).setEasing(lime.animation.Easing.LINEAR);
            break;
        //hotizontal line
        case 3:
        case 4:
        case 5:
            this.victoryline.setAnchorPoint(0, 0.5).setPosition(33, 184 + 90 * (endCondition - 3));
            pieces = [
                this.gameboard.gamePosition[0][endCondition - 3].piece,
                this.gameboard.gamePosition[1][endCondition - 3].piece,
                this.gameboard.gamePosition[2][endCondition - 3].piece
            ];
            animation = new lime.animation.Resize(241, 12).setEasing(lime.animation.Easing.LINEAR);
            break;
        //diagonal line
        case 6:
        case 7:
            if (endCondition === 6) {
                this.victoryline.setAnchorPoint(0, 0.5)
                    .setRotation(-45)
                    .setPosition(44, 164);
                pieces = [
                    this.gameboard.gamePosition[0][0].piece,
                    this.gameboard.gamePosition[1][1].piece,
                    this.gameboard.gamePosition[2][2].piece
                ];
            } else {
                this.victoryline.setAnchorPoint(1, 0.5)
                    .setRotation(-135)
                    .setPosition(44, 384);
                pieces = [
                    this.gameboard.gamePosition[0][2].piece,
                    this.gameboard.gamePosition[1][1].piece,
                    this.gameboard.gamePosition[2][0].piece
                ];
            }
            animation = new lime.animation.Resize(311, 12).setEasing(lime.animation.Easing.LINEAR);
            break;
        //board full
        case 8:
            this.fadePlayerIndicators(true, true);
            this.fadePlayerIndicators(false, true);
            if (currentPlayer) {
                this.leftAvatarOverlay.setHidden(true);
            } else {
                this.rightAvatarOverlay.setHidden(true);
            }
            return;
        }

        this.victoryline.setHidden(false);
        setTimeout(function() {
            pieces[0].setFill('#f09600');
        }, 100);
        setTimeout(function() {
            pieces[1].setFill('#f09600');
        }, 500);
        setTimeout(function() {
            pieces[2].setFill('#f09600');
        }, 900);
        this.victoryline.runAction(animation);
    }

    this.fadePlayerIndicators(true, true);
    this.fadePlayerIndicators(false, true);
    if (currentPlayer) {
        this.leftPlayerName.setFontColor('#f09600');
        this.winnerIndicator.setPosition(33, 42).setHidden(false);
    } else {
        this.rightPlayerName.setFontColor('#f09600');
        this.winnerIndicator.setPosition(277, 42).setHidden(false);
    }

};

tictactoe.GameView.prototype.switchPlayer = function(currentPlayer, optTime) {
    'use strict';
    var that = this, timer, colorStep1, colorStep2;

    clearInterval(this.intervalId);

    if (typeof this.timerColorAnim !== 'undefined') {
        this.timerColorAnim.stop();
    }

    if (typeof optTime !== 'undefined') {
        this.timeLeft = optTime;
    } else {
        this.timeLeft = this.timeout;
    }

    colorStep2 = this.timeLeft / 3;
    colorStep1 = colorStep2 * 2;

    if (currentPlayer) {
        timer = this.leftTimer;
        this.fadePlayerIndicators(true, true);
        this.fadePlayerIndicators(false, false);
    } else {
        timer = this.rightTimer;
        this.fadePlayerIndicators(true, false);
        this.fadePlayerIndicators(false, true);
    }

    timer.setText(this.timeLeft).setFontColor('#00ff00');

    this.intervalId = setInterval(function() {
        timer.setText(--that.timeLeft);

        switch (that.timeLeft) {
        case colorStep1:
            that.timerColorAnim = new lime.animation.ColorTo('#ffff00')
                .setTargetComponent(lime.animation.ColorTo.Target.FONT).setDuration(3);
            timer.runAction(that.timerColorAnim);
            break;
        case colorStep2:
            that.timerColorAnim = new lime.animation.ColorTo('#ff0000')
                .setTargetComponent(lime.animation.ColorTo.Target.FONT).setDuration(3);
            timer.runAction(that.timerColorAnim);
            break;
        case 0:
            clearInterval(that.intervalId);
            break;
        }
    }, 1000);

    if (currentPlayer && typeof this.cursor !== 'undefined') {
        this.moveCursor();
        this.cursor.setHidden(false);
    }
};

tictactoe.GameView.prototype.fadePlayerIndicators = function(currentPlayer, show) {
    'use strict';

    var nameAnim = new lime.animation.FadeTo(show ? 1 : 0.33).setDuration(0.5),
        overlayAnim = new lime.animation.FadeTo(show ? 0.72 : 0).setDuration(0.5),
        timerAnim = new lime.animation.FadeTo(show ? 1 : 0).setDuration(0.5);

    if (currentPlayer) {
        nameAnim.addTarget(this.leftPlayerName);
        nameAnim.addTarget(this.leftPlayerRank);
        nameAnim.addTarget(this.leftPlayerAvatar);
        nameAnim.addTarget(this.leftPlayerProgress);
        overlayAnim.addTarget(this.leftAvatarOverlay);
        timerAnim.addTarget(this.leftTimer);
    } else {
        nameAnim.addTarget(this.rightPlayerName);
        nameAnim.addTarget(this.rightPlayerRank);
        nameAnim.addTarget(this.rightPlayerAvatar);
        nameAnim.addTarget(this.rightPlayerProgress);
        overlayAnim.addTarget(this.rightAvatarOverlay);
        timerAnim.addTarget(this.rightTimer);
    }

    nameAnim.play();
    overlayAnim.play();
    timerAnim.play();
};

tictactoe.GameView.prototype.moveCursor = function(direction) {
    'use strict';
    switch (direction) {
    case 'left':
        if (this.cursorPos[0] > 0) {
            this.cursorPos[0]--;
        }
        break;
    case 'right':
        if (this.cursorPos[0] < 2) {
            this.cursorPos[0]++;
        }
        break;
    case 'up':
        if (this.cursorPos[1] > 0) {
            this.cursorPos[1]--;
        }
        break;
    case 'down':
        if (this.cursorPos[1] < 2) {
            this.cursorPos[1]++;
        }
        break;
    }

    if (typeof this.gameboard.gamePosition[this.cursorPos[0]][this.cursorPos[1]].piece === 'undefined') {
        this.cursor.setColor('#52504C');
    } else {
        this.cursor.setColor('#FF5638');
    }

    this.cursor.setPosition(64 + this.cursorPos[0] * 90, 184 + this.cursorPos[1] * 90);
};
