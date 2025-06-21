let names = JSON.parse(localStorage.getItem("luckyBoxNames") || "[]");

window.onload = function () {
  // Set logo from admin settings
  const savedLogo = localStorage.getItem("logoImage");
  if (savedLogo) {
    const logoImg = document.querySelector(".huawei_img");
    if (logoImg) logoImg.src = savedLogo;
  }
};

function startDraw() {
  if (names.length === 0) {
    alert("No names found. Please add participants first!");
    return;
  }

  const selectedWinner = localStorage.getItem("selectedWinner");
  const winnerDisplay = document.getElementById("winnerName");
  const winnerBox = document.getElementById("winnerBox");
  winnerBox.style.display = "block";

  let finalWinner = "";

  if (selectedWinner && names.includes(selectedWinner)) {
    finalWinner = selectedWinner;
  } else {
    const randomIndex = Math.floor(Math.random() * names.length);
    finalWinner = names[randomIndex];
  }

  let i = 0;
  const spin = setInterval(() => {
    const tempIndex = Math.floor(Math.random() * names.length);
    winnerDisplay.textContent = names[tempIndex];
    i++;
    if (i >= 20) {
      clearInterval(spin);
      winnerDisplay.textContent = finalWinner;
    }
  }, 100);
}
