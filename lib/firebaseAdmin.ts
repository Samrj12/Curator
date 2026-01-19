import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const saveOrUpdateUser = async (userData: {
  id: string;
  name: string;
  email: string;
  image?: string;
}): Promise<User> => {
  try {
    const userRef = doc(db, "users", userData.id);
    const docSnap = await getDoc(userRef);
    const now = Timestamp.now();

    if (docSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        image: userData.image || null,
        updatedAt: now,
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    throw new Error(
      "Error saving or updating user: " + (error as Error).message,
    );
  }
};

export { saveOrUpdateUser };
