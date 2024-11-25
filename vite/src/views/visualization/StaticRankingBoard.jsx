// src/views/visualization/StaticRankingBoard.jsx
import React from 'react';

const StaticRankingBoard = ({ data }) => {
  return (
    <div className="static-ranking-board">
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaticRankingBoard;
