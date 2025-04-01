// js/renderer.js
const Renderer = {
	clearCanvas: (ctx, canvas) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	drawBackground: (ctx, canvas) => {
		// Sky
		ctx.fillStyle = Config.COLOR_SKY;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Ground
		ctx.fillStyle = Config.COLOR_GROUND;
		ctx.fillRect(0, Config.GROUND_Y, canvas.width, canvas.height - Config.GROUND_Y);
	},

	drawArcher: (ctx, archer) => {
		archer.draw(ctx);
	},

	// drawTarget REMOVED

	drawStump: (ctx, stump) => {
		stump.draw(ctx);
	},

	drawApple: (ctx, apple) => {
		apple.draw(ctx);
	},

	drawArrow: (ctx, arrow) => {
		arrow.draw(ctx);
	},

	// --- New: Draw Start Circle ---
	drawStartCircle: (ctx, x, y, radius) => {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fillStyle = Config.COLOR_START_CIRCLE;
		ctx.fill();
	},
	// -----------------------------

	// Originates from touch start point now
	drawAimingLine: (ctx, startX, startY, endX, endY, powerRatio) => {
		const dx = endX - startX;
		const dy = endY - startY;
		const angle = Math.atan2(dy, dx);
		// Calculate visual length based on drag distance, clamped by MAX_POWER_DRAG
		const dragDistance = Math.sqrt(dx * dx + dy * dy);
		const visualLength = Math.min(dragDistance, Config.MAX_POWER_DRAG) * 0.6; // Adjust multiplier as needed

		ctx.save();
		ctx.translate(startX, startY); // Translate to touch start point
		ctx.rotate(angle);

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(visualLength, 0);

		const red = Math.floor(255 * powerRatio);
		const green = Math.floor(255 * (1 - powerRatio));
		ctx.strokeStyle = `rgb(${red}, ${green}, 0)`;
		ctx.lineWidth = 3;
		ctx.stroke();

		ctx.restore();
	},

	// Draws trajectory points calculated by physics
	drawTrajectoryPreview: (ctx, points) => {
		if (!points || points.length < 2) return;

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.strokeStyle = Config.COLOR_TRAJECTORY;
		ctx.lineWidth = 2;
		ctx.setLineDash([4, 4]); // Adjusted dash pattern
		ctx.stroke();
		ctx.setLineDash([]);
	},

	// --- UI Updates ---
	updateScoreDisplay: (score) => { // Keep this
		const scoreElement = document.getElementById('scoreDisplay');
		if (scoreElement) {
			scoreElement.textContent = `Score: ${score}`;
		}
	},

	updateArrowDisplay: (arrows) => { // Keep this
		const arrowElement = document.getElementById('arrowDisplay');
		if (!arrowElement) {
			const container = document.getElementById('gameContainer');
			const newDiv = document.createElement('div');
			newDiv.id = 'arrowDisplay';
			container?.appendChild(newDiv);
			// Apply styles if needed, or rely on CSS
		}
		const element = document.getElementById('arrowDisplay');
		if (element) {
			element.textContent = `Arrows: ${'💘'.repeat(arrows)}`;
		}
	},

	drawWindIndicator: (ctx, windForce) => {
		const indicatorX = Config.CANVAS_WIDTH / 2; // Centered horizontally
		const indicatorY = 55; // Position below score/arrows
		const arrowLength = 30;
		const arrowHeight = 10;
		const strength = Math.abs(windForce * 100).toFixed(0); // Use same strength calculation

		ctx.save();
		ctx.font = 'bold 16px "Comic Sans MS", cursive, sans-serif'; // Cute font
		ctx.textAlign = 'center';
		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black text/arrow

		if (Math.abs(windForce) < 0.001) {
			// Draw Calm indicator
			ctx.fillText('Wind: Calm', indicatorX, indicatorY);
		} else {
			const direction = windForce > 0 ? 1 : -1; // 1 for right, -1 for left

			// Draw Strength Text
			ctx.fillText(`Wind: ${strength}`, indicatorX, indicatorY);

			// Draw Arrow Shape (adjust Y position slightly for arrow)
			const arrowY = indicatorY + 20;
			ctx.beginPath();
			if (direction === 1) { // Pointing Right >>
				ctx.moveTo(indicatorX - arrowLength / 1.5, arrowY - arrowHeight / 2);
				ctx.lineTo(indicatorX + arrowLength / 3, arrowY - arrowHeight / 2);
				ctx.lineTo(indicatorX + arrowLength / 3, arrowY - arrowHeight); // Arrowhead bottom indent
				ctx.lineTo(indicatorX + arrowLength / 1.5, arrowY); // Arrow tip
				ctx.lineTo(indicatorX + arrowLength / 3, arrowY + arrowHeight); // Arrowhead top indent
				ctx.lineTo(indicatorX + arrowLength / 3, arrowY + arrowHeight / 2);
				ctx.lineTo(indicatorX - arrowLength / 1.5, arrowY + arrowHeight / 2);
			} else { // Pointing Left <<
				ctx.moveTo(indicatorX + arrowLength / 1.5, arrowY - arrowHeight / 2);
				ctx.lineTo(indicatorX - arrowLength / 3, arrowY - arrowHeight / 2);
				ctx.lineTo(indicatorX - arrowLength / 3, arrowY - arrowHeight); // Arrowhead bottom indent
				ctx.lineTo(indicatorX - arrowLength / 1.5, arrowY); // Arrow tip
				ctx.lineTo(indicatorX - arrowLength / 3, arrowY + arrowHeight); // Arrowhead top indent
				ctx.lineTo(indicatorX - arrowLength / 3, arrowY + arrowHeight / 2);
				ctx.lineTo(indicatorX + arrowLength / 1.5, arrowY + arrowHeight / 2);
			}
			ctx.closePath();
			ctx.fill(); // Fill the arrow shape
		}
		ctx.restore();
	},

	showGameOverScreen: (score) => {
		const screen = document.getElementById('gameOverScreen');
		const finalScoreEl = document.getElementById('finalScore');
		if (screen && finalScoreEl) {
			finalScoreEl.textContent = score;
			Leaderboard.displayLeaderboard('leaderboardList', score);
			screen.classList.remove('hidden');
		}
	},

	hideGameOverScreen: () => {
		const screen = document.getElementById('gameOverScreen');
		if (screen) {
			screen.classList.add('hidden');
		}
	}
};