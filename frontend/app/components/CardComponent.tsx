"use client";

import React from "react";

interface Card {
  id: number;
  name: string;
  email: string;
}

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {card.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="text-white font-medium">{card.name}</div>
        <div className="text-gray-400 text-sm">{card.email}</div>
      </div>
      <span className="ml-2 text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
        #{card.id}
      </span>
    </div>
  );
};

export default CardComponent;
