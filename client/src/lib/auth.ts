import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
}

export const signIn = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user in our database
  await apiRequest("POST", "/api/users", {
    firebaseUid: result.user.uid,
    email: result.user.email,
    name
  });
  
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
