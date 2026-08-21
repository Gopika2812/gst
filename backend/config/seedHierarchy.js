const User = require('../models/User');

const seedOrgHierarchy = async () => {
  try {
    // 1. Super Admin (Sainath - Founder & MD)
    let sainath = await User.findOne({ email: 'sainath@vigneshassociates.com' });
    if (!sainath) {
      sainath = await User.create({
        name: 'Sainath',
        email: 'sainath@vigneshassociates.com',
        phone: '+91 98765 00001',
        password: 'admin123',
        role: 'Super Admin',
        department: 'Management',
        designation: 'Founder & MD',
        status: 'Approved'
      });
    } else {
      sainath.name = 'Sainath';
      sainath.role = 'Super Admin';
      sainath.department = 'Management';
      sainath.designation = 'Founder & MD';
      sainath.status = 'Approved';
      await sainath.save();
    }

    // Also update superadmin@vigneshassociates.com if exists to point to Sainath as Super Admin
    let superAdminLegacy = await User.findOne({ email: 'superadmin@vigneshassociates.com' });
    if (superAdminLegacy) {
      superAdminLegacy.role = 'Super Admin';
      superAdminLegacy.department = 'Management';
      superAdminLegacy.designation = 'Founder & MD';
      await superAdminLegacy.save();
    }

    // 2. Department Admins / Managers
    // Premila (Administration Manager)
    let premila = await User.findOne({ email: 'premila@vigneshassociates.com' });
    if (!premila) {
      premila = await User.create({
        name: 'Premila',
        email: 'premila@vigneshassociates.com',
        phone: '+91 98765 00002',
        password: 'admin123',
        role: 'Admin',
        department: 'Administration',
        designation: 'Administration Manager',
        reportsTo: sainath._id,
        status: 'Approved'
      });
    } else {
      premila.reportsTo = sainath._id;
      premila.role = 'Admin';
      premila.department = 'Administration';
      premila.designation = 'Administration Manager';
      await premila.save();
    }

    // Iniya (Senior Income Tax Executive)
    let iniya = await User.findOne({ email: 'iniya@vigneshassociates.com' });
    if (!iniya) {
      iniya = await User.create({
        name: 'Iniya',
        email: 'iniya@vigneshassociates.com',
        phone: '+91 98765 00003',
        password: 'admin123',
        role: 'Admin',
        department: 'Income Tax',
        designation: 'Senior Income Tax Executive',
        reportsTo: sainath._id,
        status: 'Approved'
      });
    } else {
      iniya.reportsTo = sainath._id;
      iniya.role = 'Admin';
      iniya.department = 'Income Tax';
      iniya.designation = 'Senior Income Tax Executive';
      await iniya.save();
    }

    // Revathi (Senior Accounts Executive)
    let revathi = await User.findOne({ email: 'revathi@vigneshassociates.com' });
    if (!revathi) {
      revathi = await User.create({
        name: 'Revathi',
        email: 'revathi@vigneshassociates.com',
        phone: '+91 98765 00004',
        password: 'admin123',
        role: 'Admin',
        department: 'Accounts',
        designation: 'Senior Accounts Executive',
        reportsTo: sainath._id,
        status: 'Approved'
      });
    } else {
      revathi.reportsTo = sainath._id;
      revathi.role = 'Admin';
      revathi.department = 'Accounts';
      revathi.designation = 'Senior Accounts Executive';
      await revathi.save();
    }

    // 3. Staffs under Admins
    // Under Premila: Seleena, Sakshi, Sowmiya
    const gstStaffs = [
      { name: 'Seleena', email: 'seleena@vigneshassociates.com', phone: '+91 98765 00010', designation: 'GST Executive' },
      { name: 'Sakshi', email: 'sakshi@vigneshassociates.com', phone: '+91 98765 00011', designation: 'GST Executive' },
      { name: 'Sowmiya', email: 'sowmiya@vigneshassociates.com', phone: '+91 98765 00012', designation: 'Junior GST Executive' }
    ];

    for (const staff of gstStaffs) {
      let u = await User.findOne({ email: staff.email });
      if (!u) {
        await User.create({
          ...staff,
          password: 'user123',
          role: 'GST Executive',
          department: 'GST',
          reportsTo: premila._id,
          status: 'Approved'
        });
      } else {
        u.reportsTo = premila._id;
        u.designation = staff.designation;
        u.role = 'GST Executive';
        await u.save();
      }
    }

    // Under Iniya: Sankar, Praveena
    const itStaffs = [
      { name: 'Sankar', email: 'sankar@vigneshassociates.com', phone: '+91 98765 00020', designation: 'Income Tax Executive' },
      { name: 'Praveena', email: 'praveena@vigneshassociates.com', phone: '+91 98765 00021', designation: 'Income Tax Executive' }
    ];

    for (const staff of itStaffs) {
      let u = await User.findOne({ email: staff.email });
      if (!u) {
        await User.create({
          ...staff,
          password: 'user123',
          role: 'Income Tax Executive',
          department: 'Income Tax',
          reportsTo: iniya._id,
          status: 'Approved'
        });
      } else {
        u.reportsTo = iniya._id;
        u.designation = staff.designation;
        u.role = 'Income Tax Executive';
        await u.save();
      }
    }

    // Under Revathi: Santhiya
    const accStaffs = [
      { name: 'Santhiya', email: 'santhiya@vigneshassociates.com', phone: '+91 98765 00030', designation: 'Junior Accounts Executive' }
    ];

    for (const staff of accStaffs) {
      let u = await User.findOne({ email: staff.email });
      if (!u) {
        await User.create({
          ...staff,
          password: 'user123',
          role: 'Accounts Executive',
          department: 'Accounts',
          reportsTo: revathi._id,
          status: 'Approved'
        });
      } else {
        u.reportsTo = revathi._id;
        u.designation = staff.designation;
        u.role = 'Accounts Executive';
        await u.save();
      }
    }

    console.log('[Seed] Organization Chart & Reporting Structure seeded successfully.');
  } catch (err) {
    console.error('[Seed Error] Failed to seed hierarchy:', err);
  }
};

module.exports = seedOrgHierarchy;
