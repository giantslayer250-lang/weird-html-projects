const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() { // handle high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize, { passive: true }); // adjust canvas size on window resize
resize();
addEventListener("contextmenu", (e) => e.preventDefault()); // prevent right-click context menu 
addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); // prevent page scrolling on spacebar
        resetwind(); // reset wind force when spacebar is pressed
    }
});
const controls = document.getElementById("controls");

document.addEventListener("keydown", (event) => {

    // Press H to toggle controls
    if (event.key.toLowerCase() === "h") {

        if (controls.style.display === "none") {
            controls.style.display = "block";
        } else {
            controls.style.display = "none";
        }

    }
});
addEventListener("click", (event) => { 
    

}) ;
controls.classList.toggle("hidden");
// Simple physics object
let currentBackground = null;
const backgroundImage = new Image();
backgroundImage.src = 'background.jpg';
let balls = [];
let force = 0; // wind force in px/s^2
const btn = document.getElementById('remove-ball-btn');
const btn1 = document.getElementsByClassName('btn1')[0];
const btn2 = document.getElementsByClassName('btn2')[0];
const btn3 = document.getElementsByClassName('btn3')[0];
const btn4 = document.getElementsByClassName('btn4')[0];
const btn5 = document.getElementsByClassName('btn5')[0];
const numBalls = 20;
const Speed = 750; // max initial speed in px/s
let x = Math.random() * (canvas.clientWidth - 40) + 20,//ball initial x position
    y = Math.random() * (canvas.clientHeight - 40) + 20,//ball initial y position
    vx = (Math.random() - 0.5) * Speed,//x axis initial velocity
    vy = (Math.random() - 0.5) * Speed,//y axis initial velocity
    r = Math.random() * 10 + 20, //ball radius
    mass = 1;


let BGCOLOR = "rgba(0,0,0,0.2)"; // background color
let gravity = 0; // px/s^2
const restitution = 0.95; // bounciness
let environmentResistance = 0.01; // simple drag coefficient
let last = performance.now();
let dutation = 0;
let windParticles = [];
let dustParticles = [];

for (let i = 0; i < 200; i++) {
    dustParticles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        size: Math.random() * 1 + 0.75,
        speed: Math.random() * 30 + 10
    });
}
for (let i = 0; i < 50; i++) {
    windParticles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        length: Math.random() * 10 + 5
    });
}
function updateWind(dt) {
    for (const p of windParticles) {
        p.x += force * dt * 0.5;

        if (p.x > canvas.clientWidth + p.length) {
            p.x = -p.length;
            p.y = Math.random() * canvas.clientHeight;
        }

        if (p.x < -p.length) {
            p.x = canvas.clientWidth + p.length;
            p.y = Math.random() * canvas.clientHeight;
        }
    }
}
function removeBallFromSimulation() {
    if (balls.length > 0) {
        balls.pop(); // remove the last ball from the array
    }
}

btn.addEventListener("click", removeBallFromSimulation);

btn1.addEventListener("click", function () { // reset all balls
    balls = [];
});
function drawWind() {
    if (force === 0) return;

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;

    for (const p of windParticles) {
        ctx.beginPath();

        if (force > 0) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.length, p.y);
        } else {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.length, p.y);
        }

        ctx.stroke();
    }
}
function resolveCollision(ball1, ball2) {

    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const minDistance = ball1.r + ball2.r;

    if (distance < minDistance) {

        // Collision normal
        const nx = dx / distance;
        const ny = dy / distance;

        // Separate overlapping balls
        const overlap = minDistance - distance;

        const totalMass = ball1.mass + ball2.mass;

        ball1.x -= nx * overlap * (ball2.mass / totalMass);
        ball1.y -= ny * overlap * (ball2.mass / totalMass);

        ball2.x += nx * overlap * (ball1.mass / totalMass);
        ball2.y += ny * overlap * (ball1.mass / totalMass);

        // Relative velocity
        const rvx = ball2.vx - ball1.vx;
        const rvy = ball2.vy - ball1.vy;

        const velAlongNormal = rvx * nx + rvy * ny;

        // Ignore if balls are moving apart
        if (velAlongNormal > 0) return;

        const restitution = 0.95; // bounce factor

        const impulse =
            -(1 + restitution) * velAlongNormal /
            (1 / ball1.mass + 1 / ball2.mass);

        const impulseX = impulse * nx;
        const impulseY = impulse * ny;

        // Apply impulse
        ball1.vx -= impulseX / ball1.mass;
        ball1.vy -= impulseY / ball1.mass;

        ball2.vx += impulseX / ball2.mass;
        ball2.vy += impulseY / ball2.mass;
    }
}

function updateDust(dt) {
    for (const p of dustParticles) {

        // Wind affects horizontal movement
        p.x += (force * 0.1 + p.speed - 20) * dt;

        // Small random vertical drift
        p.y += (Math.random() - 0.5) * 20 * dt;

        // Wrap around screen
        if (p.x > canvas.clientWidth) {
            p.x = 0;
            p.y = Math.random() * canvas.clientHeight;
        }

        if (p.x < 0) {
            p.x = canvas.clientWidth;
            p.y = Math.random() * canvas.clientHeight;
        }

        if (p.y < 0) p.y = canvas.clientHeight;
        if (p.y > canvas.clientHeight) p.y = 0;
    }
}
function drawDust() {
    ctx.fillStyle = "rgba(220,220,220,0.5)";

    for (const p of dustParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
function animateball(ball, gravity, force, dt) {
    //integrate motion equations
    ball.vy += gravity * dt;
    ball.vx += force * dt;    // apply wind force
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;


    // apply air resistance (simulate drag)


    ball.vx *= (1 - environmentResistance * dt);
    ball.vy *= (1 - environmentResistance * dt);


    // collisions with walls


    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = -ball.vx * restitution; }
    if (ball.x + ball.r > canvas.clientWidth) { ball.x = canvas.clientWidth - ball.r; ball.vx = -ball.vx * restitution; }

    // floor & ceiling

    if (ball.y + ball.r > canvas.clientHeight) {
        ball.y = canvas.clientHeight - ball.r;
        ball.vy = -ball.vy * restitution;
        // prevent tiny jitter when ball is almost at rest
        if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
    }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = -ball.vy * restitution; }

}

// main animation loop 
function step(now) { // now is in milliseconds
    const dt = Math.min((now - last) / 1000, 0.05); // seconds, clamped
    last = now;
for (const b of balls) {
    animateball(b, gravity, force, dt);
}

for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
        resolveCollision(balls[i], balls[j]);
    }
}
    updateWind(dt);
    updateDust(dt);
    render();
    requestAnimationFrame(step);
}



// button event listeners
btn2.onhover = function () { // Optional: Add hover effect for gravity button
    btn2.style.backgroundColor = "";
};
btn2.addEventListener("click", function () { // toggle gravity on/off
    toggleGravity(btn2);
    btn2.textContent = gravity > 0 ? "Gravity : on" : "Gravity : off";
});

btn3.addEventListener("click", function () { // activate wind left

    activateWindLeft(btn3, calculateWindForce(btn3));
});
btn4.addEventListener("click", function () { // activate wind right

    activateWindRight(btn4, calculateWindForce(btn4));
});
// function to draw a ball
function makeball(x, y, vx, vy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
// function to reset ball properties
function resetAll() {
    ball.x = Math.random() * (canvas.clientWidth - 40) + 20;
    ball.y = Math.random() * (canvas.clientHeight - 40) + 20;
    ball.vx = (Math.random() - 0.5) * Speed;
    ball.vy = (Math.random() - 0.5) * Speed;
    ball.r = Math.random() * 20 + 20;
    ball.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}
// function to reset wind force
resetwind = () => {
    force = 0;
    btn3.classList.remove("active");
    btn4.classList.remove("active");
}
// function to calculate wind force based on button hold duration
function calculateWindForce(button) {
    // Calculate wind force based on some conditions or user input

    button.addEventListener("mousedown", () => {
        startTime = Date.now();
    });

    button.addEventListener("mouseup", () => {
        duration = Date.now() - startTime;
        // alert(`Held for ${duration} ms`);
    });
    return duration;
}
// functions to activate wind in left or right direction

function activateWindLeft(button, duration) {

    force = -duration; // apply wind force to the left
    console.log(force);

}
function activateWindRight(button, duration) {

    force = duration; // apply wind force to the right
    console.log(force);
}
function waterEnvironment() {
    environmentResistance = 0.8 // simulate water by increasing drag;
    console.log("Air friction increased:", environmentResistance);
    BGCOLOR = "rgb(74, 128, 255)"; // change background color to blue for water simulation

}
function voidEnvironment() {
    gravity = 0; // simulate void by removing gravity;
    environmentResistance = 0; // simulate void by removing drag;
    BGCOLOR = "rgba(0,0,0,1)"; // reset background color
    console.log("Air friction reset:", environmentResistance);
}
function openAirEnvironment(ctx) {
    gravity = 980; // simulate open air by setting normal gravity;
    environmentResistance = 0.01 // simulate open air by setting moderate drag;
    console.log("Air friction decreased:", environmentResistance);
    BGCOLOR = "rgba(255, 255, 255, 0)"; // reset background color
    currentBackground = bakcgroundImage;
}
// toggle gravity on/off
function toggleGravity(button) {
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
        gravity = 980;
    } else {
        gravity = 0;
    }

    console.log(gravity);
}
function addBalltosimulation() {
    if (balls.length < numBalls) {

        const x = Math.random() * (canvas.clientWidth - 40) + 20;
        const y = Math.random() * (canvas.clientHeight - 40) + 20;
        const vx = (Math.random() - 0.5) * Speed;
        const vy = (Math.random() - 0.5) * Speed;
        const r = Math.random() * 10 + 20;

        balls.push({
            x,
            y,
            vx,
            vy,
            r,
            mass: 1,
            color: `rgb(${Math.random()*255},
                        ${Math.random()*255},
                        ${Math.random()*255})`
        });
    }
}

addBallButton = document.getElementsByClassName('btn0')[0];
addBallButton.addEventListener("click", addBalltosimulation);

// render function to draw everything
function render() {
    if (currentBackground) {
        ctx.drawImage(currentBackground, 0, 0, canvas.clientWidth, canvas.clientHeight);
    } else {
        ctx.fillStyle = BGCOLOR;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.fillStyle = BGCOLOR;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    // draw ground line
    ctx.strokeStyle = "rgba(255,255,255,1)";


    ctx.beginPath();
    ctx.moveTo(0, canvas.clientHeight - 0.5);
    ctx.lineTo(canvas.clientWidth, canvas.clientHeight - 0.5);
    ctx.stroke();
    drawDust();
    drawWind();
    // draw ball
    for (const b of balls) {
        makeball(b.x, b.y, b.vx, b.vy, b.r, b.color);
    }
}

requestAnimationFrame(step);