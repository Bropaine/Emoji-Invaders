const endScore = document.querySelector('#endScore');
const levelTag = document.querySelector('#levelTag');
const accuracyEndTag = document.querySelector('#accuracyEndTag');
const accuracyEndEl = document.querySelector('#accuracyEndEl');
const endHighScoreTag = document.querySelector('#highScoreEnd');
const endHighScoreEl = document.querySelector('#highScoreEndEl');
const accuracyTag = document.querySelector('#accuracyTag');
const startScore = document.querySelector('#score');
const highScoreTag = document.querySelector('#highScore');
const endScoreEl = document.querySelector('#endScoreEl');
const bonusEl = document.querySelector('#bonusEl');
const totalScoreEl = document.querySelector('#totalScoreEl');
const bonus = document.querySelector('#bonus');
const totalScore = document.querySelector('#totalScore');
const accuracyEl = document.querySelector('#accuracyEl');
const highScoreEl = document.querySelector('#highScoreEl');
const scoreEl = document.querySelector('#scoreEl');
const levelEl = document.querySelector('#levelEl');
const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');
const rot = 0.15;
let music = new Howl({
    src: ['./assets/sounds/spaceInvadersLevelOne.wav'],
    autoplay: false,
    loop: true,
});

let music02 = new Howl({
    src: ['./assets/sounds/spaceInvaders02.wav'],
    autoplay: false,
    loop: true
});

let music03 = new Howl({
    src: ['./assets/sounds/spaceInvaders03.wav'],
    autoplay: false,
    loop: true
});

let music04 = new Howl({
    src: ['./assets/sounds/spaceInvaders04.wav'],
    autoplay: false,
    loop: true
});

let laserSound = new Howl({
    src: ['./assets/sounds/laser01.wav'],
    autoplay: false,
    loop: false
});

let explosionEnd = new Howl({
    src: ['./assets/sounds/explosionEnd.wav'],
    autoplay: false,
    loop: false
});

let powerUpSound = new Howl({
    src: ['./assets/sounds/powerup02.wav'],
    autoplay: false,
    loop: false
});

let mute = false;

let heightRatio = 2.5;
let widthRatio = 1.53;
canvas.height = canvas.width * heightRatio;
canvas.width = canvas.height * widthRatio;;

class Player {
    constructor() {

        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './assets/ship001.png'
        image.onload = () => {
            this.image = image;
            const scale = 1;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.opacity = 1;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height
            }

            this.rotation = 0;

        }

    }

    draw() {
        //Only draw if image is loaded
        //save snapshot of canvas then translate to center of player
       
       
            c.save();
            c.globalAlpha = this.opacity;
            c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);

            c.rotate(this.rotation);
            //rotate canvas back
            c.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            c.restore(this.rotation);
        
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

}

class Projectile {
    constructor({ position, velocity, negVelocity, scale }) {
        const image = new Image();
        image.src = playerProjectileSprite;
        this.position = position;
        this.velocity = velocity;
        this.negVelocity = negVelocity;
        this.radius = 4;
        this.scale = scale || 1;
        image.onload = () => {
            this.image = image;
            //Shrink image and maintain the aspect ratio
            this.width = image.width * this.scale;
            this.height = image.height * this.scale;
            this.opacity = 1;
            this.position = {
                x: this.position.x - 5,
                y: this.position.y
            }
        }
    }

    draw() {
        
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y -= this.negVelocity.y;
            this.position.y += this.velocity.y;
        }
       
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        //Math.PI * 2 creates the full circle with arc()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades)
            this.opacity -= 0.01;
    }
}


class Invader {
    constructor({ position }) {

        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();

        image.src = enemySprite;

        image.onload = () => {
            this.image = image;
            const scale = 1;
            this.width = image.width * scale;
            this.height = image.height * scale;

            this.position = {
                x: position.x,
                y: position.y
            }

            this.rotation = 0;

        }

    }

    draw() {
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )

    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;

        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: ProjectileVelocity
            }
        }))
    }


}
class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;

    }

    draw() {
        c.fillStyle = enemyLaserColor;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: enemySpeed,
            y: 0
        }

        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        this.width = columns * enemyWidth;
        this.height = (rows) * enemyHeight;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * enemyWidth,
                        y: y * enemyHeight
                    }
                }))
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        //reset velocity
        this.velocity.y = 0;
        //bounce invaders off of the screen edge
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;

        }
        //gameover if invaders reach the bottom
        if (this.position.y + this.height >= canvas.height) {
            setTimeout(() => {
                player.opacity = 0;
                game.over = true;
                if (!explosionEnd.playing()) {
                    music.stop();
                    music02.stop();
                    music03.stop();
                    explosionEnd.play();
                }
            }, 0);

            setTimeout(() => {
                game.active = false;
            }, 3000);

            createParticles({
                object: player,
                color: 'white',
                fades: true,
                num: 1
            })
        }
        //collision if player hits invaders
        if (this.position.y + this.height > Math.floor(player.position.y) && this.position.x + this.width > //
            player.position.x && this.position.x < Math.floor(player.position.x) + player.width && this.position.y < Math.floor(player.position.y) + player.height) {
            setTimeout(() => {
                player.opacity = 0;
                game.over = true;
                if (!explosionEnd.playing()) {
                    music.stop();
                    music02.stop();
                    music03.stop();
                    explosionEnd.play();
                }
            }, 0);

            setTimeout(() => {
                game.active = false;
            }, 3000);

            createParticles({
                object: player,
                color: 'white',
                fades: true,
                num: 1
            })
        }

    }
}

class EndGame {
    constructor() {

        const image = new Image();
        image.src = './assets/gameover.png'
        image.onload = () => {
            this.image = image;
            //Shrink image and maintain the aspect ratio
            const scale = 0.25;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.opacity = 1;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height / 2 - this.height / 2
            }
        }
    }

    draw() {
        startScreenUpdate()
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        accuracyEndEl.innerHTML = calcAccuracy();
        if (calcAccuracy().includes(NaN)) {
            accuracyEndEl.innerHTML= 0.0;
        }
        endHighScoreEl.innerHTML = highScore;        
        startScore.style.visibility = 'hidden';
        accuracyTag.style.visibility = 'hidden';
        levelTag.style.visibility = 'hidden';
        highScoreTag.style.visibility = 'hidden';
        bonus.removeAttribute('hidden');
        totalScore.removeAttribute('hidden');
        endScore.removeAttribute('hidden');
        endHighScoreTag.removeAttribute('hidden');
        accuracyEndTag.removeAttribute('hidden');
        
    }

    update() {
        calcEndgame();
        this.draw();
    }

}

class StartGame {
    constructor() {

        const image = new Image();
        image.src = './assets/splashScreen01.png'
        image.onload = () => {
           
            //Shrink image and maintain the aspect ratio
            const scale = .65;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.opacity = 1;
            this.position = {
                x: 0,
                y: 0
            }
        }
        this.image = image;
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height / 2 - this.height / 2
        }
    }

    draw() {
        
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        if (!game.over) {
            
                pressStart.update();     
        }
    }

    update() {
       
        this.draw();
    }

}
class PressStart {
    constructor() {

        const image = new Image();
        image.src = './assets/pressStart.png'
        image.onload = () => {
           
            //Shrink image and maintain the aspect ratio
            const scale = .75;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.opacity = 1;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height / 2 - this.height / 2 + 50
            }
        }
            this.image = image;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height / 2 - this.height / 2 + 50
            }
    }

    draw() {
        
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
       
        this.draw();
    }

}

class Planet {
    constructor() {

        const image = new Image();
        image.src = planetSprite;
        this.position = {
            x: 0,
            y: 0
        },
            this.velocity = {
                x: 0,
                y: 0
            };
        image.onload = () => {

            //Shrink image and maintain the aspect ratio
            const scale = 1;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.opacity = 1;
            this.position = {
                x: Math.floor(Math.random() * canvas.width),
                y: 0
            },
                this.velocity = {
                    x: 0,
                    y: 0.15
                };

        }
        this.image = image;
    }

    draw() {

        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);

    }

    update() {

        this.position.y += this.velocity.y;
        this.draw();
    }

}


class PowerUp {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        let randomNum = Math.floor(Math.random() * 4)
        switch (randomNum) {
            case 0:
                this.color = 'green'
                break;
            case 1:
                this.color = 'blue'
                break;
            case 2:
                this.color = 'white'
                break;
            case 3:
                this.color = 'red'
                break;
        }

        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        //Math.PI * 2 creates the full circle with arc()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();

    }

    update() {
        if (!this.fades) {
            this.draw();
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (powerup.position.y + powerup.radius > Math.floor(player.position.y) && powerup.position.x + powerup.radius > //
            player.position.x && powerup.position.x < Math.floor(player.position.x) + player.width && powerup.position.y < Math.floor(player.position.y) + player.height) {
            this.fades = true;
            doubleShot = true;

            powerUpSound.play();
            powerUpSound.volume(0.5);

            setTimeout(() => {
                doubleShot = false;

            }, 10000)

        }
    }
}

setInterval(() => {

    createPowerUp();

}, 20000)

const planets = [];
let powerup;
const player = new Player();
const endGame = new EndGame();
const startGame = new StartGame();
const pressStart = new PressStart();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const keys = {

    a: {
        pressed: false
    },
    w: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },
    space: {
        pressed: false
    },
    Capslock: {
        pressed: false
    }

}

let frames = 0;
let randomInterval = Math.floor((Math.random() * 1500) + 1000);
let game = {
    over: false,
    active: true
}

let planetSprite = './assets/planet01.png';
let playerProjectileSprite = './assets/shipbeam.png';
let enemySprite = './assets/invader.png';
let enemyWidth = 30;
let enemyHeight = 30;
let highScore;
let localStorageName = 'emojiInvaderScore';
let score = 0;
let level = 1;
let playerProjectileColor = '#ff462e';
let ProjectileVelocity = 0;
let enemySpeed = 0;
let enemySpawn = 0;
let speed = 4;
let enemyLaserColor = 'white';
let starColor = 'white';
let particleColor = '#BAA0DE';
let executed = false;
let isPressed = false;
let isPressedReset = false;
let doubleShot = false;
let shotCount = 0;
let shotHit = 0;
let shotMiss = 0;
let startScreen = true;

highScore = localStorage.getItem(localStorageName) == null ? 0 :
    localStorage.getItem(localStorageName);
highScoreEl.innerHTML = highScore;

function calcHighScore() {
    highScore = Math.max(score, highScore);
    localStorage.setItem(localStorageName, highScore);
    if (highScore == score) {
        highScoreEl.style.color = 'green';
    }
    return highScore;
}

function createPowerUp() {
    powerup = new PowerUp({
        position: {
            x: Math.floor(Math.random() * canvas.width),
            y: Math.floor(Math.random() * canvas.height)
        },
        velocity: {
            x: 0,
            y: 1
        },
        radius: 20,
        color: 'red',
        fades: false
    })
}


function createParticles({ object, color, fades, num }) {
    //particle effect when enemy is hit
    this.num = num;
    for (let i = 0; i < this.num; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color,
            fades: fades

        }))
    }
}
function createStars({ num, color }) {

    this.num = num;
    this.color = color;
    for (let i = 0; i < this.num; i++) {
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 0.3
            },
            radius: Math.random() * 2,
            color: color
        }));
    }

}

function stars(starColor, num) {
    this.starColor = starColor;
    this.num = num;
    createPlanets();
    createStars({
        color: starColor,
        num: num
    })

}
function createPlanets() {
    planets.push(new Planet());

}

function calcAccuracy() {
    shotMiss = shotCount - shotHit;
    return ((shotCount - shotMiss) / shotCount * 100).toFixed(1);

}

function calcAccuracyBonus() {
    let accuracyBonusPercent = 0;
    console.log(calcAccuracy());
    if (calcAccuracy() >= 100) {
        accuracyBonusPercent = 1.0;
    } else if (calcAccuracy() < 100 && calcAccuracy() >= 90) {
        accuracyBonusPercent = .75;
    } else if (calcAccuracy() < 90 && calcAccuracy() >= 80) {
        accuracyBonusPercent = .5;
    } else if (calcAccuracy() < 80 && calcAccuracy() >= 70) {
        accuracyBonusPercent = .25;
    } else if (calcAccuracy() < 70 && calcAccuracy() >= 60) {
        accuracyBonusPercent = .1;
    }
    return score * accuracyBonusPercent;
}

function calcEndgame() {
    let scoreTotal = 0;
    bonusEl.innerHTML = calcAccuracyBonus();
    scoreTotal = score + calcAccuracyBonus();
    endScoreEl.innerHTML = score;
    score = scoreTotal;
    totalScoreEl.innerHTML = scoreTotal;
    scoreEl.innerHTML = scoreTotal;
    calcHighScore();
    highScoreEl.innerHTML = highScore;
}

function startScreenUpdate() {
    startGame.update();
}

function animate() {

    if (!game.active) {
        music.stop();
        music02.stop();
        music03.stop();
        music04.stop();
        endGame.update();
        return;
    }
        //level Progression
        if (score <= 5000) {
            ProjectileVelocity = 1;
            enemySpeed = 2;
            enemySpawn = 1000;
            enemyLaserColor = 'yellow';
            enemySprite = './assets/invader.png';
            if (!executed) {
                starColor = 'white';
                stars(starColor, 75);
                executed = true;
            }
            if (!music.playing() && !explosionEnd.playing()) {
                music.play();
                music.volume(0.75);
            }

        } else if (score > 5000 && score <= 12000) {
            planetSprite = './assets/planet02.png';
            ProjectileVelocity = 2;
            enemySpeed = 2;
            enemySpawn = 1000;
            level = 2;
            levelEl.innerHTML = level;
            enemySprite = './assets/alienEmoji.png';
            particleColor = '#5f7b7c';
            enemyLaserColor = 'yellow';
            if (executed) {
                starColor = 'white';
                stars(starColor, 25);
                executed = false;
            }

        } else if (score > 12000 && score <= 20000) {
            planetSprite = './assets/planet03.png';
            ProjectileVelocity = 2;
            enemySpeed = 2;
            enemySpawn = 1000;
            level = 2;
            levelEl.innerHTML = level;
            enemyLaserColor = 'yellow';
            particleColor = '#b8b8b8';
            enemySprite = './assets/skullEmoji.png';
            if (!executed) {
                starColor = '#8f5cd1';
                stars(starColor, 50);
                executed = true;
            }
            if (!music02.playing()) {
                music.stop();
                music02.play();
                music02.volume(0.75);
            }

        } else if (score > 20000 && score <= 30000) {
            planetSprite = './assets/planet05.png';
            ProjectileVelocity = 3;
            enemySpeed = 3;
            enemySpawn = 1000;
            level = 4;
            levelEl.innerHTML = level;
            enemySprite = './assets/crazyEmoji.png';
            particleColor = '#fee7b1';
            enemyLaserColor = 'orange';
            if (executed) {
                starColor = '#e3b354';
                stars(starColor, 30);
                executed = false;
            }

        } else if (score > 30000 && score <= 50000) {
            planetSprite = './assets/planet04.png';
            ProjectileVelocity = 3;
            enemySpeed = 3;
            enemySpawn = 1000;
            level = 5;
            levelEl.innerHTML = level;
            enemySprite = './assets/pooEmoji.png';
            enemyLaserColor = 'orange';
            particleColor = '#805023'
            if (!executed) {
                starColor = '#white';
                stars(starColor, 30);
                executed = true;
            }

        } else if (score > 50000 && score <= 75000) {
            planetSprite = './assets/planet01.png';
            ProjectileVelocity = 4;
            enemySpeed = 3;
            enemySpawn = 500;
            level = 6;
            levelEl.innerHTML = level;
            enemyLaserColor = 'orange';
            enemySprite = './assets/loveEmoji.png';
            particleColor = '#805023'
            if (!music03.playing()) {
                music02.stop();
                music03.play();
                music03.volume(0.75);
            }
            if (executed) {
                starColor = '#8f5cd1';
                stars(starColor, 30);
                executed = false;
            }

        } else if (score > 75000 && score <= 100000) {
            planetSprite = './assets/planet06.png';
            ProjectileVelocity = 4;
            enemySpeed = 4;
            enemySpawn = 500;
            level = 7;
            levelEl.innerHTML = level;
            enemyLaserColor = 'green';
            enemySprite = './assets/sinisterEmoji.png';
            particleColor = '#d6a8e2'
            if (!executed) {
                starColor = '#e3b354';
                stars(starColor, 25);
                executed = true;
            }
        }

        else if (score > 100000 && score <= 150000) {
            planetSprite = './assets/planet01.png';
            ProjectileVelocity = 5;
            enemySpeed = 4;
            enemySpawn = 500;
            level = 8;
            levelEl.innerHTML = level;
            enemySprite = './assets/devilEmoji.png';
            particleColor = '#f08370';
            enemyLaserColor = 'green';
            if (executed) {
                starColor = '#e3b354';
                stars(starColor, 30);
                executed = false;
            }

        } else if (score > 150000 && score <= 200000) {
            planetSprite = './assets/planet07.png';
            ProjectileVelocity = 5;
            enemySpeed = 4;
            enemySpawn = 250;
            level = 9;
            levelEl.innerHTML = level;
            enemySprite = './assets/madEmoji.png';
            particleColor = '#f8600d';
            enemyLaserColor = 'green';
            if (!executed) {
                starColor = '#c70000';
                stars(starColor, 30);
                executed = true;
            }

        } else if (score > 200000) {
            planetSprite = './assets/planet08.png';
            ProjectileVelocity = 5.5;
            enemySpeed = 5;
            enemySpawn = 250;
            level = 10;
            levelEl.innerHTML = level;
            enemySprite = './assets/motherShip.png';
            enemyHeight = 30;
            enemyWidth = 63;
            particleColor = 'red';
            enemyLaserColor = 'purple';
            if (executed) {
                starColor = '#c70000';
                stars(starColor, 50);
                executed = false;
            }
            if (!music04.playing()) {
                music03.stop();
                music04.play();
                music04.volume(0.75);
            }
        }

        const rot = 0.15;
        
        
            requestAnimationFrame(animate);
        
        if (startScreen) {
            requestAnimationFrame(startScreenUpdate);
        }else if (!startScreen) {
            startScore.removeAttribute('hidden');
            highScoreTag.removeAttribute('hidden');
            levelTag.removeAttribute('hidden');
            accuracyTag.removeAttribute('hidden');
        }
        
       
        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, i) => {
            if (particle.position.y - particle.radius >= canvas.height) {
                particle.position.x = Math.random() * canvas.width;
                particle.position.y = -particle.radius;
            }
            if (particle.opacity <= 0) {
                setTimeout(() => {
                    particles.splice(i, 1);
                }, 0)
            } else {
                particle.update();
            }
        })
        if (!startScreen) {
            if (planets) {
                planets.forEach((planet) => {
                    planet.update();
                })
            }
            if (powerup) {
                powerup.update();
            }
        }
        player.update();
        //player movement and canvas boundry
        //player.position.x is left side of player
        if (keys.a.pressed && player.position.x >= 0 && player.position.y <= canvas.height - player.height //
            && player.position.y > -5) {
            player.velocity.x = -speed;
            player.velocity.y = 0;
            player.rotation = -rot;
            
            //player.position.x + player.width is right side of player
        } else if (keys.d.pressed && player.position.x + player.width <= canvas.width && //
            player.position.y <= canvas.height - player.height && player.position.y > -5) {      
            player.velocity.x = speed;
            player.velocity.y = 0;
            player.rotation = rot;
        } else if (keys.w.pressed && player.position.y >= 0 && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5) {
            player.velocity.y = -speed;
            player.velocity.x = 0;
        } else if (keys.s.pressed && player.position.y <= canvas.height - player.height - 5 && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5) {
            player.velocity.y = speed;
            player.velocity.x = 0;
        }
        else {
            player.velocity.y = 0;
            player.velocity.x = 0;
            player.rot = 0;
        }

        invaderProjectiles.forEach((invaderProjectile, index) => {
            if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
                setTimeout(() => {
                    invaderProjectiles.splice(index, 1);
                }, 0);
            } else {
                invaderProjectile.update();

                //Hit Box algorithm for collision detection
                if (invaderProjectile.position.y + invaderProjectile.height > Math.floor(player.position.y) && invaderProjectile.position.x + invaderProjectile.width > //
                    player.position.x && invaderProjectile.position.x < Math.floor(player.position.x) + player.width && invaderProjectile.position.y < Math.floor(player.position.y) + player.height) {
                    setTimeout(() => {
                        invaderProjectiles.splice(index, 1);
                        player.opacity = 0;
                        game.over = true;
                        if (!explosionEnd.playing()) {
                            music.stop();
                            music02.stop();
                            music03.stop();
                            explosionEnd.play();
                        }
                    }, 0);

                    setTimeout(() => {
                        game.active = false;
                    }, 2000);

                    createParticles({
                        object: player,
                        color: 'white',
                        fades: true,
                        num: 15
                    })
                }
            }
        })
        projectiles.forEach((projectile, index) => {
            if (projectile.position.y - projectile.height <= 0) {
                setTimeout(() => {
                    projectiles.splice(index, 1);
                    shotCount++;
                    accuracyEl.innerHTML = calcAccuracy();
                }, 0);
            } else {
                projectile.update();
            }
        })
    if (!startScreen) {    
        grids.forEach((grid, gridIndex) => {
            grid.update();
            //spawn projectiles
            if (frames % 100 === 0 && grid.invaders.length > 0) {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
            }
            grid.invaders.forEach((invader, i) => {
                invader.update({ velocity: grid.velocity });

                //collision detection and enemy removal
                //projectiles hit enemy

                projectiles.forEach((projectile, j) => {
                    if (projectile.position.y <= invader.position.y + invader.height && projectile.position.x  //
                        >= invader.position.x && projectile.position.x <= invader.position.x + invader.width && projectile.position.y //
                        >= invader.position.y) {
                        shotCount++;
                        shotHit++;
                        setTimeout(() => {
                            //check if invader is in parent grid array
                            const invaderFound = grid.invaders.find(invader2 => {
                                return invader2 === invader;
                            })
                            const projectileFound = projectiles.find(projectile2 => {
                                return projectile2 === projectile;
                            })
                            //remove invader and projectile
                            if (invaderFound && projectileFound) {
                                score += 100;
                                highScoreEl.innerHTML = calcHighScore();
                                scoreEl.innerHTML = score;
                                createParticles({
                                    object: invader,
                                    color: particleColor,
                                    fades: true,
                                    num: 15
                                });
                                grid.invaders.splice(i, 1);
                                projectiles.splice(j, 1);
                                accuracyEl.innerHTML = calcAccuracy();

                                if (grid.invaders.length > 0) {
                                    const firstInvader = grid.invaders[0];
                                    const lastInvader = grid.invaders[grid.invaders.length - 1];
                
                                    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                    grid.height = lastInvader.position.y - firstInvader.position.y + lastInvader.height;
                
                                } else {
                                    grids.splice(gridIndex, 1)
                                }
                                
                            }

                        }, 0)
                    }
                })
            })
        })
        
        //randomly spawn invaders
        if (frames % randomInterval === 0) {
            grids.push(new Grid());
            randomInterval = Math.floor((Math.random() * enemySpawn) + 1000);
            frames = 0;
        }

        frames++;
    
    }
}
    animate();

document.querySelector("#fireButton").addEventListener("click", function () {
    startScreen = false;
    if (!doubleShot) {
        laserSound.play();
        setTimeout(() => {
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: player.velocity.y - 5
                },
                negVelocity: {
                    x: 0,
                    y: player.velocity.y + 5
                }
            }));
        }, 100);
    }

    if (doubleShot) {
        laserSound.play();
        setTimeout(() => {
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2 - 22,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: player.velocity.y - 5
                },
                negVelocity: {
                    x: 0,
                    y: player.velocity.y + 5
                }
            }));
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2 + 22,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: player.velocity.y - 5
                },
                negVelocity: {
                    x: 0,
                    y: player.velocity.y + 5
                }
            }));

        }, 100);
    }
})

window.addEventListener("gamepadconnected", function (e) {
    let gp = navigator.getGamepads()[e.gamepad.index]
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        gp.index, gp.id,
        gp.buttons.length, gp.axes.length);

    setInterval(reportOnGamepad, 1)
});

window.addEventListener("gamepaddisconnected", function (e) {
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
});


function reportOnGamepad() {
    let gp = navigator.getGamepads()[0];

    if (gp.axes.length > 0) {

        if (gp.axes[0] < -0.5 && player.position.x >= 0 && player.position.y <= canvas.height - player.height + 5  //
            && player.position.y > -5 && !game.over) {
            player.velocity.x = -speed;
            player.rotation = -rot;
            startScreen = false;

        }

        else if (gp.axes[0] > 0.5 && player.position.x + player.width <= canvas.width && //
            player.position.y <= canvas.height - player.height + 5 && player.position.y >= -5 && !game.over) {
            player.velocity.x = speed;
            player.rotation = rot;
            startScreen = false;
        }
        else if (gp.axes[1] < -0.5 && player.position.y >= -5 && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5 && !game.over) {
            player.velocity.y = -speed;
            startScreen = false;

        }

        else if (gp.axes[1] > 0.5 && player.position.y <= canvas.height - player.height && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5 && !game.over) {
            player.velocity.y = speed;
            startScreen = false;
        }

    }

    if (gp.buttons.length > 0) {

        if ((gp.buttons[0].pressed || gp.buttons[7].pressed || gp.buttons[5].pressed) && !isPressed && !game.over) {
            startScreen = false;
            
            if (!doubleShot) {
                laserSound.play();
                setTimeout(() => {
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));
                }, 100);
            }
            if (doubleShot) {
                laserSound.play();
                setTimeout(() => {
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2 - 22,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2 + 22,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));

                }, 100);
            }
            isPressed = true;
        }


        if (!gp.buttons[0].pressed && !gp.buttons[7].pressed && !gp.buttons[5].pressed) {
            isPressed = false;
        }

        if (gp.buttons[14].pressed && player.position.x >= 0 && player.position.y <= canvas.height - player.height + 5   //
            && player.position.y > -5 && !game.over) {
            player.velocity.x = -speed;
            player.rotation = -rot;
            startScreen = false;
        }

        else if (gp.buttons[15].pressed && player.position.x + player.width <= canvas.width && //
            player.position.y <= canvas.height - player.height + 5 && player.position.y >= -5 && !game.over) {
            player.velocity.x = speed;
            player.rotation = rot;
            startScreen = false;
        }

        else if ((gp.buttons[12].pressed) && player.position.y >= -5 && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5 && !game.over) {
            player.velocity.y = -speed;
            startScreen = false;
        }

        else if (gp.buttons[13].pressed && player.position.y <= canvas.height - player.height && //
            player.position.x >= -5 && player.position.x + player.width <= canvas.width + 5 && !game.over) {
            player.velocity.y = speed;
            startScreen = false;
        }
        else if (!(gp.axes[0] < -0.5) && !(gp.axes[0] > 0.5) && !(keys.a.pressed) && !(keys.d.pressed)) {
            player.rotation = 0;
        }
        if (gp.buttons[9].pressed && !isPressedReset) {
            startScreen = false;
            if (!game.active) {
                let reset = document.getElementById("buttonImage");
                reset.click();
                isPressedReset = true;
            }
        }
        if (gp.buttons[8].pressed && !isPressedReset) {
            let reset = document.getElementById("buttonImage");
            reset.click();
            isPressedReset = true;
        }
        if (!gp.buttons[8].pressed) {
            isPressedReset = false;
        }
    }

}

addEventListener('keydown', ({ key }) => {
    if (game.over) return;
    switch (key) {
        case 'Escape':
            let reset = document.getElementById("buttonImage");
                reset.click();
                isPressedReset = true;
            break;
        case 'a':
            startScreen = false;
            keys.a.pressed = true;
            break;
        case 'w':
            startScreen = false;
            keys.w.pressed = true;
            break;
        case 'd':
            startScreen = false;
            keys.d.pressed = true;
            break;
        case 's':
            startScreen = false;
            keys.s.pressed = true;
            break;
        case 'A':
            startScreen = false;
            keys.a.pressed = true;
            break;
        case 'W':
            startScreen = false;
            keys.w.pressed = true;
            break;
        case 'D':
            startScreen = false;
            keys.d.pressed = true;
            break;
        case 'S':
            startScreen = false;
            keys.s.pressed = true;
            break;
        case ' ':
            startScreen = false;
            
            if (!keys.space.pressed && !doubleShot) {
                laserSound.play();
                setTimeout(() => {
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));
                }, 100);
            }

            if (!keys.space.pressed && doubleShot) {
                laserSound.play();
                setTimeout(() => {
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2 - 22,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));
                    projectiles.push(new Projectile({
                        position: {
                            x: player.position.x + player.width / 2 + 22,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: player.velocity.y - 5
                        },
                        negVelocity: {
                            x: 0,
                            y: player.velocity.y + 5
                        }
                    }));

                }, 100);
            }
            keys.space.pressed = true;
            break;

    }
})

addEventListener('keyup', ({ key }) => {

    switch (key) {

        case 'a':
            keys.a.pressed = false;
            player.rotation = 0;
            break;
        case 'w':
            keys.w.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            player.rotation = 0;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'A':
            keys.a.pressed = false;
            player.rotation = 0;
            break;
        case 'W':
            keys.w.pressed = false;
            break;
        case 'D':
            keys.d.pressed = false;
            player.rotation = 0;
            break;
        case 'S':
            keys.s.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;

    }

}) 
 
addEventListener('mousedown', ()=> {
    startScreen = false;
})