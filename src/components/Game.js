import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
    const canvasRef = useRef(null);
    const [snake, setSnake] = useState([
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 },
    ]);
    const [food, setFood] = useState(getRandomFoodPosition(snake));
    const [direction, setDirection] = useState({ x: 0, y: -1 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [canChangeDirection, setCanChangeDirection] = useState(true);
    const [speed, setSpeed] = useState(150); // Default speed
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const SNAKE_SIZE = 15; // Slimmer snake size
    const FOOD_RADIUS = 7.5; // Radius of the food

    // Load high score from localStorage
    useEffect(() => {
        const storedHighScore = localStorage.getItem('highScore');
        if (storedHighScore) {
            setHighScore(parseInt(storedHighScore, 10));
        }
    }, []);

    function getRandomFoodPosition(snake) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20),
            };
        } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    const moveSnake = () => {
        const newSnake = [...snake];
        const head = {
            x: newSnake[0].x + direction.x,
            y: newSnake[0].y + direction.y,
        };

        // Check for collision with walls
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            setIsGameOver(true);
            return;
        }

        // Check for collision with itself
        for (let segment of newSnake) {
            if (segment.x === head.x && segment.y === head.y) {
                setIsGameOver(true);
                return;
            }
        }

        newSnake.unshift(head);

        // Check for collision with food
        if (head.x === food.x && head.y === food.y) {
            setFood(getRandomFoodPosition(newSnake));
            setScore(score + 10); // Increase score
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
        setCanChangeDirection(true); // Allow direction change after the move
    };

    const handleKeyPress = (event) => {
        if (event.key === ' ') {
            setIsPaused(!isPaused);
            return;
        }

        if (!isGameStarted) {
            setIsGameStarted(true);
            setCanChangeDirection(true);
            setDirection({ x: 0, y: -1 });
        }

        if (!canChangeDirection || isPaused) return; // Prevent direction change if not allowed or paused

        let newDirection;
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y === 1) return;
                newDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (direction.y === -1) return;
                newDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (direction.x === 1) return;
                newDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === -1) return;
                newDirection = { x: 1, y: 0 };
                break;
            default:
                return;
        }
        setDirection(newDirection);
        setCanChangeDirection(false); // Prevent multiple direction changes in one tick
    };

    const restartGame = () => {
        const initialSnake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 },
        ];
        setSnake(initialSnake);
        setFood(getRandomFoodPosition(initialSnake));
        setDirection({ x: 0, y: -1 });
        setIsGameOver(false);
        setIsGameStarted(false); // Ensure the game waits for an arrow key press
        setIsPaused(false); // Reset pause state
        setCanChangeDirection(true); // Allow direction change at the start
        setScore(0); // Reset score
    };

    useEffect(() => {
        if (!isGameOver) {
            window.addEventListener('keydown', handleKeyPress);
            const interval = isGameStarted && !isPaused ? setInterval(moveSnake, speed) : null;
            return () => {
                window.removeEventListener('keydown', handleKeyPress);
                if (interval) clearInterval(interval);
            };
        } else {
            if (score > highScore) {
                setHighScore(score); // Update high score
                localStorage.setItem('highScore', score); // Save high score to localStorage
            }
        }
    }, [snake, direction, isGameOver, speed, isGameStarted, isPaused]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        context.fillStyle = 'green';
        snake.forEach(segment => {
            context.fillRect(segment.x * 20, segment.y * 20, SNAKE_SIZE, SNAKE_SIZE);
        });

        // Draw food
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(food.x * 20 + FOOD_RADIUS, food.y * 20 + FOOD_RADIUS, FOOD_RADIUS, 0, Math.PI * 2);
        context.fill();

        if (!isGameStarted && !isGameOver) {
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('Press any arrow key to start', canvas.width / 2, canvas.height / 2);
        }

        if (isPaused) {
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';
            context.font = '30px Arial';
            context.textAlign = 'center';
            context.fillText('Paused', canvas.width / 2, canvas.height / 2);
        }

        if (isGameOver) {
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';
            context.font = '30px Arial';
            context.textAlign = 'center';
            context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        }
    }, [snake, food, isGameOver, isGameStarted, isPaused]);

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
                <label>
                    Speed: 
                    <input
                        type="range"
                        min="50"
                        max="500"
                        step="50"
                        value={500 - speed}
                        onChange={(e) => setSpeed(500 - e.target.value)}
                        style={{ marginLeft: '10px' }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span>Score: {score}</span> | <span>High Score: {highScore}</span>
            </div>
            <canvas
                ref={canvasRef}
                width="400"
                height="400"
                style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}
            />
            {!isGameOver && (
                <div style={{ marginTop: '20px' }}>
                    <p>Click space to pause and unpause the game</p>
                </div>
            )}
            {isGameOver && (
                <button onClick={restartGame} style={{ marginTop: '20px' }}>
                    Restart
                </button>
            )}
        </div>
    );
};

export default Game;
