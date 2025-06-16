let names = JSON.parse(localStorage.getItem("luckyBoxNames") || "[]");

function startDraw() {
  if (names.length === 0) {
    alert("No names found. Please add participants first!");
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
    if (i >= 20) clearInterval(spin);
  }, 100);
}
