const Certification = require('../models/Certification');
const { logAudit } = require('../middleware/auditLogger');

// Create Certification Request
exports.createCertification = async (req, res) => {
  try {
    const { client, certificateType, applicationDate, expectedDate, certificateNumber, remarks } = req.body;

    const cert = await Certification.create({
      client,
      certificateType,
      applicationDate: applicationDate || new Date(),
      expectedDate,
      certificateNumber,
      remarks,
      status: 'Waiting For Certificate',
      certificateReceived: 'No'
    });

    await logAudit(req.user, 'Certification Created', 'Certification', `Initiated certificate tracking for client ID: ${client}`, req);

    res.status(201).json({ message: 'Certification record created', certification: cert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Certifications
exports.getCertifications = async (req, res) => {
  try {
    const { status, certificateReceived, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (certificateReceived) filter.certificateReceived = certificateReceived;

    const certs = await Certification.find(filter)
      .populate('client', 'clientName tradeName pan gstin phone email status')
      .sort({ createdAt: -1 });

    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Certification (Mark Received & Upload Certificate Document)
exports.updateCertification = async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Certification record not found' });
    }

    const { certificateReceived, certificateNumber, receivedDate, remarks, movedToBilling } = req.body;

    if (certificateReceived) cert.certificateReceived = certificateReceived;
    if (certificateNumber) cert.certificateNumber = certificateNumber;
    if (receivedDate) cert.receivedDate = receivedDate;
    if (remarks) cert.remarks = remarks;
    if (movedToBilling !== undefined) cert.movedToBilling = movedToBilling;

    if (cert.certificateReceived === 'Yes') {
      cert.status = 'Certificate Received';
      if (!cert.receivedDate) cert.receivedDate = new Date();
    }

    if (req.file) {
      cert.uploadedCertificate = `/uploads/${req.file.filename}`;
    }

    await cert.save();

    await logAudit(req.user, 'Certification Updated', 'Certification', `Updated certificate status for cert ID: ${cert._id}`, req);

    res.json({ message: 'Certification status updated', certification: cert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
