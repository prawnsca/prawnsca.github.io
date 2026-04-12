(function () {
    const canvas = document.getElementById('dino-canvas');
    const scoreEl = document.getElementById('dino-score');
    const hintEl = document.getElementById('dino-hint');
    const restartBtn = document.getElementById('dino-restart');
    const wrap = document.querySelector('.dino-wrap');

    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const GROUND = H - 28;

    const LOGO_SRC = './img/prawns.png';
    const LOGO_MAX_H = 52;
    const LOGO_MAX_W = 64;
    const LOGO_RADIUS = 10;

    const logoImg = new Image();
    let logoReady = false;

    const dino = {
        x: 72,
        w: 48,
        h: 48,
        y: GROUND - 48,
        vy: 0,
    };

    let obstacles = [];
    let nextSpawn = 40;
    let speed = 5.5;
    let score = 0;
    let state = 'idle';
    let raf = 0;
    let tick = 0;

    function syncDinoFootprint() {
        if (!logoReady || !logoImg.naturalWidth) return;
        const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
        let h = LOGO_MAX_H;
        let w = h * aspect;
        if (w > LOGO_MAX_W) {
            w = LOGO_MAX_W;
            h = w / aspect;
        }
        dino.w = w;
        dino.h = h;
    }

    function groundPlayer() {
        dino.y = GROUND - dino.h;
    }

    function onLogoReady() {
        logoReady = true;
        syncDinoFootprint();
        groundPlayer();
        drawFrame();
    }

    logoImg.onload = onLogoReady;
    logoImg.onerror = function () {
        logoReady = false;
        drawFrame();
    };
    logoImg.src = LOGO_SRC;
    if (logoImg.complete && logoImg.naturalWidth) {
        onLogoReady();
    }

    function resetGame() {
        syncDinoFootprint();
        groundPlayer();
        dino.vy = 0;
        obstacles = [];
        nextSpawn = 50;
        speed = 5.5;
        score = 0;
        state = 'idle';
        tick = 0;
        cancelAnimationFrame(raf);
        if (scoreEl) scoreEl.textContent = '0';
        if (hintEl) {
            hintEl.textContent =
                'Пробел, стрелка вверх или касание — прыжок. Нажми, чтобы начать.';
            hintEl.hidden = false;
        }
        if (restartBtn) restartBtn.hidden = true;
        drawFrame();
    }

    function startRun() {
        if (state !== 'idle') return;
        state = 'run';
        if (hintEl) hintEl.hidden = true;
        loop();
    }

    function gameOver() {
        state = 'dead';
        cancelAnimationFrame(raf);
        if (hintEl) {
            hintEl.textContent = 'Игра окончена. «Заново», пробел или Enter.';
            hintEl.hidden = false;
        }
        if (restartBtn) restartBtn.hidden = false;
        drawFrame();
    }

    function jump() {
        if (state === 'idle') {
            startRun();
            return;
        }
        if (state === 'dead') {
            resetGame();
            return;
        }
        const onGround = dino.y >= GROUND - dino.h - 0.5;
        if (onGround) dino.vy = -12.5;
    }

    function spawnObstacle() {
        const w = 18 + Math.random() * 22;
        const h = 36 + Math.floor(Math.random() * 3) * 12;
        obstacles.push({ x: W + 20, w, h, y: GROUND - h });
    }

    function collides(a, b) {
        const padX = 5;
        const padY = 4;
        return (
            a.x + padX < b.x + b.w - padX &&
            a.x + a.w - padX > b.x + padX &&
            a.y + padY < b.y + b.h &&
            a.y + a.h > b.y + padY
        );
    }

    function drawGround() {
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND + 1);
        ctx.lineTo(W, GROUND + 1);
        ctx.stroke();
    }

    function drawDino() {
        const x = Math.round(dino.x);
        const y = Math.round(dino.y);

        if (logoReady && logoImg.naturalWidth) {
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y, dino.w, dino.h, LOGO_RADIUS);
            } else {
                ctx.rect(x, y, dino.w, dino.h);
            }
            ctx.clip();
            ctx.drawImage(logoImg, x, y, dino.w, dino.h);
            ctx.restore();
            return;
        }

        ctx.fillStyle = '#bbb';
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, dino.w, dino.h, LOGO_RADIUS);
        } else {
            ctx.rect(x, y, dino.w, dino.h);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('img', x + dino.w / 2, y + dino.h / 2 + 4);
        ctx.textAlign = 'left';
    }

    function drawObstacles() {
        ctx.fillStyle = '#535353';
        for (const o of obstacles) {
            ctx.fillRect(Math.round(o.x), o.y, o.w, o.h);
            if (o.h > 40) {
                ctx.fillRect(Math.round(o.x) + o.w - 6, o.y + 10, 8, o.h - 10);
            }
        }
    }

    function drawFrame() {
        drawGround();
        drawObstacles();
        drawDino();
        if (state === 'dead') {
            ctx.fillStyle = '#535353';
            ctx.font = 'bold 16px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
            ctx.font = '14px system-ui, sans-serif';
            ctx.fillText('Очки: ' + Math.floor(score), W / 2, H / 2 + 12);
            ctx.textAlign = 'left';
        }
    }

    function loop() {
        if (state !== 'run') return;
        tick++;

        dino.vy += 0.58;
        dino.y += dino.vy;
        if (dino.y > GROUND - dino.h) {
            groundPlayer();
            dino.vy = 0;
        }

        for (const o of obstacles) {
            o.x -= speed;
        }
        obstacles = obstacles.filter((o) => o.x + o.w > -10);

        nextSpawn--;
        if (nextSpawn <= 0) {
            spawnObstacle();
            nextSpawn = 55 + Math.random() * 50 - Math.min(25, score / 80);
        }

        speed += 0.0012;
        score += speed / 20;
        if (scoreEl) scoreEl.textContent = String(Math.floor(score));

        const hitBox = { x: dino.x, y: dino.y, w: dino.w, h: dino.h };
        for (const o of obstacles) {
            if (collides(hitBox, { x: o.x, y: o.y, w: o.w, h: o.h })) {
                gameOver();
                return;
            }
        }

        drawFrame();
        raf = requestAnimationFrame(loop);
    }

    function gameInView() {
        const r = wrap.getBoundingClientRect();
        return r.bottom > 40 && r.top < window.innerHeight - 40;
    }

    canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        canvas.focus({ preventScroll: true });
        jump();
    });

    document.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (!gameInView()) return;
            e.preventDefault();
            jump();
        }
        if (state === 'dead' && e.code === 'Enter' && gameInView()) {
            e.preventDefault();
            resetGame();
        }
    });

    restartBtn?.addEventListener('click', () => {
        resetGame();
    });

    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'application');
    canvas.setAttribute(
        'aria-label',
        'Мини-игра: прыжок с логотипом через препятствия. Пробел — прыжок.'
    );

    resetGame();
})();
