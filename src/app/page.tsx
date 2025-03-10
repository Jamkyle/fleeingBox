"use client";
import React, { Suspense } from "react";
import Layout from "./layout";
import dynamic from "next/dynamic";
const Game = dynamic(() => import("../components/Game"), {
  ssr: false,
});
const HomePage: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={"...loading"}>
        <Game />
      </Suspense>
    </Layout>
  );
};

export default HomePage;
