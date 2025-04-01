// js/game.js
const Game = {
	canvas: null,
	ctx: null,
	archer: null,
	// target: null, // REMOVED
	stump: null,   // ADDED
	apple: null,
	arrow: null,
	score: 0,
	arrowsRemaining: Config.INITIAL_ARROWS, // ADDED
	targetDistance: Config.INITIAL_TARGET_DISTANCE,
	gameState: 'aiming', // 'aiming', 'flying', 'gameOver'
	lastTime: 0,
	animationFrameId: null,

	// ... Add wind state variables ...
	windForce: 0,     // Current wind strength and direction (+ve right, -ve left)
	windDirection: 1, // Track direction separately if needed for indicator

	init: () => {
		Game.canvas = document.getElementById('gameCanvas');
		if (!Game.canvas) return;
		Game.ctx = Game.canvas.getContext('2d');
		Game.canvas.width = Config.CANVAS_WIDTH;
		Game.canvas.height = Config.CANVAS_HEIGHT;

		Input.init(Game.canvas);
		Game.resetGame(); // Setup initial state

		const restartButton = document.getElementById('restartButton');
		restartButton?.addEventListener('click', Game.resetGame);

		Game.lastTime = performance.now();
		Game.gameLoop(Game.lastTime);
		console.log("Pink Archer Game Initialized");
	},

	resetGame: () => {
		console.log("Resetting game...");
		if (Game.animationFrameId) cancelAnimationFrame(Game.animationFrameId);

		Game.score = 0;
		Game.arrowsRemaining = Config.INITIAL_ARROWS; // Reset arrows
		Game.targetDistance = Config.INITIAL_TARGET_DISTANCE;
		Game.gameState = 'aiming';
		Renderer.updateScoreDisplay(Game.score);
		Renderer.updateArrowDisplay(Game.arrowsRemaining); // Update arrow display
		Renderer.hideGameOverScreen();
		Input.resetAfterAction(); // Reset input flags

		// Create archer
		Game.archer = new Archer(
			Config.ARCHER_POS_X, Config.ARCHER_POS_Y,
			Config.STICKMAN_WIDTH, Config.STICKMAN_HEIGHT, Config.HEAD_RADIUS
		);

		// Create Stump with initial random height
		const initialStumpHeight = Game.getRandomStumpHeight();
		const stumpX = Config.ARCHER_POS_X + Game.targetDistance; // Position based on distance
		Game.stump = new Stump(
			stumpX, Config.GROUND_Y, // Position relative to ground
			Config.STUMP_WIDTH, initialStumpHeight
		);

		// Create apple on the stump
		Game.apple = new Apple(Game.stump, Config.APPLE_RADIUS, Config.APPLE_ON_STUMP_Y_OFFSET);
		Game.apple.isHit = false;

		// Create initial arrow at archer's bow position
		Game.arrow = new Arrow(Game.archer.arrowOriginX, Game.archer.arrowOriginY);
		Game.arrow.isActive = false;

		Game.lastTime = performance.now();
		Game.animationFrameId = requestAnimationFrame(Game.gameLoop);
	},

	getRandomStumpHeight: () => {
		return Math.random() * (Config.MAX_STUMP_HEIGHT - Config.MIN_STUMP_HEIGHT) + Config.MIN_STUMP_HEIGHT;
	},

	prepareNextShot: (isHit) => {
		let nextStumpHeight = Game.stump.height; // Keep current height by default
		let nextStumpX = Game.stump.x;       // Keep current X by default

		if (isHit) {
			Game.score++;
			Renderer.updateScoreDisplay(Game.score);

			// Increase target distance, but cap it
			const newDistance = Game.targetDistance + Config.DISTANCE_INCREMENT;
			Game.targetDistance = Math.min(newDistance, Config.MAX_TARGET_DISTANCE); // Apply cap

			// Get new stump position and height
			nextStumpHeight = Game.getRandomStumpHeight();
			nextStumpX = Config.ARCHER_POS_X + Game.targetDistance; // Use potentially capped distance

			// --- Introduce/Increase Wind (Example logic) ---
			if (Game.score > 3) { // Start wind after score 3
				// Increase wind slightly, random direction, cap magnitude
				let potentialWind = (Game.score - 3) * 0.008; // Adjust multiplier for wind strength scaling
				Game.windForce = Math.min(potentialWind, 0.15); // Cap max wind force
				if (Math.random() < 0.4) { // 40% chance to change direction
					Game.windDirection = Math.random() < 0.5 ? 1 : -1; // 1 for right, -1 for left
				}
				// Apply direction
				Game.windForce *= Game.windDirection;
				console.log(`Wind Force: ${Game.windForce.toFixed(3)}`);
			}
			// -------------------------------------------

			// --- Optional: Shrink Apple at Higher Score ---
			// if (Game.score > 10 && Game.apple.radius > Config.APPLE_RADIUS * 0.8) {
			//     Game.apple.radius *= 0.98; // Shrink slightly
			//     console.log(`Apple radius reduced to: ${Game.apple.radius.toFixed(1)}`);
			// }
			// ---------------------------------------------


			console.log(`Apple Hit! Score: ${Game.score}. Next round distance: ${Game.targetDistance.toFixed(0)}, Stump Height: ${nextStumpHeight.toFixed(0)}`);

		} else {
			// Missed - decrement arrows
			Game.arrowsRemaining--;
			Renderer.updateArrowDisplay(Game.arrowsRemaining);
			console.log(`Miss! Arrows remaining: ${Game.arrowsRemaining}`);
			if (Game.arrowsRemaining <= 0) {
				Game.gameOver();
				return; // Don't reset arrow if game is over
			}
			// Keep apple/stump position and height the same for the next shot on miss
			Game.apple.isHit = false;
		}

		// Update stump position and height (applies changes from hit or keeps old values on miss)
		Game.stump.x = nextStumpX;
		Game.stump.updateHeight(nextStumpHeight);

		// Update apple position based on stump
		Game.apple.updatePosition();
		Game.apple.isHit = false; // Ensure apple is drawable


		// Reset arrow for the next shot (if game not over)
		Game.arrow = new Arrow(Game.archer.arrowOriginX, Game.archer.arrowOriginY);
		Game.arrow.isActive = false;
		Game.gameState = 'aiming';
		Input.resetAfterAction();
	},

	gameOver: () => {
		console.log(`Game Over! Final Score: ${Game.score}`);
		Game.gameState = 'gameOver'; // Set state first
		Game.arrow.isActive = false; // Ensure arrow stops visually
		Leaderboard.saveScore(Game.score);
		Renderer.showGameOverScreen(Game.score);
		// Loop continues but updates/drawing stop based on gameState
	},

	update: (deltaTime) => {
		// --- State: Flying (Arrow in motion) ---
		if (Game.gameState === 'flying') {
			const subSteps = 3; // Number of sub-steps per frame (increase if tunneling still occurs)
			const subDeltaTime = deltaTime / subSteps;
			let collisionDetected = false; // Flag to track if collision happened in sub-steps

			for (let i = 0; i < subSteps; i++) {
				// Only update physics if the arrow is still active
				if (!Game.arrow.isActive) break;

				// --- 1. Update Arrow Position for Sub-step ---
				Game.arrow.update(subDeltaTime); // Pass subDeltaTime to arrow's update

				// --- 2. Perform Collision Checks *after* each sub-step ---
				if (Physics.checkCollisionArrowApple(Game.arrow, Game.apple)) {
					console.log(`Apple Hit detected in sub-step ${i + 1}`);
					Game.apple.isHit = true;
					Game.arrow.isActive = false;
					Game.gameState = 'hitPause'; // Set pause state
					collisionDetected = true;
					setTimeout(() => Game.prepareNextShot(true), 300); // Schedule next round prep
					break; // Exit sub-step loop once collision occurs
				}

				if (Physics.checkCollisionArrowStump(Game.arrow, Game.stump)) {
					console.log(`Stump Hit detected in sub-step ${i + 1}`);
					Game.arrow.isActive = false;
					Game.gameState = 'missPause';
					collisionDetected = true;
					setTimeout(() => Game.prepareNextShot(false), 300);
					break;
				}

				if (Physics.checkOutOfBounds(Game.arrow, Game.canvas.width, Config.GROUND_Y)) {
					console.log(`Out of Bounds detected in sub-step ${i + 1}`);
					Game.arrow.isActive = false;
					Game.gameState = 'missPause';
					collisionDetected = true;
					setTimeout(() => Game.prepareNextShot(false), 300);
					break;
				}
			}
			// Note: If no collision occurred in any sub-step, the arrow continues flying normally.

			// --- State: Aiming ---
		} else if (Game.gameState === 'aiming') {
			if (Input.didShoot) {
				const aimData = Input.getAimData();
				Game.arrow.shoot(aimData.angle, aimData.power);
				Game.gameState = 'flying';
				Input.resetAfterAction();
			} else if (Input.cancelShot) {
				Input.resetAfterAction();
			}
		}
		// Other states (hitPause, missPause, gameOver) don't have active updates here.
	},

	render: () => {
		Renderer.clearCanvas(Game.ctx, Game.canvas);
		Renderer.drawBackground(Game.ctx, Game.canvas);

		// Draw Game Elements
		Renderer.drawArcher(Game.ctx, Game.archer);
		Renderer.drawStump(Game.ctx, Game.stump);
		Renderer.drawApple(Game.ctx, Game.apple);

		// Draw Arrow
		if (Game.arrow.isActive || Game.gameState === 'missPause' || Game.gameState === 'hitPause') {
			Renderer.drawArrow(Game.ctx, Game.arrow);
		}

		// Draw Aiming Visuals
		if (Game.gameState === 'aiming' && Input.isDragging) {
			const aimData = Input.getAimData();
			Renderer.drawStartCircle(Game.ctx, aimData.startPos.x, aimData.startPos.y, Config.START_CIRCLE_RADIUS);
			Renderer.drawAimingLine(Game.ctx, aimData.startPos.x, aimData.startPos.y, aimData.currentPos.x, aimData.currentPos.y, aimData.powerRatio);
			const trajectoryPoints = Physics.predictTrajectory(
				Game.archer.arrowOriginX, Game.archer.arrowOriginY,
				aimData.angle, aimData.power
			);
			Renderer.drawTrajectoryPreview(Game.ctx, trajectoryPoints);
		}

		// --- Draw Wind Indicator on Canvas ---
		Renderer.drawWindIndicator(Game.ctx, Game.windForce);
		// -------------------------------------
	},

	gameLoop: (currentTime) => {
		if (Game.gameState === 'gameOver') {
			// Optionally render one last frame if needed, then stop.
			// Game.render();
			// cancelAnimationFrame(Game.animationFrameId); // Or just let it idle
			// return; // Stop loop updates entirely? Depends on desired behavior.
			// Current setup lets render run but update does nothing.
		}

		const deltaTime = (currentTime - Game.lastTime) / (1000 / 60); // Normalize to 60fps
		Game.lastTime = currentTime;

		// Basic catch for large deltaTime (e.g., tab backgrounded)
		if (deltaTime < 10) {
			// Only update game logic if not paused or game over
			if (Game.gameState !== 'hitPause' && Game.gameState !== 'missPause' && Game.gameState !== 'gameOver') {
				Game.update(deltaTime);
			}
			Game.render(); // Always render the current state
		} else {
			console.warn("Large deltaTime skipped:", deltaTime.toFixed(1));
		}

		Game.animationFrameId = requestAnimationFrame(Game.gameLoop);
	}
};

window.addEventListener('load', Game.init);