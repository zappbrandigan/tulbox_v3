import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyC96LCDv57yYVomO4oZgrwV3mDxBd4ve3E',
  authDomain: 'tulbox-7f86d.firebaseapp.com',
  projectId: 'tulbox-7f86d',
  storageBucket: 'tulbox-7f86d.firebasestorage.app',
  messagingSenderId: '605353867469',
  appId: '1:605353867469:web:d750f4b5ddb1f33e795184',
  measurementId: 'G-9C3LB4WHF8',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics };
