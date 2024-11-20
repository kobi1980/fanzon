import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ClubDashboard = () => {
  const { user } = useAuth();
  const isRTL = (text) => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlRegex.test(text);
  };
  const [matches, setMatches] = useState([]);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [formData, setFormData] = useState({
    opponent: '',
    isHome: true,
    date: '',
    time: '',
    articleUrl: ''
  });

  useEffect(() => {
    fetchMatches();
  }, [user.uid]);

    const fetchMatches = async () => {
    try {
        const q = query(
        collection(db, 'matches'),
        where('clubId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
        
        // Sort matches by date
        const sortedMatches = matchesData.sort((a, b) => {
        const dateA = new Date(a.datetime.seconds * 1000);
        const dateB = new Date(b.datetime.seconds * 1000);
        return dateA - dateB;
        });
        
        setMatches(sortedMatches);
    } catch (error) {
        console.error('Error fetching matches:', error);
    }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const matchData = {
        clubId: user.uid,
        clubName: user.clubData.clubName,
        opponent: formData.opponent,
        isHome: formData.isHome === 'true' ? true : false,
        datetime: new Date(`${formData.date}T${formData.time}`),
        totalGrant: 0,
        grants: {},
        articleUrl: formData.articleUrl || null
      };

        console.log('Form data before submit:', formData);
        console.log('Match data being saved:', matchData);
      console.log('Match data being saved:', matchData);

    try {
      if (editMatch) {
        await updateDoc(doc(db, 'matches', editMatch.id), matchData);
      } else {
        await addDoc(collection(db, 'matches'), matchData);
      }
      await fetchMatches();
      setShowAddMatch(false);
      setEditMatch(null);
      setFormData({ opponent: '', isHome: true, date: '', time: '' });
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleDelete = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
        fetchMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const handleEdit = (match) => {
    const datetime = new Date(match.datetime.seconds * 1000);
    setFormData({
      opponent: match.opponent,
      isHome: match.isHome.toString(),
      date: datetime.toISOString().split('T')[0],
      time: datetime.toTimeString().split(' ')[0].slice(0, 5),
      articleUrl: match.articleUrl || ''
    });
    setEditMatch(match);
    setShowAddMatch(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {user.clubData.clubName} Dashboard
        </h1>
        <button
          onClick={() => setShowAddMatch(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Match
        </button>
      </div>

      {showAddMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">
            {editMatch ? 'Edit Match' : 'Add New Match'}
          </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Opponent Team
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                    Match Type
                </label>
                <select
                    value={formData.isHome}
                    onChange={(e) => {
                    console.log('Selected value:', e.target.value);
                    setFormData({ ...formData, isHome: e.target.value })
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="true">Home</option>
                    <option value="false">Away</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, articleUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                    Enter the URL of the article you want to display
                    </p>
                </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMatch(false);
                    setEditMatch(null);
                    setFormData({ opponent: '', isHome: true, date: '', time: '' });
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editMatch ? 'Save Changes' : 'Add Match'}
                </button>
              </div>
            </form>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map((match) => (
              <tr key={match.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                {isRTL(match.opponent) && isRTL(user.clubData.clubName) ? (
                    // Both teams are RTL
                    <div className="text-right">
                    {match.isHome ? (
                        <>
                        <span>{match.opponent}</span>
                        <span className="text-gray-500"> נגד </span>
                        <span className="font-medium">{user.clubData.clubName}</span>
                        </>
                    ) : (
                        <>
                        <span className="font-medium">{user.clubData.clubName}</span>
                        <span className="text-gray-500"> נגד </span>
                        <span>{match.opponent}</span>
                        </>
                    )}
                    </div>
                ) : (
                    // At least one team is LTR
                    <div className="text-left">
                    {match.isHome ? (
                        <>
                        <span className="font-medium">{user.clubData.clubName}</span>
                        <span className="text-gray-500"> vs </span>
                        <span>{match.opponent}</span>
                        </>
                    ) : (
                        <>
                        <span>{match.opponent}</span>
                        <span className="text-gray-500"> vs </span>
                        <span className="font-medium">{user.clubData.clubName}</span>
                        </>
                    )}
                    </div>
                )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(match.datetime.seconds * 1000).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${match.totalGrant.toLocaleString()}
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