// =============================================
// waitlist.js — Waitlist email capture
// Saves email signups to Firestore
// =============================================

import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("waitlist-form");
const msg  = document.getElementById("waitlist-msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email  = document.getElementById("waitlist-email").value.trim();
    const btn    = form.querySelector("button[type='submit']");

    btn.textContent = "Joining...";
    btn.disabled = true;

    try {
        await addDoc(collection(db, "waitlist"), {
            email,
            source: "homepage-cta",
            createdAt: serverTimestamp()
        });

        form.style.display = "none";
        msg.style.display  = "block";

    } catch (err) {
        console.error("Waitlist error:", err);
        btn.textContent = "Get Early Access";
        btn.disabled = false;
    }
});
