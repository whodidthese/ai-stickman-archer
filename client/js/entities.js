// js/entities.js

// --- Base Stickman ---
function drawStickman(ctx, x, y, width, height, headRadius, color) {
    // Adjusted drawing logic for potentially better limb placement
    const bodyTopY = y - height + headRadius * 2;
    const neckY = y - height + headRadius * 2;
    const hipY = y - height * 0.4;
    const shoulderY = neckY + height * 0.15;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - height + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(x, neckY);
    ctx.lineTo(x, hipY);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x, hipY);
    ctx.lineTo(x - width / 2, y); // Left leg
    ctx.moveTo(x, hipY);
    ctx.lineTo(x + width / 2, y); // Right leg
    ctx.stroke();

    // Arms (pointing slightly forward)
    ctx.beginPath();
    ctx.moveTo(x, shoulderY);
    ctx.lineTo(x + width / 1.8, shoulderY + height * 0.2); // Right arm slightly forward/down
    ctx.moveTo(x, shoulderY);
    ctx.lineTo(x - width / 2.5, shoulderY + height * 0.1); // Left arm more horizontal
    ctx.stroke();
}

// --- Archer ---
class Archer {
    constructor(x, y, width, height, headRadius) {
        this.x = x;
        this.y = y; // Bottom of feet position
        this.width = width;
        this.height = height;
        this.headRadius = headRadius;
        // Bow/Arrow origin adjusted slightly relative to new drawing
        this.arrowOriginX = x + 5;
        this.arrowOriginY = y - height * 0.55;
    }

    draw(ctx) {
        drawStickman(ctx, this.x, this.y, this.width, this.height, this.headRadius, Config.COLOR_ARCHER);
        // Simple Bow Shape
        ctx.beginPath();
        ctx.arc(this.x - 2, this.arrowOriginY, 25, -Math.PI * 0.4, Math.PI * 0.4); // Arc for bow
        ctx.strokeStyle = Config.COLOR_ARCHER;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// --- Target REMOVED ---

// --- Stump ---
class Stump {
    constructor(x, y, width, height) {
        this.x = x; // Center x position
        this.y = y; // Bottom y position (on the ground)
        this.width = width;
        this.height = height;
        this.topY = y - height; // Calculate top Y for apple placement
    }

    updateHeight(newHeight) {
        this.height = newHeight;
        this.topY = this.y - this.height;
    }

    draw(ctx) {
        const drawX = this.x - this.width / 2; // Top-left corner X for rect drawing
        ctx.fillStyle = Config.COLOR_STUMP;
        ctx.fillRect(drawX, this.topY, this.width, this.height);
        // Add some texture/lines to stump (optional)
        ctx.strokeStyle = '#8B4513'; // SaddleBrown
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i < 4; i++) {
            const lineY = this.topY + (this.height / 4) * i;
            ctx.moveTo(drawX, lineY);
            ctx.lineTo(drawX + this.width, lineY);
        }
        ctx.stroke();
    }
}


// --- Apple (Now simpler, positioned on Stump) ---
class Apple {
    constructor(stump, radius, yOffset) {
        this.stump = stump; // Reference to the stump
        this.radius = radius;
        this.yOffset = yOffset; // Offset above the stump's top
        this.updatePosition();
        this.isHit = false;
    }

    updatePosition() {
        // Position relative to the stump
        this.x = this.stump.x;
        this.y = this.stump.topY + this.yOffset - this.radius; // Position based on stump top
    }

    draw(ctx) {
        if (this.isHit) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = Config.COLOR_APPLE;
        ctx.fill();
        // Optional: Tiny shine spot
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // White shine
        ctx.fill();
    }
}


// --- Arrow ---
class Arrow {
    constructor(x, y) {
        this.x = x; // Starting position (center)
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.length = 30;
        this.isActive = false;
    }

    shoot(angle, power) {
        const speed = power * Config.ARROW_SPEED_FACTOR;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.isActive = true;
        this.angle = angle;
        console.log(`Arrow shot: angle=${angle.toFixed(2)}, power=${power.toFixed(2)}, initial vx=${this.vx.toFixed(2)}, vy=${this.vy.toFixed(2)}`);
    }

    update(deltaTime) {
        if (!this.isActive) return;
        Physics.updateArrowPosition(this, deltaTime);
        this.angle = Physics.getArrowAngle(this);
    }

    draw(ctx) {
        if (!this.isActive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = Config.COLOR_ARROW;
        ctx.lineWidth = 2;

        // Arrow body
        ctx.beginPath();
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(this.length / 2, 0);
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(this.length / 2, 0);
        ctx.lineTo(this.length / 2 - 6, -3);
        ctx.moveTo(this.length / 2, 0);
        ctx.lineTo(this.length / 2 - 6, 3);
        ctx.stroke();

        // Fletching (tail feathers) - simple lines
        ctx.beginPath();
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(-this.length / 2 - 4, -4);
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(-this.length / 2 - 4, 4);
        ctx.stroke();


        ctx.restore();
    }
}