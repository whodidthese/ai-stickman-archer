// js/leaderboard.js
const Leaderboard = {
	getScores: () => {
		try {
			const scoresJSON = localStorage.getItem(Config.LEADERBOARD_KEY);
			return scoresJSON ? JSON.parse(scoresJSON) : [];
		} catch (e) {
			console.error("Could not retrieve scores from localStorage:", e);
			return [];
		}
	},

	saveScore: (newScore) => {
		if (typeof newScore !== 'number' || isNaN(newScore)) return;

		try {
			const scores = Leaderboard.getScores();
			scores.push(newScore);
			scores.sort((a, b) => b - a); // Sort descending

			// Keep only top N scores
			const topScores = scores.slice(0, Config.LEADERBOARD_MAX_ENTRIES);

			localStorage.setItem(Config.LEADERBOARD_KEY, JSON.stringify(topScores));
		} catch (e) {
			console.error("Could not save score to localStorage:", e);
		}
	},

	displayLeaderboard: (elementId, currentScore) => {
		const listElement = document.getElementById(elementId);
		if (!listElement) return;

		const scores = Leaderboard.getScores();
		listElement.innerHTML = ''; // Clear previous list

		if (scores.length === 0) {
			listElement.innerHTML = '<li>No scores yet!</li>';
		} else {
			scores.forEach((score, index) => {
				const li = document.createElement('li');
				li.textContent = `${index + 1}. ${score}`;
				// Optional: Highlight current game's score if it's in the top list
				// if (score === currentScore && !highlighted) {
				//    li.style.fontWeight = 'bold';
				//    li.style.color = '#4CAF50'; // Highlight color
				//    highlighted = true; // Prevent highlighting duplicates if scores are same
				//}
				listElement.appendChild(li);
			});
		}

		// Add current score if it's not already clear from context
		// (Already shown above leaderboard in this layout)
		// const currentScoreEl = document.createElement('li');
		// currentScoreEl.textContent = `Your game: ${currentScore}`;
		// currentScoreEl.style.marginTop = '10px';
		// listElement.appendChild(currentScoreEl);
	}
};