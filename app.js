// Select all the drag-and-drop zones
const dropZones = document.querySelectorAll('.drop-zone');

// File handling for drag-and-drop and file input
dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        zone.style.backgroundColor = '#333'; // Highlight when hovering
    });

    zone.addEventListener('dragleave', () => {
        zone.style.backgroundColor = '#444'; // Reset highlight when dragging leaves
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files; // Get dropped files
        handleFileUpload(files, zone); // Handle uploaded files
    });
});

// Handling file input (choose file button)
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', (e) => {
        handleFileUpload(e.target.files, e.target.closest('.tool-card').querySelector('.drop-zone'));
    });
});

// Handle file upload
function handleFileUpload(files, zone) {
    zone.style.backgroundColor = '#66BB6A'; // Highlight green when files are uploaded
    alert("Files uploaded successfully!");

    // Process the uploaded files based on the section (tool card)
    const toolCard = zone.closest('.tool-card');
    const fileInputs = toolCard.querySelectorAll('input[type="file"]');

    // Example of how to handle different file types and tools
    if (toolCard.id === 'file-compare-txt') {
        // Compare text/docx files (simplified)
        if (files.length === 2) {
            compareTextFiles(files[0], files[1]);
        } else {
            alert('Please upload exactly two files for comparison.');
        }
    } else if (toolCard.id === 'file-compare-csv') {
        // Compare CSV/Excel files
        if (files.length === 2) {
            compareCsvFiles(files[0], files[1]);
        } else {
            alert('Please upload exactly two files for comparison.');
        }
    } else if (toolCard.id === 'duplicates') {
        // Find duplicates in CSV/Excel
        if (files.length === 1) {
            findDuplicates(files[0]);
        } else {
            alert('Please upload one file to find duplicates.');
        }
    } else if (toolCard.id === 'json-to-csv') {
        // Convert JSON to CSV
        if (files.length === 1) {
            convertJsonToCsv(files[0]);
        } else {
            alert('Please upload one JSON file to convert.');
        }
    }
}

// Comparing text files (simplified, should use a library or more detailed logic)
function compareTextFiles(file1, file2) {
    alert('Comparing .txt or .docx files...');
    // Placeholder: you would need to implement logic to compare the contents
}

// Comparing CSV files (using PapaParse or similar)
function compareCsvFiles(file1, file2) {
    alert('Comparing .csv or .xlsx files...');
    // Placeholder: you would need to read both CSVs, find differences, and output results
}

// Finding duplicates in CSV (using PapaParse or similar)
function findDuplicates(file) {
    alert
