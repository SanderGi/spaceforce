player = {
  x: width / 2,
  y: height - 80,
  speed: 200,
  touchSpeed: 600,
  health: 3,
  spriteID: 0,
  collisionR2: 35 * 35,
};

stars = [];
for (let i = 0; i < 500; i++) {
  stars[i] = {
    x: width * Math.random(),
    y: height * Math.random(),
    size: 1.5 * Math.random() + 1,
  };
}

spawnList = [
  // botttom appears first
  new EnemyDefinition(840, 5, 20, 0.5, Move.None, Fire.Spiral),
  new EnemyDefinition(440, 3, 3, 0.58, Move.None, Fire.None),
  new EnemyDefinition(440, 0, 3, 0.3, Move.SinNarrow, Fire.None),
  new EnemyDefinition(380, 5, 3, 0.9, Move.None, Fire.CirclePulse2),
  new EnemyDefinition(380, 4, 3, 0.7, Move.None, Fire.Straight),
  new EnemyDefinition(380, 1, 3, 0.25, Move.SinWide, Fire.Straight),
  new EnemyDefinition(360, 2, 3, 0.4, Move.Fast, Fire.Straight),
  new EnemyDefinition(240, 0, 3, 0.7, Move.Fast, Fire.None),
  new EnemyDefinition(210, 0, 3, 0.7, Move.Fast, Fire.None),
  new EnemyDefinition(180, 0, 3, 0.7, Move.Fast, Fire.None),
  new EnemyDefinition(150, 0, 3, 0.7, Move.Fast, Fire.None),
  new EnemyDefinition(120, 0, 3, 0.7, Move.Fast, Fire.Straight),
  new EnemyDefinition(120, 0, 3, 0.3, Move.Fast, Fire.None),
  new EnemyDefinition(90, 0, 3, 0.3, Move.Fast, Fire.None),
  new EnemyDefinition(60, 0, 3, 0.3, Move.Fast, Fire.None),
  new EnemyDefinition(30, 0, 3, 0.3, Move.Fast, Fire.None),
  new EnemyDefinition(0, 0, 3, 0.3, Move.Fast, Fire.Straight),
];
enemyList = [];
enemyBullets = [];

playerBullets = [];
playerReloadDelay = 0.4;
playerReloadTimer = 0;

fragments = [];

worldSpeed = 30;
worldPos = 0;
winMoment = Infinity;
deathMoment = Infinity;

let playerShips = loadImage("/assets/Spaceships.png");
let playerSprites = [
  { x: 5, y: 50, width: 85, height: 68 },
  { x: 127, y: 46, width: 84, height: 77 },
  { x: 241, y: 36, width: 97, height: 97 },
];
function drawShip(x, y, ID) {
  let sprite = playerSprites[ID];
  ctx.drawImage(
    playerShips,
    sprite.x,
    sprite.y,
    sprite.width,
    sprite.height,
    x - sprite.width / 2,
    y - sprite.height / 2,
    sprite.width,
    sprite.height
  );
  // ctx.strokeStyle = "lime";
  // ctx.beginPath();
  // ctx.arc(x, y, Math.sqrt(player.collisionR2), 0, 2 * Math.PI);
  // ctx.closePath();
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(x, y - radius);
  // ctx.lineTo(x - 0.866 * radius, y + 0.5 * radius);
  // ctx.lineTo(x + 0.866 * radius, y + 0.5 * radius);
  // ctx.closePath();
  // ctx.fillStyle = "blue";
  // ctx.fill();
}

function fillStar(x, y, r, n, inset) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, 0 - r);
  ctx.rotate(Math.PI / 4);
  for (var i = 0; i < n; i++) {
    ctx.rotate(Math.PI / n);
    ctx.lineTo(0, 0 - r * inset);
    ctx.rotate(Math.PI / n);
    ctx.lineTo(0, 0 - r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStars(positions, dtime) {
  ctx.fillStyle = "white";
  positions.forEach((pos) => {
    pos.y += (worldSpeed * dtime * Math.max(pos.size, 1)) / 5;
    if (pos.y > height + pos.size) {
      pos.x = width * Math.random();
      pos.y = -pos.size;
    } else {
      fillStar(pos.x, pos.y, pos.size, 4, pos.size * 0.999);
    }
  });
}

let offset = { x: 0, y: 0 };
let hastouched = false;
function update(dtime) {
  // INPUT
  if (Key.isDown(Key.UP)) player.y -= dtime * player.speed;
  if (Key.isDown(Key.LEFT)) player.x -= dtime * player.speed;
  if (Key.isDown(Key.DOWN)) player.y += dtime * player.speed;
  if (Key.isDown(Key.RIGHT)) player.x += dtime * player.speed;

  if (Touch.isDown) {
    if (!hastouched) {
      hastouched = true;
      offset = {
        x: Touch.startposition.x - player.x,
        y: Touch.startposition.y - player.y,
      };
    }
    dx = player.x - Touch.position.x + offset.x;
    dy = player.y - Touch.position.y + offset.y;
    distance = Math.sqrt(dx * dx + dy * dy);
    maxDistance = dtime * player.touchSpeed;
    if (distance > maxDistance) {
      ratio = maxDistance / distance;
      player.x -= dx * ratio;
      player.y -= dy * ratio;
    } else {
      player.x -= dx;
      player.y -= dy;
    }
  } else {
    hastouched = false;
  }

  // clamp player
  if (player.x > width) player.x = width;
  else if (player.x < 0) player.x = 0;
  if (player.y > height) player.y = height;
  else if (player.y < 0) player.y = 0;

  // GAME LOGIC
  worldPos += worldSpeed * dtime;
  playerReloadTimer += dtime;
  if (playerReloadTimer > playerReloadDelay) {
    playerReloadTimer -= playerReloadDelay;
    let bullet = new Bullet(
      player.x,
      player.y - playerSprites[player.spriteID].height / 2,
      0,
      -200
    );
    playerBullets.push(bullet);
  }

  // Spawn enemies
  while (
    spawnList.length != 0 &&
    worldPos >= spawnList[spawnList.length - 1].triggerTime
  ) {
    enemyList.push(new Enemy(spawnList.pop()));
  }

  // update fragments
  for (let i = fragments.length - 1; i >= 0; i--) {
    let particle = fragments[i];
    particle.pos.x += particle.vel.x * dtime;
    particle.pos.y += (particle.vel.y + worldSpeed) * dtime;
    if (
      particle.pos.y > height ||
      particle.removeFlag ||
      particle.pos.x < 0 ||
      particle.pos.x > width ||
      particle.pos.y < 0
    )
      fragments.splice(i, 1);
  }

  // update enemies
  for (let i = enemyList.length - 1; i >= 0; i--) {
    let enemy = enemyList[i];
    enemy.update(dtime, worldSpeed, enemyBullets);
    let sprite = sprites[enemy.definition.spriteID];
    if (enemy.definition.health <= 0) {
      for (let j = 0; j < 100; j++) {
        let theta = 2 * Math.PI * Math.random();
        let velocity = 200 * Math.random() + 50;
        fragments.push(
          new Bullet(
            enemy.x + sprite.width / 2,
            enemy.y + sprite.height / 2,
            velocity * Math.cos(theta),
            velocity * Math.sin(theta)
          )
        );
      }
    }
    if (enemy.y > height || enemy.definition.health <= 0)
      enemyList.splice(i, 1);
  }

  // update bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let bullet = enemyBullets[i];
    bullet.pos.x += bullet.vel.x * dtime;
    bullet.pos.y += (bullet.vel.y + worldSpeed) * dtime;

    let distPlayerSquared = distanceSquared(
      bullet.pos.x,
      bullet.pos.y,
      player.x,
      player.y
    );
    if (distPlayerSquared < player.collisionR2) {
      bullet.removeFlag = true;
      player.health -= 1;
    }
    if (
      bullet.pos.y > height ||
      bullet.removeFlag ||
      bullet.pos.x < 0 ||
      bullet.pos.x > width ||
      bullet.pos.y < 0
    )
      enemyBullets.splice(i, 1);
  }

  for (let i = playerBullets.length - 1; i >= 0; i--) {
    let bullet = playerBullets[i];
    bullet.pos.x += bullet.vel.x * dtime;
    bullet.pos.y += (bullet.vel.y + worldSpeed) * dtime;

    enemyList.forEach((enemy) => {
      let sprite = sprites[enemy.definition.spriteID];
      let distSquared = distanceSquared(
        bullet.pos.x,
        bullet.pos.y,
        enemy.x + sprite.width / 2,
        enemy.y + sprite.height / 2
      );
      if (
        distSquared <
        ((sprite.width + sprite.height) * (sprite.width + sprite.height)) / 18
      ) {
        bullet.removeFlag = true;
        enemy.definition.health -= 1;
      }
    });

    if (
      bullet.pos.y > height ||
      bullet.removeFlag ||
      bullet.pos.x < 0 ||
      bullet.pos.x > width ||
      bullet.pos.y < 0
    )
      playerBullets.splice(i, 1);
  }

  // win and lose conditions
  if (enemyList.length <= 0 && spawnList.length <= 0 && worldPos < winMoment) {
    winMoment = worldPos;
  }
  if (player.health <= 0 && worldPos < deathMoment) {
    deathMoment = worldPos;
    for (let j = 0; j < 100; j++) {
      let theta = 2 * Math.PI * Math.random();
      let velocity = 200 * Math.random() + 50;
      fragments.push(
        new Bullet(
          player.x,
          player.y,
          velocity * Math.cos(theta),
          velocity * Math.sin(theta)
        )
      );
    }
    player.x = NaN;
  }
}

function draw(dtime) {
  ctx.clearRect(0, 0, width, height);

  drawStars(stars, dtime);

  enemyList.forEach((enemy) => {
    enemy.show();
  });

  drawShip(player.x, player.y, player.spriteID);

  ctx.fillStyle = "red";
  enemyBullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.pos.x, bullet.pos.y, 8, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  });

  ctx.fillStyle = "cyan";
  playerBullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.pos.x, bullet.pos.y, 8, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  });

  ctx.fillStyle = "orange";
  fragments.forEach((particle) => {
    ctx.fillRect(particle.pos.x, particle.pos.y, 1, 2);
  });

  let hearts = "";
  for (let i = 0; i < Math.round(player.health); i++) hearts += "❤";
  health.innerHTML = hearts;
}

function loop(timestamp) {
  let dtime = (timestamp - lastRender) / 1000;

  update(dtime);
  draw(dtime);

  // win condition
  if (worldPos > winMoment + 100) {
    alert("VICTORY!!");
    location.replace(location.href);
  }
  // lose condition
  else if (worldPos > deathMoment + 100) {
    let tips = [
      "Tip: Prioritize your fire on the most dangerous enemies",
      "Tip: A wasted bullet is a wasted opportunity",
      "Tip: Take out straight shooting enemies before their bullets reach the end",
      "Trick: You can partly hide on the edges of the screen",
      "Tip: Learn the level to anticipate enemy positions with concentrated fire",
      "Tip: Use your speed to navigate to favorable positions",
      "Trick: Get out of a jam by strategically getting hit to avoid fatal damage",
      "Trick: Moving ahead of certain shooting patterns allows you to outrun the enemy bullets",
      "Trick: A wall of enemy fire can often be avoided by flying around it",
      "Tip: Don't get distracted looking at the background",
      "Tip: Give your eyes a break every once in a while",
      "Tip: Choose your battles wisely",
      "Pro tip: A shot only counts as a hit if within a certain radius of a player/enemy",
      "Trick: You can slightly touch bullets and they will glide of your armor",
      "Pro tip: The most important thing is to have fun",
      "Tip: If you don't get it on the first try, you're guaranteed to get it on a later attempt as long as you keep trying",
      "Tip: Keep your finger in a position where both your ship and incoming fire is visible",
      "Tip: It is always possible, you just have to find the right path through enemy fire",
      "Tip: See an opening? Take it! Unless you know it is a trap from a previous attempt...",
    ];
    alert("You died :( \n" + tips[Math.floor(tips.length * Math.random())]);
    location.replace(location.href);
  } else {
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
  }
}
var lastRender = 0;
window.onload = function () {
  window.requestAnimationFrame(loop);
};
// function imgLoaded() {
//     window.requestAnimationFrame(loop);
// }
