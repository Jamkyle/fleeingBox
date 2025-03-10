"use client"

export default function Button({
  startGame,
  title,
}: {
  startGame: () => void;
  title: string;
}) {
  return (
    <span className="btn" onClick={startGame}>
      {title}
    </span>
  );
}
