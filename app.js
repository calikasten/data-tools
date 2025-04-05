document.addEventListener("DOMContentLoaded", () => {
  const fileUploadSections = document.querySelectorAll('.file-upload');
  
  // Add event listeners to file upload sections
  fileUploadSections.forEach((section) => {
      section.addEventListener("dragover", (e) => {
          e.preventDefault();
          section.classList.add('dragover');  // Add class for visual feedback
      });

      section.addEventListener("dragleave", () => {
          section.classList.remove('dragover');  // Remove class when dragging leaves
      });

      section.addEventListener("drop", (e) => {
          e.preventDefault();
          section.classList.remove('dragover');
          handleFileDrop(e, section);
      });

      const fileInput = section.querySelector('input[type="file"]');
      fileInput.addEventListener('change', (e) => {
          handleFileInputChange(e, section);
      });
  });

  function allowDrop(event) {
      event.preventDefault();
  }

  function handleFileDrop(event, section) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
          section.querySelector('input[type="file"]').files = files;
          handleFileInputChange({ target: { files } }, section);
      }
  }

  function handleFileInputChange(event, section) {
      const files = event.target.files;
      if (files.length > 0) {
          section.classList.add('accepted');
          const fileId = section.id;

          // Check file types and trigger appropriate actions
          switch (fileId) {
              case "compare-files-txt":
                  if (files[0].type === "text/plain" || files[1].type === "text/plain") {
                      compareTextFiles(files);
                  } else {
                      alert("Please upload valid .txt files.");
                  }
                  break;
              case "compare-files-csv":
                  if (files[0].type === "text/csv" || files[1].type === "text/csv") {
                      compareCsvFiles(files);
                  } else {
                      alert("Please upload valid .csv files.");
                  }
                  break;
              case "find-duplicates":
                  if (files[0].type === "text/csv") {
                      findDuplicates(files);
                  } else {
                      alert("Please upload a valid .csv file.");
                  }
                  break;
              case "convert-json-csv":
                  if (files[0].type === "application/json") {
                      convertJsonToCsv(files);
                  } else {
                      alert("Please upload a valid .json file.");
                  }
                  break;
              default:
                  break;
          }
      }
  }

  // Compare two .txt files
  function compareTextFiles(files) {
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

  function getTextDifferences(text1, text2) {
      const lines1 = text1.split("\n");
      const lines2 = text2.split("\n");
      let diffText = '';
      for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
          if (lines1[i] !== lines2[i]) {
              diffText += `Line ${i + 1}:\nFile 1: ${lines1[i]}\nFile 2: ${lines2[i]}\n\n`;
          }
      }
      return diffText;
  }

  // Compare two .csv files
  function compareCsvFiles(files) {
      const file1 = files[0];
      const file2 = files[1];
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

  function getCsvDifferences(csv1, csv2) {
      const rows1 = csv1.split("\n");
      const rows2 = csv2.split("\n");
      let diffText = '';
      for (let i = 0; i < Math.max(rows1.length, rows2.length); i++) {
          if (rows1[i] !== rows2[i]) {
              diffText += `Row ${i + 1}:\nFile 1: ${rows1[i]}\nFile 2: ${rows2[i]}\n\n`;
          }
      }
      return diffText;
  }

  // Find duplicates in a .csv file
  function findDuplicates(files) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
          const csv = e.target.result;
          const duplicates = getCsvDuplicates(csv);
          createFileDownload(duplicates, "duplicates.csv");
      };
      reader.readAsText(file);
  }

  function getCsvDuplicates(csv) {
      const rows = csv.split("\n");
      const seen = new Set();
      let duplicates = '';
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
      csvRows.push(keys.join(','));

      json.forEach((item) => {
          const values = keys.map((key) => item[key]);
          csvRows.push(values.join(','));
      });
      return csvRows.join('\n');
  }

  // Helper function to create a downloadable file
  function createFileDownload(content, filename) {
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
  }

  // Compare two .xlsx files
  function compareXlsxFiles(files) {
      const file1 = files[0];
      const file2 = files[1];
      const reader1 = new FileReader();
      const reader2 = new FileReader();

      reader1.onload = function (e) {
          const workbook1 = XLSX.read(e.target.result, { type: "binary" });
          reader2.onload = function (e) {
              const workbook2 = XLSX.read(e.target.result, { type: "binary" });
              const diff = getXlsxDifferences(workbook1, workbook2);
              createFileDownload(diff, "difference.xlsx");
          };
          reader2.readAsBinaryString(file2);
      };
      reader1.readAsBinaryString(file1);
  }

  function getXlsxDifferences(workbook1, workbook2) {
      const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
      const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
      const rows1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
      const rows2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });

      let diffText = '';
      for (let i = 0; i < Math.max(rows1.length, rows2.length); i++) {
          if (JSON.stringify(rows1[i]) !== JSON.stringify(rows2[i])) {
              diffText += `Row ${i + 1}:\nFile 1: ${JSON.stringify(rows1[i])}\nFile 2: ${JSON.stringify(rows2[i])}\n\n`;
          }
      }
      return diffText;
  }
});
