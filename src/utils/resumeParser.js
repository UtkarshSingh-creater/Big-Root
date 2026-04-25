import * as pdfjsLib from "pdfjs-dist";

export async function parseResume(file) {
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = async () => {
      const pdf = await pdfjsLib.getDocument(reader.result).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((i) => i.str).join(" ");
      }

      resolve(text);
    };

    reader.readAsArrayBuffer(file);
  });
}