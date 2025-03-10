"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(ref, () => canvasRef.current);

  return (
    <canvas ref={canvasRef} style={{ display: "block" }} className="scene" />
  );
});

export default Canvas;
