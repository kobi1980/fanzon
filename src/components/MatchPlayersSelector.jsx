import React from "react";

import FootballPlayerSelector from "./FootballPlayerSelector.jsx";

const MatchPlayersSelector = ({ allPlayers, initialStarting, initialBench, initialFormation, onSelectionChange }) => {
  if (!allPlayers || allPlayers.length === 0) {
    return null;
  }

  return (
    <FootballPlayerSelector
      allPlayers={allPlayers}
      initialStarting={initialStarting || []}
      initialBench={initialBench || []}
      initialFormation={initialFormation || '4-4-2'}
      onSelectionChange={onSelectionChange}
    />
  );
};

export default MatchPlayersSelector;
