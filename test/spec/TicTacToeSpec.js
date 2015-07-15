PG = {
    init: function(params) {
        'use strict';
        this.onMatchPrepare = params.onMatchPrepare;
        this.onMatchStart = params.onMatchStart;
        this.onMoveValid = params.onMoveValid;
        this.onMoveInvalid = params.onMoveInvalid;
        this.onMatchEnd = params.onMatchEnd;
        this.onKeyPress = params.onKeyPress;
    },
    prepared: function() {
        'use strict';
        this.isPrepared = true;
    },
    ready: function() {
        'use strict';
        this.isReady = true;
    },
    move: function(move) {
        'use strict';
        this.movePerformed = move;
    },
    showMenu: function() {
        'use strict';
        this.calledShowMenu = true;
    },
};

describe('Rendering Engine', function() {
    'use strict';

    it('should be able to render in Canvas', function() {
        runs(function() {
            tictactoe.configs.useCanvas = true;

            var notepad = document.createElement('div');
            notepad.id = 'notepad';
            document.body.appendChild(notepad);

            tictactoe.start();
        });
        waitsFor(function() {
            return document.getElementsByTagName('canvas').length >= 1;
        }, 'should have one Canvas element in the page');
    });

    it('should be able to render in DOM', function() {
        runs(function() {
            tictactoe.director.removeDomElement();
            tictactoe.configs.useCanvas = false;
            tictactoe.start();
        });
        waitsFor(function() {
            return document.getElementsByTagName('canvas').length === 0;
        }, 'should have no Canvas element in the page');
    });


});

describe('Show/Hide Game', function() {
    'use strict';

    it('should tell the platform it is ready', function() {
        runs(function() {
            PG.isReady = false;
            tictactoe.director.removeDomElement();
            tictactoe.start();
            PG.onMatchPrepare({
                id: 1,
                user: {
                    nickname: 'tic',
                    ranking: '123',
                    avatar: '#ffffff',
                    progress: Math.PI / 2
                }
            }, {
                id: 2,
                user: {
                    nickname: 'tac',
                    ranking: '321',
                    avatar: '#ffffff',
                    progress: 0
                }
            });
        });
        waitsFor(function() {
            return PG.isReady;
        }, 'should send the ready event');
    });

    it('should tell the platform to show the menu', function() {
        runs(function() {
            PG.calledShowMenu = false;
            tictactoe.gameView.menuButton.dispatchEvent(lime.Button.Event.CLICK);
        });
        waitsFor(function() {
            return PG.calledShowMenu;
        }, 'should show the menu');
    });

});

var startTestGame = function(nextPlayerId) {
    'use strict';

    runs(function() {
        //clear test board
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                while (tictactoe.gameView.gameboard.gamePosition[i][j].getChildAt(0) !== null) {
                    tictactoe.gameView.gameboard.gamePosition[i][j].removeChildAt(0);
                }
            }
        }
        // remove victory line
        tictactoe.gameView.gameboard.removeChild(tictactoe.gameView.victoryline);

        PG.isReady = false;
        tictactoe.gameController.state = null;

        PG.onMatchPrepare({
            id: 1,
            user: {
                nickname: 'tic',
                ranking: '123',
                avatar: '#ffffff',
                progress: Math.PI / 2
            }
        }, {
            id: 2,
            user: {
                nickname: 'tac',
                ranking: '321',
                avatar: '#ffffff',
                progress: 0
            }
        });
    });
    waitsFor(function() {
        return PG.isReady;
    }, 'should tell the platform it is ready');
    runs(function() {
        PG.onMatchStart(nextPlayerId, 60000);
    });
    waitsFor(function() {
        return tictactoe.gameController.state && tictactoe.gameController.state.running;
    }, 'should define a game state and it should be running');
};

var doTestMove = function(play, currentPlayer, expectedEndCondition, isLastMove) {
    'use strict';
    if (currentPlayer) {
        runs(function() {
            PG.movePerformed = null;
            tictactoe.gameView.gameboard.gamePosition[play[0]][play[1]].dispatchEvent(lime.Button.Event.CLICK);
        });
        waitsFor(function() {
            return PG.movePerformed && PG.movePerformed.posX === play[0] && PG.movePerformed.posY === play[1];
        }, 'should send the move to the platform');
    }

    runs(function() {
        PG.onMoveValid(currentPlayer ? 1 : 2, currentPlayer ? 2 : 1, {
            className: 'Move',
            posX: play[0],
            posY: play[1]
        }, isLastMove ? expectedEndCondition : undefined,
            isLastMove ? (expectedEndCondition === 8 ? 'draw' : 'won') : undefined);
    });

    waitsFor(function() {
        return tictactoe.gameController.state.board[play[0]][play[1]] === (currentPlayer ? 1 : 2);
    }, 'should register player move');
};

var playTestGame = function(plays, currentPlayer, expectedEndCondition) {
    'use strict';

    for (var i = 0; i < plays.length; i++) {
        doTestMove(plays[i], currentPlayer, expectedEndCondition, i === plays.length - 1);
        currentPlayer = !currentPlayer;
    }
    waitsFor(function() {
        return window.verifyBoard(tictactoe.gameController.state.board) === expectedEndCondition;
    }, 'game rules should detect end of the game');
    runs(function() {
        PG.onMatchEnd(currentPlayer ? 'won' : 'lost', expectedEndCondition);
    });
    waitsFor(function() {
        return !tictactoe.gameController.state.running;
    }, 'game rules state should not be running');
};

describe('End Conditions', function() {
    'use strict';

    it('should start a new game', function() {
        startTestGame(1);
    });

    it('should tie the game', function() {
        playTestGame( [ [0,0], [1,0], [0,1], [1,1], [1,2], [0,2], [2,0], [2,1], [2,2] ], true, 8);
    });

    //horizontal lines
    it('should lose the game on first line', function() {
        startTestGame(2);
        playTestGame( [ [0,0], [0,1], [1,0], [1,1], [2,0] ], false, 3 );
    });

    it('should win the game on first line', function() {
        startTestGame(1);
        playTestGame( [ [0,0], [0,1], [1,0], [1,1], [2,0] ], true, 3 );
    });

    it('should lose the game on second line', function() {
        startTestGame(2);
        playTestGame( [ [0,1], [0,2], [1,1], [1,2], [2,1] ], false, 4 );
    });

    it('should win the game on second line', function() {
        startTestGame(1);
        playTestGame( [ [0,1], [0,2], [1,1], [1,2], [2,1] ], true, 4 );
    });

    it('should lose the game on third line', function() {
        startTestGame(2);
        playTestGame( [ [0,2], [0,1], [1,2], [1,1], [2,2] ], false, 5 );
    });

    it('should win the game on third line', function() {
        startTestGame(1);
        playTestGame( [ [0,2], [0,1], [1,2], [1,1], [2,2] ], true, 5 );
    });

    //vertical lines
    it('should lose the game on first column', function() {
        startTestGame(2);
        playTestGame( [ [0,0], [1,0], [0,1], [1,1], [0,2] ], false, 0 );
    });

    it('should win the game on first column', function() {
        startTestGame(1);
        playTestGame( [ [0,0], [1,0], [0,1], [1,1], [0,2] ], true, 0 );
    });

    it('should lose the game on second column', function() {
        startTestGame(2);
        playTestGame( [ [1,0], [2,0], [1,1], [2,1], [1,2] ], false, 1 );
    });

    it('should win the game on second column', function() {
        startTestGame(1);
        playTestGame( [ [1,0], [2,0], [1,1], [2,1], [1,2] ], true, 1 );
    });

    it('should lose the game on third column', function() {
        startTestGame(2);
        playTestGame( [ [2,0], [1,0], [2,1], [1,1], [2,2] ], false, 2 );
    });

    it('should win the game on third column', function() {
        startTestGame(1);
        playTestGame( [ [2,0], [1,0], [2,1], [1,1], [2,2] ], true, 2 );
    });

    //diagonal lines
    it('should lose the game on first diagonal', function() {
        startTestGame(2);
        playTestGame( [ [0,0], [0,1], [1,1], [0,2], [2,2] ], false, 6 );
    });

    it('should win the game on first diagonal', function() {
        startTestGame(1);
        playTestGame( [ [0,0], [0,1], [1,1], [0,2], [2,2] ], true, 6 );
    });

    it('should lose the game on second diagonal', function() {
        startTestGame(2);
        playTestGame( [ [2,0], [0,0], [1,1], [0,1], [0,2] ], false, 7 );
    });

    it('should win the game on second diagonal', function() {
        startTestGame(1);
        playTestGame( [ [2,0], [0,0], [1,1], [0,1], [0,2] ], true, 7 );
    });
});

describe('Invalid Moves', function() {
    'use strict';

    it('should detect that the id of the move is wrong', function() {
        startTestGame(1);

        runs(function() {
            expect(evaluateMove(tictactoe.gameController.state, 1, 2, {
                posX: 0,
                posY: 0
            }).result).toBe('invalid');
            expect(tictactoe.gameController.state.board[0][0]).toBe(0);
        });
    });

    it('should detect incorrect player turn', function() {
        expect(evaluateMove(tictactoe.gameController.state, 2, 1, {
            posX: 0,
            posY: 0
        }).result).toBe('invalid');
        expect(tictactoe.gameController.state.board[0][0]).toBe(0);
    });

    it('should detect detect a move out of board', function() {
        expect(evaluateMove(tictactoe.gameController.state, 1, 1, {
            posX: 4,
            posY: 4
        }).result).toBe('invalid');
    });

    it('should detect a position that is already filled', function() {
        expect(evaluateMove(tictactoe.gameController.state, 1, 1, {
            posX: 0,
            posY: 0
        }).result).toBe('valid');
        expect(tictactoe.gameController.state.board[0][0]).toBe(1);
        expect(evaluateMove(tictactoe.gameController.state, 2, 2, {
            posX: 0,
            posY: 0
        }).result).toBe('invalid');
        expect(tictactoe.gameController.state.board[0][0]).toBe(1);
    });

    it('should detect the match is ended', function() {
        expect(evaluateMove(tictactoe.gameController.state, 2, 2, {
            posX: 0,
            posY: 1
        }).result).toBe('valid');
        expect(tictactoe.gameController.state.board[0][1]).toBe(2);
        expect(evaluateMove(tictactoe.gameController.state, 1, 3, {
            posX: 1,
            posY: 0
        }).result).toBe('valid');
        expect(tictactoe.gameController.state.board[1][0]).toBe(1);
        expect(evaluateMove(tictactoe.gameController.state, 2, 4, {
            posX: 1,
            posY: 1
        }).result).toBe('valid');
        expect(tictactoe.gameController.state.board[1][1]).toBe(2);
        expect(evaluateMove(tictactoe.gameController.state, 1, 5, {
            posX: 2,
            posY: 0
        }).result).toBe('winner');
        expect(tictactoe.gameController.state.board[2][0]).toBe(1);
        expect(evaluateMove(tictactoe.gameController.state, 2, 6, {
            posX: 2,
            posY: 1
        }).result).toBe('invalid');
        expect(tictactoe.gameController.state.board[2][1]).toBe(0);
    });
});
