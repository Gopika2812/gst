const ServiceMaster = require('../models/ServiceMaster');

// @desc    Get all Master Services & Sub-Services
// @route   GET /api/services
// @access  Private
exports.getAllServices = async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    if (department) {
      query.department = department;
    }
    const services = await ServiceMaster.find(query).sort({ department: 1, serviceName: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new Service / Sub-Service
// @route   POST /api/services
// @access  Private (Admin / Super Admin)
exports.createService = async (req, res) => {
  try {
    const { department, serviceName, subServiceName, startDayOfMonth, dueDayOfMonth, periodicity, description } = req.body;
    
    if (!department || !serviceName || !subServiceName) {
      return res.status(400).json({ message: 'Department, Service Name, and Sub-Service Name are required' });
    }

    const newService = await ServiceMaster.create({
      department,
      serviceName,
      subServiceName,
      startDayOfMonth: Number(startDayOfMonth) || 1,
      dueDayOfMonth: Number(dueDayOfMonth) || 11,
      periodicity: periodicity || 'Monthly',
      description: description || ''
    });

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Service / Sub-Service
// @route   PUT /api/services/:id
// @access  Private (Admin / Super Admin)
exports.updateService = async (req, res) => {
  try {
    const service = await ServiceMaster.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service master item not found' });
    }

    const updated = await ServiceMaster.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Service / Sub-Service
// @route   DELETE /api/services/:id
// @access  Private (Admin / Super Admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await ServiceMaster.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service master item not found' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
