// Server utility to compute pickup pass lifecycle state (Module 2 Business Logic)

function computePassState(pass) {
  if (!pass || !pass.code) return null;
  if (pass.isUsed) return 'used';
  if (typeof pass.attemptsRemaining === 'number' && pass.attemptsRemaining <= 0) return 'locked';
  if (pass.expiresAt && new Date(pass.expiresAt).getTime() <= Date.now()) return 'expired';
  return 'active';
}

module.exports = { computePassState };
