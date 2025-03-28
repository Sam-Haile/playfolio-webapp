import { createUserWithEmailAndPassword, getAuth, updateProfile, sendEmailVerification , signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, collection, query, where } from "firebase/firestore";
export const signUpUser = async (email, password, username, firstName, lastName) => {
    const auth = getAuth(); // Initialize auth
  
    try {
        // 🔍 Step 1: Check if username already exists
        const usernameDocRef = doc(db, "usernames", username.toLowerCase());
        const usernameDoc = await getDoc(usernameDocRef);
  
        if (usernameDoc.exists()) {
            throw new Error("⚠️ This username is already taken.");
        }
  
        // 🔐 Step 2: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        console.log("✅ User created:", user.uid);
  
        // 📩 Step 3: Send email verification
        await sendEmailVerification(user);
  
        // ✏️ Step 4: Update Firebase Authentication Profile
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });
  
        // 🛠 Step 5: Store user details in Firestore "users" collection
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            username: username.toLowerCase(),
            firstName,
            lastName,
            email,
            createdAt: new Date(),
        });
  
        console.log("✅ User profile updated & stored in Firestore.");
  
        // 🔗 Step 6: Store username → email mapping in "usernames" collection
        await setDoc(usernameDocRef, { email });
  
        // 🔄 Step 7: Reload user to get updated display name
        await user.reload();
        console.log("✅ User reloaded. Display Name:", user.displayName);
  
        return user;
    } catch (error) {
        console.error("❌ Error signing up:", error.message);
        throw error;
    }
  };
  

/**
 * Log In User with Email & Password
 */

export const loginUser = async (emailOrUsername, password) => {
  try {
      let email = emailOrUsername.trim().toLowerCase();

      // ✅ If input is a username, fetch corresponding email from "usernames" collection
      if (!email.includes("@")) {  
          const usernameDocRef = doc(db, "usernames", email);
          const usernameDocSnap = await getDoc(usernameDocRef);

          if (usernameDocSnap.exists()) {
              email = usernameDocSnap.data().email;
          } else {
              throw new Error("⚠️ No account found with this username.");
          }
      }

      // ✅ Authenticate using the resolved email
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        return { error: "unverified", user };
      }

      // ✅ Fetch full user details from "users" collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
          return { uid: user.uid, ...userDocSnap.data() };
      } else {
          throw new Error("⚠️ User data not found.");
      }

  } catch (error) {
      console.error("Error logging in:", error.message);
      throw error;
  }
};


// ✅ Function to Resend Email Verification
export const resendVerificationEmail = async (user) => {
  try {
      await sendEmailVerification(user);
      return "✅ Verification email sent! Please check your inbox.";
  } catch (error) {
      console.error("Error sending verification email:", error.message);
      throw new Error("⚠️ Could not send verification email. Try again later.");
  }
};


/**
 * Log Out User
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem(`userData_${user.uid}`);
    console.log("User logged out, cache cleared");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};