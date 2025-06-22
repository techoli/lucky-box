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

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDPgkDyKwQSUkcPbEOCg4wCsmxBf01YYWk",
  authDomain: "lucky-box-c773e.firebaseapp.com",
  projectId: "lucky-box-c773e",
  storageBucket: "lucky-box-c773e.appspot.com",
  messagingSenderId: "785898929349",
  appId: "1:785898929349:web:1321d9c578e6c00e7184ac",
};

// ✅ Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// ✅ Loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// ✅ Populate dropdown and current values
async function populateDropdown() {
  try {
    showLoader();

    // Fill winner dropdown
    const participantsRef = ref(db, "participants");
    const snapshot = await get(participantsRef);
    const winnerSelect = document.getElementById("winner-select");
    winnerSelect.innerHTML = `<option value="">-- Random Selection --</option>`;

    if (snapshot.exists()) {
      const values = Object.values(snapshot.val());
      values.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        winnerSelect.appendChild(opt);
      });
    }

    // Watch for current selected winner
    const selectedRef = ref(db, "settings/selectedWinner");
    onValue(selectedRef, (snap) => {
      const currentInput = document.getElementById("current-winner");
      if (snap.exists()) {
        const selectedName = snap.val();
        currentInput.value = selectedName;
        winnerSelect.value = selectedName;
      } else {
        currentInput.value = "";
        winnerSelect.value = "";
      }
    });

    // Show logo URL
    const logoRef = ref(db, "settings/logoUrl");
    const logoSnap = await get(logoRef);
    if (logoSnap.exists()) {
      const logoURL = logoSnap.val();
      document.getElementById("logo-url").value = logoURL;
      document.getElementById("logo-preview").src = logoURL;
    }
  } catch (err) {
    console.error("Dropdown error:", err);
  } finally {
    hideLoader();
  }
}

// ✅ Save both selected winner and logo URL
window.saveAdminSettings = async function () {
  const selected = document.getElementById("winner-select").value;
  const logoUrl = document.getElementById("logo-url").value.trim();

  if (!logoUrl) {
    alert("Please select a logo image before saving.");
    return;
  }

  try {
    showLoader();

    await set(ref(db, "settings/selectedWinner"), selected);
    if (logoUrl) {
      await set(ref(db, "settings/logoUrl"), logoUrl);
      document.getElementById("logo-preview").src = logoUrl;
    }

    alert("Settings saved successfully.");
  } catch (err) {
    console.error("Save error:", err);
    alert("Error saving settings.");
  } finally {
    hideLoader();
  }
};

// ✅ Clear selected winner
window.clearSpecificWinner = async function () {
  if (!confirm("Are you sure you want to clear the specific winner?")) return;

  try {
    showLoader();

    // ❌ Remove specific winner from database
    await remove(ref(db, "settings/selectedWinner"));

    // ❌ Remove logo from database (revert to default)
    // await remove(ref(db, "settings/logoUrl"));

    alert("Specific winner cleared. Random winner will be used.");
  } catch (err) {
    console.error("Clear error:", err);
    alert("Error clearing settings.");
  } finally {
    hideLoader();
  }
};

populateDropdown();
