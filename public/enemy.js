let enemyShips = loadImage("https://cdn.glitch.com/24f47a7d-8c45-4219-8a3e-b599d1b721b1%2FEnemy-SpaceShips.webp?v=1604809396130");
// let enemyFire = loadImage("./assets/Enemy-Sprites.jpg");
let sprites = [
    {x: 0, y: 15, width: 58, height: 81},
    {x: 432, y: 14, width: 63, height: 83},
    {x: 313, y: 14, width: 104, height: 83},
    {x: 503, y: 14, width: 89, height: 83},
    {x: 72, y: 0, width: 90, height: 111},
    {x: 170, y: 7, width: 126, height: 97}
];

class EnemyDefinition {
    constructor(triggerTime, spriteID, health, spawnx, moveFunction, fireFunction) {
        this.triggerTime = triggerTime;
        this.spriteID = spriteID;
        this.health = health;
        this.spawnx = spawnx; // normalized spawn location

        this.moveFunction = moveFunction;
        this.fireFunction = fireFunction;
    }
}

class Enemy {
    constructor(definition) {
        let sprite = sprites[definition.spriteID];
        this.x = definition.spawnx * width - sprite.width / 2;
        this.y = -sprite.height;
        this.definition = definition;

        this.moveData = [0, 0, 0, 0];
        this.fireData = [0, 0, 0, 0];
    }

    update(dtime, speed, bullets) {
        this.definition.moveFunction(this, dtime, speed);
        this.definition.fireFunction(this, dtime, speed, bullets);
    }

    show() {
        let sprite = sprites[this.definition.spriteID];
        ctx.drawImage(enemyShips, sprite.x, sprite.y, sprite.width, sprite.height, this.x, this.y, sprite.width, sprite.height);
    }
}

class Bullet {
    constructor(x, y, dx, dy) {
        this.pos = {x: x, y: y};
        this.vel = {x: dx, y: dy};
        this.removeFlag = false;
    }
}

// MOVEMENT PATTERNS
Move = {
    None: function(enemy, dtime, scrollSpeed) {
        enemy.y += dtime * scrollSpeed;
    },
    Fast: function(enemy, dtime, scrollSpeed) {
        enemy.y += dtime * scrollSpeed * 3;
    },
    SinNarrow: function(enemy, dtime, scrollSpeed) {
        enemy.y += dtime * scrollSpeed;
        enemy.moveData[0] += dtime;
        enemy.x += 50 * Math.cos(enemy.moveData[0]) * dtime;
    },
    SinWide: function(enemy, dtime, scrollSpeed) {
        enemy.y += dtime * scrollSpeed;
        enemy.moveData[0] += dtime;
        enemy.x += 150 * Math.cos(enemy.moveData[0]) * dtime;
    },
};

// FIRING PATTERNS
Fire = {
    None: function(enemy, dtime, scrollSpeed, bullets) {},
    Straight: function(enemy, dtime, scrollSpeed, bullets) {
        let delay = 0.5;
        enemy.fireData[0] += dtime;
        if (enemy.fireData[0] > delay) {
            enemy.fireData[0] -= delay;
            let bullet = new Bullet(enemy.x + sprites[enemy.definition.spriteID].width / 2,
                enemy.y + sprites[enemy.definition.spriteID].height,
                0,
                200
            );
            bullets.push(bullet);
        }
    },
    CirclePulse2: function(enemy, dtime, scrollSpeed, bullets) {
        let delay = 2;
        let bulletCount = 20;
        let theta = 2 * Math.PI / bulletCount; 
        enemy.fireData[0] += dtime;
        if (enemy.fireData[0] > delay) {
            enemy.fireData[0] -= delay;
            for (let i = 0; i < bulletCount; i++) {
                let bullet = new Bullet(enemy.x + sprites[enemy.definition.spriteID].width / 2,
                    enemy.y + sprites[enemy.definition.spriteID].height / 2,
                    200 * Math.cos(theta * i),
                    200 * Math.sin(theta * i)
                ); 
                bullets.push(bullet); 
            }
        }
    },
    Spiral: function(enemy, dtime, scrollSpeed, bullets) {
        let delay = 0.05;
        enemy.fireData[0] += dtime;
        if (enemy.fireData[0] > delay) {
            enemy.fireData[0] -= delay;
            enemy.fireData[1] += 0.15;
            let bullet = new Bullet(enemy.x + sprites[enemy.definition.spriteID].width/2,
                enemy.y + sprites[enemy.definition.spriteID].height/2,
                200 * Math.cos(enemy.fireData[1]),
                200 * Math.sin(enemy.fireData[1])
            ); 
            bullets.push(bullet); 
        }
    },
};

function distanceSquared(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}