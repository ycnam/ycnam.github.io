(function () {
  const mountEl = document.getElementById('p5-canvas');
  if (!mountEl || typeof window === 'undefined' || typeof window.p5 !== 'function') {
    return;
  }

  new window.p5((p) => {
    const baseW = 960;
    const baseH = 540;

    const scriptLines = [
      '새의 숫자와 관련한 논증',
      'Argumentum Ornithologicum',
      'Jorge Luis Borges',
      '숫자와 기호, 그리고 반복',
      '보이는 것과 믿는 것의 간격',
      '한 마리, 열 마리, 끝없는 군집',
      '새들은 계산될 수 있을까?',
      '혹은 단지 흔적으로만 남을까?'
    ];

    let tick = 0;
    let trailAlpha = 16;

    function drawBirdShape(x, y, scale, rot, alpha) {
      p.push();
      p.translate(x, y);
      p.rotate(rot);
      p.scale(scale);
      p.noStroke();
      p.fill(255, alpha);
      p.beginShape();
      p.vertex(-34, 10);
      p.bezierVertex(-18, -22, -4, -20, 0, -6);
      p.bezierVertex(4, -20, 18, -22, 34, 10);
      p.bezierVertex(16, 0, 0, 2, -16, 0);
      p.endShape(p.CLOSE);
      p.pop();
    }

    p.setup = () => {
      const w = p.constrain(mountEl.clientWidth || baseW, 460, baseW);
      const h = p.floor((w / baseW) * baseH);
      p.createCanvas(w, h);
      p.frameRate(30);
      p.background(255);
      p.textFont('sans-serif');
      p.textAlign(p.CENTER, p.CENTER);
      p.noStroke();
    };

    p.draw = () => {
      const sx = p.width / baseW;
      const sy = p.height / baseH;

      p.push();
      p.scale(sx, sy);

      p.fill(0, trailAlpha);
      p.rect(0, 0, baseW, baseH);

      for (let i = 0; i < 2; i += 1) {
        const nx = p.random(baseW);
        const ny = p.random(baseH);
        const digit = p.floor(p.random(10));
        p.push();
        p.translate(nx, ny);
        p.rotate(p.random(-0.5, 0.5));
        p.fill(p.random(20, 50), 90);
        p.textSize(p.random(18, 44));
        p.text(String(digit), 0, 0);
        p.pop();
      }

      if (tick % 9 === 0) {
        p.push();
        p.translate(p.random(baseW), p.random(baseH));
        p.fill(0, 15);
        p.textSize(p.random(180, 420));
        p.text(String(p.floor(p.random(10))), 0, 0);
        p.pop();
      }

      const lineIndex = p.floor(tick / 120) % scriptLines.length;
      const current = scriptLines[lineIndex];

      p.fill(255, 236);
      p.textSize(38);
      p.text(current, baseW * 0.5 + p.random(-1.3, 1.3), baseH * 0.5 + p.random(-3.1, 3.1));

      p.fill(255, 60);
      p.textSize(22);
      p.text(
        scriptLines[(lineIndex + 3) % scriptLines.length],
        baseW * 0.18,
        p.random(baseH * 0.12, baseH * 0.88)
      );

      const shapeBeat = p.sin(tick * 0.05);
      if (lineIndex === 2 || lineIndex === 6) {
        const x = baseW * 0.5 + p.sin(tick * 0.03) * 210;
        const y = baseH * 0.5 + p.cos(tick * 0.04) * 70;
        drawBirdShape(x, y, 1.2, tick * -0.03, 190);
      }

      if (lineIndex >= 4) {
        for (let i = 0; i < 3; i += 1) {
          const phase = tick * 0.04 + i * 1.9;
          const x = p.map(p.sin(phase), -1, 1, baseW * 0.2, baseW * 0.8);
          const y = p.map(p.cos(phase * 1.3), -1, 1, baseH * 0.35, baseH * 0.72);
          drawBirdShape(x, y, 0.52 + p.abs(shapeBeat) * 0.22, phase, 120);
        }
      }

      p.fill(255, 110);
      p.textSize(16);
      p.text('press mouse to invert', baseW * 0.5, baseH - 26);

      if (p.mouseIsPressed) {
        p.blendMode(p.DIFFERENCE);
        p.fill(255, 130);
        p.rect(0, 0, baseW, baseH);
        p.blendMode(p.BLEND);
      }

      p.pop();

      trailAlpha = p.mouseIsPressed ? 30 : 16;
      tick += 1;
      if (tick > 100000) {
        tick = 0;
      }
    };
  }, mountEl);
})();
