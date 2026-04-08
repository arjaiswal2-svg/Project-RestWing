// =============================================
// checkout.js — RestWing Checkout Logic
// Saves order to Firestore, then sends
// customer to Stripe to complete payment.
// =============================================

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Stripe Payment Link ──────────────────────
// Replace this URL after creating your Payment
// Link in the Stripe dashboard (see instructions).
const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/test_aFa3cugJ1aMagOx6mOcfK00";

// ── Price per unit ───────────────────────────
const UNIT_PRICE = 39;

// ── Quantity controls ────────────────────────
let quantity = 1;

const qtyDisplay = document.getElementById("qty-display");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");

function updateTotals() {
  const total = quantity * UNIT_PRICE;
  qtyDisplay.textContent = quantity;
  subtotalEl.textContent = "$" + total.toFixed(2);
  totalEl.textContent = "$" + total.toFixed(2);
}

document.getElementById("qty-minus").addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    updateTotals();
  }
});

document.getElementById("qty-plus").addEventListener("click", () => {
  if (quantity < 10) {
    quantity++;
    updateTotals();
  }
});

// ── Form Submission ──────────────────────────
document
  .getElementById("checkout-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorEl = document.getElementById("form-error");
    const submitBtn = e.target.querySelector("button[type='submit']");

    // Collect field values
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const address2 = document.getElementById("address2").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();

    // Basic validation — check required fields are filled
    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      errorEl.style.display = "block";
      return;
    }

    errorEl.style.display = "none";
    submitBtn.textContent = "Saving your order...";
    submitBtn.disabled = true;

    try {
      // Save order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        customer: {
          firstName,
          lastName,
          email,
          phone,
        },
        shipping: {
          address,
          address2,
          city,
          state,
          zip,
        },
        quantity,
        unitPrice: UNIT_PRICE,
        total: quantity * UNIT_PRICE,
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });

      // Build Stripe URL — pass email and order ID so Stripe can prefill fields
      const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${orderRef.id}&quantity=${quantity}`;

      // Redirect to Stripe Checkout
      window.location.href = stripeUrl;
    } catch (err) {
      console.error("Error saving order:", err);
      submitBtn.textContent = "Continue to Payment →";
      submitBtn.disabled = false;
      errorEl.textContent = "Something went wrong. Please try again.";
      errorEl.style.display = "block";
    }
  });
