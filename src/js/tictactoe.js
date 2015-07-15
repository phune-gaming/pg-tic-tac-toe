goog.provide('tictactoe');

goog.require('tictactoe.GameController');
goog.require('tictactoe.GameView');

goog.require('lime.Director');

tictactoe.configs = {
    useCanvas: true,
    useCSS3Animations: true, // see http://www.limejs.com/5_animations for a list of problems with this
    showFPS: false,
    width: 312,
    height: 568,
    allwaysUseSameSymbol: false
};

if ((window.devicePixelRatio && window.devicePixelRatio > 1) || window.innerWidth > 320 || window.innerHeight > 568) {
    tictactoe.configs.retinaImages = true;

    if (tictactoe.configs.useCanvas) {
        //temp fix while userAgent.RETINA is not defined
        goog.global.devicePixelRatio = window.devicePixelRatio > 2 ? window.devicePixelRatio : 2;
    }
    tictactoe.configs.retinaPrefix = '@2x';

    if (document.body !== null) {
        document.body.classList.add('retinaImages');
    }
} else {
    tictactoe.configs.retinaPrefix = '';

    if (document.body !== null) {
        document.body.classList.add('normalImages');
    }
}

tictactoe.start = function() {
    'use strict';

    // load font
    lime.Label.defaultFont = 'KomikaTitle';

    tictactoe.director = new lime.Director(document.getElementById('notepad'), tictactoe.configs.width, tictactoe.configs.height);

    tictactoe.director.setDisplayFPS(tictactoe.configs.showFPS);

    if(tictactoe.configs.useCSS3Animations) {
        lime.animation.Animation.prototype.optimizations_ = true;
        lime.animation.Animation.prototype.useTransitions = function() {
            return this.duration_ > 0 && lime.style.isTransitionsSupported && this.optimizations_;
        };
    }

    var background = document.createElement('div');
    background.id = 'background';
    document.getElementsByClassName('lime-director')[0].appendChild(background);

    tictactoe.gameView = new tictactoe.GameView();

    tictactoe.director.replaceScene(tictactoe.gameView);

    tictactoe.gameController = new tictactoe.GameController(tictactoe.gameView);
};

goog.events.listen(window, goog.events.EventType.LOAD, tictactoe.start);
