const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

async function run() {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    // Draw simple text
    page.drawText('Hello World', { x: 50, y: 350 });
    
    // Save without compression / object streams
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    
    console.log("PDF Bytes length:", pdfBytes.length);
    const parsed = await pdfParse(Buffer.from(pdfBytes));
    console.log("Parsed text successfully:", JSON.stringify(parsed.text));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

run();
