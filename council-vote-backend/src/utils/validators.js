// Validate email domain
const isEmailDomainAllowed = (email) => {
  const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',').map(d => d.trim()) || [];
  
  if (allowedDomains.length === 0) {
    return true; // If no domains specified, allow all
  }

  return allowedDomains.some(domain => email.endsWith(domain));
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if position is in voting period
const isPositionInVotingPeriod = (position) => {
  if (!position.votingStartDate || !position.votingEndDate) {
    return false;
  }

  const now = new Date();
  return now >= position.votingStartDate && now <= position.votingEndDate;
};

// Check if position accepts applications
const isPositionAcceptingApplications = (position) => {
  const now = new Date();
  return now <= position.applicationEndDate && position.status === 'APPROVED';
};

module.exports = {
  isEmailDomainAllowed,
  isValidEmail,
  isPositionInVotingPeriod,
  isPositionAcceptingApplications,
};
