// Drag and drop functionality
const dropZones = document.querySelectorAll(".drop-zone");

dropZones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.style.backgroundColor = "#333";
  });

  zone.addEventListener("dragleave", () => {
    zone.style.backgroundColor = "#444";
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files, zone);
  });
});

// Handling file input
document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    handleFileUpload(
      e.target.files,
      e.target.closest(".tool-card").querySelector(".drop-zone")
    );
  });
});

function handleFileUpload(files, zone) {
  zone.style.backgroundColor = "#66BB6A";
  // Add logic for handling different file types
  // e.g. Compare files, Find duplicates, Convert JSON to CSV
  alert("Files uploaded successfully!");
}

// Compare files (simplified example)
document.getElementById("compare-btn-txt").addEventListener("click", () => {
  alert("Compare .txt or .docx files!");
});

// Compare CSV files
document.getElementById("compare-btn-csv").addEventListener("click", () => {
  alert("Compare .csv or .xlsx files!");
});

// Find duplicates
document.getElementById("duplicates-btn").addEventListener("click", () => {
  alert("Find duplicates in .csv or .xlsx files!");
});

// Convert JSON to CSV
document.getElementById("convert-btn").addEventListener("click", () => {
  alert("Convert .json to .csv!");
});
