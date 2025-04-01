// js/physics.js
const Physics = {
	updateArrowPosition: (arrow, deltaTime = 1) => {
		if (!arrow.isActive) return;
		// Apply Gravity
		arrow.vy += Config.GRAVITY * deltaTime;
		// Apply Wind
		arrow.vx += Game.windForce * deltaTime; // Apply the global wind force directly to horizontal velocity

		// Update position
		arrow.x += arrow.vx * deltaTime;
		arrow.y += arrow.vy * deltaTime;
	},

	getArrowAngle: (arrow) => {
		return Math.atan2(arrow.vy, arrow.vx);
	},

	// --- Collision Checks ---

	// Arrow tip vs Apple collision
	checkCollisionArrowApple: (arrow, apple) => {
		if (!arrow.isActive || apple.isHit) return false;
		const arrowTipX = arrow.x + Math.cos(arrow.angle) * arrow.length / 2;
		const arrowTipY = arrow.y + Math.sin(arrow.angle) * arrow.length / 2;
		const dx = arrowTipX - apple.x;
		const dy = arrowTipY - apple.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < apple.radius; // Collision if tip is inside apple radius
	},

	// Arrow tip vs Stump collision (Rectangle check)
	checkCollisionArrowStump: (arrow, stump) => {
		if (!arrow.isActive) return false;
		const arrowTipX = arrow.x + Math.cos(arrow.angle) * arrow.length / 2;
		const arrowTipY = arrow.y + Math.sin(arrow.angle) * arrow.length / 2;

		const stumpLeft = stump.x - stump.width / 2;
		const stumpRight = stump.x + stump.width / 2;
		const stumpTop = stump.topY;
		const stumpBottom = stump.y; // Bottom is ground level

		return (
			arrowTipX > stumpLeft &&
			arrowTipX < stumpRight &&
			arrowTipY > stumpTop && // Must be below the top edge
			arrowTipY < stumpBottom // And above the bottom edge
		);
	},

	// Check if arrow hits ground or goes way off screen
	checkOutOfBounds: (arrow, canvasWidth, groundY) => {
		if (!arrow.isActive) return false;
		// Check using arrow's main position for simplicity, or tip
		const checkY = arrow.y + Math.sin(arrow.angle) * arrow.length / 2; // Tip Y
		const checkX = arrow.x + Math.cos(arrow.angle) * arrow.length / 2; // Tip X

		return checkY > groundY || checkX < -arrow.length || checkX > canvasWidth + arrow.length;
	},

	// --- Trajectory Prediction ---
	// Takes arrow's starting point, but uses angle/power from input
	predictTrajectory: (startX, startY, angle, power) => {
		const points = [];
		let simArrow = {
			x: startX, // Use actual arrow start X
			y: startY, // Use actual arrow start Y
			vx: Math.cos(angle) * power * Config.ARROW_SPEED_FACTOR,
			vy: Math.sin(angle) * power * Config.ARROW_SPEED_FACTOR,
			isActive: true
		};
		const stepTime = Config.TRAJECTORY_STEP_TIME; // Use config value

		for (let i = 0; i < Config.TRAJECTORY_STEPS; i++) {
			// Simulate physics step (same as updateArrowPosition)
			simArrow.vy += Config.GRAVITY * stepTime;
			simArrow.x += simArrow.vx * stepTime;
			simArrow.y += simArrow.vy * stepTime;

			// Add point every few steps for performance/clarity
			if (i % 2 === 0) { // Add points more frequently
				points.push({ x: simArrow.x, y: simArrow.y });
			}

			// Stop prediction if it hits the ground (approx)
			if (simArrow.y > Config.GROUND_Y + 10) break; // Add small buffer
			// Optional: Could add basic collision check with stump here too for better preview
		}
		return points;
	}
};