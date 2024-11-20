import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

const isRTL = (text) => {
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
};

const TeamDisplay = ({ match, className = "text-3xl font-bold mb-4" }) => (
    <h1 className={className}>
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
  );

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clubUrls, setClubUrls] = useState({});
  const [grantAmount, setGrantAmount] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  useEffect(() => {
    const fetchMatchesAndClubData = async () => {
      try {
        const matchesRef = collection(db, 'matches');
        let q;
        
        if (user?.fanData?.followedClubs?.length > 0) {
          q = query(
            matchesRef, 
            where('clubId', 'in', user.fanData.followedClubs)
          );
        } else {
          q = query(matchesRef);
        }

        const querySnapshot = await getDocs(q);
        const matchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMatches(matchesData.sort((a, b) => a.datetime.seconds - b.datetime.seconds));

        if (user?.fanData?.followedClubs) {
          const clubData = {};
          for (const clubId of user.fanData.followedClubs) {
            const clubDoc = await getDoc(doc(db, 'clubs', clubId));
            if (clubDoc.exists()) {
              clubData[clubId] = clubDoc.data();
            }
          }
          setClubUrls(clubData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchMatchesAndClubData();
  }, [user]);

  const handleGrantCommit = async (matchId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!grantAmount || isNaN(grantAmount) || parseFloat(grantAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseFloat(grantAmount);
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);

      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const currentMatch = matchDoc.data();
      const currentGrants = currentMatch.grants || {};
      const currentUserGrant = currentGrants[user.uid] || 0;

      const updates = {
        totalGrant: (currentMatch.totalGrant || 0) + amount,
        grants: {
          ...currentGrants,
          [user.uid]: currentUserGrant + amount
        }
      };

      await updateDoc(matchRef, updates);
      
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, ...updates }
          : match
      ));
      
      setGrantAmount('');
      setError('');
    } catch (error) {
      setError('Failed to commit grant. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading matches...</div>;
  }

  const sortedMatches = [...matches].sort((a, b) => a.datetime.seconds - b.datetime.seconds);
  const nextMatch = sortedMatches[0];
  const otherMatches = sortedMatches.slice(1);

  return (
    <div className="container mx-auto p-4">
     {/* Next Match Card */}
    {nextMatch && (
    <Link to={`/match/${nextMatch.id}`}>
        <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Next Match</h2>
            <TeamDisplay match={nextMatch} className="text-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="text-lg text-gray-600 mb-4">
                {new Date(nextMatch.datetime.seconds * 1000).toLocaleString()}
                </div>
                <div className="text-xl font-bold text-blue-600 mb-4">
                Total Grant Pool: ${(nextMatch.totalGrant || 0).toLocaleString()}
                </div>
                {user && (
                <div className="text-lg text-green-600 mb-4">
                    Your Committed Grant: ${((nextMatch.grants && nextMatch.grants[user.uid]) || 0).toLocaleString()}
                </div>
                )}
            </div>

            <div className="flex flex-col justify-center" onClick={(e) => e.preventDefault()}>
                {user ? (
                <div className="space-y-4">
                    <div>
                    {((nextMatch.grants && nextMatch.grants[user.uid]) || 0) > 0 ? (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-blue-800">
                            You have already committed ${((nextMatch.grants && nextMatch.grants[user.uid]) || 0).toLocaleString()}.
                            Any additional amount will be added to your current commitment.
                        </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-600">
                            Commit funds to support your team in this match!
                        </p>
                        </div>
                    )}
                    </div>
                    <input
                    type="number"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    placeholder="Enter grant amount"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1"
                    />
                    <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleGrantCommit(nextMatch.id);
                    }}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                    {((nextMatch.grants && nextMatch.grants[user.uid]) || 0) > 0 ? 'Add Grant' : 'Commit Grant'}
                    </button>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {grantAmount && ((nextMatch.grants && nextMatch.grants[user.uid]) || 0) > 0 && (
                    <div className="text-sm text-gray-600">
                        After this commitment, your total grant will be: $
                        {(((nextMatch.grants && nextMatch.grants[user.uid]) || 0) + parseFloat(grantAmount || 0)).toLocaleString()}
                    </div>
                    )}
                </div>
                ) : (
                <Link
                    to="/login"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                    Login to Commit Grant
                </Link>
                )}
            </div>
            </div>
        </div>
        </div>
    </Link>
    )}
       

      {/* Other Matches Carousel */}
      {otherMatches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Upcoming Matches</h3>
          <Carousel
            responsive={responsive}
            infinite={false}
            keyBoardControl={true}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            itemClass="px-2"
          >
            {otherMatches.map(match => (
              <Link key={match.id} to={`/match/${match.id}`}>
                <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow h-full">
                  <TeamDisplay match={match} className="text-lg font-bold mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(match.datetime.seconds * 1000).toLocaleString()}
                  </div>
                  <div className="text-blue-600">
                    Total Grant Pool: ${(match.totalGrant || 0).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default MatchList;