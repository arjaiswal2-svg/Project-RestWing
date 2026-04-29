import { db, auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Check auth state and role
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }
  try {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Access denied");
    window.location.replace("index.html");
    return;
  }
  loadOrders();
  loadProducts();
} catch (err) {
  console.error("Admin panel error:", err);
}
});
//Load products
async function loadProducts() {
  const container = document.getElementById("products-list");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${data.name}</strong>
      — $${data.price}
      — Stock: ${data.stock}
    `;

    container.appendChild(div);
  });
}
//Load or check orders
async function loadOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${data.customer?.firstName || ""} ${data.customer?.lastName || ""}</strong>
      — $${data.total}
      — ${data.status}
    `;

    container.appendChild(div);
  });
}
// Add or update product
document.addEventListener("DOMContentLoaded", () => {

  const saveBtn = document.getElementById("save-product");

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {

      const id = document.getElementById("product-id").value.trim();
      const name = document.getElementById("product-name").value.trim();
      const price = parseFloat(document.getElementById("product-price").value);
      const stock = parseInt(document.getElementById("product-stock").value);

      if (!id || !name || isNaN(price) || isNaN(stock)) {
        alert("Please fill all fields correctly");
        return;
      }

      await setDoc(doc(db, "products", id), {
        name,
        price,
        stock
      });

      alert("Product saved");

      loadProducts();
    });
  }
  document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout-btn");

  if (logoutBtn) {
    e.preventDefault();
    await signOut(auth);
    window.location.replace("index.html");
  }
});
});
