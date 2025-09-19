import { useState, useEffect, createContext, useContext } from "react";
import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase.js";
import { authAPI } from "@/lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token and store it
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("authToken", idToken);

        // Get user profile from backend
        try {
          const profileResponse = await authAPI.getProfile();
          setUser({
            ...firebaseUser,
            profile: profileResponse.profile,
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(firebaseUser);
        }
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (firstName, lastName, email, password) => {
    setLoading(true);
    try {
      // Call backend to register and get custom token
      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
      });

      // Sign in with custom token on frontend to create Auth user
      const result = await signInWithCustomToken(auth, response.customToken);
      console.log("✅ Frontend signed in with custom token after register");

      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Call backend to login and get custom token
      const response = await authAPI.login({ email, password });

      // Sign in with custom token on frontend
      const result = await signInWithCustomToken(auth, response.customToken);
      console.log("✅ Frontend signed in with custom token after login");

      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Frontend initiates Google popup
      const provider = new GoogleAuthProvider();
      const popupResult = await signInWithPopup(auth, provider);
      const idToken = await popupResult.user.getIdToken();

      // Send idToken to backend for verification and get customToken
      const response = await authAPI.googleAuth({ idToken });

      // Sign in with custom token (if needed; but since popup already signed in, this might be redundant but ensures consistency)
      await signInWithCustomToken(auth, response.customToken);
      console.log("✅ Frontend signed in with custom token after Google auth");

      return popupResult;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
