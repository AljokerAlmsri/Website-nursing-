// سيتم استبدال هذه القيم بقيمك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyCTfKgp7LlgWM5Ps0r-ZBDdZlJdbP5wStE",
  authDomain: "dr-syringe-2fe1f.firebaseapp.com",
  databaseURL: "https://dr-syringe-2fe1f-default-rtdb.firebaseio.com",
  projectId: "dr-syringe-2fe1f",
  storageBucket: "dr-syringe-2fe1f.firebasestorage.app",
  messagingSenderId: "966755258991",
  appId: "1:966755258991:web:48a240d366d008f4db339a",
  measurementId: "G-LM138THGJT"
};
const githubConfig = {
    token: "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",
    repo: "AljokerAlmsri/Website-nursing-",
    branch: "main"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
