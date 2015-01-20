goog.provide('tictactoe.GameController');

goog.require('goog.events.EventTarget');

/**
 * @constructor
 */
tictactoe.GameController = function(gameView) {
    'use strict';
    var that = this;

    goog.events.EventTarget.call(this);

    // send move to platform
    goog.events.listen(this, 'move', function(e) {
        if (typeof this.state === 'undefined') {
            return;
        }

        this.lastMove = e;

        var moveResult = evaluateMove(this.state, this.player.id, this.state.nextMoveId, e);

        if (moveResult.result === 'invalid') {
            console.log(moveResult.evaluationContent);
        } else {
            gameView.doMove(true, e.posX, e.posY);

            PG.sendMove({
                className: 'Move',
                posX: e.posX,
                posY: e.posY
            });
        }
    });

    // menu button
    goog.events.listen(this, 'showMenu', function() {
        PG.showMenu();
    });

    PG.init({
        onMatchPrepare: function(player, opponent, deviceType) {
            that.player = player;
            that.opponent = opponent;
            gameView.prepareGame(that.player, that.opponent, deviceType);
            PG.ready();
        },
        onMatchStart: function(playerIdToPlayNext, timeToPlay) {
            that.state = JSON.parse(createStateForNewMatch([
                [that.player.id, false],
                [that.opponent.id, false]
            ], playerIdToPlayNext));
            gameView.startGame(playerIdToPlayNext === that.player.id, timeToPlay);
        },
        onMoveValid: function(playerIdWhoSentTheMove, playerToPlayNext, moveDetails, moveResults, gameResults) {
            if (playerIdWhoSentTheMove === that.opponent.id) {
                evaluateMove(that.state, that.opponent.id, that.state.nextMoveId, moveDetails);
                gameView.doMove(false, moveDetails.posX, moveDetails.posY);
                if (typeof gameResults !== 'undefined') {
                    that.state.running = false;
                    if (gameResults === 'draw') {
                        gameView.endGame(false, 8);
                    } else {
                        gameView.endGame(false, moveResults);
                    }
                } else {
                    gameView.switchPlayer(true);
                }
            } else {
                if (typeof gameResults !== 'undefined') {
                    that.state.running = false;
                    if (gameResults === 'draw') {
                        gameView.endGame(true, 8);
                    } else {
                        gameView.endGame(true, moveResults);
                    }
                } else {
                    gameView.switchPlayer(false);
                }
            }
        },
        onMoveInvalid: function(playerIdWhoSentTheMove, playerToPlayNext) {
            that.state.board[that.lastMove.posX][that.lastMove.posY] = 0;
            that.state.nextPlayerId = playerToPlayNext;

            gameView.switchPlayer(
                playerToPlayNext === that.player.id,
                gameView.undoLastMove(that.lastMove.posX, that.lastMove.posY)
            );
        },
        onKeyPress: function(key) {
            if (typeof that.state !== 'undefined' && that.state.nextPlayerId === that.player.id) {
                switch (key) {
                case 'left':
                case 'right':
                case 'up':
                case 'down':
                    gameView.moveShadow(key);
                    break;
                case 'enter':
                    gameView.handleClick(gameView.shadowPos[0], gameView.shadowPos[1]);
                    break;
                }
            }
        },
        onMatchEnd: function(gameResults) {
            if (typeof that.state !== 'undefined' && that.state.running === true) {
                that.state.running = false;
                if (gameResults === 'draw') {
                    gameView.endGame(true, 8);
                } else {
                    gameView.endGame(gameResults === 'won', 9);
                }
            }
        }
    });
};

goog.inherits(tictactoe.GameController, goog.events.EventTarget);
