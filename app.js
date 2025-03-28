document.addEventListener("DOMContentLoaded", () => {
    // Tool 1: Compare Two Files
    const tool1Form = document.getElementById("tool1-form");
    const fileDifferencesDiv = document.getElementById("file-differences");

    // Tool 2: Find Duplicates
    const tool2Form = document.getElementById("tool2-form");
    const duplicatesResultDiv = document.getElementById("duplicates-result");

    tool1Form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const file1 = document.getElementById("file1").files[0];
        const file2 = document.getElementById("file2").files[0];

        if (file1 && file2) {
            const file1Data = await parseFile(file1);
            const file2Data = await parseFile(file2);

            const differences = compareFiles(file1Data, file2Data);

            displayFileDifferences(differences);
        } else {
            alert("Please upload both files.");
        }
    });

    tool2Form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const file3 = document.getElementById("file3").files[0];

        if (file3) {
            const fileData = await parseFile(file3);
            const duplicates = findDuplicates(fileData);

            displayDuplicates(duplicates);
        } else {
            alert("Please upload a file.");
        }
    });

    // Function to parse a CSV or XLSX file
    async function parseFile(file) {
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.onload = async (event) => {
                const fileContent = event.target.result;

                if (fileExtension === "csv") {
                    resolve(parseCSV(fileContent));
                } else if (fileExtension === "xlsx") {
                    resolve(await parseXLSX(fileContent));
                } else {
                    reject("Unsupported file format");
                }
            };

            fileReader.onerror = reject;
            fileReader.readAsText(file);
        });
    }

    // Function to parse CSV file content into an array of rows
    function parseCSV(content) {
        const rows = content.split("\n").map(row => row.split(","));
        return rows;
    }

    // Function to parse XLSX file content (using the XLSX.js library)
    async function parseXLSX(content) {
        const workbook = XLSX.read(content, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return data;
    }

    // Function to compare two files and return the differences
    function compareFiles(file1Data, file2Data) {
        const differences = [];
        const maxRows = Math.max(file1Data.length, file2Data.length);

        for (let i = 0; i < maxRows; i++) {
            const row1 = file1Data[i] || [];
            const row2 = file2Data[i] || [];

            for (let j = 0; j < Math.max(row1.length, row2.length); j++) {
                if (row1[j] !== row2[j]) {
                    differences.push(`Difference at Row ${i + 1}, Column ${j + 1}: ${row1[j] || "N/A"} !== ${row2[j] || "N/A"}`);
                }
            }
        }

        return differences;
    }

    // Function to display differences
    function displayFileDifferences(differences) {
        fileDifferencesDiv.style.display = "block";
        fileDifferencesDiv.innerHTML = `<h3>Differences</h3><ul>${differences.map(diff => `<li>${diff}</li>`).join("")}</ul>`;
    }

    // Function to find duplicates in a file
    function findDuplicates(fileData) {
        const seen = new Set();
        const duplicates = [];

        fileData.forEach((row, index) => {
            const rowString = JSON.stringify(row);
            if (seen.has(rowString)) {
                duplicates.push(`Duplicate at Row ${index + 1}: ${row.join(", ")}`);
            } else {
                seen.add(rowString);
            }
        });

        return duplicates;
    }

    // Function to display duplicates
    function displayDuplicates(duplicates) {
        duplicatesResultDiv.style.display = "block";
        duplicatesResultDiv.innerHTML = `<h3>Duplicates</h3><ul>${duplicates.map(dup => `<li>${dup}</li>`).join("")}</ul>`;
    }
});
