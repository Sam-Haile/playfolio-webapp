import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUser({ uid: firebaseUser.uid, ...userDocSnap.data() });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ✅ Function to update user data in Firestore and Context
    const updateUserData = async (newData) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, newData);

        setUser((prev) => ({ ...prev, ...newData })); // Update user state immediately
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
