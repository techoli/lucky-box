import {
  getDatabase,
  ref,
  get,
  onValue, // for real-time updates
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

let names = [];
let selectedWinner = null;

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

window.onload = async function () {
  try {
    showLoader();
    loadLogoLive(); // now uses real-time updates
    await fetchNames();
    listenSelectedWinner(); // start real-time listener (doesn't block)
  } finally {
    hideLoader();
  }
};

function loadLogoLive() {
  const db = getDatabase();
  const logoRef = ref(db, "settings/logoUrl");

  onValue(logoRef, (snapshot) => {
    if (snapshot.exists()) {
      document.querySelector(".huawei_img").src = snapshot.val();
    }
  });
}
async function fetchNames() {
  const db = getDatabase();
  const snapshot = await get(ref(db, "participants"));
  if (snapshot.exists()) {
    names = Object.values(snapshot.val());
  } else {
    names = [];
  }
}

// Real-time listener for selected winner changes
function listenSelectedWinner() {
  const db = getDatabase();
  const winnerRef = ref(db, "settings/selectedWinner");
  onValue(winnerRef, (snapshot) => {
    if (snapshot.exists()) {
      selectedWinner = snapshot.val();
      console.log("Selected winner updated:", selectedWinner);
      // Optionally update UI here if needed
    } else {
      selectedWinner = null;
      console.log("No selected winner set");
    }
  });
}

function startDraw() {
  if (!names.length)
    return alert("No names found. Please add participants first!");

  const winnerDisplay = document.getElementById("winnerName");
  const winnerBox = document.getElementById("winnerBox");
  winnerBox.style.display = "block";

  let finalWinner =
    selectedWinner && names.includes(selectedWinner)
      ? selectedWinner
      : names[Math.floor(Math.random() * names.length)];

  let i = 0;
  const spin = setInterval(() => {
    const tempIndex = Math.floor(Math.random() * names.length);
    winnerDisplay.textContent = names[tempIndex];
    if (++i >= 20) {
      clearInterval(spin);
      winnerDisplay.textContent = finalWinner;
    }
  }, 100);
}

window.startDraw = startDraw;
