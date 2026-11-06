
const db = require('./firebase');

async function testFirebase() {
  try {
    await db.collection('connection_test').limit(1).get();
    console.log('SUCCESS: Firebase Firestore connected!');
  } catch (error) {
    console.error('Firebase connection failed:', error.message);
  }
}

testFirebase();
