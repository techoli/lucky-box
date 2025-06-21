let names = JSON.parse(localStorage.getItem("luckyBoxNames") || "[]");

window.onload = function () {
  // Set logo from admin settings
  const savedLogo = localStorage.getItem("logoImage");
  if (savedLogo) {
    const logoImg = document.querySelector(".huawei_img");
    if (logoImg) logoImg.src = savedLogo;
  }
};

function handleFile() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select an Excel file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const importedNames = json
      .flat()
      .map((n) => String(n).trim())
      .filter((n) => n && !names.includes(n));

    if (importedNames.length === 0) {
      alert("No valid names found.");
      return;
    }

    names.push(...importedNames);
    localStorage.setItem("luckyBoxNames", JSON.stringify(names));
    renderNames();
  };

  reader.readAsArrayBuffer(file);
}

function renderNames() {
  const tbody = document.querySelector("#nameTable tbody");
  tbody.innerHTML = names
    .map((n, i) => `<tr><td>${i + 1}</td><td>${n}</td></tr>`)
    .join("");
}

function clearNames() {
  if (confirm("Clear all names?")) {
    names = [];
    localStorage.removeItem("luckyBoxNames");
    renderNames();
  }
}

renderNames();
