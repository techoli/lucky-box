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
const storage = getStorage(app);

// ✅ Loader functions
function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// ✅ Hold file before upload
let selectedLogoFile = null;

// ✅ Populate dropdown and winner
async function populateDropdown() {
  try {
    showLoader();

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
  } catch (err) {
    console.error("Dropdown error:", err);
  } finally {
    hideLoader();
  }
}

// ✅ Save settings (winner + logo)
window.saveAdminSettings = async function () {
  const selected = document.getElementById("winner-select").value;

  try {
    showLoader();

    // Save selected winner
    await set(ref(db, "settings/selectedWinner"), selected);

    // Upload new logo if changed
    if (selectedLogoFile) {
      const logoRef = sRef(storage, "logo/logo.png");
      await uploadBytes(logoRef, selectedLogoFile);
      const url = await getDownloadURL(logoRef);
      await set(ref(db, "settings/logoUrl"), url);
      selectedLogoFile = null;
    }

    alert("Settings saved successfully.");
  } catch (err) {
    console.error("Save error:", err);
    alert("Error saving settings.");
  } finally {
    hideLoader();
  }
};

// ✅ Clear winner
window.clearSpecificWinner = async function () {
  if (!confirm("Are you sure you want to clear the specific winner?")) return;
  try {
    showLoader();
    await remove(ref(db, "settings/selectedWinner"));
    alert("Specific winner cleared.");
  } catch (err) {
    console.error("Clear error:", err);
    alert("Error clearing winner.");
  } finally {
    hideLoader();
  }
};

// ✅ Handle logo selection
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

// ✅ Initial load
populateDropdown();
