function formatStatus(status) {
  if (!status) return "pending";
  return status.replaceAll("_", " ");
}
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
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
// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadUserProfile(user);
  loadOrders(user);
  loadTracking(user);
  loadAddress(user);
});
// Profile info
async function loadUserProfile(user) {
  document.getElementById("user-email").textContent = user.email;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("user-name").textContent =
      `${data.firstName || ""} ${data.lastName || ""}`;
  }
  const addrBox = document.getElementById("saved-address");

  if (!addrBox) return; // safety check

  if (!data.address) {
    addrBox.innerHTML = "No address saved";
  } else {
    const a = data.address;

    addrBox.innerHTML = `
      ${a.street || ""}<br>
      ${a.apartment ? a.apartment + "<br>" : ""}
      ${a.city || ""}, ${a.state || ""} ${a.zip || ""}
    `;
  }
}
// Show orders
async function loadUserOrders(user) {
  const container = document.getElementById("orders-list");
  const noOrders = document.getElementById("no-orders");

  container.innerHTML = "";
  noOrders.style.display = "none";

  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      noOrders.style.display = "block";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const div = document.createElement("div");
      div.className = "order-item";

      div.innerHTML = `
        <div class="order-row">
          <div>
            <strong>Order ID:</strong> ${docSnap.id}<br>
            <span>$${data.total || 39}</span>
          </div>
          <div class="order-status">${data.status}</div>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("LOAD ORDERS ERROR:", err);
  }
}
// Track orders
async function loadTracking(user) {
  const container = document.getElementById("tracking-list");
  const noTracking = document.getElementById("no-tracking");

  container.innerHTML = "";
  noTracking.style.display = "none";

  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      noTracking.style.display = "block";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const div = document.createElement("div");
      div.className = "order-item";

      let statusLabel = data.status || "pending";

      div.innerHTML = `
        <div class="order-row">
          <div>
            <strong>Order:</strong> ${docSnap.id}
          </div>
          <div class="order-status">${statusLabel}</div>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("LOAD TRACKING ERROR:", err);
  }
}
// Show address
async function loadAddress(user) {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const a = data.address || {};

    document.getElementById("street").value = a.address || "";
    document.getElementById("address2").value = a.address2 || "";
    document.getElementById("city").value = a.city || "";
    document.getElementById("state").value = a.state || "";
    document.getElementById("zip").value = a.zip || "";

  } catch (err) {
    console.error("LOAD ADDRESS ERROR:", err);
  }
}
// Save address
document.getElementById("save-address").addEventListener("click", async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const address = document.getElementById("street").value.trim();
    const address2 = document.getElementById("address2").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();

    await updateDoc(doc(db, "users", user.uid), {
      address: {
        address,
        address2,
        city,
        state,
        zip
      }
    });

    alert("Address saved");

  } catch (err) {
    console.error("SAVE ADDRESS ERROR:", err);
  }
});
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    const user = auth.currentUser;
    if (!user) return;

    if (btn.dataset.tab === "orders") {
      loadUserOrders(user);
    }

    if (btn.dataset.tab === "tracking") {
      loadTracking(user);
    }

    if (btn.dataset.tab === "settings") {
      loadAddress(user);
    }
  });
});
