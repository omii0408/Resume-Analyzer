const { PDFDocument } = require('pdf-lib');

async function test() {
  // Generate a valid PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('John Doe\nSoftware Engineer\nSkills: Node.js, React, JavaScript, SQL', { x: 50, y: 700 });
  const pdfBytes = await pdfDoc.save();

  const formData = new FormData();
  const fileBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  formData.append('resume', fileBlob, 'resume.pdf');
  formData.append('jobDescription', 'Looking for a Software Engineer with skills in Node.js and React.');

  try {
    console.log("Sending analysis request with a valid generated PDF...");
    const response = await fetch('http://localhost:5001/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

test();
