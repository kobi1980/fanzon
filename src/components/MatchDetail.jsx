import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

const isRTL = text => {
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
};

const MatchDetail = () => {
  const { id } = useParams();
  const { user, isClub } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [grantAmount, setGrantAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [articleContent, setArticleContent] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'matches', id));
        if (matchDoc.exists()) {
          const matchData = { id: matchDoc.id, ...matchDoc.data() };
          setMatch(matchData);
          setArticleContent(matchData.article || '');
        } else {
          setError('Match not found');
        }
      } catch (error) {
        console.error('Error loading match:', error);
        setError('Error loading match details');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  // ... existing handleGrantCommit and handleShare functions ...

  const handleSaveArticle = async () => {
    try {
      await updateDoc(doc(db, 'matches', id), {
        article: articleContent,
        lastUpdated: new Date(),
      });
      setIsEditing(false);
      setMatch(prev => ({
        ...prev,
        article: articleContent,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setError('Failed to save article');
    }
  };

  const handleGrantCommit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!grantAmount || isNaN(grantAmount) || parseFloat(grantAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      console.log('Starting grant commit...');
      console.log('Match ID:', id);
      console.log('User ID:', user.uid);
      console.log('Grant Amount:', grantAmount);

      const amount = parseFloat(grantAmount);
      const matchRef = doc(db, 'matches', id);

      // First get the current match data
      const matchDoc = await getDoc(matchRef);
      console.log('Current match data:', matchDoc.data());

      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const currentMatch = matchDoc.data();

      // Initialize grants if it doesn't exist
      const currentGrants = currentMatch.grants || {};
      const currentUserGrant = currentGrants[user.uid] || 0;

      // Create the update object with proper initialization
      const updates = {
        totalGrant: (currentMatch.totalGrant || 0) + amount,
        grants: {
          ...currentGrants,
          [user.uid]: currentUserGrant + amount,
        },
      };

      console.log('Updates to be applied:', updates);

      // Update the document
      await updateDoc(matchRef, updates);
      console.log('Update completed successfully');

      // Update local state
      setMatch(prev => ({
        ...prev,
        ...updates,
      }));

      setGrantAmount('');
      setError('');
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error stack:', error.stack);
      setError(`Failed to commit grant: ${error.message}`);
    }
  };

  const GrantSection = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-2xl font-bold text-blue-600 mb-4">
        Total Grant Pool: ${(match.totalGrant || 0).toLocaleString()}
      </div>
      {user && (
        <div className="text-lg text-green-600 mb-4">
          Your Committed Grant: ${userGrant.toLocaleString()}
        </div>
      )}

      {user ? (
        <div className="space-y-4">
          <div className="text-lg">
            {userGrant > 0 ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  You have already committed ${userGrant.toLocaleString()}. Any additional amount
                  will be added to your current commitment.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Commit funds to support your team in this match!</p>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <input
              type="number"
              value={grantAmount}
              onChange={e => setGrantAmount(e.target.value)}
              placeholder="Enter grant amount"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
            <button
              onClick={handleGrantCommit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {userGrant > 0 ? 'Add Grant' : 'Commit Grant'}
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {grantAmount && userGrant > 0 && (
            <div className="text-sm text-gray-600">
              After this commitment, your total grant will be: $
              {(userGrant + parseFloat(grantAmount || 0)).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login to Commit Grant
        </button>
      )}
    </div>
  );

  if (loading) return <div className="text-center mt-8">Loading match details...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;
  if (!match) return <div className="text-center mt-8">Match not found</div>;

  const userGrant = (match.grants && match.grants[user?.uid]) || 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">
              {isRTL(match.opponent) && isRTL(match.clubName) ? (
                // Both teams are RTL
                <div className="text-right">
                  {match.isHome ? (
                    <>
                      <span>{match.opponent}</span>
                      <span className="text-gray-500"> נגד </span>
                      <span>{match.clubName}</span>
                    </>
                  ) : (
                    <>
                      <span>{match.clubName}</span>
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
                      <span>{match.clubName}</span>
                      <span className="text-gray-500"> vs </span>
                      <span>{match.opponent}</span>
                    </>
                  ) : (
                    <>
                      <span>{match.opponent}</span>
                      <span className="text-gray-500"> vs </span>
                      <span>{match.clubName}</span>
                    </>
                  )}
                </div>
              )}
            </h1>
            <div className="text-xl mb-6">
              Match Time: {new Date(match.datetime.seconds * 1000).toLocaleString()}
            </div>
            {/* Article Section */}
            <div className="prose max-w-none">
              {match.articleUrl ? (
                <div>
                  {/* Main article embed */}
                  <div className="relative overflow-hidden pb-[56.25%] h-0 mb-4">
                    <iframe
                      src={match.articleUrl}
                      className="absolute top-0 left-0 w-full h-full border rounded"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Backup link in case iframe doesn't work */}
                  <div className="text-sm text-gray-600 mb-4">
                    Can&apos;t see the article?{' '}
                    <a
                      href={match.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Click here to open it in a new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 italic">No article available yet.</p>
                </div>
              )}

              {/* Show edit button for club owners */}
              {isClub && match.clubId === user?.uid && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {match.articleUrl ? 'Update Article URL' : 'Add Article URL'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grant Section - Fixed on Desktop */}
        <div className="md:w-96 md:sticky md:top-4 h-fit">
          <GrantSection />
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
