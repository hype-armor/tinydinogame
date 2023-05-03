class Dinosaur {
    constructor() {
        this.object = document.getElementById('object');
        this.ground = document.getElementById('ground');
        this.x = 50;
        this.y = 400;
        this.x_momentum = 0;
        this.y_momentum = 0;
        this.gravity_off = false;
        this.on_ground = false;
        this.gravity = 0.2;
        this.keysPressed = {};
        this.svg1 = new Image();
        this.svg1.src = 'dinosaur.svg';
        this.svg2 = new Image();
        this.svg2.src = 'dinosaur1.svg';
        this.jump_id = null;
        this.friction = 0.5;
        this.score = document.getElementById('score');
        this.init();
    }

    init() {
        setInterval(() => {
            if (this.x_momentum != 0 && this.object.getAttribute('src') === this.svg1.src) {
                this.object.setAttribute('src', this.svg2.src);
            } else if (this.object.getAttribute('src') != this.svg1.src) {
                this.object.setAttribute('src', this.svg1.src);
            }
        }, 200);

        document.addEventListener('keydown', (event) => {
            this.keysPressed[event.key] = true;
        });

        document.addEventListener('keyup', (event) => {
            delete this.keysPressed[event.key];
        });

        setInterval(() => {
            this.checkKeys();
            this.physics();
        }, 20);

        window.onresize = () => {
            this.y = this.ground.getBoundingClientRect().top - 22;
            this.object.style.top = this.y + 'px';
        };
    }

    checkKeys() {
        this.gravity_off = false;

        if ((this.keysPressed['w'] || this.keysPressed[' ']) && this.on_ground && !this.gravity_off) {
            this.y_momentum = -20;
            this.y -= 7;
        }
        if (this.keysPressed['a'] && this.on_ground) {
            this.x_momentum = -10;
        }
        if (this.keysPressed['d'] && this.on_ground) {
            this.x_momentum = 10;
        }
        if (this.keysPressed['s'] && this.on_ground) {
            this.x_momentum = 0;
        }
        this.object.style.top = this.y + 'px';
        this.object.style.left = this.x + 'px';
    }

    physics() {
        this.on_ground = false;
        const ground_height = this.ground.getBoundingClientRect().top;
        if (this.gravity_off) {
            // do nothing
        } else if (this.y > ground_height - 29) {
            this.y = ground_height - 22;
            this.on_ground = true;
        } else {
            this.y_momentum += 1;
            if (this.y_momentum > 0) {
                this.y += this.y_momentum;
                this.y_momentum -= this.gravity;
            } else if (this.y_momentum < 0) {
                this.y += this.y_momentum;
                this.y_momentum += this.gravity;
            }
        }
        this.object.style.top = this.y + 'px';

        if (this.on_ground) {
            this.friction = 0.5;
        } else {
            this.friction = 0.02;
        }

        if (this.x_momentum > 0) {
            this.x += this.x_momentum;
            this.x_momentum -= this.friction;
        } else if (this.x_momentum < 0) {
            this.x += this.x_momentum;
            this.x_momentum += this.friction;
        }
        this.x_momentum = Math.round(this.x_momentum * 10) / 10;

        if (this.x < 0) {
            this.x = 0;
            this.x_momentum = 0;
        }
        this.object.style.left = this.x + 'px';

        this.score.innerText = parseInt(this.score.innerText) + 3;

        obstacles.forEach(obstacle => {
            obstacle.update_speed((parseInt(this.score.innerText) / 100) + 10);
        });
    }


}

class Obstacle {
    constructor(width, height, color) {
        this.ground = document.getElementById('ground');
        const rect = this.ground.getBoundingClientRect();
        console.log(rect.top, rect.right, rect.bottom, rect.left);
        this.width = width;
        this.height = height;
        this.color = color;
        this.element = document.createElement('div');
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.backgroundColor = this.color;
        this.element.style.position = "absolute";
        this.element.style.left = getRandomInt(1500,3000) + "px";
        this.element.style.top = (rect.top - 100) + (100 - this.height) + 'px';
        document.body.appendChild(this.element);
        this.speed = 0;
        this.score = document.getElementById('score');
        this.init();
    }

    init() {
        setInterval(() => {
            const rect1 = this.element.getBoundingClientRect();
            const rect2 = dinosaur.object.getBoundingClientRect();
            if (rect1.top < rect2.bottom && rect1.bottom > rect2.top && rect1.right > rect2.left && rect1.left < rect2.right) {
                this.collision();
            }
            // movement
            if (this.element.getBoundingClientRect().left > -100) {
                this.element.style.left = parseInt(this.element.style.left) - this.speed + 'px';
            }
            else {
                this.element.style.left = getMostRightObstacle() + getRandomInt(1500,3000) + getRandomInt(this.speed * 4,this.speed * 9) + "px";
            }
        }, 20);
    }

    update_speed(speed) {
        if (this.speed < 10.0) {
               this.speed = speed + 10;
        }
        else {
            this.speed = speed;
        }

    }

    collision() {
        console.log('collision')
        score.innerText = 0;
        this.reset();
    }

    reset() {
        this.element.style.visibility = "hidden";
        this.x = getMostRightObstacle() + 1500;
        console.log(this.x)
        this.element.style.left = this.x + "px";
        this.element.style.visibility = "visible";
    }
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
  

const dinosaur = new Dinosaur();

obstacles = [];
obstacles.push(new Obstacle(getRandomInt(40,120), getRandomInt(40,100), 'black'));
for (let i = 0; i < 10; i++) {
    obs = new Obstacle(getRandomInt(40,120), getRandomInt(40,100), 'black')
    
    // check if obstacle is on another obstacle
    const lastItem = obstacles[obstacles.length - 1];
    last_x = lastItem.element.style.left;
    obs.element.style.left = parseInt(last_x) + parseInt(obs.element.style.left) + 'px'; 
    obstacles.push(obs);
}

function getMostRightObstacle() {
    leftest = 0;
    obstacles.forEach(obstacle => {
        if (parseInt(obstacle.element.style.left) > leftest) {
            leftest = parseInt(obstacle.element.style.left);
        }
    });
    return leftest;
}
console.log('');