document.addEventListener("DOMContentLoaded", () => {
    // Tool 1: Compare Two Files
    const tool1Form = document.getElementById("tool1-form");
    const fileDifferencesDiv = document.getElementById("file-differences");

    // Tool 2: Find Duplicates
    const tool2Form = document.getElementById("tool2-form");
    const duplicatesResultDiv = document.getElementById("duplicates-result");

    // Tool 3: JSON to CSV
    const tool3Form = document.getElementById("tool3-form");
    const jsonToCsvResultDiv = document.getElementById("json-to-csv-result");

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

    tool3Form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const jsonFile = document.getElementById("jsonFile").files[0];

        if (jsonFile) {
            const jsonData = await parseJSONFile(jsonFile);
            const csvData = convertJSONToCSV(jsonData);

            displayJSONToCSV(csvData);
        } else {
            alert("Please upload a JSON file.");
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
            if (fileExtension === "xlsx") {
                fileReader.readAsArrayBuffer(file); // Read the file as binary (ArrayBuffer) for XLSX
            } else {
                fileReader.readAsText(file); // Read CSV as text
            }
        });
    }

    // Function to parse CSV file content into an array of rows
    function parseCSV(content) {
        const rows = content.split("\n").map(row => row.split(","));
        return rows;
    }

    // Function to parse XLSX file content (using the XLSX.js library)
    async function parseXLSX(content) {
        const workbook = XLSX.read(content, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return data;
    }

    // Function to convert JSON to CSV
    function convertJSONToCSV(jsonData) {
        const headers = Object.keys(jsonData[0]);
        const csvRows = [];

        // Add headers to CSV
        csvRows.push(headers.join(","));

        // Add rows to CSV
        jsonData.forEach(row => {
            const values = headers.map(header => {
                if (typeof row[header] === "object") {
                    return JSON.stringify(row[header]);
                }
                return row[header] || "";
            });
            csvRows.push(values.join(","));
        });

        return csvRows.join("\n");
    }

    // Function to parse the JSON file
    async function parseJSONFile(file) {
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    resolve(jsonData);
                } catch (e) {
                    reject("Invalid JSON format");
                }
            };
            fileReader.onerror = reject;
            fileReader.readAsText(file);
        });
    }

    // Function to display differences between two files
    function displayFileDifferences(differences) {
        fileDifferencesDiv.style.display = "block";
        fileDifferencesDiv.innerHTML = `<h3>Differences</h3><ul>${differences.map(diff => `<li>${diff}</li>`).join("")}</ul>`;
    }

    // Function to display duplicates
    function displayDuplicates(duplicates) {
        duplicatesResultDiv.style.display = "block";
        duplicatesResultDiv.innerHTML = `<h3>Duplicates</h3><ul>${duplicates.map(dup => `<li>${dup}</li>`).join("")}</ul>`;
    }

    // Function to display the JSON to CSV result
    function displayJSONToCSV(csvData) {
        jsonToCsvResultDiv.style.display = "block";
        jsonToCsvResultDiv.innerHTML = `<h3>CSV Output</h3><pre>${csvData}</pre>`;
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
});
