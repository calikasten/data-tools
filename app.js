// Helper function to handle file drag-and-drop and hover state
function handleDragOver(event, toolId) {
    event.preventDefault();
    document.getElementById(toolId).classList.add('dragover');
}

function handleDrop(event, toolId) {
    event.preventDefault();
    document.getElementById(toolId).classList.remove('dragover');
    let files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files, toolId);
    }
}

function handleFileUpload(files, toolId) {
    // Handle the files uploaded based on the toolId (e.g., file comparison, duplicates, etc.)
    console.log(`Files uploaded for ${toolId}:`, files);
    // Example: process the file, handle the comparison, etc.
}

// Attach event listeners to dropzones
document.getElementById("dropzoneTxt").addEventListener('dragover', (e) => handleDragOver(e, "dropzoneTxt"));
document.getElementById("dropzoneTxt").addEventListener('drop', (e) => handleDrop(e, "dropzoneTxt"));
document.getElementById("dropzoneCsv").addEventListener('dragover', (e) => handleDragOver(e, "dropzoneCsv"));
document.getElementById("dropzoneCsv").addEventListener('drop', (e) => handleDrop(e, "dropzoneCsv"));
document.getElementById("dropzoneDup").addEventListener('dragover', (e) => handleDragOver(e, "dropzoneDup"));
document.getElementById("dropzoneDup").addEventListener('drop', (e) => handleDrop(e, "dropzoneDup"));
document.getElementById("dropzoneJson").addEventListener('dragover', (e) => handleDragOver(e, "dropzoneJson"));
document.getElementById("dropzoneJson").addEventListener('drop', (e) => handleDrop(e, "dropzoneJson"));

// Handle file input changes (for file selectors)
document.getElementById("file1Txt").addEventListener('change', (e) => handleFileUpload(e.target.files, 'fileUploadTxt'));
document.getElementById("file2Txt").addEventListener('change', (e) => handleFileUpload(e.target.files, 'fileUploadTxt'));
