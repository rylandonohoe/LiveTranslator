
import { ref, remove, onValue, set, update } from 'firebase/database';

export const doLogin = async (username, database, handleUpdate) => {
  const notifsRef = ref(database, '/notifs/' + username); // Use ref to create a reference
  
  await remove(notifsRef);

  onValue(notifsRef, snapshot => {
    if (snapshot.exists()) {
      handleUpdate(snapshot.val(), username); // Handle the update when data changes
    }
  });
  console.log("hi")
};




export const doOffer = async (to, offer, database, username) => {
  const notifsRef = ref(database, '/notifs/' + to); // Create a reference

  // Set the 'offer' data
  await set(notifsRef, {
    type: 'offer',
    from: username,
    offer: JSON.stringify(offer),
  });
};

export const doAnswer = async (to, answer, database, username) => {
  const notifsRef = ref(database, '/notifs/' + to); // Create a reference

  // Update the 'answer' data
  await update(notifsRef, {
    type: 'answer',
    from: username,
    answer: JSON.stringify(answer),
  });
};

export const doLeaveNotif = async (to, database, username) => {
  const notifsRef = ref(database, '/notifs/' + to); // Create a reference

  // Update the 'leave' notification
  await update(notifsRef, {
    type: 'leave',
    from: username,
  });
};

export const doCandidate = async (to, candidate, database, username) => {
  const notifsRef = ref(database, '/notifs/' + to); // Create a reference

  // Update the 'candidate' data
  await update(notifsRef, {
    type: 'candidate',
    from: username,
    candidate: JSON.stringify(candidate),
  });
};