const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

let particles = [];
let bullets = [];
let enemies = [];
let score = 0;
let level = 1;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    vx: 0,
    vy: 0,
    friction: 0.98,
    angle: 0
};

// Partículas para efeito visual de impacto
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.alpha = 1;
        this.color = color;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.alpha -= 0.02;
    }
}

function spawnEnemy() {
    const radius = 20;
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    enemies.push({ x, y, radius, speed: 1 + (level * 0.2) });
}

window.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    
    // Mecânica de Recuo (Empurra o jogador na direção oposta)
    const recoil = 8;
    player.vx -= Math.cos(angle) * recoil;
    player.vy -= Math.sin(angle) * recoil;

    bullets.push({
        x: player.x, y: player.y,
        vx: Math.cos(angle) * 12,
        vy: Math.sin(angle) * 12
    });
});

function update() {
    // Física do Jogador
    player.vx *= player.friction;
    player.vy *= player.friction;
    player.x += player.vx;
    player.y += player.vy;

    // Limites do ecrã
    if (player.x < 0 || player.x > canvas.width) player.vx *= -1;
    if (player.y < 0 || player.y > canvas.height) player.vy *= -1;

    // Balas
    bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
    });

    // Inimigos
    if (Math.random() < 0.02 + (level * 0.005)) spawnEnemy();
    
    enemies.forEach((en, i) => {
        const angle = Math.atan2(player.y - en.y, player.x - en.x);
        en.x += Math.cos(angle) * en.speed;
        en.y += Math.sin(angle) * en.speed;

        // Colisão Bala-Inimigo
        bullets.forEach((b, bi) => {
            const dist = Math.hypot(en.x - b.x, en.y - b.y);
            if (dist < en.radius) {
                for(let k=0; k<8; k++) particles.push(new Particle(en.x, en.y, '#ff4757'));
                enemies.splice(i, 1);
                bullets.splice(bi, 1);
                score++;
                if (score % 10 === 0) level++;
                document.getElementById('score').innerText = `Nível: ${level} | Baterias: ${score}`;
            }
        });

        // Colisão Jogador-Inimigo (Game Over)
        const distPlayer = Math.hypot(en.x - player.x, en.y - player.y);
        if (distPlayer < en.radius + player.radius) {
            alert(`SISTEMA CRITICO! Pontuação final: ${score}`);
            location.reload();
        }
    });

    particles.forEach((p, i) => {
        p.update();
        if (p.alpha <= 0) particles.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Jogador (Um triângulo que aponta para o movimento)
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Balas
    ctx.fillStyle = '#eccc68';
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Inimigos
    ctx.fillStyle = '#ff4757';
    enemies.forEach(en => {
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    particles.forEach(p => p.draw());
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
