if (location.protocol !== 'https:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
// document.documentElement.webkitRequestFullscreen(); // needs user gesture
health = document.getElementById('health');
canvas = document.getElementById('canvas');
playArea = document.getElementById('playArea');
ctx = canvas.getContext('2d');
canvas.width = 640;
width = canvas.width;

window.onresize = rotateScreen;
function rotateScreen() {
    playArea.style.height = window.innerHeight + "px";
    w = Math.min(window.innerWidth, window.innerHeight ** 2 / window.innerWidth);
    playArea.style.width = w + "px";
}
rotateScreen();
canvas.height = width / w * window.innerHeight;
height = canvas.height;

function touchToCanvas(x, y) {
    return {x: x / w * width, y: y / window.innerHeight * height};
}

var Key = {
    _pressed: {},
  
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    
    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    
    onKeydown: function(event) {
        this._pressed[event.keyCode] = true; // could store epoch time instead of just 'true'
    },
    
    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Touch = {
    isDown: false,
    position: {x: null, y: null},
    startposition: {x: null, y: null},
    
    onTouchstart: function(event) {
        this.isDown = true;
        this.position = touchToCanvas(event.touches[0].clientX, event.touches[0].clientY); // {x: event.touches[0].clientX, y: event.touches[0].clientY};
        this.startposition = {x: this.position.x, y: this.position.y};
    },

    onTouchmove: function(event) {
        this.position = touchToCanvas(event.touches[0].clientX, event.touches[0].clientY); // {x: event.touches[0].clientX, y: event.touches[0].clientY};
    },
    
    onTouchend: function(event) {
        this.isDown = false;
    }
};
canvas.addEventListener('touchstart', function(event) { Touch.onTouchstart(event); }, false);
canvas.addEventListener('touchmove', function(event) { Touch.onTouchmove(event); }, false);
canvas.addEventListener('touchend', function(event) { Touch.onTouchend(event); }, false);

// let totalImg = 0;
// let imgCount = 0;
function loadImage(url) {
    // totalImg++;
    let img = new Image();
    // img.onload = onloadImg;
    img.src = url;
    return img;
}

// function onloadImg() {
//     imgCount++;
//     if (imgCount == totalImg) imgLoaded();
// }