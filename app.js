// Function to compare text or .docx files
function compareTextFiles() {
  const file1 = document.getElementById("file1").files[0];
  const file2 = document.getElementById("file2").files[0];
  if (!file1 || !file2) {
    alert("Please upload two files.");
    return;
  }

  if (
    file1.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file2.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // .docx files - Convert to text
    const reader1 = new FileReader();
    reader1.onload = function (e) {
      const arrayBuffer = e.target.result;
      mammoth.extractRawText({ arrayBuffer: arrayBuffer }).then((result) => {
        const text1 = result.value;
        const reader2 = new FileReader();
        reader2.onload = function (e) {
          const arrayBuffer2 = e.target.result;
          mammoth
            .extractRawText({ arrayBuffer: arrayBuffer2 })
            .then((result2) => {
              const text2 = result2.value;
              compareTexts(text1, text2);
            });
        };
        reader2.readAsArrayBuffer(file2);
      });
    };
    reader1.readAsArrayBuffer(file1);
  } else {
    // .txt files - Direct text comparison
    const reader1 = new FileReader();
    reader1.onload = function (e) {
      const text1 = e.target.result;
      const reader2 = new FileReader();
      reader2.onload = function (e) {
        const text2 = e.target.result;
        compareTexts(text1, text2);
      };
      reader2.readAsText(file2);
    };
    reader1.readAsText(file1);
  }
}

// Helper function to compare text and highlight differences
function compareTexts(text1, text2) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  let output = "";
  diffs.forEach(([op, text]) => {
    if (op === 1) {
      // Added
      output += `<span class="highlight">${text}</span>`;
    } else if (op === -1) {
      // Deleted
      output += `<span class="highlight">${text}</span>`;
    } else {
      output += text;
    }
  });

  // Create and download the result
  const blob = new Blob([output], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "comparison_result.html";
  a.click();
}

// Compare CSV or XLSX files
function compareCsvFiles() {
  const file1 = document.getElementById("csvFile1").files[0];
  const file2 = document.getElementById("csvFile2").files[0];
  if (!file1 || !file2) {
    alert("Please upload two files.");
    return;
  }

  if (
    file1.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file2.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    // Parse XLSX files
    const reader1 = new FileReader();
    reader1.onload = function (e) {
      const wb1 = XLSX.read(e.target.result, { type: "array" });
      const sheet1 = wb1.Sheets[wb1.SheetNames[0]];
      const json1 = XLSX.utils.sheet_to_json(sheet1);
      const reader2 = new FileReader();
      reader2.onload = function (e) {
        const wb2 = XLSX.read(e.target.result, { type: "array" });
        const sheet2 = wb2.Sheets[wb2.SheetNames[0]];
        const json2 = XLSX.utils.sheet_to_json(sheet2);
        compareSheets(json1, json2);
      };
      reader2.readAsArrayBuffer(file2);
    };
    reader1.readAsArrayBuffer(file1);
  } else {
    // Parse CSV files
    Papa.parse(file1, {
      complete: function (results1) {
        Papa.parse(file2, {
          complete: function (results2) {
            compareCsvData(results1.data, results2.data);
          },
        });
      },
    });
  }
}

// Helper function to compare CSV data
function compareCsvData(data1, data2) {
  let outputData = [];
  data1.forEach((row, i) => {
    let newRow = row.map((cell, j) => {
      if (cell !== data2[i][j]) {
        return `<span class="highlight">${cell}</span>`;
      } else {
        return cell;
      }
    });
    outputData.push(newRow);
  });

  // Create CSV from outputData and trigger download
  const csv = Papa.unparse(outputData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "csv_comparison.csv";
  a.click();
}

// Find duplicates in CSV or XLSX
function findDuplicates() {
  const file = document.getElementById("duplicateFile").files[0];
  if (!file) {
    alert("Please upload a file.");
    return;
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    // Parse XLSX file
    const reader = new FileReader();
    reader.onload = function (e) {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const duplicates = findDuplicateRows(json);
      highlightRows(duplicates, json);
    };
    reader.readAsArrayBuffer(file);
  } else {
    // Parse CSV file
    Papa.parse(file, {
      complete: function (results) {
        const duplicates = findDuplicateRows(results.data);
        highlightRows(duplicates, results.data);
      },
    });
  }
}

// Find duplicate rows based on the entire row values
function findDuplicateRows(data) {
  let seen = {};
  let duplicates = [];
  data.forEach((row, index) => {
    let key = JSON.stringify(row); // Make a key based on the row's data
    if (seen[key]) {
      duplicates.push(index);
    } else {
      seen[key] = true;
    }
  });
  return duplicates;
}

// Highlight duplicate rows in the output
function highlightRows(duplicates, data) {
  duplicates.forEach((index) => {
    data[index] = data[index].map(
      (cell) => `<span class="highlight">${cell}</span>`
    );
  });

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "duplicates_highlighted.csv";
  a.click();
}

// Convert JSON to CSV
function convertJsonToCsv() {
  const file = document.getElementById("jsonFile").files[0];
  if (!file) {
    alert("Please upload a JSON file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);
    const csv = Papa.unparse(json);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.csv";
    a.click();
  };
  reader.readAsText(file);
}
