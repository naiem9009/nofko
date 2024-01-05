
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDCMS4zZ3MRcVbyL82vYIpf--2Pk31mPYc",
  authDomain: "nofko-2f05e.firebaseapp.com",
  projectId: "nofko-2f05e",
  storageBucket: "nofko-2f05e.appspot.com",
  messagingSenderId: "534637016044",
  appId: "1:534637016044:web:9fb0d97a8097d9628186c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// google auth
const provider = new GoogleAuthProvider()

const auth = getAuth()

export const authWithGoogle = async () => {
    let user = null

    await signInWithPopup(auth, provider).then(result => {
        user = result.user
    }) .catch(err => console.log(err))

    return user
}
