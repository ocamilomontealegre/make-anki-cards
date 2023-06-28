const fs = require("fs");
const XLSX = require("xlsx");
const axios = require("axios");

async function searchMeaning(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const meanings = response.data[0]?.meanings;
    if (meanings && meanings.length > 0) {
      return meanings.map((meaning) => meaning.definitions[0]?.definition);
    }
    return ["No definition found"];
  } catch (error) {
    throw new Error("Failed to fetch word meaning");
  }
}

function generateExcel(results) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(results);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

  const outputFilePath = "resultados.xlsx";
  XLSX.writeFile(workbook, outputFilePath);
  console.log(`Archivo Excel generado correctamente. Ruta: ${outputFilePath}`);
}

function handleFileRead(csvData) {
  const wordsToSearch = csvData.split(",");

  const searchPromises = wordsToSearch.map((word) => searchMeaning(word.trim()));

  Promise.all(searchPromises)
    .then((results) => {
      const searchResults = wordsToSearch.map((word, index) => ({
        Palabra: word.trim(),
        Significado: results[index].join(", "), // Combine meanings into a single string
      }));

      generateExcel(searchResults);
    })
    .catch((error) => {
      console.error("Error al buscar los significados:", error);
    });
}

function handleFormSubmit(csvFile) {
  fs.readFile(csvFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo CSV:", err);
    } else {
      handleFileRead(data);
    }
  });
}

function run() {
  const csvFilePath = "C:\\Users\\Camilo\\Documents\\Languages\\Make_Anki_Cards\\input.csv";
  handleFormSubmit(csvFilePath);
}

run();
