// js/input.js
const Input = {
    isDragging: false,
    startPos: { x: 0, y: 0 },   // Position where dragging STARTED
    currentPos: { x: 0, y: 0 }, // Current finger/mouse position
    aimVector: { dx: 0, dy: 0 },
    power: 0,
    angle: 0,
    didShoot: false,            // Flag to signal shot attempt on release
    cancelShot: false,          // Flag to signal cancellation on release
    _canvas: null,
    _listeners: [],

    init: (canvas) => {
        Input._canvas = canvas;
        Input.removeListeners();

        const touchStart = (e) => { e.preventDefault(); Input.handleStart(e.touches[0]); };
        const touchMove = (e) => {
            // --- Debugging event.preventDefault ---
            if (e && typeof e.preventDefault === 'function') {
                 e.preventDefault(); // Prevent scroll ONLY if function exists
            } else {
                 console.warn('event.preventDefault is not available on touchmove event:', e);
            }
            // ---------------------------------------
             Input.handleMove(e.touches[0]);
        };
        const touchEnd = (e) => { e.preventDefault(); Input.handleEnd(); }; // Prevent click events after touchend
        const mouseDown = (e) => Input.handleStart(e);
        const mouseMove = (e) => Input.handleMove(e);
        const mouseUp = () => Input.handleEnd();

        // Add listeners with passive: false where preventDefault is used
        canvas.addEventListener('touchstart', touchStart, { passive: false });
        canvas.addEventListener('touchmove', touchMove, { passive: false });
        canvas.addEventListener('touchend', touchEnd, { passive: false });
        canvas.addEventListener('touchcancel', touchEnd, { passive: false }); // Treat cancel as end

        canvas.addEventListener('mousedown', mouseDown);
        canvas.addEventListener('mousemove', mouseMove);
        canvas.addEventListener('mouseup', mouseUp);
        canvas.addEventListener('mouseleave', mouseUp);

        Input._listeners = [
            { type: 'touchstart', func: touchStart, options: { passive: false } },
            { type: 'touchmove', func: touchMove, options: { passive: false } },
            { type: 'touchend', func: touchEnd, options: { passive: false } },
            { type: 'touchcancel', func: touchEnd, options: { passive: false } },
            { type: 'mousedown', func: mouseDown },
            { type: 'mousemove', func: mouseMove },
            { type: 'mouseup', func: mouseUp },
            { type: 'mouseleave', func: mouseUp }
        ];
    },

    removeListeners: () => {
        if (Input._canvas && Input._listeners.length > 0) {
             Input._listeners.forEach(listener => {
                 Input._canvas.removeEventListener(listener.type, listener.func, listener.options);
             });
             Input._listeners = [];
        }
    },

    getEventPosition: (event) => {
        const rect = Input._canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    },

    handleStart: (event) => {
        // Reset flags
        Input.didShoot = false;
        Input.cancelShot = false;

        Input.isDragging = true;
        Input.startPos = Input.getEventPosition(event);
        Input.currentPos = { ...Input.startPos };
        Input.aimVector = { dx: 0, dy: 0 };
        Input.power = 0;
        Input.angle = 0;
    },

    handleMove: (event) => {
        if (!Input.isDragging) return;
        Input.currentPos = Input.getEventPosition(event);

        // Aim vector points FROM current TO start (for intuitive aiming pull-back)
        Input.aimVector.dx = Input.startPos.x - Input.currentPos.x;
        Input.aimVector.dy = Input.startPos.y - Input.currentPos.y;

        Input.angle = Math.atan2(Input.aimVector.dy, Input.aimVector.dx);
        const dragDistance = Math.sqrt(Input.aimVector.dx**2 + Input.aimVector.dy**2);
        Input.power = Math.min(dragDistance, Config.MAX_POWER_DRAG);
    },

    handleEnd: () => {
        if (!Input.isDragging) return;

        // Check if release is within the start circle radius
        const releaseDx = Input.currentPos.x - Input.startPos.x;
        const releaseDy = Input.currentPos.y - Input.startPos.y;
        const releaseDistance = Math.sqrt(releaseDx**2 + releaseDy**2);

        if (releaseDistance < Config.START_CIRCLE_RADIUS && Input.power > 0) {
            // Released inside the circle after dragging -> Cancel shot
            Input.cancelShot = true;
            console.log("Shot cancelled - released inside start circle.");
        } else if (Input.power > 0) {
            // Released outside circle after dragging -> Attempt shot
            Input.didShoot = true;
            console.log("Shot attempted.");
        } else {
             // Simple click/tap without dragging, do nothing or maybe select?
             Input.cancelShot = true; // Treat tap as cancel for now
        }

        Input.isDragging = false;
        // Game loop will check Input.didShoot or Input.cancelShot
    },

    // Get data needed for aiming visuals and shooting
    getAimData: () => {
        return {
            angle: Input.angle,
            power: Input.power,
            powerRatio: Input.power / Config.MAX_POWER_DRAG,
            startPos: Input.startPos,     // For start circle & aim line origin
            currentPos: Input.currentPos, // For end of aim line
            isDragging: Input.isDragging
        };
    },

    // Reset state after shot or cancellation
    resetAfterAction: () => {
        Input.didShoot = false;
        Input.cancelShot = false;
        // Don't reset power/angle here, they are reset on next handleStart
    }
};