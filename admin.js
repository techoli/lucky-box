import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDPgkDyKwQSUkcPbEOCg4wCsmxBf01YYWk",
  authDomain: "lucky-box-c773e.firebaseapp.com",
  projectId: "lucky-box-c773e",
  storageBucket: "lucky-box-c773e.appspot.com",
  messagingSenderId: "785898929349",
  appId: "1:785898929349:web:1321d9c578e6c00e7184ac",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const storage = getStorage(app);

// Loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Logo file (previewed but not uploaded yet)
let selectedLogoFile = null;

// Populate participants and selected winner
async function populateDropdown() {
  try {
    showLoader();
    const snapshot = await get(ref(db, "participants"));
    const select = document.getElementById("winner-select");
    select.innerHTML = `<option value="">-- Random Selection --</option>`;

    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
    }

    // Watch for selected winner in real time
    onValue(ref(db, "settings/selectedWinner"), (snap) => {
      const currentInput = document.getElementById("current-winner");
      if (snap.exists()) {
        currentInput.value = snap.val();
        select.value = snap.val();
      } else {
        currentInput.value = "";
        select.value = "";
      }
    });
  } catch (err) {
    console.error("Error populating dropdown:", err);
  } finally {
    hideLoader();
  }
}

// Save all settings: winner + logo
window.saveAdminSettings = async function () {
  const selected = document.getElementById("winner-select").value;

  try {
    showLoader();

    // Save selected winner
    await set(ref(db, "settings/selectedWinner"), selected);

    // Upload new logo (if any)
    if (selectedLogoFile) {
      const logoRef = sRef(storage, "logo/logo.png");
      await uploadBytes(logoRef, selectedLogoFile);
      const url = await getDownloadURL(logoRef);
      await set(ref(db, "settings/logoUrl"), url);
      selectedLogoFile = null; // clear after saving
    }

    alert("Settings saved successfully.");
  } catch (err) {
    console.error("Error saving settings:", err);
    alert("Error saving settings. See console for details.");
  } finally {
    hideLoader();
  }
};

// Clear winner
window.clearSpecificWinner = async function () {
  if (!confirm("Clear specific winner and allow random?")) return;

  try {
    showLoader();
    await remove(ref(db, "settings/selectedWinner"));
    alert("Specific winner cleared.");
  } catch (err) {
    console.error("Error clearing winner:", err);
    alert("Failed to clear winner.");
  } finally {
    hideLoader();
  }
};

// File select: only preview
document.getElementById("logo-upload").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  selectedLogoFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("logo-preview").src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Start up
populateDropdown();
