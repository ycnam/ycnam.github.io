(function () {
  const mountEl = document.getElementById('p5-canvas');
  if (!mountEl || typeof window === 'undefined' || typeof window.p5 !== 'function') {
    return;
  }

  new window.p5((p) => {
    const canvasBaseW = 920;
    const canvasBaseH = 560;
    const sidebarW = 190;
    const playW = canvasBaseW - sidebarW;

    const colors = {
      bg: [8, 10, 16],
      wall: [230, 90, 70],
      spring: [40, 120, 235],
      ui: [255, 220, 40],
      text: [245, 248, 255],
      bad: [255, 120, 90],
      good: [80, 240, 160],
    };

    const balloons = [];
    const particles = [];

    const obstacles = [
      { x: 210, y: 130, w: 28, h: 130, spring: false },
      { x: 410, y: 80, w: 28, h: 90, spring: true },
      { x: 560, y: 250, w: 120, h: 22, spring: false },
      { x: 620, y: 380, w: 100, h: 20, spring: true },
    ];

    const movingObstacle = {
      cx: 470,
      cy: 300,
      radius: 130,
      angle: 0,
      size: 28,
      x: 470,
      y: 300,
    };

    const fan = {
      x: 28,
      y: canvasBaseH * 0.5,
      targetY: canvasBaseH * 0.5,
      level: 1,
      speed: 26,
      spin: 0,
      forceMap: [0, 0.12, 0.42, 0.8, 1.4],
    };

    let spawnCounter = 0;
    let spawned = 0;
    const spawnLimit = 20;
    let score = 0;
    let combo = 0;

    function spawnBalloon() {
      if (spawned >= spawnLimit) {
        return;
      }
      const type = p.floor(p.random(6));
      const toTop = type <= 2;
      const hue = toTop ? p.random(190, 230) : p.random(100, 145);
      const sat = toTop ? 75 : 65;
      const bri = toTop ? 100 : 95;
      balloons.push({
        x: 95,
        y: canvasBaseH + p.random(12, 58),
        vx: p.random(-0.12, 0.08),
        vy: p.random(-0.9, -0.45),
        r: p.random(14, 23),
        type,
        toTop,
        hue,
        sat,
        bri,
      });
      spawned += 1;
    }

    function burst(x, y, isGood) {
      for (let i = 0; i < 12; i += 1) {
        const a = p.random(p.TWO_PI);
        const s = p.random(0.9, 3.3);
        particles.push({
          x,
          y,
          vx: p.cos(a) * s,
          vy: p.sin(a) * s,
          life: 30,
          color: isGood ? colors.good : colors.bad,
        });
      }
    }

    function removeBalloon(idx) {
      balloons.splice(idx, 1);
    }

    function collideRectCircle(b, r) {
      const closestX = p.constrain(b.x, r.x, r.x + r.w);
      const closestY = p.constrain(b.y, r.y, r.y + r.h);
      const dx = b.x - closestX;
      const dy = b.y - closestY;
      return dx * dx + dy * dy <= b.r * b.r;
    }

    function updateFanControl() {
      if (p.keyIsDown(p.UP_ARROW)) {
        fan.targetY -= fan.speed * 0.18;
      }
      if (p.keyIsDown(p.DOWN_ARROW)) {
        fan.targetY += fan.speed * 0.18;
      }
      fan.targetY = p.constrain(fan.targetY, 52, canvasBaseH - 62);
      fan.y = p.lerp(fan.y, fan.targetY, 0.18);
      fan.spin += (fan.level + 0.25) * 0.26;
    }

    function updateMovingObstacle() {
      movingObstacle.angle += 0.014;
      movingObstacle.x = movingObstacle.cx + p.cos(movingObstacle.angle) * movingObstacle.radius;
      movingObstacle.y = movingObstacle.cy + p.sin(movingObstacle.angle * 1.2) * movingObstacle.radius * 0.66;
    }

    function updateBalloons() {
      const wind = fan.forceMap[fan.level] || 0;
      for (let i = balloons.length - 1; i >= 0; i -= 1) {
        const b = balloons[i];

        const dx = b.x - fan.x;
        const dy = b.y - fan.y;
        if (dx > 0 && dx < 210 && p.abs(dy) < 72) {
          const amp = (1 - dx / 210) * wind;
          b.vx += amp * 0.16;
          b.vy += (-dy / 100) * amp * 0.12;
        }

        b.vy -= 0.005;
        b.vx *= 0.994;
        b.vy *= 0.997;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx *= -0.45;
        }
        if (b.y + b.r > canvasBaseH) {
          b.y = canvasBaseH - b.r;
          b.vy *= -0.68;
        }

        let popped = false;
        for (let j = 0; j < obstacles.length; j += 1) {
          const o = obstacles[j];
          if (!collideRectCircle(b, o)) {
            continue;
          }
          if (o.spring) {
            b.vx *= -1.08;
            b.vy *= -1.08;
            b.x += b.vx * 2;
            b.y += b.vy * 2;
          } else {
            combo = 0;
            score -= 300;
            burst(b.x, b.y, false);
            removeBalloon(i);
            popped = true;
          }
          break;
        }
        if (popped) {
          continue;
        }

        const mdx = b.x - movingObstacle.x;
        const mdy = b.y - movingObstacle.y;
        const mDist = p.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < movingObstacle.size + b.r * 0.9) {
          combo = 0;
          score -= 300;
          burst(b.x, b.y, false);
          removeBalloon(i);
          continue;
        }

        if (b.y + b.r < -8) {
          const good = b.toTop;
          combo = good ? combo + 1 : 0;
          score += good ? 120 * p.max(combo, 1) : -260;
          burst(b.x, b.y, good);
          removeBalloon(i);
          continue;
        }

        if (b.x - b.r > playW + 6) {
          const good = !b.toTop;
          combo = good ? combo + 1 : 0;
          score += good ? 220 * p.max(combo, 1) : -260;
          burst(playW - 4, b.y, good);
          removeBalloon(i);
        }
      }
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.98;
        pt.vy *= 0.98;
        pt.life -= 1;
        if (pt.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }

    function drawPlayfield() {
      p.push();
      p.noStroke();
      p.fill(15, 16, 24);
      p.rect(0, 0, playW, canvasBaseH);

      p.fill(35, 45, 70);
      p.rect(0, 0, 300, 18);
      p.rect(470, 0, 210, 18);
      p.rect(playW - 25, 230, 25, 130);

      for (let i = 0; i < obstacles.length; i += 1) {
        const o = obstacles[i];
        p.fill(o.spring ? colors.spring : colors.wall);
        p.rect(o.x, o.y, o.w, o.h);
      }

      p.fill(colors.wall[0], colors.wall[1], colors.wall[2]);
      p.circle(movingObstacle.x, movingObstacle.y, movingObstacle.size * 2);
      p.pop();
    }

    function drawBalloons() {
      p.colorMode(p.HSB, 360, 100, 100, 255);
      for (let i = 0; i < balloons.length; i += 1) {
        const b = balloons[i];
        p.push();
        p.translate(b.x, b.y);
        p.fill(b.hue, b.sat, b.bri);
        p.stroke(255, 35);
        p.strokeWeight(1);
        p.ellipse(0, 0, b.r * 2.1, b.r * 2.45);
        p.noStroke();
        p.fill(0, 0, 100, 120);
        p.ellipse(-b.r * 0.3, -b.r * 0.35, b.r * 0.6, b.r * 0.9);
        p.stroke(255, 90);
        p.strokeWeight(1.1);
        p.line(0, b.r * 1.15, 0, b.r * 2.1);

        if (b.toTop) {
          p.noStroke();
          p.fill(0, 0, 20, 190);
          p.triangle(0, -b.r * 0.45, -4, -b.r * 0.15, 4, -b.r * 0.15);
        } else {
          p.noStroke();
          p.fill(0, 0, 20, 190);
          p.triangle(b.r * 0.35, 0, b.r * 0.05, -4, b.r * 0.05, 4);
        }
        p.pop();
      }
      p.colorMode(p.RGB, 255, 255, 255, 255);
    }

    function drawFan() {
      p.push();
      p.stroke(180);
      p.strokeWeight(8);
      p.line(fan.x, 46, fan.x, canvasBaseH - 44);
      p.translate(fan.x, fan.y);
      p.rotate(fan.spin);
      p.noStroke();
      p.fill(255, 225, 60);
      p.rect(-3, -25, 6, 50);
      p.rect(-25, -3, 50, 6);
      p.fill(255, 125, 40);
      p.circle(0, 0, 10);
      p.pop();

      p.noFill();
      p.stroke(140, 190, 255, 30 + fan.level * 25);
      for (let i = 0; i < 3; i += 1) {
        const yOff = (i - 1) * 28;
        p.bezier(
          fan.x + 14,
          fan.y + yOff,
          fan.x + 80,
          fan.y + yOff - 22,
          fan.x + 160,
          fan.y + yOff + 22,
          fan.x + 230,
          fan.y + yOff
        );
      }
    }

    function drawParticles() {
      for (let i = 0; i < particles.length; i += 1) {
        const pt = particles[i];
        p.noStroke();
        p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 8);
        p.circle(pt.x, pt.y, 3.2);
      }
    }

    function drawUi() {
      p.push();
      p.translate(playW, 0);
      p.fill(colors.ui[0], colors.ui[1], colors.ui[2]);
      p.noStroke();
      p.rect(0, 0, sidebarW, canvasBaseH);

      p.fill(18);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(16);
      p.text('BALLOON BLOW', sidebarW * 0.5, 18);
      p.textSize(12);
      p.text('score', sidebarW * 0.5, 62);

      p.textSize(34);
      p.text(p.nf(score, 1), sidebarW * 0.5, 82);
      p.textSize(12);
      p.text('wind level  Q A S D F', sidebarW * 0.5, 155);
      p.textSize(24);
      p.text(fan.level, sidebarW * 0.5, 178);

      p.textSize(12);
      p.text('combo', sidebarW * 0.5, 235);
      p.textSize(26);
      p.text(combo, sidebarW * 0.5, 255);

      p.textSize(12);
      p.text('left balloons', sidebarW * 0.5, 314);
      p.textSize(24);
      p.text(p.max(spawnLimit - spawned + balloons.length, 0), sidebarW * 0.5, 334);

      p.textSize(11);
      p.text('UP/DOWN: fan\nblue -> top\ngreen -> right', sidebarW * 0.5, 405);
      p.pop();
    }

    p.setup = () => {
      const mountWidth = mountEl.clientWidth || canvasBaseW;
      const targetW = p.constrain(mountWidth, 520, canvasBaseW);
      const scale = targetW / canvasBaseW;
      p.createCanvas(targetW, canvasBaseH * scale);
      p.frameRate(60);
      p.textFont('sans-serif');
      spawnBalloon();
    };

    p.draw = () => {
      const sx = p.width / canvasBaseW;
      const sy = p.height / canvasBaseH;
      p.push();
      p.scale(sx, sy);
      p.background(colors.bg[0], colors.bg[1], colors.bg[2]);

      updateFanControl();
      updateMovingObstacle();

      spawnCounter += 1;
      if (spawnCounter % 105 === 0 && spawned < spawnLimit) {
        spawnBalloon();
      }

      updateBalloons();
      updateParticles();

      drawPlayfield();
      drawBalloons();
      drawFan();
      drawParticles();
      drawUi();

      p.pop();
    };

    p.keyPressed = () => {
      if (p.key === 'q' || p.key === 'Q') {
        fan.level = 0;
      } else if (p.key === 'a' || p.key === 'A') {
        fan.level = 1;
      } else if (p.key === 's' || p.key === 'S') {
        fan.level = 2;
      } else if (p.key === 'd' || p.key === 'D') {
        fan.level = 3;
      } else if (p.key === 'f' || p.key === 'F') {
        fan.level = 4;
      }
    };
  }, mountEl);
})();
