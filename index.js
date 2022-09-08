const scoreEl = document.querySelector('#scoreEl');
const levelEl = document.querySelector('#levelEl');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
let music = new Howl({
    src: ['./assets/spaceInvadersLevelOne.wav'],
    autoplay: true,
    loop: true
  });
  let mute = false;
  
canvas.width = 1024;
canvas.height = 576;

class Player {
    constructor() {

        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './assets/spaceship.png'
        image.onload = () => {
        this.image = image;
        //Shrink image and maintain the aspect ratio
        const scale = 0.15;
        this.width = image.width * scale;
        this.height = image.height * scale;
        this.opacity = 1;
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height -20
        }

        this.rotation = 0;

        }
       
    }

    draw() {
       // c.fillStyle = 'red';
       // c.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    constructor({position, velocity, negVelocity}) {
        this.position = position;
        this.velocity = velocity;
        this.negVelocity = negVelocity;
        this.radius = 4;
    }

    draw() {
        c.beginPath();
        //Math.PI * 2 creates the full circle with arc()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y -= this.negVelocity.y;
        this.position.y += this.velocity.y;
        }
   }

   class Particle {
    constructor({position, velocity, radius, color, fades}) {
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
    constructor({position}) {

        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './assets/invader.png'
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

    update({velocity}) {
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
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
        
    }

    draw() {
       c.fillStyle = 'yellow';
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

        this.width = columns * 30;
        this.height = rows * 30;

        for  (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++){
                this.invaders.push(new Invader({
                    position: {
                      x: x * 30,
                      y: y * 30
                   }
                }))
            }
        }
       // console.log(this.invaders);
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
    if (this.position.y + this.height >= canvas.height){
        setTimeout(() => {
            player.opacity = 0;
            game.over = true;
            }, 0);
           
            setTimeout(() => {
               
              game.active = false;
              }, 2000);
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
      
       c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
       
    }

    update() {
            this.draw();
    }
       
}

const player = new Player();
const endGame = new EndGame();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
//monitor key strokes
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
    }

}



let frames = 0;
let randomInterval = Math.floor((Math.random() * 1500) + 1000);
let game = {
    over: false,
    active: true
}

let score = 0;
let level = 1;
let ProjectileVelocity = 0;
let enemySpeed = 0;
let enemySpawn  = 0;
let speed = 5;


for (let i = 0; i < 100; i++) {    
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
        color: 'white'

    }))
}
function createParticles({object, color, fades}) {
    //particle effect when enemy is hit
    for (let i = 0; i < 15; i++) {    
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
           color: color || '#BAA0DE',
           fades: fades

       }))
   }
}

function animate() {
    
    if (!game.active) {
        music.stop();
        endGame.update();
        return;
    } 
    if (!music.playing()) {
        music.play();
    }
    //level Progression
    console.log(game.over);
    if (score <= 5000) {
        ProjectileVelocity = 1;
        enemySpeed = 1;
        enemySpawn  = 1500;
    } else if (score > 5000 && score <= 12000) {
        ProjectileVelocity = 2;
        enemySpeed = 1.5;
        enemySpawn  = 1500;
        level = 2;
        levelEl.innerHTML = level;
    } else if (score > 12000 && score <= 20000) {
        ProjectileVelocity = 2;
        enemySpeed = 2;
        enemySpawn  = 1000;
        level = 3;
        levelEl.innerHTML = level;
    } else if (score > 20000 && score <= 30000) {
        ProjectileVelocity = 3;
        enemySpeed = 2.5;
        enemySpawn  = 1000;
        level = 4;
        levelEl.innerHTML = level;
    } else if (score > 30000 && score <= 50000) {
        ProjectileVelocity = 3;
        enemySpeed = 3;
        enemySpawn  = 1000;
        level = 5;
        levelEl.innerHTML = level;
    } else if (score > 50000) {
        ProjectileVelocity = 4;
        enemySpeed = 4;
        enemySpawn  = 500;
        level = 6;
        levelEl.innerHTML = level;
    }

    const rot = 0.15;
    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
   
    particles.forEach((particle, i) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            },0)
        } else {
            particle.update();
        }
    })
   // console.log(particles);
    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        } else {
        invaderProjectile.update();
        
        if (Math.floor(invaderProjectile.position.y + invaderProjectile.height)  ===  Math.floor(player.position.y)  && invaderProjectile.position.x + invaderProjectile.width >= //
             player.position.x && invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
              invaderProjectiles.splice(index, 1);
              player.opacity = 0;
              game.over = true;
              }, 0);
             
              setTimeout(() => {
                game.active = false;
                }, 2000);
            
            console.log('You Lose');
            createParticles({
                object: player,
                color: 'white',
                fades: true
             })
        }
        }
    })
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0){
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        } else {
        projectile.update();
        }
    })
   
    
    grids.forEach((grid, gridIndex) => {
        grid.update();
        //spawn projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
         }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity});
           
            //collision detection and enemy removal
            //projectiles hit enemy
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height && projectile.position.x + projectile.radius //
                     >= invader.position.x && projectile.position.x - projectile.radius <= invader.position.x + invader.width && projectile.position.y //
                      + projectile.radius >= invader.position.y) {
                   
                    setTimeout(() => {
                        //check if invader is in parent grid array
                        const invaderFound = grid.invaders.find(invader2 => {
                            return invader2 === invader;
                        })
                        const projectileFound = projectiles.find(projectile2 => {
                            return projectile2 === projectile;
                        })
                        //remove invader and projectile
                        if (invaderFound && projectileFound){
                            score += 100;
                            scoreEl.innerHTML = score;
                             createParticles({
                                object: invader,
                                fades: true
                             });
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];
                            
                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.y = firstInvader.position.y;
                                grid.position.x = firstInvader.position.x;
                               
                          } else {
                            grids.splice(gridIndex, 1)
                          }
                          
                        }
                    }, 0)
                }
            })
            
        })
    })
    //player movement and canvas boundry
    //player.position.x is left side of player
    if (keys.a.pressed && player.position.x >= 0 && player.position.y <= canvas.height - player.height   //
        && player.position.y > 0) { 
        player.velocity.x = -speed;
        player.rotation = -rot;  
        //player.position.x + player.width is right side of player
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width  && //
         player.position.y <= canvas.height - player.height && player.position.y >= 0) {
        player.velocity.x =  speed;
        player.rotation = rot;
    } else if (keys.w.pressed && player.position.y >= 0 && //
        player.position.x >= 0 && player.position.x + player.width <= canvas.width ){
        player.velocity.y = -speed;
    } else if (keys.s.pressed && player.position.y <= canvas.height - player.height && //
         player.position.x >= 0 && player.position.x + player.width <= canvas.width ) {          
         player.velocity.y = speed;
    } else {
        player.velocity.x = 0;
        player.velocity.y = 0;
        player.rotation = 0;
    }
    
    
    //randomly spawn invaders
    if (frames % randomInterval === 0){
        grids.push(new Grid());
        randomInterval = Math.floor((Math.random() * enemySpawn) + 1000);
        frames = 0;
    }
    
    frames++;
}

animate();

addEventListener('keydown', ({key}) =>  {
    if (game.over) return;

    switch (key) {

        case 'a':
            console.log('left');
            keys.a.pressed = true;
            break;
        case 'w':
            console.log('up');
            keys.w.pressed = true;
             break;    
        case 'd':
            console.log('right');
            keys.d.pressed = true;
             break;    
        case 's':
            console.log('down');
            keys.s.pressed = true;
             break;         
        case ' ':
            console.log('space');
          if (!keys.space.pressed){
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
            }, 10);
          }
           // console.log(projectiles);
            keys.space.pressed = true;
           
             break;               
    }
})

addEventListener('keyup', ({key}) =>  {
    switch (key) {
       
        case 'a':
            console.log('left');
            keys.a.pressed = false;
            player.rotation = 0; 
            break;
        case 'w':
            console.log('up');
            keys.w.pressed = false;
             break;    
        case 'd':
            console.log('right');
            keys.d.pressed = false;
            player.rotation = 0; 
             break;    
        case 's':
            console.log('down');
            keys.s.pressed = false;
             break;         
        case ' ':
            console.log('space');
            keys.space.pressed = false;
             break;               
    }
})