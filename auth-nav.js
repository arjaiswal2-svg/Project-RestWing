// =============================================
// auth-nav.js — Updates navbar based on auth state.
// Include on every page that has a navbar.
// =============================================

import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  const loginLink  = navLinks.querySelector('a[href="login.html"]');
  const signupLink = navLinks.querySelector('a[href="signup.html"]');

  if (user) {
    // Hide login/signup, show email + logout
    if (loginLink)  loginLink.style.display  = "none";
    if (signupLink) signupLink.style.display = "none";

    const existing = document.getElementById("nav-user-info");
    if (!existing) {
      const userInfo = document.createElement("span");
      userInfo.id = "nav-user-info";
      userInfo.style.cssText = "color:#aaaaaa; font-size:13px; margin-left:16px;";
      userInfo.textContent = user.email;
      navLinks.appendChild(userInfo);

      const logoutBtn = document.createElement("a");
      logoutBtn.id = "nav-logout-btn";
      logoutBtn.href = "#";
      logoutBtn.textContent = "Logout";
      logoutBtn.style.cssText = "margin-left:16px; font-size:13px;";
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "index.html";
      });
      navLinks.appendChild(logoutBtn);
    }
  } else {
    // Show login/signup links
    if (loginLink)  loginLink.style.display  = "";
    if (signupLink) signupLink.style.display = "";

    const userInfo  = document.getElementById("nav-user-info");
    const logoutBtn = document.getElementById("nav-logout-btn");
    if (userInfo)  userInfo.remove();
    if (logoutBtn) logoutBtn.remove();
  }
});
