export const FORMATIONS = {
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