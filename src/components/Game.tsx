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

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const effectTime = useRef<Partial<Record<effect, NodeJS.Timeout | null>>>({});
  const {
    gameOver,
    setGameOver,
    score,
    addScore,
    freeze,
    setFreeze,
    invincible,
    bestScore,
    stagEffect,
    setStagEffect,
    removeStagEffect
  } = useGameStore();

  const keysPressed = useRef<{ [key: number]: boolean }>({});
  const perso = useRef<Perso[]>([]);
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
    startGame();
    smoothMove();
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
        perso.current.forEach((p) => p.setScreenWidth(width));
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const handleGameOver = () => {
    if (perso.current.length === 0) {
      setGameOver(true);
    }
  };

  const startGame = useCallback(() => {
    const screenWidth = SCX.current || window.innerWidth;
    const screenHeight = SCY.current || window.innerHeight;
    inter.current = setInterval(() => {
      if (Math.random() * 100 < 40) doBonus(1);
      doBlock(1);
    }, 2000);

    setGameOver(false);

    perso.current = [
      new Perso({
        position: { x: screenWidth / 2, y: screenHeight - 100 },
        name: "player 0",
        speed: 3,
        size: 50,
        playerColor: "#FFF",
        die: () => handleGameOver,
      }),
    ];

    blocks.current = [];
    bonus.current = [];

    requestAnimationFrame(update);
  }, []);

  const addPoint = useCallback(
    (point: number) => {
      if (gameOver || invincible) {
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
      updateObjects(perso.current);

      checkCollisions(perso.current, blocks.current);
      checkCollisions(perso.current, bonus.current);
      requestAnimationFrame(update);
    }
  }, [freeze]);

  // const Player = (n: number) => {
  //   for (let i = 0; i < n; i++) {
  //     const player = new Perso({
  //       position: {
  //         x:
  //           (canvasRef?.current?.getBoundingClientRect().width || 800) / 2 +
  //           i * 10,
  //         y: (canvasRef?.current?.getBoundingClientRect().height || 500) - 50,
  //       },
  //       speed: 3,
  //       die: () => setGameOver(true),
  //       size: 50,
  //       name: "player" + i,
  //       playerColor: "#FF2",
  //     });
  //     perso.current.push(player);
  //   }
  // };

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
    if (perso.current.length > 0) {
      if (keysPressed.current[LEFT] || keysPressed.current[Q]) {
        perso.current[0].move("left");
      }
      if (keysPressed.current[RIGHT] || keysPressed.current[D]) {
        perso.current[0].move("right");
      }
      perso.current[0].update();
    }
    requestAnimationFrame(smoothMove);
  }

  const updateObjects = (items: (Perso | Bonus | Block)[]) => {
    items.forEach((item: Perso | Bonus | Block) => {
      if (item instanceof Block) {
        item.freezed = freeze;
      }
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
          item.action(perso);
          item.destroy();
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
    if (timer) {
      if (effect === "freeze") {
        setFreeze(true);
      }
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
