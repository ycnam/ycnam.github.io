(function () {
  const mountEl = document.getElementById('p5-canvas');
  if (!mountEl || typeof window === 'undefined' || typeof window.p5 !== 'function') {
    return;
  }

  new window.p5((p) => {
    const baseW = 960;
    const baseH = 360;

    const phrase = '너의목소리가들려';
    const phrasePressed = '아무리막아보려해도';

    let angleSin = 0;
    let angleCos = 0;
    let angleTan = 0;
    let pulse = 0;

    function drawSpeaker(x, y, wobble) {
      p.push();
      p.translate(x, y);
      p.noStroke();
      p.fill(55);
      p.rect(-24, -34, 48, 68, 4);
      p.fill(95);
      p.rect(-20, -30, 40, 60, 4);
      p.fill(40);
      p.circle(0, -11, 20 + wobble * 2.2);
      p.fill(22);
      p.circle(0, 12, 30 + wobble * 5.2);
      p.fill(115);
      p.circle(0, 12, 10 + wobble * 2.6);
      p.pop();
    }

    function drawEar(x, y, wobble) {
      p.push();
      p.translate(x, y);
      p.noFill();
      p.stroke(180);
      p.strokeWeight(5);
      p.ellipse(0, 0, 52 + wobble * 2, 88 + wobble * 2);
      p.stroke(150);
      p.strokeWeight(3);
      p.arc(2, 2, 28, 46, -p.HALF_PI * 0.6, p.HALF_PI * 1.35);
      p.arc(2, 15, 18, 25, -p.HALF_PI * 0.6, p.HALF_PI * 1.35);
      p.pop();
    }

    p.setup = () => {
      const w = p.constrain(mountEl.clientWidth || baseW, 460, baseW);
      const h = p.floor((w / baseW) * baseH);
      p.createCanvas(w, h);
      p.frameRate(36);
      p.textFont('sans-serif');
      p.textAlign(p.CENTER, p.CENTER);
      p.colorMode(p.HSB, 360, 100, 100, 255);
    };

    p.draw = () => {
      const sx = p.width / baseW;
      const sy = p.height / baseH;

      p.push();
      p.scale(sx, sy);
      p.background(0, 0, 5);

      angleTan += 0.008;
      angleCos += 0.013;
      const tanValue = p.tan(angleTan);
      const cosValue = p.cos(angleCos);
      const ampBase = p.map(cosValue, -1, 1, 40, 135);
      const amp = p.mouseIsPressed ? ampBase * 1.75 : ampBase;

      pulse = p.lerp(pulse, p.mouseIsPressed ? 1 : 0.28, 0.18);
      const wobble = p.sin(p.frameCount * 0.2) * pulse;

      drawSpeaker(68, baseH * 0.5, p.abs(wobble));
      drawEar(baseW - 54, baseH * 0.5, p.abs(wobble));

      const currentPhrase = p.mouseIsPressed ? phrasePressed : phrase;
      let charIndex = 0;

      for (let x = 100; x < baseW - 90; x += 18) {
        angleSin += tanValue;
        if (p.mouseIsPressed) {
          angleSin += p.random(0.05, 0.55);
        }
        const sinValue = p.sin(angleSin);
        const y = baseH * 0.5 + sinValue * amp;

        for (let i = 0; i < 3; i += 1) {
          const tx = x + i * 4;
          const y2 = baseH * 0.5 + p.sin(angleSin - angleTan * (i + 1)) * (amp * 0.85);
          p.strokeWeight(0.8);
          p.stroke(p.map(sinValue, -1, 1, 180, 340), 10, p.mouseIsPressed ? 100 : 82, 220);
          p.line(tx, y, tx, y2);
        }

        const ch = currentPhrase[charIndex % currentPhrase.length];
        const ts = p.map(sinValue, -1, 1, 9, p.mouseIsPressed ? 24 : 18);
        p.textSize(ts);
        if (p.mouseIsPressed) {
          p.fill(p.random(0, 360), 90, 100, 235);
        } else {
          p.fill(0, 0, 86, 230);
        }
        p.noStroke();
        p.text(ch, x, y);
        charIndex += 1;
      }

      p.strokeWeight(1.3);
      p.stroke(0, 0, 100, 38 + pulse * 70);
      p.noFill();
      p.beginShape();
      for (let x = 100; x < baseW - 90; x += 8) {
        const y = baseH * 0.5 + p.sin(angleSin * 0.5 + x * 0.02) * amp * 0.42;
        p.curveVertex(x, y);
      }
      p.endShape();

      p.pop();

      angleSin = 0;
      if (p.frameCount % 600 === 0) {
        angleTan = 0;
      }
    };
  }, mountEl);
})();
