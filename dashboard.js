import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Check auth state
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadOrders(user.uid);
  loadAddress(user.uid);
});
// Load orders for the user
async function loadOrders(uid) {
  const container = document.getElementById("orders-list");
  container.innerHTML = "";

  const q = query(collection(db, "orders"), where("userId", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = "No orders yet.";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>Order:</strong> $${data.total} <br>
      Status: ${data.status}
    `;

    container.appendChild(div);
  });
}
//Show address
async function loadAddress(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("address").value = data.address || "";
  }
}
// Save address
window.saveAddress = async function () {
  const user = auth.currentUser;
  const address = document.getElementById("address").value;

  await updateDoc(doc(db, "users", user.uid), {
    address
  });

  alert("Address saved");
};
// Logout
window.logout = function () {
  signOut(auth);
  window.location.href = "index.html";
};