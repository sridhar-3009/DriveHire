function toSafeUser(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    name: row.name, email: row.email, phone: row.phone || '',
    role: row.role, avatar: row.avatar || '', isActive: row.is_active,
    createdAt: row.created_at, updatedAt: row.updated_at,
    profile: {
      licenseNumber: row.license_number || '',
      licenseExpiry: row.license_expiry || null,
      experience: row.experience || 0,
      location: row.location || '',
      languages: row.languages || [],
      availability: row.availability || 'immediate',
      bio: row.bio || '',
      kycStatus: row.kyc_status || 'not_submitted',
    },
    company: {
      name: row.company_name || '',
      fleetSize: row.fleet_size || 0,
      location: row.company_location || '',
      website: row.company_website || '',
      description: row.company_description || '',
    },
  };
}

function toSafeJob(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    employerId: row.employer_id,
    title: row.title, company: row.company,
    location: row.location, salary: row.salary,
    type: row.type, route: row.route,
    experience: row.experience, description: row.description,
    requirements: row.requirements || [],
    openings: row.openings || 1, deadline: row.deadline,
    status: row.status, vehicleType: row.vehicle_type || 'bus',
    createdAt: row.created_at, updatedAt: row.updated_at,
    applicantCount: row.applicant_count || 0,
  };
}

module.exports = { toSafeUser, toSafeJob };
