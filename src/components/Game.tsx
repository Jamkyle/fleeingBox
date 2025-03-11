"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Status from "./Status";
import Button from "./Button";
import Perso from "../entities/perso";
import Block from "../entities/block";
import Bonus, { effect } from "../entities/bonus";
import { useGameStore } from "../store/gameStore";
import Canvas from "./Canvas";
import { generatePlayers } from "../utils/gameLoop";
import { D, LEFT, Q, RIGHT } from "../utils/constants";
import { useCanvasStore } from "../store/canvasStore";
import { useBonusStore } from "../store/bonusStore";

const effects: Array<effect> = ["freeze", "speed", "invincible"];
type Item = Block | Bonus | Perso;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const effectTime = useRef<Partial<Record<effect, NodeJS.Timeout | null>>>({});


  const { setCanvas, setContext } = useCanvasStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    setCanvas(canvasRef.current);
    setContext(canvasRef.current.getContext("2d"));
  }, []);

  const {
    gameOver,
    setGameOver,
    score,
    addScore,
    freeze,
    setFreeze,
    invincible,
    bestScore,
    removeStagEffect,
    players,
    inGame,
    setInGame,
    setPlayers,
    setScore,
  } = useGameStore();

  const playersState = useBonusStore(state => state.playersState)

  const keysPressed = useRef<Partial<Record<number, boolean>>>({});
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
    const playersGenerated = generatePlayers(2);
    setPlayers(playersGenerated);
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
  }, [players]);

  const startGame = useCallback(() => {
    inter.current = setInterval(() => {
      if (Math.random() * 100 < 100) generateBonus(1);
      generateBlock(1);
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
    if (useGameStore.getState().gameOver) return;
    if (context.current) {
      context.current.clearRect(0, 0, SCX.current, SCY.current);

      blocks.current.forEach((block) => {
        block.freezed = freeze
      });

      updateObjects(blocks.current);
      updateObjects(bonus.current);
      updateObjects(players);

      checkCollisions(players, blocks.current);
      checkCollisions(players, bonus.current);
      requestAnimationFrame(update);
    }
  }, [players, freeze, playersState]);

  const handleRestart = () => {
    setScore(0);
    setPlayers(generatePlayers(2));
  };

  const generateBonus = (n: number) => {
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

  const generateBlock = (n: number) => {
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
      });
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
    effectTime.current[effect as effect] = setTimeout(() => {
      if (effect === "freeze") {
        setFreeze(false);
      }
      return removeStagEffect(effect);
    }, 5000);
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
            <Button startGame={handleRestart} title="Play Again" />
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
        <Status />
      </div>
    </div>
  );
};

export default Game;
