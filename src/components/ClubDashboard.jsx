import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import FootballPlayerSelector from './FootballPlayerSelector.jsx';
import { FORMATIONS } from '../utils/formations';


const ClubDashboard = () => {
  const { user } = useAuth();
  const isRTL = text => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlRegex.test(text);
  };

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('match-info');
  const [formData, setFormData] = useState({
    opponent: '',
    isHome: true,
    date: '',
    time: '',
    articleUrl: '',
    startingPlayers: [],
    benchPlayers: [],
    formation: '4-4-2'
  });

  const fetchPlayers = useCallback(async () => {
    try {
      const q = query(collection(db, 'players'), where('clubId', '==', user.uid));
      const snapshot = await getDocs(q);
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, [user?.uid]);

  const fetchMatches = useCallback(async () => {
    try {
      const q = query(collection(db, 'matches'), where('clubId', '==', user.uid));
      const snapshot = await getDocs(q);
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedMatches = matchesData.sort((a, b) => {
        const dateA = new Date(a.datetime.seconds * 1000);
        const dateB = new Date(b.datetime.seconds * 1000);
        return dateA - dateB;
      });

      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchMatches();
      fetchPlayers();
    }
  }, [user?.uid, fetchMatches, fetchPlayers]);

  const handlePlayerSelection = useCallback(({ startingPlayers, benchPlayers, formation }) => {
    setFormData(prev => ({
      ...prev,
      startingPlayers,
      benchPlayers,
      formation,
    }));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.startingPlayers.length !== 11) {
      alert('You must select exactly 11 starting players');
      return;
    }

    const matchData = {
      clubId: user.uid,
      clubName: user.clubData.clubName,
      opponent: formData.opponent,
      isHome: formData.isHome === 'true' ? true : false,
      datetime: new Date(`${formData.date}T${formData.time}`),
      totalGrant: editMatch ? editMatch.totalGrant : 0,
      grants: editMatch ? editMatch.grants : {},
      articleUrl: formData.articleUrl || null,
      benchPlayers: formData.benchPlayers,
      startingPlayers: formData.startingPlayers.map(p => typeof p === 'string' ? p : p.playerId),
      startingPositions: formData.startingPlayers.map(p => typeof p === 'string' ? null : p.positionId),
      formation: formData.formation,
    };

    try {
      if (editMatch) {
        await updateDoc(doc(db, 'matches', editMatch.id), matchData);
      } else {
        await addDoc(collection(db, 'matches'), matchData);
      }
      await fetchMatches();
      setShowAddMatch(false);
      setEditMatch(null);
      setFormData({
        opponent: '',
        isHome: true,
        date: '',
        time: '',
        articleUrl: '',
        startingPlayers: [],
        benchPlayers: [],
      });
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleDelete = async matchId => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const handleEdit = match => {
    const datetime = new Date(match.datetime.seconds * 1000);
    
    // Reconstruct the player positions array
    const startingPlayers = (match.startingPlayers || []).map((playerId, index) => ({
      playerId,
      positionId: match.startingPositions && match.startingPositions[index] 
        ? match.startingPositions[index] 
        // If no position stored, map to default formation positions
        : FORMATIONS[match.formation || '4-4-2'].positions[index]?.id
    }));
  
    setFormData({
      opponent: match.opponent,
      isHome: match.isHome.toString(),
      date: datetime.toISOString().split('T')[0],
      time: datetime.toTimeString().split(' ')[0].slice(0, 5),
      articleUrl: match.articleUrl || '',
      startingPlayers: startingPlayers,
      benchPlayers: match.benchPlayers || [],
      formation: match.formation || '4-4-2',
    });
    setEditMatch(match);
    setShowAddMatch(true);
  };

  const resetForm = () => {
    setShowAddMatch(false);
    setEditMatch(null);
    setFormData({
      opponent: '',
      isHome: true,
      date: '',
      time: '',
      articleUrl: '',
      startingPlayers: [],
      benchPlayers: [],
    });
    setActiveTab('match-info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{user?.clubData?.clubName} Dashboard</h1>
        <button
          onClick={() => setShowAddMatch(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Match
        </button>
      </div>

      {showAddMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editMatch ? 'Edit Match' : 'Add New Match'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="match-info">Match Info</TabsTrigger>
                <TabsTrigger
                  value="players"
                  disabled={!formData.opponent || !formData.date || !formData.time}
                >
                  Players Selection
                </TabsTrigger>
              </TabsList>

              <TabsContent value="match-info">
                <form onSubmit={e => e.preventDefault()} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Opponent Team</label>
                    <input
                      type="text"
                      value={formData.opponent}
                      onChange={e => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Match Type</label>
                    <select
                      value={formData.isHome}
                      onChange={e => setFormData(prev => ({ ...prev, isHome: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="true">Home</option>
                      <option value="false">Away</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Article URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.articleUrl}
                      onChange={e => setFormData(prev => ({ ...prev, articleUrl: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.opponent && formData.date && formData.time) {
                          setActiveTab('players');
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Next: Select Players
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="players">
                <div className="space-y-6">
                  <FootballPlayerSelector
                    allPlayers={players}
                    initialStarting={formData.startingPlayers}
                    initialBench={formData.benchPlayers}
                    initialFormation={formData.formation}
                    onSelectionChange={handlePlayerSelection}
                  />

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('match-info')}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Back to Match Info
                    </button>
                    <div className="space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        {editMatch ? 'Save Changes' : 'Add Match'}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Grant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map(match => (
              <tr key={match.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isRTL(match.opponent) && isRTL(user?.clubData?.clubName) ? (
                    <div className="text-right">
                      {match.isHome ? (
                        <>
                          <span>{match.opponent}</span>
                          <span className="text-gray-500"> נגד </span>
                          <span className="font-medium">{user?.clubData?.clubName}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{user?.clubData?.clubName}</span>
                          <span className="text-gray-500"> נגד </span>
                          <span>{match.opponent}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-left">
                      {match.isHome ? (
                        <>
                          <span className="font-medium">{user?.clubData?.clubName}</span>
                          <span className="text-gray-500"> vs </span>
                          <span>{match.opponent}</span>
                        </>
                      ) : (
                        <>
                          <span>{match.opponent}</span>
                          <span className="text-gray-500"> vs </span>
                          <span className="font-medium">{user?.clubData?.clubName}</span>
                        </>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(match.datetime.seconds * 1000).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${match.totalGrant?.toLocaleString() ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium">
                      Starting XI: {match.startingPlayers?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Bench: {match.benchPlayers?.length || 0}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(match)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClubDashboard;
