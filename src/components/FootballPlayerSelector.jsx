import React, { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Define all available formations with their positions
const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'gk', top: '85%', left: '50%', label: 'GK', requiresGK: true },
      // Defenders
      { id: 'lb', top: '70%', left: '20%', label: 'LB' },
      { id: 'lcb', top: '70%', left: '40%', label: 'CB' },
      { id: 'rcb', top: '70%', left: '60%', label: 'CB' },
      { id: 'rb', top: '70%', left: '80%', label: 'RB' },
      // Midfielders
      { id: 'lm', top: '45%', left: '20%', label: 'LM' },
      { id: 'lcm', top: '45%', left: '40%', label: 'CM' },
      { id: 'rcm', top: '45%', left: '60%', label: 'CM' },
      { id: 'rm', top: '45%', left: '80%', label: 'RM' },
      // Forwards
      { id: 'ls', top: '20%', left: '35%', label: 'ST' },
      { id: 'rs', top: '20%', left: '65%', label: 'ST' },
    ],
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'gk', top: '85%', left: '50%', label: 'GK', requiresGK: true },
      // Defenders
      { id: 'lb', top: '70%', left: '20%', label: 'LB' },
      { id: 'lcb', top: '70%', left: '40%', label: 'CB' },
      { id: 'rcb', top: '70%', left: '60%', label: 'CB' },
      { id: 'rb', top: '70%', left: '80%', label: 'RB' },
      // Midfielders
      { id: 'cdm', top: '50%', left: '50%', label: 'CDM' },
      { id: 'lcm', top: '45%', left: '35%', label: 'CM' },
      { id: 'rcm', top: '45%', left: '65%', label: 'CM' },
      // Forwards
      { id: 'lw', top: '25%', left: '20%', label: 'LW' },
      { id: 'st', top: '20%', left: '50%', label: 'ST' },
      { id: 'rw', top: '25%', left: '80%', label: 'RW' },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'gk', top: '85%', left: '50%', label: 'GK', requiresGK: true },
      // Defenders
      { id: 'lb', top: '70%', left: '20%', label: 'LB' },
      { id: 'lcb', top: '70%', left: '40%', label: 'CB' },
      { id: 'rcb', top: '70%', left: '60%', label: 'CB' },
      { id: 'rb', top: '70%', left: '80%', label: 'RB' },
      // Defensive Midfielders
      { id: 'ldm', top: '55%', left: '40%', label: 'DM' },
      { id: 'rdm', top: '55%', left: '60%', label: 'DM' },
      // Attacking Midfielders
      { id: 'lam', top: '35%', left: '25%', label: 'AM' },
      { id: 'cam', top: '35%', left: '50%', label: 'CAM' },
      { id: 'ram', top: '35%', left: '75%', label: 'AM' },
      // Forward
      { id: 'st', top: '20%', left: '50%', label: 'ST' },
    ],
  },
};

const POSITIONS_ORDER = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

const FootballPlayerSelector = ({
  allPlayers = [],
  initialStarting = [],
  initialBench = [],
  initialFormation = '4-4-2',
  onSelectionChange,
}) => {
  const [selectedFormation, setSelectedFormation] = useState(initialFormation);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [pitchPlayers, setPitchPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState({});
  

  // Initialize players
  useEffect(() => {
    const selectedIds = new Set([...initialStarting, ...initialBench]);
    const available = allPlayers.filter(p => !selectedIds.has(p.id));
    const bench = allPlayers.filter(p => initialBench.includes(p.id));

    setAvailablePlayers(available);
    setBenchPlayers(bench);

    // Only set pitch players if we have initial starting players
    if (initialStarting.length > 0) {
      const pitchPlayersObj = {};
      initialStarting.forEach((playerId, index) => {
        const position = FORMATIONS[initialFormation].positions[index];
        if (position) {
          const player = allPlayers.find(p => p.id === playerId);
          if (player) {
            pitchPlayersObj[position.id] = player;
          }
        }
      });
      setPitchPlayers(pitchPlayersObj);
    }
  }, [allPlayers, initialFormation]); // Only depend on allPlayers

  // Validate positions
  useEffect(() => {
    const newWarnings = {};
    Object.entries(pitchPlayers).forEach(([positionId, player]) => {
      const position = FORMATIONS[selectedFormation].positions.find(p => p.id === positionId);
      if (position?.requiresGK && player.position !== 'Goalkeeper') {
        newWarnings[positionId] = 'Only goalkeepers can play in goal';
      }
    });
    setWarnings(newWarnings);
  }, [pitchPlayers, selectedFormation]);

  // Notify parent of changes
  const notifyChanges = useCallback(() => {
  if (!onSelectionChange) return;

  const startingIds = Object.values(pitchPlayers).map(p => p.id);
  const benchIds = benchPlayers.map(p => p.id);

  const changes = {
    startingPlayers: startingIds,
    benchPlayers: benchIds,
    formation: selectedFormation,
  };

  console.log('Notifying changes:', changes);
  onSelectionChange(changes);
}, [pitchPlayers, benchPlayers, selectedFormation, onSelectionChange]);

  useEffect(() => {
    notifyChanges();
  }, [notifyChanges]);

  const handleFormationChange = newFormation => {
    if (Object.keys(pitchPlayers).length > 0) {
      if (window.confirm('Changing formation will reset the current lineup. Continue?')) {
        setPitchPlayers({});
        setAvailablePlayers(prev => [...prev, ...Object.values(pitchPlayers)]);
        setSelectedFormation(newFormation);
      }
    } else {
      setSelectedFormation(newFormation);
    }
  };

  const handleDragEnd = result => {
    const { source, destination, draggableId } = result;
  
    if (!destination) return;
  
    const player = allPlayers.find(p => p.id === draggableId);
    if (!player) return;
  
    // Handle moving between any sections
    const sourceType = source.droppableId.split('-')[0];
    const destinationType = destination.droppableId.split('-')[0];
  
    // If dropping on a position that's already occupied, get the displaced player
    if (destinationType === 'position') {
      const positionId = destination.droppableId.replace('position-', '');
      const displacedPlayer = pitchPlayers[positionId];
      
      if (displacedPlayer) {
        // Add displaced player back to available players
        setAvailablePlayers(prev => [...prev, displacedPlayer]);
      }
    }
  
    // Remove from source
    if (sourceType === 'available') {
      setAvailablePlayers(prev => prev.filter(p => p.id !== draggableId));
    } else if (sourceType === 'bench') {
      setBenchPlayers(prev => prev.filter(p => p.id !== draggableId));
    } else if (sourceType === 'position') {
      const positionId = source.droppableId.replace('position-', '');
      setPitchPlayers(prev => {
        const updated = { ...prev };
        delete updated[positionId];
        return updated;
      });
    }
  
    // Add to destination
    if (destinationType === 'available') {
      setAvailablePlayers(prev => [...prev, player]);
    } else if (destinationType === 'bench') {
      if (benchPlayers.length >= 7) {
        setError('Maximum bench size is 7 players');
        return;
      }
      setBenchPlayers(prev => [...prev, player]);
    } else if (destinationType === 'position') {
      const positionId = destination.droppableId.replace('position-', '');
      const position = FORMATIONS[selectedFormation].positions.find(p => p.id === positionId);
  
      if (position?.requiresGK && player.position !== 'Goalkeeper') {
        setError('Only goalkeepers can play in goal');
        return;
      }
  
      if (Object.keys(pitchPlayers).length >= 11 && !pitchPlayers[positionId]) {
        setError('Cannot select more than 11 starting players');
        return;
      }
  
      setPitchPlayers(prev => ({
        ...prev,
        [positionId]: player,
      }));
    }
    
    setError('');
  };

  const PlayerDraggable = ({ player, index, isDraggingFrom }) => (
    <Draggable draggableId={player.id} index={index}>
      {(provided, snapshot) => {
        const circleSize = 48;
        
        const baseStyle = {
          ...provided.draggableProps.style,
          width: `${circleSize}px`,
          height: `${circleSize}px`,
        };
  
        return (
          <div className="flex flex-col items-center">
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={baseStyle}
              className={`
                rounded-full flex items-center justify-center bg-white border-2 mb-1
                ${snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
                ${snapshot.isDragging ? 'shadow-lg' : 'hover:border-blue-300'}
              `}
            >
              <div className="font-bold text-lg">
                {player.shirtNumber}
              </div>
            </div>
            {!snapshot.isDragging && (
              <div className="text-center w-[120px]">
                <div className="font-medium text-xs break-words leading-tight min-h-[2.5rem]">
                  {player.name}
                </div>
                <div className="text-gray-500 text-[10px]">{player.position}</div>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
  
  return (
    <div className="space-y-6">
      {/* Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

       {/* Formation Selector and Status */}
       <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="font-medium">Starting XI: {Object.keys(pitchPlayers).length}/11</div>
            <div>Bench: {benchPlayers.length} players</div>
          </div>
          <select
            value={selectedFormation}
            onChange={e => handleFormationChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.keys(FORMATIONS).map(formation => (
              <option key={formation} value={formation}>
                {formation}
              </option>
            ))}
          </select>
        </div>
        <Settings className="h-5 w-5 text-gray-400" />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {/* Available Players Column */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Available Players</h3>
            <div className="space-y-4">
              {POSITIONS_ORDER.map(position => (
                <div key={position}>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{position}s</h4>
                  <Droppable droppableId={`available-${position}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          grid grid-cols-3 gap-4 min-h-[80px] p-2 rounded-lg
                          ${snapshot.isDraggingOver ? 'bg-gray-50' : ''}
                        `}
                      >
                        {availablePlayers
                          .filter(p => p.position === position)
                          .map((player, index) => (
                            <PlayerDraggable
                              key={player.id}
                              player={player}
                              index={index}
                              isDraggingFrom="available"
                            />
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Column */}
          <div className="col-span-2">
            <div className="relative aspect-[3/4] bg-green-600 rounded-lg overflow-hidden">
              {/* Pitch markings remain the same */}
              
              {/* Formation positions */}
              {FORMATIONS[selectedFormation].positions.map(position => (
                <Droppable key={position.id} droppableId={`position-${position.id}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="absolute w-16 h-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ top: position.top, left: position.left }}
                    >
                      {pitchPlayers[position.id] ? (
                        <PlayerDraggable
                          player={pitchPlayers[position.id]}
                          index={0}
                          isDraggingFrom="pitch"
                        />
                      ) : (
                        <div className={`
                          w-12 h-12 border-2 border-dashed rounded-full 
                          flex items-center justify-center text-white
                          ${position.requiresGK ? 'border-yellow-300' : 'border-white'}
                        `}>
                          {position.label}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>

            {/* Bench Area */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">Bench</h3>
              <Droppable droppableId="bench" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      grid grid-cols-3 gap-4 min-h-[80px] p-2 rounded-lg
                      ${snapshot.isDraggingOver ? 'bg-gray-50' : ''}
                    `}
                  >
                    {benchPlayers.map((player, index) => (
                      <PlayerDraggable
                        key={player.id}
                        player={player}
                        index={index}
                        isDraggingFrom="bench"
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default FootballPlayerSelector;
