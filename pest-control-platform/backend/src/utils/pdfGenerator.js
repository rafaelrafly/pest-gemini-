const PDFDocument = require('pdfkit');

function generateServiceReportPDF(reportData, res) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ServiceReport-${reportData.report_number}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(18).fillColor('#1b4332').text('PROTEKSI PEST CONTROL', { align: 'left' });
  doc.fontSize(10).fillColor('#555').text('Pest Management Services | Komplek Pondok Cibubur Blok B2 No. 10, Depok');
  doc.text('E-mail: proteksipestcontrol@gmail.com');
  doc.moveDown();

  doc.fontSize(14).fillColor('#000').text('SERVICE REPORT', { align: 'center', underline: true });
  doc.moveDown();

  // Meta Info
  doc.fontSize(10).text(`DATE: ${reportData.date}    |    TIME: ${reportData.time}    |    REPORT NO: ${reportData.report_number}`);
  doc.moveDown();

  // Client Information Box
  doc.rect(30, doc.y, 535, 60).stroke();
  doc.fontSize(11).fillColor('#1b4332').text('CLIENT INFORMATION', 35, doc.y + 5);
  doc.fontSize(10).fillColor('#000');
  doc.text(`NAME: ${reportData.client_name}`, 35, doc.y + 20);
  doc.text(`LOCATION: ${reportData.client_address}`, 35, doc.y + 35);
  doc.moveDown(3);

  // Scope & Personnel
  doc.text(`SCOPE OF AREAS: ${reportData.scope_of_areas}`);
  doc.text(`AUTHORIZED PERSONNEL / TECHNICIAN: ${reportData.technician_name} (NIK: Leader Teknis)`);
  doc.moveDown();

  // Pest Findings Table
  doc.fontSize(11).fillColor('#1b4332').text('PEST FINDINGS & INSPECTION');
  doc.fontSize(10).fillColor('#000');
  
  const findings = reportData.pest_findings || {};
  doc.text(`- Fly (F): ${findings.F || 0} found`);
  doc.text(`- Mosquito (M): ${findings.M || 0} found`);
  doc.text(`- Cockroach (C): ${findings.C || 0} found`);
  doc.text(`- Rat / Rodent (R): ${findings.R || 0} found`);
  doc.text(`- Ant (A): ${findings.A || 0} found`);
  doc.text(`- Other (O): ${findings.O || 0} found`);
  doc.moveDown();

  // Treatments
  doc.fontSize(11).fillColor('#1b4332').text('SERVICE TREATMENT');
  doc.fontSize(10).fillColor('#000').text(reportData.treatments_description || 'Spraying, Cold Fogging, Gel Baiting, and Rodent Trapping executed.');
  doc.moveDown();

  // Recommendation
  doc.fontSize(11).fillColor('#1b4332').text('RECOMMENDATION');
  doc.fontSize(10).fillColor('#000').text(reportData.recommendations || 'Always maintain cleanliness in pantry and working areas.');
  doc.moveDown(2);

  // Signatures
  doc.text(`Service Technician: ${reportData.technician_name}                      Acknowledge By User: ${reportData.client_contact || 'Client'}`, { align: 'left' });

  doc.end();
}

module.exports = { generateServiceReportPDF };
