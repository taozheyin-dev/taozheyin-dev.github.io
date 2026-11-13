(() => {
  'use strict';

  /* ==========================================================================
     0. Mobile Navigation Toggle
     ========================================================================== */
  const menuBtn = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ==========================================================================
     1. XOR Dataset, Parameter Metadata & Mathematical Engine (Float64)
     ========================================================================== */
  const X_DATA = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ];
  const Y_DATA = [0, 1, 1, 0];
  const SAMPLE_BITS = ['00', '01', '10', '11'];
  const TOTAL_EPOCHS = 300;

  // Ordered as: [w11, w21, b_h1, w12, w22, b_h2, v1, v2, b_o]
  const NEURON_ROWS = [
    {
      title: '隐藏神经元 h₁',
      desc: '接收 x₁、x₂，训练后专门响应 (1, 0) 样本',
      formula: 'h₁ = σ(w₁₁x₁ + w₂₁x₂ + b_h1)',
      color: '#7fb8e0',
      params: [
        { idx: 0, key: 'w11', sym: 'w₁₁', role: 'x₁ → h₁ 权重' },
        { idx: 1, key: 'w21', sym: 'w₂₁', role: 'x₂ → h₁ 权重' },
        { idx: 2, key: 'b_h1', sym: 'b_h1', role: 'h₁ 偏置' }
      ]
    },
    {
      title: '隐藏神经元 h₂',
      desc: '接收 x₁、x₂，训练后专门响应 (0, 1) 样本',
      formula: 'h₂ = σ(w₁₂x₁ + w₂₂x₂ + b_h2)',
      color: '#e8c66a',
      params: [
        { idx: 3, key: 'w12', sym: 'w₁₂', role: 'x₁ → h₂ 权重' },
        { idx: 4, key: 'w22', sym: 'w₂₂', role: 'x₂ → h₂ 权重' },
        { idx: 5, key: 'b_h2', sym: 'b_h2', role: 'h₂ 偏置' }
      ]
    },
    {
      title: '输出神经元 ŷ',
      desc: '合并 h₁、h₂ 的特征，在隐藏平面画出分类直线',
      formula: 'ŷ = σ(v₁h₁ + v₂h₂ + b_o)',
      color: '#4cc59a',
      params: [
        { idx: 6, key: 'v1', sym: 'v₁', role: 'h₁ → ŷ 权重' },
        { idx: 7, key: 'v2', sym: 'v₂', role: 'h₂ → ŷ 权重' },
        { idx: 8, key: 'b_o', sym: 'b_o', role: 'ŷ 偏置' }
      ]
    }
  ];

  function sigmoid(z) {
    if (z >= 0) {
      const ez = Math.exp(-z);
      return 1 / (1 + ez);
    }
    const ez = Math.exp(z);
    return ez / (1 + ez);
  }

  function activate(z, act) {
    return act === 'tanh' ? Math.tanh(z) : sigmoid(z);
  }

  function activateDeriv(a, act) {
    return act === 'tanh' ? 1 - a * a : a * (1 - a);
  }

  function bceWithLogits(z, y) {
    const maxVal = z > 0 ? z : 0;
    return maxVal - z * y + Math.log(1 + Math.exp(-Math.abs(z)));
  }

  function getInitialParams(preset) {
    if (preset === 'random') {
      // [w11, w21, b_h1, w12, w22, b_h2, v1, v2, b_o]
      return [1.35, -1.45, -0.60, -1.10, 1.25, -0.50, 2.10, 1.90, -1.40];
    }
    if (preset === 'asym') {
      return [2.60, -1.50, -1.20, -1.40, 2.20, -0.80, 2.40, 3.20, -2.10];
    }
    // Textbook default: W=[[2,-2],[-2,2]], b_hidden=[-1,-1], v=[[3],[3]], b_output=[-2.5]
    return [2.0, -2.0, -1.0, -2.0, 2.0, -1.0, 3.0, 3.0, -2.5];
  }

  function simulateTraining(preset, opt, lr, act) {
    const theta = getInitialParams(preset).slice();
    const m = new Array(9).fill(0);
    const s = new Array(9).fill(0);
    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    const snapshots = [];

    for (let epoch = 0; epoch <= TOTAL_EPOCHS; epoch++) {
      const [w11, w21, bh1, w12, w22, bh2, v1, v2, bo] = theta;
      const zHidden = [];
      const h = [];
      const zOutput = [];
      const probs = [];
      let lossSum = 0;
      let correctCount = 0;

      for (let i = 0; i < 4; i++) {
        const [x1, x2] = X_DATA[i];
        const zh1 = x1 * w11 + x2 * w21 + bh1;
        const zh2 = x1 * w12 + x2 * w22 + bh2;
        const h1 = activate(zh1, act);
        const h2 = activate(zh2, act);
        const zo = h1 * v1 + h2 * v2 + bo;
        const p = sigmoid(zo);

        zHidden.push([zh1, zh2]);
        h.push([h1, h2]);
        zOutput.push(zo);
        probs.push(p);
        lossSum += bceWithLogits(zo, Y_DATA[i]);
        if ((p >= 0.5 ? 1 : 0) === Y_DATA[i]) correctCount++;
      }

      const loss = lossSum / 4;
      const acc = correctCount / 4;

      // Backward pass
      let gw11 = 0, gw21 = 0, gbh1 = 0;
      let gw12 = 0, gw22 = 0, gbh2 = 0;
      let gv1 = 0, gv2 = 0, gbo = 0;
      const dzOutArr = [];
      const dzHidArr = [];

      for (let i = 0; i < 4; i++) {
        const [x1, x2] = X_DATA[i];
        const [h1, h2] = h[i];
        const dzo = (probs[i] - Y_DATA[i]) / 4;
        dzOutArr.push(dzo);

        gv1 += h1 * dzo;
        gv2 += h2 * dzo;
        gbo += dzo;

        const dh1 = dzo * v1;
        const dh2 = dzo * v2;
        const dzh1 = dh1 * activateDeriv(h1, act);
        const dzh2 = dh2 * activateDeriv(h2, act);
        dzHidArr.push([dzh1, dzh2]);

        gw11 += x1 * dzh1;
        gw21 += x2 * dzh1;
        gbh1 += dzh1;

        gw12 += x1 * dzh2;
        gw22 += x2 * dzh2;
        gbh2 += dzh2;
      }

      const grads = [gw11, gw21, gbh1, gw12, gw22, gbh2, gv1, gv2, gbo];
      const deltas = new Array(9).fill(0);

      const tStep = epoch + 1;
      for (let k = 0; k < 9; k++) {
        if (opt === 'adam') {
          const mt = beta1 * m[k] + (1 - beta1) * grads[k];
          const st = beta2 * s[k] + (1 - beta2) * grads[k] * grads[k];
          const mHat = mt / (1 - Math.pow(beta1, tStep));
          const sHat = st / (1 - Math.pow(beta2, tStep));
          deltas[k] = -lr * mHat / (Math.sqrt(sHat) + eps);
          if (epoch < TOTAL_EPOCHS) {
            m[k] = mt;
            s[k] = st;
          }
        } else {
          deltas[k] = -(lr * 8.0) * grads[k];
        }
      }

      snapshots.push({
        epoch,
        params: theta.slice(),
        grads,
        deltas,
        W: [[w11, w12], [w21, w22]],
        b_hidden: [bh1, bh2],
        v: [v1, v2],
        b_output: bo,
        z_hidden: zHidden,
        h,
        z_output: zOutput,
        probs,
        dz_out: dzOutArr,
        dz_hid: dzHidArr,
        loss,
        acc,
        correctCount
      });

      if (epoch < TOTAL_EPOCHS) {
        for (let k = 0; k < 9; k++) {
          theta[k] += deltas[k];
        }
      }
    }

    return snapshots;
  }

  /* ==========================================================================
     2. Application State & DOM References
     ========================================================================== */
  const state = {
    preset: 'textbook',
    opt: 'adam',
    lr: 0.03,
    act: 'sigmoid',
    epoch: 300,
    playing: false,
    speed: 1,
    showLines: true,
    netMode: 'forward',
    sampleIdx: 1,
    hoverParam: null,
    step: 2,
    fw: 'pytorch',
    snapshots: []
  };

  const dom = {
    stageStatus: document.getElementById('stage-status'),
    toggleLines: document.getElementById('toggle-lines'),
    inputBox: document.getElementById('input-box'),
    inputCanvas: document.getElementById('input-canvas'),
    netSvg: document.getElementById('net-svg'),
    netLegendNote: document.getElementById('net-legend-note'),
    hiddenSvg: document.getElementById('hidden-svg'),
    sampleChips: document.getElementById('sample-chips'),
    playBtn: document.getElementById('play-btn'),
    stepBack: document.getElementById('step-back'),
    stepFwd: document.getElementById('step-fwd'),
    speedBtn: document.getElementById('speed-btn'),
    epochNum: document.getElementById('epoch-num'),
    lossSvg: document.getElementById('loss-svg'),
    tlHead: document.getElementById('tl-head'),
    tlDot: document.getElementById('tl-dot'),
    epochRange: document.getElementById('epoch-range'),
    mLoss: document.getElementById('m-loss'),
    mAcc: document.getElementById('m-acc'),
    paramBoard: document.getElementById('param-board'),
    codeDl: document.getElementById('code-dl'),
    codeBody: document.getElementById('code-body'),
    inspEpoch: document.getElementById('insp-epoch'),
    inspTitle: document.getElementById('insp-title'),
    inspDesc: document.getElementById('insp-desc'),
    inspTensor: document.getElementById('insp-tensor')
  };

  function fmtSigned(n, digits = 2) {
    return (n >= 0 ? '+' : '') + n.toFixed(digits);
  }

  /* ==========================================================================
     3. Sample Chips Bar (4 XOR Samples)
     ========================================================================== */
  function initSampleChips() {
    if (!dom.sampleChips) return;
    dom.sampleChips.innerHTML = X_DATA.map((pt, i) => {
      const y = Y_DATA[i];
      return `
        <button type="button" class="sample-chip${i === state.sampleIdx ? ' is-active' : ''}" data-sample="${i}">
          <div class="sample-chip-top">
            <span class="sample-chip-input">样本 ${SAMPLE_BITS[i]} · (${pt[0]}, ${pt[1]})</span>
            <span class="sample-chip-tag ${y === 1 ? 'is-pos' : 'is-neg'}">标签 y = ${y}</span>
          </div>
          <div class="sample-chip-bar">
            <div class="sample-chip-fill" data-fill="${i}" style="width:50%;background:${y === 1 ? '#4cc59a' : '#f08c6c'}"></div>
          </div>
          <div class="sample-chip-meta">
            <span data-prob="${i}">ŷ = —</span>
            <span data-hidden="${i}">h = (—, —)</span>
          </div>
        </button>`;
    }).join('');

    dom.sampleChips.querySelectorAll('.sample-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sampleIdx = Number(btn.getAttribute('data-sample'));
        updateSampleChips(state.snapshots[state.epoch]);
        drawInputCanvas(state.snapshots[state.epoch]);
        drawNetworkSvg(state.snapshots[state.epoch]);
        drawHiddenSvg(state.snapshots[state.epoch]);
      });
    });
  }

  function updateSampleChips(snap) {
    if (!dom.sampleChips || !snap) return;
    dom.sampleChips.querySelectorAll('.sample-chip').forEach((btn, i) => {
      btn.classList.toggle('is-active', i === state.sampleIdx);
      const p = snap.probs[i];
      const [h1, h2] = snap.h[i];
      const fill = btn.querySelector(`[data-fill="${i}"]`);
      const probEl = btn.querySelector(`[data-prob="${i}"]`);
      const hidEl = btn.querySelector(`[data-hidden="${i}"]`);
      if (fill) {
        fill.style.width = `${Math.max(4, Math.min(100, p * 100)).toFixed(1)}%`;
        fill.style.background = p >= 0.5 ? '#4cc59a' : '#f08c6c';
      }
      if (probEl) probEl.textContent = `ŷ = ${p.toFixed(4)}`;
      if (hidEl) hidEl.textContent = `h = (${h1.toFixed(2)}, ${h2.toFixed(2)})`;
    });
  }

  /* ==========================================================================
     4. Panel A: Input Space Probability Field & Decision Boundaries (Canvas)
     ========================================================================== */
  function probToColor(p) {
    // Dark-stage palette:
    // p = 0.0 -> warm coral (#d86c51)
    // p = 0.5 -> deep slate-forest (#14211b)
    // p = 1.0 -> bright emerald (#3cb88c)
    if (p < 0.5) {
      const t = p / 0.5; // 0 at p=0, 1 at p=0.5
      return [
        Math.round(188 * (1 - t) + 20 * t),
        Math.round(92 * (1 - t) + 33 * t),
        Math.round(72 * (1 - t) + 27 * t)
      ];
    }
    const t = (p - 0.5) / 0.5; // 0 at p=0.5, 1 at p=1
    return [
      Math.round(20 * (1 - t) + 54 * t),
      Math.round(33 * (1 - t) + 172 * t),
      Math.round(27 * (1 - t) + 130 * t)
    ];
  }

  function clipLineToBox(a, b, c, minC, maxC) {
    const pts = [];
    const eps = 1e-9;
    if (Math.abs(b) > eps) {
      const yAtMinX = (-c - a * minC) / b;
      if (yAtMinX >= minC - 1e-6 && yAtMinX <= maxC + 1e-6) pts.push([minC, yAtMinX]);
      const yAtMaxX = (-c - a * maxC) / b;
      if (yAtMaxX >= minC - 1e-6 && yAtMaxX <= maxC + 1e-6) pts.push([maxC, yAtMaxX]);
    }
    if (Math.abs(a) > eps) {
      const xAtMinY = (-c - b * minC) / a;
      if (xAtMinY > minC + 1e-6 && xAtMinY < maxC - 1e-6) pts.push([xAtMinY, minC]);
      const xAtMaxY = (-c - b * maxC) / a;
      if (xAtMaxY > minC + 1e-6 && xAtMaxY < maxC - 1e-6) pts.push([xAtMaxY, maxC]);
    }
    return pts.length >= 2 ? [pts[0], pts[1]] : null;
  }

  function drawInputCanvas(snap) {
    const canvas = dom.inputCanvas;
    if (!canvas || !snap) return;
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.max(220, Math.round(rect.width || 320));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pxSize = Math.round(cssSize * dpr);
    if (canvas.width !== pxSize || canvas.height !== pxSize) {
      canvas.width = pxSize;
      canvas.height = pxSize;
    }

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);

    const W = cssSize;
    const H = cssSize;
    const pad = 34;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const minC = -0.25;
    const maxC = 1.25;

    const toX = (x) => pad + ((x - minC) / (maxC - minC)) * plotW;
    const toY = (y) => pad + (1 - (y - minC) / (maxC - minC)) * plotH;

    // Background
    ctx.fillStyle = '#0d1310';
    ctx.fillRect(0, 0, W, H);

    // Low-res offscreen probability field scaled smoothly
    const gridN = 68;
    const off = document.createElement('canvas');
    off.width = gridN;
    off.height = gridN;
    const offCtx = off.getContext('2d');
    const img = offCtx.createImageData(gridN, gridN);
    const data = img.data;
    const [w11, w21, bh1, w12, w22, bh2, v1, v2, bo] = snap.params;
    const pGrid = new Float64Array(gridN * gridN);

    for (let gy = 0; gy < gridN; gy++) {
      const x2 = maxC - (gy / (gridN - 1)) * (maxC - minC);
      for (let gx = 0; gx < gridN; gx++) {
        const x1 = minC + (gx / (gridN - 1)) * (maxC - minC);
        const h1 = activate(x1 * w11 + x2 * w21 + bh1, state.act);
        const h2 = activate(x1 * w12 + x2 * w22 + bh2, state.act);
        const p = sigmoid(h1 * v1 + h2 * v2 + bo);
        pGrid[gy * gridN + gx] = p;
        const [r, g, b] = probToColor(p);
        const idx = (gy * gridN + gx) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    offCtx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, pad, pad, plotW, plotH);

    // Subtle coordinate grid at 0 and 1
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    [0, 1].forEach((val) => {
      const gx = toX(val);
      const gy = toY(val);
      ctx.beginPath();
      ctx.moveTo(gx, pad);
      ctx.lineTo(gx, pad + plotH);
      ctx.moveTo(pad, gy);
      ctx.lineTo(pad + plotW, gy);
      ctx.stroke();
    });

    // Plot frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.strokeRect(pad, pad, plotW, plotH);

    // Clip to plot area for contours and hidden lines
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, plotW, plotH);
    ctx.clip();

    // ŷ = 0.5 contour via marching squares segments
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let gy = 0; gy < gridN - 1; gy++) {
      for (let gx = 0; gx < gridN - 1; gx++) {
        const p00 = pGrid[gy * gridN + gx] - 0.5;
        const p10 = pGrid[gy * gridN + gx + 1] - 0.5;
        const p01 = pGrid[(gy + 1) * gridN + gx] - 0.5;
        const p11 = pGrid[(gy + 1) * gridN + gx + 1] - 0.5;
        const pts = [];
        if (p00 * p10 <= 0 && p00 !== p10) {
          const t = p00 / (p00 - p10);
          pts.push([gx + t, gy]);
        }
        if (p10 * p11 <= 0 && p10 !== p11) {
          const t = p10 / (p10 - p11);
          pts.push([gx + 1, gy + t]);
        }
        if (p01 * p11 <= 0 && p01 !== p11) {
          const t = p01 / (p01 - p11);
          pts.push([gx + t, gy + 1]);
        }
        if (p00 * p01 <= 0 && p00 !== p01) {
          const t = p00 / (p00 - p01);
          pts.push([gx, gy + t]);
        }
        if (pts.length >= 2) {
          ctx.moveTo(pad + (pts[0][0] / (gridN - 1)) * plotW, pad + (pts[0][1] / (gridN - 1)) * plotH);
          ctx.lineTo(pad + (pts[1][0] / (gridN - 1)) * plotW, pad + (pts[1][1] / (gridN - 1)) * plotH);
        }
      }
    }
    ctx.stroke();

    // Hidden neuron linear boundaries: w1*x1 + w2*x2 + b = 0
    if (state.showLines) {
      const lines = [
        { a: w11, b: w21, c: bh1, color: '#7fb8e0', label: 'h₁' },
        { a: w12, b: w22, c: bh2, color: '#e8c66a', label: 'h₂' }
      ];
      lines.forEach((ln) => {
        const seg = clipLineToBox(ln.a, ln.b, ln.c, minC, maxC);
        if (!seg) return;
        const [p1, p2] = seg;
        ctx.save();
        ctx.strokeStyle = ln.color;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(toX(p1[0]), toY(p1[1]));
        ctx.lineTo(toX(p2[0]), toY(p2[1]));
        ctx.stroke();
        ctx.restore();
      });
    }
    ctx.restore();

    // Axis ticks & titles
    ctx.fillStyle = '#8fa097';
    ctx.font = '600 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', toX(0), pad + plotH + 16);
    ctx.fillText('1', toX(1), pad + plotH + 16);
    ctx.fillText('x₁', pad + plotW / 2, H - 6);

    ctx.textAlign = 'right';
    ctx.fillText('0', pad - 8, toY(0) + 4);
    ctx.fillText('1', pad - 8, toY(1) + 4);
    ctx.save();
    ctx.translate(12, pad + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('x₂', 0, 0);
    ctx.restore();

    // 4 XOR sample points
    X_DATA.forEach((pt, i) => {
      const cx = toX(pt[0]);
      const cy = toY(pt[1]);
      const y = Y_DATA[i];
      const p = snap.probs[i];
      const isSel = i === state.sampleIdx;

      if (isSel) {
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = y === 1 ? '#4cc59a' : '#f08c6c';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0d1310';
      ctx.stroke();

      // Compact pill label inside plot
      const tag = `${SAMPLE_BITS[i]} · ${p.toFixed(2)}`;
      ctx.font = '600 10.5px "JetBrains Mono", Consolas, monospace';
      const tw = ctx.measureText(tag).width + 10;
      const dx = pt[0] === 0 ? 13 : -tw - 13;
      const dy = pt[1] === 0 ? -18 : 6;
      const bx = cx + dx;
      const by = cy + dy;

      ctx.fillStyle = 'rgba(13, 19, 16, 0.86)';
      ctx.strokeStyle = isSel ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#eef2ee';
      ctx.textAlign = 'left';
      ctx.fillText(tag, bx + 5, by + 12.5);
    });

    ctx.restore();
  }

  // Click on input canvas to select nearest XOR sample
  if (dom.inputCanvas) {
    dom.inputCanvas.addEventListener('click', (e) => {
      const rect = dom.inputCanvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const pad = 34;
      const minC = -0.25;
      const maxC = 1.25;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let bestIdx = -1;
      let bestDist = 999;
      X_DATA.forEach((pt, i) => {
        const cx = pad + ((pt[0] - minC) / (maxC - minC)) * (W - pad * 2);
        const cy = pad + (1 - (pt[1] - minC) / (maxC - minC)) * (H - pad * 2);
        const d = Math.hypot(mx - cx, my - cy);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      if (bestIdx >= 0 && bestDist < 42) {
        state.sampleIdx = bestIdx;
        const snap = state.snapshots[state.epoch];
        updateSampleChips(snap);
        drawInputCanvas(snap);
        drawNetworkSvg(snap);
        drawHiddenSvg(snap);
      }
    });
  }

  /* ==========================================================================
     5. Panel B: 2—2—1 Network Architecture, Weights & Gradients (SVG)
     ========================================================================== */
  function drawNetworkSvg(snap) {
    if (!dom.netSvg || !snap) return;
    const i = state.sampleIdx;
    const [x1, x2] = X_DATA[i];
    const [h1, h2] = snap.h[i];
    const p = snap.probs[i];
    const y = Y_DATA[i];
    const [w11, w21, bh1, w12, w22, bh2, v1, v2, bo] = snap.params;
    const [gw11, gw21, gbh1, gw12, gw22, gbh2, gv1, gv2, gbo] = snap.grads;
    const isGrad = state.netMode === 'backward';

    const nodes = {
      x1: { x: 58, y: 112, label: 'x₁', val: x1.toFixed(0), act: x1 },
      x2: { x: 58, y: 238, label: 'x₂', val: x2.toFixed(0), act: x2 },
      h1: { x: 182, y: 102, label: 'h₁', val: h1.toFixed(2), act: (state.act === 'tanh' ? (h1 + 1) / 2 : h1), biasKey: 'b_h1', biasVal: isGrad ? gbh1 : bh1, biasAbove: true, ringColor: '#7fb8e0' },
      h2: { x: 182, y: 248, label: 'h₂', val: h2.toFixed(2), act: (state.act === 'tanh' ? (h2 + 1) / 2 : h2), biasKey: 'b_h2', biasVal: isGrad ? gbh2 : bh2, ringColor: '#e8c66a' },
      yo: { x: 304, y: 175, label: 'ŷ', val: p.toFixed(2), act: p, biasKey: 'b_o', biasVal: isGrad ? gbo : bo, ringColor: '#4cc59a' }
    };

    const edges = [
      { key: 'w11', sym: 'w₁₁', from: nodes.x1, to: nodes.h1, val: isGrad ? gw11 : w11, lx: 118, ly: 86 },
      { key: 'w12', sym: 'w₁₂', from: nodes.x1, to: nodes.h2, val: isGrad ? gw12 : w12, lx: 102, ly: 152 },
      { key: 'w21', sym: 'w₂₁', from: nodes.x2, to: nodes.h1, val: isGrad ? gw21 : w21, lx: 102, ly: 198 },
      { key: 'w22', sym: 'w₂₂', from: nodes.x2, to: nodes.h2, val: isGrad ? gw22 : w22, lx: 118, ly: 264 },
      { key: 'v1',  sym: 'v₁',  from: nodes.h1, to: nodes.yo, val: isGrad ? gv1 : v1,   lx: 248, ly: 118 },
      { key: 'v2',  sym: 'v₂',  from: nodes.h2, to: nodes.yo, val: isGrad ? gv2 : v2,   lx: 248, ly: 232 }
    ];

    const maxScale = isGrad ? 0.12 : 8.5;
    const edgeSvg = edges.map((e) => {
      const color = e.val >= 0 ? '#4cc59a' : '#f08c6c';
      const norm = Math.min(1, Math.abs(e.val) / maxScale);
      const sw = (1.4 + norm * 4.2).toFixed(2);
      const isHovered = state.hoverParam === e.key;
      const dimmed = state.hoverParam && !isHovered;
      const opacity = dimmed ? 0.2 : (isHovered ? 1 : 0.82);
      const digits = isGrad ? 3 : 2;
      const text = `${isGrad ? '∂' : ''}${e.sym} ${fmtSigned(e.val, digits)}`;

      return `
        <g opacity="${opacity}">
          <line x1="${e.from.x}" y1="${e.from.y}" x2="${e.to.x}" y2="${e.to.y}"
                stroke="${color}" stroke-width="${isHovered ? Number(sw) + 1.5 : sw}" stroke-linecap="round"/>
          ${(state.playing || isHovered) ? `
          <line x1="${e.from.x}" y1="${e.from.y}" x2="${e.to.x}" y2="${e.to.y}"
                stroke="#ffffff" stroke-width="1.6" stroke-opacity="0.7" class="edge-flow"/>` : ''}
          <rect x="${e.lx - 34}" y="${e.ly - 9}" width="68" height="17" rx="4"
                fill="#0d1310" fill-opacity="0.9" stroke="${isHovered ? '#ffffff' : color}" stroke-opacity="${isHovered ? 0.9 : 0.45}"/>
          <text x="${e.lx}" y="${e.ly + 3}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#eef2ee">${text}</text>
        </g>`;
    }).join('');

    const nodeSvg = Object.values(nodes).map((n) => {
      const r = 24;
      const glowAlpha = (0.14 + Math.max(0, Math.min(1, n.act)) * 0.48).toFixed(2);
      const isBiasHover = n.biasKey && state.hoverParam === n.biasKey;
      const ring = isBiasHover ? '#ffffff' : (n.ringColor || '#7a8c82');
      const digits = isGrad ? 3 : 2;
      const by = n.biasAbove ? n.y - 46 : n.y + 30;
      const biasTag = n.biasKey
        ? `<g>
             <rect x="${n.x - 35}" y="${by}" width="70" height="16" rx="4"
                   fill="#141d18" stroke="${isBiasHover ? '#ffffff' : 'rgba(255,255,255,0.18)'}"/>
             <text x="${n.x}" y="${by + 11}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#b7c5bd">
               ${isGrad ? '∂' : ''}${n.biasKey} ${fmtSigned(n.biasVal, digits)}
             </text>
           </g>`
        : '';

      return `
        <g>
          <circle cx="${n.x}" cy="${n.y}" r="${r + 4}" fill="${ring}" fill-opacity="${ n.act * 0.16 }"/>
          <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="rgba(76, 197, 154, ${glowAlpha})" stroke="${ring}" stroke-width="${isBiasHover ? 2.6 : 1.8}"/>
          <text x="${n.x}" y="${n.y - 5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="#9fb0a7">${n.label}</text>
          <text x="${n.x}" y="${n.y + 11}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700" fill="#ffffff">${n.val}</text>
          ${biasTag}
        </g>`;
    }).join('');

    dom.netSvg.innerHTML = `
      <g font-family="JetBrains Mono, Noto Sans SC, sans-serif" font-size="10" fill="#7c8d84" text-anchor="middle">
        <text x="58" y="28">输入层 (2)</text>
        <text x="182" y="28">隐藏层 (2)</text>
        <text x="304" y="28">输出层 (1)</text>
      </g>
      ${edgeSvg}
      ${nodeSvg}
      <g transform="translate(18, 322)">
        <rect x="0" y="0" width="324" height="24" rx="5" fill="#141d18" stroke="rgba(255,255,255,0.1)"/>
        <text x="162" y="15.5" text-anchor="middle" font-family="JetBrains Mono, Noto Sans SC, monospace" font-size="10.2" fill="#c7d3cc">
          当前样本 (${x1}, ${x2}) · 标签 y=${y} · 预测 ŷ=${p.toFixed(4)}
        </text>
      </g>
    `;
  }

  /* ==========================================================================
     6. Panel C: Hidden Feature Space (h₁, h₂) Trajectories & Linear Separator
     ========================================================================== */
  function clipPolygonHalfPlane(poly, a, b, c, sign) {
    // Keep points where sign * (a*x + b*y + c) >= 0
    const out = [];
    const evalPt = (pt) => sign * (a * pt[0] + b * pt[1] + c);
    for (let i = 0; i < poly.length; i++) {
      const cur = poly[i];
      const nxt = poly[(i + 1) % poly.length];
      const vc = evalPt(cur);
      const vn = evalPt(nxt);
      if (vc >= 0) out.push(cur);
      if ((vc >= 0 && vn < 0) || (vc < 0 && vn >= 0)) {
        const t = vc / (vc - vn);
        out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
      }
    }
    return out;
  }

  function drawHiddenSvg(snap) {
    if (!dom.hiddenSvg || !snap) return;
    const W = 360;
    const H = 360;
    const pad = 38;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const minC = state.act === 'tanh' ? -1.08 : -0.06;
    const maxC = state.act === 'tanh' ? 1.08 : 1.06;

    const toX = (h1) => pad + ((h1 - minC) / (maxC - minC)) * plotW;
    const toY = (h2) => pad + (1 - (h2 - minC) / (maxC - minC)) * plotH;

    const [v1, v2] = snap.v;
    const bo = snap.b_output;
    const boxPoly = [
      [minC, minC],
      [maxC, minC],
      [maxC, maxC],
      [minC, maxC]
    ];
    const posPoly = clipPolygonHalfPlane(boxPoly, v1, v2, bo, 1);
    const negPoly = clipPolygonHalfPlane(boxPoly, v1, v2, bo, -1);
    const polyPoints = (poly) => poly.map((p) => `${toX(p[0]).toFixed(1)},${toY(p[1]).toFixed(1)}`).join(' ');

    const sepSeg = clipLineToBox(v1, v2, bo, minC, maxC);
    const sepLineSvg = sepSeg
      ? `<line x1="${toX(sepSeg[0][0]).toFixed(1)}" y1="${toY(sepSeg[0][1]).toFixed(1)}"
               x2="${toX(sepSeg[1][0]).toFixed(1)}" y2="${toY(sepSeg[1][1]).toFixed(1)}"
               stroke="#ffffff" stroke-width="2.2" stroke-dasharray="6 4"/>`
      : '';

    // Sample trajectories from epoch 0 to state.epoch
    const stepStride = Math.max(1, Math.floor(state.epoch / 45));
    const trailsSvg = X_DATA.map((_, i) => {
      if (state.epoch === 0) return '';
      const pts = [];
      for (let e = 0; e <= state.epoch; e += stepStride) {
        const [th1, th2] = state.snapshots[e].h[i];
        pts.push(`${toX(th1).toFixed(1)},${toY(th2).toFixed(1)}`);
      }
      const [lh1, lh2] = snap.h[i];
      pts.push(`${toX(lh1).toFixed(1)},${toY(lh2).toFixed(1)}`);
      const color = Y_DATA[i] === 1 ? '#4cc59a' : '#f08c6c';
      return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.6" stroke-opacity="0.55"/>`;
    }).join('');

    // Smart label offsets so (00) and (11) never collide near the origin
    const labelOffsets = [
      { dx: 12, dy: -16 }, // 00
      { dx: 12, dy: 4 },   // 01
      { dx: -44, dy: -16 },// 10
      { dx: 12, dy: 10 }   // 11
    ];

    const pointsSvg = X_DATA.map((_, i) => {
      const [h1, h2] = snap.h[i];
      const cx = toX(h1);
      const cy = toY(h2);
      const y = Y_DATA[i];
      const isSel = i === state.sampleIdx;
      const color = y === 1 ? '#4cc59a' : '#f08c6c';
      const off = labelOffsets[i];
      const bx = Math.max(pad + 4, Math.min(pad + plotW - 38, cx + off.dx));
      const by = Math.max(pad + 4, Math.min(pad + plotH - 20, cy + off.dy));

      return `
        <g class="hidden-pt" data-sample="${i}" style="cursor:pointer">
          ${isSel ? `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="14" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="3 3"/>` : ''}
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7.5" fill="${color}" stroke="#0d1310" stroke-width="2"/>
          <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="32" height="16" rx="4"
                fill="#0d1310" fill-opacity="0.88" stroke="${isSel ? '#ffffff' : color}" stroke-opacity="0.7"/>
          <text x="${(bx + 16).toFixed(1)}" y="${(by + 11.5).toFixed(1)}" text-anchor="middle"
                font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#eef2ee">${SAMPLE_BITS[i]}</text>
        </g>`;
    }).join('');

    const gridTicks = state.act === 'tanh' ? [-1, 0, 1] : [0, 0.5, 1];
    const gridSvg = gridTicks.map((t) => {
      const gx = toX(t).toFixed(1);
      const gy = toY(t).toFixed(1);
      return `
        <line x1="${gx}" y1="${pad}" x2="${gx}" y2="${pad + plotH}" stroke="rgba(255,255,255,0.09)"/>
        <line x1="${pad}" y1="${gy}" x2="${pad + plotW}" y2="${gy}" stroke="rgba(255,255,255,0.09)"/>
        <text x="${gx}" y="${pad + plotH + 15}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#8fa097">${t}</text>
        <text x="${pad - 7}" y="${Number(gy) + 3.5}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="#8fa097">${t}</text>
      `;
    }).join('');

    dom.hiddenSvg.innerHTML = `
      <defs>
        <clipPath id="hidden-clip">
          <rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}"/>
        </clipPath>
      </defs>
      <g clip-path="url(#hidden-clip)">
        ${posPoly.length >= 3 ? `<polygon points="${polyPoints(posPoly)}" fill="#4cc59a" fill-opacity="0.16"/>` : ''}
        ${negPoly.length >= 3 ? `<polygon points="${polyPoints(negPoly)}" fill="#f08c6c" fill-opacity="0.11"/>` : ''}
        ${gridSvg}
        ${sepLineSvg}
        ${trailsSvg}
        ${pointsSvg}
      </g>
      <rect x="${pad}" y="${pad}" width="${plotW}" height="${plotH}" fill="none" stroke="rgba(255,255,255,0.22)"/>
      <text x="${pad + plotW / 2}" y="${H - 7}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="#8fa097">h₁</text>
      <text x="13" y="${pad + plotH / 2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="#8fa097" transform="rotate(-90 13 ${pad + plotH / 2})">h₂</text>
    `;

    dom.hiddenSvg.querySelectorAll('.hidden-pt').forEach((g) => {
      g.addEventListener('click', () => {
        state.sampleIdx = Number(g.getAttribute('data-sample'));
        const cur = state.snapshots[state.epoch];
        updateSampleChips(cur);
        drawInputCanvas(cur);
        drawNetworkSvg(cur);
        drawHiddenSvg(cur);
      });
    });
  }

  /* ==========================================================================
     7. Integrated Loss Timeline SVG & Playhead
     ========================================================================== */
  let maxLoss = 1;

  function renderLossCurve() {
    if (!dom.lossSvg) return;
    maxLoss = Math.max(0.8, ...state.snapshots.map((s) => s.loss));
    const W = 1000;
    const H = 100;
    const topPad = 10;
    const botPad = 14;
    const plotH = H - topPad - botPad;

    const pts = state.snapshots.map((s, idx) => {
      const x = (idx / TOTAL_EPOCHS) * W;
      const y = topPad + (1 - s.loss / maxLoss) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // Bottom accuracy color strip (segmented runs)
    const accRects = [];
    let runStart = 0;
    let runCount = state.snapshots[0].correctCount;
    for (let i = 1; i <= TOTAL_EPOCHS; i++) {
      const c = state.snapshots[i].correctCount;
      if (c !== runCount || i === TOTAL_EPOCHS) {
        const x1 = (runStart / TOTAL_EPOCHS) * W;
        const x2 = (i / TOTAL_EPOCHS) * W;
        const color = runCount === 4 ? '#4cc59a' : (runCount === 3 ? '#e8c66a' : '#f08c6c');
        accRects.push(`<rect x="${x1.toFixed(1)}" y="${H - 7}" width="${Math.max(1, x2 - x1).toFixed(1)}" height="7" fill="${color}" fill-opacity="0.78"/>`);
        runStart = i;
        runCount = c;
      }
    }

    dom.lossSvg.innerHTML = `
      <defs>
        <linearGradient id="loss-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4cc59a" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#4cc59a" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="${topPad + plotH * 0.5}" x2="${W}" y2="${topPad + plotH * 0.5}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="4 4"/>
      <polygon points="0,${H - botPad} ${pts.join(' ')} ${W},${H - botPad}" fill="url(#loss-grad)"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#4cc59a" stroke-width="2.4"/>
      ${accRects.join('')}
    `;
  }

  function updateLossPlayhead(snap) {
    if (!snap) return;
    const pct = (snap.epoch / TOTAL_EPOCHS) * 100;
    const yPct = (10 + (1 - snap.loss / maxLoss) * 76);
    if (dom.tlHead) dom.tlHead.style.left = `${pct}%`;
    if (dom.tlDot) {
      dom.tlDot.style.left = `${pct}%`;
      dom.tlDot.style.top = `${yPct}%`;
    }
    if (dom.epochNum) dom.epochNum.textContent = String(snap.epoch);
    if (dom.epochRange) dom.epochRange.value = String(snap.epoch);
    if (dom.mLoss) dom.mLoss.textContent = snap.loss.toFixed(4);
    if (dom.mAcc) dom.mAcc.textContent = `${(snap.acc * 100).toFixed(0)}% (${snap.correctCount}/4)`;
    if (dom.stageStatus) {
      if (snap.epoch === 0) {
        dom.stageStatus.textContent = '初始状态 · Epoch 0';
      } else if (snap.correctCount === 4) {
        dom.stageStatus.textContent = `已收敛 · 4/4 全对 (Loss ${snap.loss.toFixed(4)})`;
      } else {
        dom.stageStatus.textContent = `训练中 · Epoch ${snap.epoch}`;
      }
    }
  }

  /* ==========================================================================
     8. 3×3 Neuron Parameter Board (#param-board)
     ========================================================================== */
  const paramMetaRuntime = [];

  function buildParamBoard() {
    if (!dom.paramBoard) return;
    paramMetaRuntime.length = 0;

    dom.paramBoard.innerHTML = NEURON_ROWS.map((row) => {
      const cardsHtml = row.params.map((p) => {
        const series = state.snapshots.map((s) => s.params[p.idx]);
        const minV = Math.min(...series, 0);
        const maxV = Math.max(...series, 0);
        const span = Math.max(0.5, maxV - minV);
        const lo = minV - span * 0.12;
        const hi = maxV + span * 0.12;
        const W = 240;
        const H = 40;
        const toY = (v) => H - ((v - lo) / (hi - lo)) * H;

        const pts = series.map((v, idx) => `${((idx / TOTAL_EPOCHS) * W).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
        const zeroY = toY(0).toFixed(1);
        const endVal = series[series.length - 1];
        const strokeColor = endVal >= 0 ? '#35705a' : '#b85039';

        paramMetaRuntime[p.idx] = { lo, hi, W, H };

        return `
          <article class="param-card" data-param-key="${p.key}" data-param-idx="${p.idx}">
            <div class="param-card-top">
              <div>
                <span class="param-sym">${p.sym}</span>
                <span class="param-role">${p.role}</span>
              </div>
              <strong class="param-val" data-pval="${p.idx}">0.0000</strong>
            </div>
            <div class="param-spark">
              <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
                <line x1="0" y1="${zeroY}" x2="${W}" y2="${zeroY}" stroke="rgba(31,40,34,0.14)" stroke-dasharray="3 3"/>
                <polyline points="${pts}" fill="none" stroke="${strokeColor}" stroke-width="2"/>
                <line data-phead="${p.idx}" x1="0" y1="0" x2="0" y2="${H}" stroke="#1f2822" stroke-width="1.2" stroke-opacity="0.55"/>
                <circle data-pdot="${p.idx}" cx="0" cy="${zeroY}" r="3.4" fill="${strokeColor}" stroke="#ffffff" stroke-width="1.2"/>
              </svg>
            </div>
            <div class="param-foot">
              <span>初值 ${fmtSigned(series[0], 2)}</span>
              <span data-pgrad="${p.idx}">∂L = 0.0000</span>
              <span data-pdelta="${p.idx}">Δ = 0.0000</span>
            </div>
          </article>`;
      }).join('');

      return `
        <div class="param-row">
          <div class="param-row-label" style="--row-color:${row.color}">
            <div>
              <strong>${row.title}</strong>
              <span>${row.desc}</span>
            </div>
            <code>${row.formula}</code>
          </div>
          ${cardsHtml}
        </div>`;
    }).join('');

    dom.paramBoard.querySelectorAll('.param-card').forEach((card) => {
      const key = card.getAttribute('data-param-key');
      card.addEventListener('mouseenter', () => {
        state.hoverParam = key;
        drawNetworkSvg(state.snapshots[state.epoch]);
      });
      card.addEventListener('mouseleave', () => {
        state.hoverParam = null;
        drawNetworkSvg(state.snapshots[state.epoch]);
      });
    });
  }

  function updateParamBoard(snap) {
    if (!dom.paramBoard || !snap) return;
    for (let idx = 0; idx < 9; idx++) {
      const val = snap.params[idx];
      const grad = snap.grads[idx];
      const delta = snap.deltas[idx];
      const meta = paramMetaRuntime[idx];
      if (!meta) continue;

      const valEl = dom.paramBoard.querySelector(`[data-pval="${idx}"]`);
      const gradEl = dom.paramBoard.querySelector(`[data-pgrad="${idx}"]`);
      const deltaEl = dom.paramBoard.querySelector(`[data-pdelta="${idx}"]`);
      const headEl = dom.paramBoard.querySelector(`[data-phead="${idx}"]`);
      const dotEl = dom.paramBoard.querySelector(`[data-pdot="${idx}"]`);

      if (valEl) {
        valEl.textContent = fmtSigned(val, 4);
        valEl.classList.toggle('is-pos', val >= 0);
        valEl.classList.toggle('is-neg', val < 0);
      }
      if (gradEl) gradEl.textContent = `梯度 ${fmtSigned(grad, 4)}`;
      if (deltaEl) deltaEl.textContent = `Δ ${fmtSigned(delta, 4)}`;

      const x = ((snap.epoch / TOTAL_EPOCHS) * meta.W).toFixed(1);
      const y = (meta.H - ((val - meta.lo) / (meta.hi - meta.lo)) * meta.H).toFixed(1);
      if (headEl) {
        headEl.setAttribute('x1', x);
        headEl.setAttribute('x2', x);
      }
      if (dotEl) {
        dotEl.setAttribute('cx', x);
        dotEl.setAttribute('cy', y);
      }
    }
  }

  /* ==========================================================================
     9. Five-Step Code Comparison & Live Tensor Inspector (#lab-code)
     ========================================================================== */
  const CODE_SOURCES = {
    pytorch: {
      file: 'assets/mlp/xor_pytorch.py',
      lines: [
        { step: 0, code: 'import torch' },
        { step: 1, code: '# 1) 张量：4 个 XOR 样本 (4×2) 与标签 (4×1)' },
        { step: 1, code: 'X = torch.tensor([[0.,0.],[0.,1.],[1.,0.],[1.,1.]], dtype=torch.float64)' },
        { step: 1, code: 'y = torch.tensor([[0.],[1.],[1.],[0.]], dtype=torch.float64)' },
        { step: 2, code: '# 2) 模型：9 个可学习参数 (requires_grad=True)' },
        { step: 2, code: 'W = torch.tensor([[2., -2.], [-2., 2.]], dtype=torch.float64, requires_grad=True)' },
        { step: 2, code: 'b_hidden = torch.tensor([-1., -1.], dtype=torch.float64, requires_grad=True)' },
        { step: 2, code: 'v = torch.tensor([[3.], [3.]], dtype=torch.float64, requires_grad=True)' },
        { step: 2, code: 'b_output = torch.tensor([-2.5], dtype=torch.float64, requires_grad=True)' },
        { step: 3, code: '# 3) 损失与优化器：BCEWithLogitsLoss + Adam' },
        { step: 3, code: 'criterion = torch.nn.BCEWithLogitsLoss()' },
        { step: 5, code: 'optimizer = torch.optim.Adam([W, b_hidden, v, b_output], lr=0.03)' },
        { step: 0, code: 'for epoch in range(300):' },
        { step: 2, code: '    h = torch.sigmoid(X @ W + b_hidden)       # 隐藏层输出 (4×2)' },
        { step: 2, code: '    z_output = h @ v + b_output               # 输出层分数 (4×1)' },
        { step: 3, code: '    loss = criterion(z_output, y)             # 二元交叉熵损失' },
        { step: 4, code: '    optimizer.zero_grad()                     # 清零上一轮梯度' },
        { step: 4, code: '    loss.backward()                           # 4) 反向传播求梯度' },
        { step: 5, code: '    optimizer.step()                          # 5) Adam 更新 9 个参数' }
      ]
    },
    tensorflow: {
      file: 'assets/mlp/xor_tensorflow.py',
      lines: [
        { step: 0, code: 'import tensorflow as tf' },
        { step: 1, code: '# 1) 张量：4 个 XOR 样本 (4×2) 与标签 (4×1)' },
        { step: 1, code: 'X = tf.constant([[0.,0.],[0.,1.],[1.,0.],[1.,1.]], dtype=tf.float64)' },
        { step: 1, code: 'y = tf.constant([[0.],[1.],[1.],[0.]], dtype=tf.float64)' },
        { step: 2, code: '# 2) 模型：tf.Variable 包装 9 个可训练参数' },
        { step: 2, code: 'W = tf.Variable([[2., -2.], [-2., 2.]], dtype=tf.float64)' },
        { step: 2, code: 'b_hidden = tf.Variable([-1., -1.], dtype=tf.float64)' },
        { step: 2, code: 'v = tf.Variable([[3.], [3.]], dtype=tf.float64)' },
        { step: 2, code: 'b_output = tf.Variable([-2.5], dtype=tf.float64)' },
        { step: 3, code: 'bce = tf.keras.losses.BinaryCrossentropy(from_logits=True)' },
        { step: 5, code: 'optimizer = tf.keras.optimizers.Adam(learning_rate=0.03)' },
        { step: 0, code: 'for epoch in range(300):' },
        { step: 4, code: '    with tf.GradientTape() as tape:           # 记录前向计算图' },
        { step: 2, code: '        h = tf.sigmoid(tf.matmul(X, W) + b_hidden)' },
        { step: 2, code: '        z_output = tf.matmul(h, v) + b_output' },
        { step: 3, code: '        loss = bce(y, z_output)               # 3) 计算交叉熵损失' },
        { step: 4, code: '    grads = tape.gradient(loss, [W, b_hidden, v, b_output])' },
        { step: 5, code: '    optimizer.apply_gradients(zip(grads, [W, b_hidden, v, b_output]))' }
      ]
    },
    numpy: {
      file: 'assets/mlp/xor_numpy_manual.py',
      lines: [
        { step: 0, code: 'import numpy as np' },
        { step: 1, code: '# 1) 数组：输入矩阵 X (4×2) 与目标向量 y (4×1)' },
        { step: 1, code: 'X = np.array([[0.,0.],[0.,1.],[1.,0.],[1.,1.]], dtype=np.float64)' },
        { step: 1, code: 'y = np.array([[0.],[1.],[1.],[0.]], dtype=np.float64)' },
        { step: 2, code: '# 2) 参数：W (2×2), b_hidden (2,), v (2×1), b_output (1,)' },
        { step: 2, code: 'W = np.array([[2., -2.], [-2., 2.]]); b_hidden = np.array([-1., -1.])' },
        { step: 2, code: 'v = np.array([[3.], [3.]]);           b_output = np.array([-2.5])' },
        { step: 0, code: 'for t in range(1, 301):' },
        { step: 2, code: '    h = 1.0 / (1.0 + np.exp(-(X @ W + b_hidden)))' },
        { step: 2, code: '    z_output = h @ v + b_output; probs = 1.0 / (1.0 + np.exp(-z_output))' },
        { step: 3, code: '    # 3) 损失：二元交叉熵均值' },
        { step: 3, code: '    loss = np.mean(np.maximum(z_output, 0) - z_output * y + np.log1p(np.exp(-np.abs(z_output))))' },
        { step: 4, code: '    # 4) 链式法则手写反向传播' },
        { step: 4, code: '    dz_out = (probs - y) / 4.0' },
        { step: 4, code: '    gv = h.T @ dz_out;               gb_out = dz_out.sum(axis=0)' },
        { step: 4, code: '    dz_hid = (dz_out @ v.T) * h * (1.0 - h)' },
        { step: 4, code: '    gW = X.T @ dz_hid;               gb_hid = dz_hid.sum(axis=0)' },
        { step: 5, code: '    # 5) Adam 一阶/二阶矩偏差修正并更新参数' },
        { step: 5, code: '    theta -= lr * m_hat / (np.sqrt(s_hat) + 1e-8)' }
      ]
    }
  };

  function highlightLine(raw) {
    const esc = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const cIdx = esc.indexOf('#');
    const codePart = cIdx >= 0 ? esc.slice(0, cIdx) : esc;
    const commPart = cIdx >= 0 ? `<span class="tk-c">${esc.slice(cIdx)}</span>` : '';

    const highlighted = codePart
      .replace(/\b(import|for|in|with|as|True|False)\b/g, '<span class="tk-k">$1</span>')
      .replace(/\b(range|sigmoid|matmul|mean|maximum|log1p|exp|abs|sum|sqrt|zero_grad|backward|step|gradient|apply_gradients|zip)\b/g, '<span class="tk-f">$1</span>')
      .replace(/(-?\d+\.\d*|\b\d+\b)/g, '<span class="tk-n">$1</span>');

    return highlighted + commPart;
  }

  function renderCodePanel() {
    if (!dom.codeBody) return;
    const src = CODE_SOURCES[state.fw];
    if (dom.codeDl) dom.codeDl.setAttribute('href', src.file);

    dom.codeBody.innerHTML = src.lines.map((ln, idx) => {
      const isAct = ln.step === state.step;
      const isDim = ln.step !== 0 && ln.step !== state.step;
      return `
        <div class="code-line${isAct ? ' is-active' : (isDim ? ' is-dim' : '')}">
          <span class="code-ln">${idx + 1}</span>
          <span>${highlightLine(ln.code)}</span>
        </div>`;
    }).join('');
  }

  function updateInspector(snap) {
    if (!snap) return;
    if (dom.inspEpoch) dom.inspEpoch.textContent = String(snap.epoch);
    const [w11, w21, bh1, w12, w22, bh2, v1, v2, bo] = snap.params;
    const [gw11, gw21, gbh1, gw12, gw22, gbh2, gv1, gv2, gbo] = snap.grads;
    const [dw11, dw21, dbh1, dw12, dw22, dbh2, dv1, dv2, dbo] = snap.deltas;

    const stepData = {
      1: {
        title: '01 · 张量 (Tensor)：批量组织输入与标签',
        desc: '把 4 个 XOR 样本打包成 4×2 矩阵 X，目标结果打包成 4×1 向量 y，一次矩阵乘法即可同时算完 4 个样本。',
        tensor: [
          'X (shape: 4×2, float64) =',
          '  [[0.0, 0.0],   # 样本 00 -> y = 0',
          '   [0.0, 1.0],   # 样本 01 -> y = 1',
          '   [1.0, 0.0],   # 样本 10 -> y = 1',
          '   [1.0, 1.0]]   # 样本 11 -> y = 0',
          '',
          'y (shape: 4×1, float64) =',
          '  [[0.0], [1.0], [1.0], [0.0]]'
        ].join('\n')
      },
      2: {
        title: '02 · 模型 (Model)：9 个参数与前向矩阵计算',
        desc: '隐藏层通过 h = σ(X·W + b_hidden) 把 4 个点映射到新特征平面，输出层再算 z_output = h·v + b_output。',
        tensor: [
          `W (2×2)        = [[${fmtSigned(w11, 4)}, ${fmtSigned(w12, 4)}],`,
          `                  [${fmtSigned(w21, 4)}, ${fmtSigned(w22, 4)}]]`,
          `b_hidden (2,)  = [${fmtSigned(bh1, 4)}, ${fmtSigned(bh2, 4)}]`,
          `v (2×1)        = [[${fmtSigned(v1, 4)}], [${fmtSigned(v2, 4)}]]`,
          `b_output (1,)  = [${fmtSigned(bo, 4)}]`,
          '',
          'h = σ(X @ W + b_hidden) (4×2) =',
          ...snap.h.map((row, idx) => `  ${SAMPLE_BITS[idx]}: [${row[0].toFixed(4)}, ${row[1].toFixed(4)}]  -> ŷ = ${snap.probs[idx].toFixed(4)}`)
        ].join('\n')
      },
      3: {
        title: '03 · 损失 (Loss)：二元交叉熵衡量预测差距',
        desc: '对每个样本计算 -[y·log(ŷ) + (1-y)·log(1-ŷ)]，4 个样本取平均得到当前轮次的标量损失 L。',
        tensor: [
          '样本逐项损失 L_i :',
          ...X_DATA.map((_, idx) => {
            const li = bceWithLogits(snap.z_output[idx], Y_DATA[idx]);
            return `  样本 ${SAMPLE_BITS[idx]} (y=${Y_DATA[idx]}): z=${fmtSigned(snap.z_output[idx], 3)}, ŷ=${snap.probs[idx].toFixed(4)} -> L_${idx}=${li.toFixed(4)}`;
          }),
          '',
          `平均损失 loss = ${snap.loss.toFixed(6)}`,
          `分类准确率    = ${(snap.acc * 100).toFixed(0)}% (${snap.correctCount}/4 样本正确)`
        ].join('\n')
      },
      4: {
        title: '04 · 求梯度 (Backward)：链式法则反传误差',
        desc: '从 δ_out = (ŷ - y)/4 出发，反向算出损失 L 对全部 9 个参数的偏导数 ∂L/∂θ。',
        tensor: [
          `δ_out = (ŷ - y)/4 = [${snap.dz_out.map((d) => fmtSigned(d, 4)).join(', ')}]`,
          '',
          `∂L/∂W (2×2)   = [[${fmtSigned(gw11, 5)}, ${fmtSigned(gw12, 5)}],`,
          `                 [${fmtSigned(gw21, 5)}, ${fmtSigned(gw22, 5)}]]`,
          `∂L/∂b_hidden  = [${fmtSigned(gbh1, 5)}, ${fmtSigned(gbh2, 5)}]`,
          `∂L/∂v (2×1)   = [[${fmtSigned(gv1, 5)}], [${fmtSigned(gv2, 5)}]]`,
          `∂L/∂b_output  = [${fmtSigned(gbo, 5)}]`
        ].join('\n')
      },
      5: {
        title: '05 · 更新参数 (Step)：按梯度反方向迈出一步',
        desc: `${state.opt === 'adam' ? 'Adam 利用一阶动量 m̂ 与二阶矩 ŝ 自适应调整每个参数的步长' : 'SGD 直接沿负梯度方向更新参数'}（学习率 lr = ${state.lr}）。`,
        tensor: [
          '本轮参数更新量 Δθ = θ(t+1) - θ(t) :',
          `  ΔW        = [[${fmtSigned(dw11, 5)}, ${fmtSigned(dw12, 5)}],`,
          `               [${fmtSigned(dw21, 5)}, ${fmtSigned(dw22, 5)}]]`,
          `  Δb_hidden = [${fmtSigned(dbh1, 5)}, ${fmtSigned(dbh2, 5)}]`,
          `  Δv        = [[${fmtSigned(dv1, 5)}], [${fmtSigned(dv2, 5)}]]`,
          `  Δb_output = [${fmtSigned(dbo, 5)}]`,
          '',
          `更新后下一轮损失预计继续下降（当前 L = ${snap.loss.toFixed(6)}）`
        ].join('\n')
      }
    };

    const cur = stepData[state.step];
    if (dom.inspTitle) dom.inspTitle.textContent = cur.title;
    if (dom.inspDesc) dom.inspDesc.textContent = cur.desc;
    if (dom.inspTensor) dom.inspTensor.textContent = cur.tensor;
  }

  /* ==========================================================================
     10. Master Render & Playback Loop
     ========================================================================== */
  function renderEpoch() {
    const snap = state.snapshots[state.epoch];
    if (!snap) return;
    updateLossPlayhead(snap);
    updateSampleChips(snap);
    drawInputCanvas(snap);
    drawNetworkSvg(snap);
    drawHiddenSvg(snap);
    updateParamBoard(snap);
    updateInspector(snap);
  }

  function recomputeAll() {
    state.snapshots = simulateTraining(state.preset, state.opt, state.lr, state.act);
    renderLossCurve();
    buildParamBoard();
    renderEpoch();
  }

  let rafId = null;
  let lastTick = 0;

  function setPlaying(play) {
    state.playing = play;
    if (dom.playBtn) {
      dom.playBtn.classList.toggle('is-playing', play);
      dom.playBtn.setAttribute('aria-label', play ? '暂停训练' : '播放训练');
    }
    drawNetworkSvg(state.snapshots[state.epoch]);
    if (play) {
      if (state.epoch >= TOTAL_EPOCHS) state.epoch = 0;
      lastTick = performance.now();
      rafId = requestAnimationFrame(tickPlay);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function tickPlay(now) {
    if (!state.playing) return;
    const interval = 28 / state.speed;
    if (now - lastTick >= interval) {
      const steps = Math.max(1, Math.floor((now - lastTick) / interval));
      lastTick = now;
      state.epoch = Math.min(TOTAL_EPOCHS, state.epoch + steps);
      renderEpoch();
      if (state.epoch >= TOTAL_EPOCHS) {
        setPlaying(false);
        return;
      }
    }
    rafId = requestAnimationFrame(tickPlay);
  }

  /* ==========================================================================
     11. Event Listeners & Initialization
     ========================================================================== */
  // Stage hyperparameter segmented controls
  document.querySelectorAll('.seg[data-option]').forEach((group) => {
    const optKey = group.getAttribute('data-option');
    group.querySelectorAll('button[data-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', 'false'));
        btn.setAttribute('aria-checked', 'true');
        const val = btn.getAttribute('data-value');
        if (optKey === 'lr') {
          state.lr = parseFloat(val);
        } else {
          state[optKey] = val;
        }
        recomputeAll();
      });
    });
  });

  // Toggle hidden lines on Panel A
  if (dom.toggleLines) {
    dom.toggleLines.addEventListener('click', () => {
      state.showLines = !state.showLines;
      dom.toggleLines.setAttribute('aria-pressed', String(state.showLines));
      drawInputCanvas(state.snapshots[state.epoch]);
    });
  }

  // Toggle Forward Weights / Backward Gradients on Panel B
  document.querySelectorAll('.seg[data-view="netMode"] button').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', 'false'));
      btn.setAttribute('aria-checked', 'true');
      state.netMode = btn.getAttribute('data-value');
      if (dom.netLegendNote) {
        dom.netLegendNote.textContent = state.netMode === 'backward'
          ? '当前显示：损失对各参数的偏导数 ∂L/∂θ'
          : '节点亮度 = 当前样本的激活值';
      }
      drawNetworkSvg(state.snapshots[state.epoch]);
    });
  });

  // Timeline controls
  if (dom.playBtn) {
    dom.playBtn.addEventListener('click', () => setPlaying(!state.playing));
  }
  if (dom.stepBack) {
    dom.stepBack.addEventListener('click', () => {
      setPlaying(false);
      state.epoch = Math.max(0, state.epoch - 1);
      renderEpoch();
    });
  }
  if (dom.stepFwd) {
    dom.stepFwd.addEventListener('click', () => {
      setPlaying(false);
      state.epoch = Math.min(TOTAL_EPOCHS, state.epoch + 1);
      renderEpoch();
    });
  }
  if (dom.speedBtn) {
    const speeds = [1, 2, 4];
    dom.speedBtn.addEventListener('click', () => {
      const next = speeds[(speeds.indexOf(state.speed) + 1) % speeds.length];
      state.speed = next;
      dom.speedBtn.textContent = `${next}×`;
    });
  }
  if (dom.epochRange) {
    dom.epochRange.addEventListener('input', () => {
      setPlaying(false);
      state.epoch = Number(dom.epochRange.value);
      renderEpoch();
    });
  }

  // Five-step code tabs
  document.querySelectorAll('.step-tabs button[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.step-tabs button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      state.step = Number(btn.getAttribute('data-step'));
      renderCodePanel();
      updateInspector(state.snapshots[state.epoch]);
    });
  });

  // Framework tabs (PyTorch / TensorFlow / NumPy)
  document.querySelectorAll('[data-fw-group] button[data-fw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      state.fw = btn.getAttribute('data-fw');
      renderCodePanel();
    });
  });

  // Resize handler for crisp Canvas redraw
  window.addEventListener('resize', () => {
    if (state.snapshots.length) {
      drawInputCanvas(state.snapshots[state.epoch]);
    }
  });

  // Boot
  initSampleChips();
  renderCodePanel();
  recomputeAll();
})();
