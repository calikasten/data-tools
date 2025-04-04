document.addEventListener("DOMContentLoaded", () => {
  const fileUploadSections = document.querySelectorAll(".file-upload");

  // Add event listeners to file upload sections
  fileUploadSections.forEach((section) => {
    section.addEventListener("dragover", (e) => {
      e.preventDefault();
      section.classList.add("accepted");
    });

    section.addEventListener("dragleave", () => {
      section.classList.remove("accepted");
    });

    section.addEventListener("drop", (e) => {
      e.preventDefault();
      section.classList.remove("accepted");
      handleFileDrop(e, section);
    });

    const fileInput = section.querySelector('input[type="file"]');
    fileInput.addEventListener("change", (e) => {
      handleFileInputChange(e, section);
    });
  });

  function handleFileDrop(event, section) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      section.querySelector('input[type="file"]').files = files;
    }
  }

  function handleFileInputChange(event, section) {
    const files = event.target.files;
    if (files.length > 0) {
      section.classList.add("accepted");
      const fileId = section.id;
      switch (fileId) {
        case "compare-files-txt":
          compareTextFiles(files);
          break;
        case "compare-files-csv":
          compareCsvFiles(files);
          break;
        case "find-duplicates":
          findDuplicates(files);
          break;
        case "convert-json-csv":
          convertJsonToCsv(files);
          break;
        default:
          break;
      }
    }
  }

  // Compare two .txt or .docx files
  function compareTextFiles(files) {
    if (
      files[0].type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      files[1].type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Handle .docx file comparison (you'll need a library like jszip or mammoth.js for parsing .docx)
      alert(
        "Compare .docx files functionality requires additional libraries like jszip."
      );
    } else {
      const file1 = files[0];
      const file2 = files[1];
      const reader1 = new FileReader();
      const reader2 = new FileReader();

      reader1.onload = function (e) {
        const text1 = e.target.result;
        reader2.onload = function (e) {
          const text2 = e.target.result;
          const diff = getTextDifferences(text1, text2);
          createFileDownload(diff, "difference.txt");
        };
        reader2.readAsText(file2);
      };
      reader1.readAsText(file1);
    }
  }

  function getTextDifferences(text1, text2) {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    let diffText = "";
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (lines1[i] !== lines2[i]) {
        diffText += `Line ${i + 1}:\nFile 1: ${lines1[i]}\nFile 2: ${
          lines2[i]
        }\n\n`;
      }
    }
    return diffText;
  }

  // Compare two .csv or .xlsx files
  function compareCsvFiles(files) {
    const file1 = files[0];
    const file2 = files[1];

    if (
      file1.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file2.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Parse .xlsx with SheetJS
      alert("Compare .xlsx files functionality requires SheetJS.");
    } else {
      const reader1 = new FileReader();
      const reader2 = new FileReader();

      reader1.onload = function (e) {
        const csv1 = e.target.result;
        reader2.onload = function (e) {
          const csv2 = e.target.result;
          const diff = getCsvDifferences(csv1, csv2);
          createFileDownload(diff, "difference.csv");
        };
        reader2.readAsText(file2);
      };
      reader1.readAsText(file1);
    }
  }

  function getCsvDifferences(csv1, csv2) {
    const rows1 = csv1.split("\n");
    const rows2 = csv2.split("\n");
    let diffCsv = "";
    for (let i = 0; i < Math.max(rows1.length, rows2.length); i++) {
      if (rows1[i] !== rows2[i]) {
        diffCsv += `Row ${i + 1}:\nFile 1: ${rows1[i]}\nFile 2: ${
          rows2[i]
        }\n\n`;
      }
    }
    return diffCsv;
  }

  // Find duplicates in .csv or .xlsx file
  function findDuplicates(files) {
    const file = files[0];
    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      alert("Find duplicates in .xlsx functionality requires SheetJS.");
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const csv = e.target.result;
        const duplicates = getCsvDuplicates(csv);
        createFileDownload(duplicates, "duplicates.csv");
      };
      reader.readAsText(file);
    }
  }

  function getCsvDuplicates(csv) {
    const rows = csv.split("\n");
    const seen = new Set();
    let duplicates = "";
    rows.forEach((row, index) => {
      if (seen.has(row)) {
        duplicates += `Duplicate Row ${index + 1}: ${row}\n`;
      } else {
        seen.add(row);
      }
    });
    return duplicates;
  }

  // Convert JSON to CSV
  function convertJsonToCsv(files) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const json = JSON.parse(e.target.result);
      const csv = jsonToCsv(json);
      createFileDownload(csv, "converted.csv");
    };
    reader.readAsText(file);
  }

  function jsonToCsv(json) {
    const keys = Object.keys(json[0]);
    const csvRows = [];
    csvRows.push(keys.join(","));

    json.forEach((item) => {
      const values = keys.map((key) => item[key]);
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  }

  // Helper function to create a downloadable file
  function createFileDownload(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
});
