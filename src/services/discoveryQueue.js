// src/services/discoveryQueue.js

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
  } from "firebase/firestore";
  import axios from "axios";
  
  const db = getFirestore();
  
  /**
   * Generate (or fetch) today's discovery queue for a user.
   * @param {string} userId    – Firebase Auth UID
   * @param {number} limit     – Number of games to pick (default 10)
   * @param {number} poolSize  – How many trending games to consider (default 500)
   * @returns {Promise<string[]>} – Array of game IDs
   */
  export async function generateDiscoveryQueueForUser(
    userId,
    limit = 10,
    poolSize = 500
  ) {
    // 1. Format today as YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
  
    // 2. If we've already generated today’s queue, just return it
    const todayRef = doc(db, "users", userId, "discoveryQueue", today);
    const todaySnap = await getDoc(todayRef);
    if (todaySnap.exists()) {
      const existing = todaySnap.data().games;
      return existing;
    }
  
    // 3. Delete any old queues, keeping only today’s slot
    const queueCol = collection(db, "users", userId, "discoveryQueue");
    const allQueues = await getDocs(queueCol);
    allQueues.forEach((qd) => {
      if (qd.id !== today) {
        deleteDoc(qd.ref);
      }
    });
  
    // 4. Fetch all gameStatuses to know which IDs to exclude
    const statusCol = collection(db, "users", userId, "gameStatuses");
    const statusSnap = await getDocs(statusCol);
    const excludedIds = statusSnap.docs.map((d) => d.id);
  
    // 5. Pull a large pool of trending games from your backend
    const resp = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/trending-games?limit=${poolSize}`
    );
    const pool = resp.data;
  
    // 6. Extract only valid IDs
    const poolIds = pool
      .map((game) => game.igdb_id)
      .filter((id) => id !== undefined && id != null);

    //console.log("[DQ] Pool Ids:", poolIds);

  
    // 7. Filter out any the user’s already seen
    const candidates = poolIds.filter((id) => !excludedIds.includes(id));
  
    // 8. Randomize & pick the top N
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);
  
    // 9. Write today’s queue to Firestore
    await setDoc(todayRef, {
      generatedAt: new Date().toISOString(),
      games: selected,
    });
  
    return selected;
  }
  