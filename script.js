let names = [];

function addNames() {
  const input = document.getElementById("nameInput").value;
  const newNames = input
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter((n) => n && !names.includes(n));

  if (newNames.length === 0) {
    alert("No valid names to add.");
    return;
  }

  names.push(...newNames);
  document.getElementById("nameInput").value = "";
  renderNames();
}

function renderNames() {
  const nameList = document.getElementById("nameList");
  nameList.innerHTML = names.map((n) => `<li>${n}</li>`).join("");
}

function clearNames() {
  names = [];
  renderNames();
  document.getElementById("winnerBox").style.display = "none";
}

function startDraw() {
  if (names.length === 0) {
    alert("Please add some names first!");
    return;
  }

  const winnerDisplay = document.getElementById("winnerName");
  const winnerBox = document.getElementById("winnerBox");
  winnerBox.style.display = "block";

  let i = 0;
  const spin = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * names.length);
    winnerDisplay.textContent = names[randomIndex];
    i++;
    if (i >= 20) {
      // stop after ~20 spins
      clearInterval(spin);
    }
  }, 100); // fast spin
}
