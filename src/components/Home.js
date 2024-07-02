import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Snake Game</h1>
      <Link to="/game">Start Game</Link>
    </div>
  );

};

export default Home;