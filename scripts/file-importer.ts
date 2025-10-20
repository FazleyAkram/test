import { parse } from "csv-parse/sync";

export const handleProcessFile = (selectedFile: File | null) => {
    // If no file is present, do not attempt to process a non-existent file
    if (!selectedFile) return;

    console.log("Processing file:", selectedFile.name, selectedFile.type);

    // Create reader to interpret file and direct to correct file type to process
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
            // POSSIBLY ADD MORE FILE TYPE CHECKING FOR NON-CSV FILES HERE

            const processedFile = processCsv(text); // Take this array and convert data to JSON report structure for parsing to AI
            console.log(processedFile);
        }
    }

    // Calls the previously defined reader to convert the file to a string
    reader.readAsText(selectedFile);
}

// Uses csv-parse/sync to convert the raw string of data to an array object, accounting for strings and numeric data points
function processCsv(input: string) {
    const records = parse(input, {
        columns: true,
        skip_empty_lines: true,
        cast: (value) => { // Cast numeric values
            return (!isNaN(Number(value)) && value.trim() !== "") ? Number(value) : value;
        }
    });

    return records;
}