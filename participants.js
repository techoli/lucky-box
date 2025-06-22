import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  remove,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDPgkDyKwQSUkcPbEOCg4wCsmxBf01YYWk",
  authDomain: "lucky-box-c773e.firebaseapp.com",
  projectId: "lucky-box-c773e",
  storageBucket: "lucky-box-c773e.appspot.com",
  messagingSenderId: "785898929349",
  appId: "1:785898929349:web:1321d9c578e6c00e7184ac",
};

// Initialize Firebase app once
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const storage = getStorage(app);

// Global participants array
let names = [];

// Loader show/hide helpers
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

// Real-time logo update listener
function loadLogoLive() {
  const logoRef = ref(db, "settings/logoUrl");
  onValue(logoRef, (snapshot) => {
    const img = document.querySelector(".huawei_img"); // <-- fix here
    if (!img) return; // prevent errors

    if (snapshot.exists()) {
      img.src = snapshot.val();
    } else {
      img.src = "default_logo.png"; // fallback
    }

    img.style.display = "block"; // show only after src set
  });
}

// Fetch participants once from Firebase
async function fetchNames() {
  showLoader();
  try {
    const snapshot = await get(ref(db, "participants"));
    if (snapshot.exists()) {
      names = Object.values(snapshot.val());
      console.log("Participants fetched:", names);
    } else {
      names = [];
      console.log("No participants found");
    }
  } catch (err) {
    console.error("Error fetching participants:", err);
    names = [];
  }
  hideLoader();
}

// Render participants into table
function renderNames() {
  const tbody = document.querySelector("#nameTable tbody");
  if (!tbody) return;

  tbody.innerHTML = names
    .map((name, i) => `<tr><td>${i + 1}</td><td>${name}</td></tr>`)
    .join("");
}

// Handle Excel file upload and import
function handleFile() {
  const fileInput = document.getElementById("excelFile");
  if (!fileInput || !fileInput.files.length) {
    alert("Please select an Excel file.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Flatten and clean names
    const importedNames = json
      .flat()
      .map((n) => String(n).trim())
      .filter((n) => n && !names.includes(n));

    if (!importedNames.length) {
      alert("No valid names found.");
      return;
    }

    showLoader();
    try {
      for (const name of importedNames) {
        await push(ref(db, "participants"), name);
      }
      await fetchNames();
      renderNames();
    } catch (err) {
      console.error("Error uploading names:", err);
      alert("Failed to upload names.");
    } finally {
      hideLoader();
    }
  };

  reader.readAsArrayBuffer(file);
}

// Clear all participants
async function clearNames() {
  if (!confirm("Clear all names?")) return;
  showLoader();
  try {
    await remove(ref(db, "participants"));
    names = [];
    renderNames();
  } catch (err) {
    console.error("Error clearing names:", err);
    alert("Failed to clear names.");
  } finally {
    hideLoader();
  }
}

// Initialization on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  loadLogoLive();
  await fetchNames();
  renderNames();
});

// Expose to global scope
window.handleFile = handleFile;
window.clearNames = clearNames;
