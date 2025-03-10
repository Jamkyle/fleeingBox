'use client';

import { effect } from "../entities/bonus";

export default function Status({ stagEffect }: { stagEffect: effect[] }) {
  return (
    <ul className="cadre">
      {stagEffect.map(function (state, i) {
        return <li key={i}>{state}</li>;
      })}
    </ul>
  );
}
