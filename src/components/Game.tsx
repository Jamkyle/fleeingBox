"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Status from "./Status";
import Button from "./Button";
import Perso from "../entities/perso";
import Block from "../entities/block";
import Bonus, { effect } from "../entities/bonus";
import { useGameStore } from "../store/gameStore";
import Canvas from "./Canvas";



const effects: Array<effect> = ["freeze", "speed", "invincible"];
type Item = Block | Bonus | Perso;
const keys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, Q: 81, D: 68 };
const { LEFT, RIGHT, Q, D } = keys;

const playerCMD = [{ left: LEFT, right: RIGHT }, { left: Q, right: D }]

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const effectTime = useRef<Partial<Record<effect, NodeJS.Timeout | null>>>({});
  const {
    gameOver,
    setGameOver,
    score,
    addScore,
    setFreeze,
    invincible,
    bestScore,
    stagEffect,
    setStagEffect,
    removeStagEffect,
    players,
    inGame,
    setInGame,
    setPlayers,
  } = useGameStore();

  const keysPressed = useRef<{ [key: number]: boolean }>({});
  const blocks = useRef<Block[]>([]);
  const bonus = useRef<Bonus[]>([]);
  const inter = useRef<NodeJS.Timeout | null>(null);
  const SCX = useRef(800);
  const SCY = useRef(800);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) context.current = ctx;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    const players = Player(2);
    setPlayers(players)
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (inter.current) clearInterval(inter.current);
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();

        // Set the canvas size
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Update SCX and SCY
        SCX.current = width;
        SCY.current = height;
        players.forEach((p) => p.setScreenWidth(width));
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (players.length > 0 && !inGame) {
      startGame();
      smoothMove();
    }
  }, [players])

  const handleGameOver = (playerId: string) => {
    useGameStore.setState((state) => {
      const remainingPlayers = state.players.filter((p) => p.name !== playerId);
      if (remainingPlayers.length === 0) {
        return { players: [], gameOver: true };
      }
      return { players: remainingPlayers };
    });
  };



  const startGame = useCallback(() => {
    inter.current = setInterval(() => {
      if (Math.random() * 100 < 40) doBonus(1);
      doBlock(1);
    }, 2000);
    setInGame(true);
    setGameOver(false);

    blocks.current = [];
    bonus.current = [];

    requestAnimationFrame(update);
  }, [players]);

  const addPoint = useCallback(
    (point: number) => {
      if (!gameOver || invincible) {
        addScore(1 + point);
        if (score >= bestScore) {
          localStorage.setItem("bestScore", String(score));
        }
      }
    },
    [score, bestScore, invincible],
  );

  const update = useCallback(() => {
    if (!gameOver && context.current) {
      context.current.clearRect(0, 0, SCX.current, SCY.current);
      updateObjects(blocks.current);
      updateObjects(bonus.current);
      updateObjects(players);

      checkCollisions(players, blocks.current);
      checkCollisions(players, bonus.current);
      requestAnimationFrame(update);
    }
  }, [players]);

  const Player = (n: number) => {
    const screenWidth = SCX.current || window.innerWidth;
    const screenHeight = SCY.current || window.innerHeight;
    const newPlayers = [];
    for (let i = 0; i < n; i++) {
      const player = new Perso({
        position: {
          x:
            screenWidth / 2 +
            i * 10,
          y: screenHeight - 50,
        },
        speed: 3,
        die: (playerId) => handleGameOver(playerId),
        size: 50,
        name: "player" + i,
        playerColor: "#FF2",
        screenWidth: SCX.current,
        cmd: playerCMD[i]
      });
      newPlayers.push(player);
    }
    return newPlayers
  };

  const doBonus = (n: number) => {
    for (let i = 0; i < n; i++) {
      const b = new Bonus({
        position: { x: 1 + Math.random() * (SCX.current - 100), y: 0 },
        speed: 1 + Math.random() * 2,
        size: 20,
        effect: effects[Math.floor(Math.random() * effects.length)],
      });
      bonus.current.push(b);
    }
  };

  const doBlock = (n: number) => {
    for (let i = 0; i < n; i++) {
      const block = new Block({
        position: { x: 1 + Math.random() * (SCX.current - 100), y: 0 },
        speed: 1 + Math.random() * 2,
        size: 10 + Math.floor(Math.random() * 100),
        addPoint: addPoint,
        color: "#000",
      });
      blocks.current.push(block);
    }
  };

  function smoothMove() {
    if (players.length > 0) {
      players.forEach((player) => {
        let moved = false;
        if (keysPressed.current[player.cmd.left]) {
          player.move("left");
          moved = true;
        }
        if (keysPressed.current[player.cmd.right]) {
          player.move("right");
          moved = true;
        }
        if (moved) {
          player.update();
        }
      })
    }
    requestAnimationFrame(smoothMove);
  }

  const updateObjects = (items: (Perso | Bonus | Block)[]) => {
    items.forEach((item: Perso | Bonus | Block) => {
      item.update();
      if (!item.delete) {
        item.render({ context: context.current });
      }
    });
  };

  const checkCollisions = (persos: Perso[], items: Block[] | Bonus[]) => {
    persos.forEach((perso) => {
      items.forEach((item: Block | Bonus) => {
        if (isCollide(perso, item)) {
          if (item instanceof Bonus && !item.collected) {
            addEffectInStag(item.effect);
          }
          if (!item.delete) {
            item.action(perso);
          }
        }
      });
    });
  };

  const handleKeyDown = ({ keyCode }: { keyCode: number }) => {
    if ([LEFT, RIGHT, Q, D].includes(keyCode)) {
      keysPressed.current[keyCode] = true;
    }
  };

  const handleKeyUp = ({ keyCode }: { keyCode: number }) => {
    if ([LEFT, RIGHT, Q, D].includes(keyCode)) {
      keysPressed.current[keyCode] = false;
    }
  };

  const addEffectInStag = useCallback((effect: effect) => {
    // Afficher l'effet dans le statut du jeu
    setStagEffect(effect);
    if (!effectTime.current) {
      effectTime.current = {};
    }
    const timer = effectTime.current[effect];
    if (effect === "freeze") {
      setFreeze(true);
    }
    if (timer) {
      clearTimeout(timer); // Ensures `clearTimeout` receives a valid argument
    }
    effectTime.current[effect as effect] = setTimeout(
      () => {
        if (effect === "freeze") {
          setFreeze(false);
        }
        return removeStagEffect(effect)
      },
      5000);
  }, []);

  const isCollide = (obj1: Item, obj2: Item) => {
    return !(
      obj1.position.y + obj1.size <= obj2.position.y || // Trop haut
      obj1.position.y >= obj2.position.y + obj2.size || // Trop bas
      obj1.position.x + obj1.size <= obj2.position.x || // Trop à gauche
      obj1.position.x >= obj2.position.x + obj2.size // Trop à droite
    );
  };

  return (
    <div id="scene">
      {gameOver && (
        <div className="gameover">
          <div className="inner">
            <p className="fnEnd">Game Over</p>
            <Button startGame={startGame} title="Play Again" />
            <p>Your Score: {score}</p>
            <p className="best">Best Score: {bestScore}</p>
          </div>
        </div>
      )}
      <Canvas ref={canvasRef} />
      <div id="score" className="score">
        Score: {score}
      </div>
      <div id="best" className="score _right">
        Best Score: {bestScore}
      </div>
      <div className="state">
        <Status stagEffect={stagEffect} />
      </div>
    </div>
  );
};

export default Game;
