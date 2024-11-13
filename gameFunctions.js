import { initializeApp } from 'firebase/app';  // For initializing Firebase
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; 

const firebaseConfig = {
    apiKey: "AIzaSyC0qWBewYSemMlOGk1CIQo0XEuUmO53xUg",
    authDomain: "bytexync-c84e8.firebaseapp.com",
    projectId: "bytexync-c84e8",
    storageBucket: "bytexync-c84e8.firebasestorage.app",
    messagingSenderId: "805730979094",
    appId: "1:805730979094:web:dd11dbcef56ae95f6b1437"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Save profile information to Firestore.
 * @param {string} userId - Discord user ID.
 * @param {string} username - User's username.
 * @param {number} age - User's age.
 * @param {string} bio - User's bio.
 */
export const saveProfile = async (userId, username, age, bio) => {
    try {
        await setDoc(doc(db, 'profiles', userId), { username, age, bio });
        console.log('Profile saved successfully.');
    } catch (error) {
        console.error('Error saving profile:', error);
    }
};

/**
 * Retrieve profile information from Firestore.
 * @param {string} userId - Discord user ID.
 * @returns {Object|null} - User profile data or null if not found.
 */
export const getProfile = async (userId) => {
    try {
        const profileDoc = await getDoc(doc(db, 'profiles', userId));
        return profileDoc.exists() ? profileDoc.data() : null;
    } catch (error) {
        console.error('Error retrieving profile:', error);
        return null;
    }
};

/**
 * Save or update the trivia score in Firestore.
 * @param {string} userId - Discord user ID.
 * @param {number} score - Score to add (or 0 for reset).
 */
export const saveTriviaScore = async (userId, score) => {
    try {
        const scoreDocRef = doc(db, 'userScores', userId);
        await updateDoc(scoreDocRef, { triviaScore: increment(score) });
    } catch (error) {
        console.error('Error saving score:', error);
    }
};

/**
 * Get the current trivia score from Firestore.
 * @param {string} userId - Discord user ID.
 * @returns {number} - User's current trivia score or 0 if not found.
 */
export const getTriviaScore = async (userId) => {
    try {
        const scoreDoc = await getDoc(doc(db, 'userScores', userId));
        return scoreDoc.exists() ? scoreDoc.data().triviaScore : 0;
    } catch (error) {
        console.error('Error retrieving score:', error);
        return 0;
    }
};

/**
 * Store a joke that a user received in Firestore.
 * @param {string} userId - Discord user ID.
 * @param {string} joke - The joke text.
 */
export const storeJoke = async (userId, joke) => {
    try {
        await setDoc(doc(db, 'userJokes', userId), { lastJoke: joke });
        console.log('Joke stored successfully.');
    } catch (error) {
        console.error('Error storing joke:', error);
    }
};

/**
 * Fetch the top 10 leaderboard from Firestore.
 * @returns {Array} - Array of leaderboard entries.
 */
export const getLeaderboard = async () => {
    try {
        const leaderboard = [];
        const scoresRef = collection(db, 'userScores');
        const snapshot = await getDocs(query(scoresRef, orderBy('triviaScore', 'desc'), limit(10)));
        snapshot.forEach((doc) => {
            leaderboard.push({ username: doc.id, triviaScore: doc.data().triviaScore });
        });
        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
};
