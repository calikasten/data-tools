document.addEventListener("DOMContentLoaded", () => {
    const fileUploadSections = document.querySelectorAll('.file-upload');
    
    // Add event listeners to file upload sections
    fileUploadSections.forEach((section) => {
        section.addEventListener("dragover", (e) => {
            e.preventDefault();
            section.classList.add('accepted');
        });

        section.addEventListener("dragleave", () => {
            section.classList.remove('accepted');
        });

        section.addEventListener("drop", (e) => {
            e.preventDefault();
            section.classList.remove('accepted');
            handleFileDrop(e, section);
        });

        const fileInput = section.querySelector('input[type="file"]');
        fileInput.addEventListener('change', (e) => {
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
            section.classList.add('accepted');
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
        if (files[0].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || files[1].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            // Handle .docx file comparison
            compareDocxFiles(files);
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

    function compareDocxFiles(files) {
        const file1 = files[0];
        const file2 = files[1];
        const reader1 = new FileReader();
        const reader2 = new FileReader();

        reader1.onload = function (e) {
            const arrayBuffer1 = e.target.result;
            reader2.onload = function (e) {
                const arrayBuffer2 = e.target.result;

                Promise.all([extractTextFromDocx(arrayBuffer1), extractTextFromDocx(arrayBuffer2)])
                    .then(([text1, text2]) => {
                        const diff = getTextDifferences(text1, text2);
                        createFileDownload(diff, "difference.docx");
                    });
            };
            reader2.readAsArrayBuffer(file2);
        };
        reader1.readAsArrayBuffer(file1);
    }

    function extractTextFromDocx(arrayBuffer) {
        return new Promise((resolve, reject) => {
            const zip = new JSZip();
            zip.loadAsync(arrayBuffer)
                .then(function (contents) {
                    const documentXml = contents.files["word/document.xml"];
                    return documentXml.async("text");
                })
                .then(function (text) {
                    mammoth.extractRawText({ xml: text }).then(function (result) {
                        resolve(result.value);
                    }).catch(reject);
                });
        });
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

    // Compare two .csv or .xlsx files
    function compareCsvFiles(files) {
        const file1 = files[0];
        const file2 = files[1];

        if (file1.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file2.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            // Parse .xlsx with SheetJS
            compareXlsxFiles(files);
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
        // Implement comparison logic for XLSX
        return "Comparison of XLSX files is not yet implemented.";
    }

    // Find duplicates in .csv or .xlsx file
    function findDuplicates(files) {
        const file = files[0];
        if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
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
});
