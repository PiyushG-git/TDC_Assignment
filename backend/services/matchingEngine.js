/**
 * ============================================================
 *  TDC MATCHMAKING ENGINE  v3.0 (Production Grade)
 * ============================================================
 *
 *  ARCHITECTURE
 *  ─────────────
 *  1. HARD FILTER PASS (Dealbreakers)
 *     - Conflicting 'wantKids' (Yes vs No)
 *     - Extreme Diet Conflict (Veg vs Non-Veg without flexibility)
 *
 *  2. SCORING MODEL (100 Points Normalized)
 *  Dimension            | Max Pts
 *  ─────────────────────|────────
 *  1. Religion          |   14
 *  2. Caste             |    8
 *  3. Age               |   16
 *  4. Income            |   12
 *  5. Values & Kids     |   14
 *  6. Lifestyle         |   14
 *  7. Height            |    7
 *  8. Education         |    7
 *  9. Location          |    6
 *  ─────────────────────|────────
 *  TOTAL                |   98  (normalized to 100)
 */

// ────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ────────────────────────────────────────────────────────────

const arrayOverlap = (a = [], b = []) => {
  const setB = new Set(b.map(x => x?.toLowerCase?.() ?? x));
  return (a || []).filter(x => setB.has(x?.toLowerCase?.() ?? x)).length;
};

const incomeTier = (income = 0) => {
  if (income < 500000)  return 0;
  if (income < 1000000) return 1;
  if (income < 2000000) return 2;
  if (income < 5000000) return 3;
  if (income < 10000000) return 4;
  return 5;
};

const eduLevel = (degree = '') => {
  const d = (degree || '').toLowerCase();
  if (d.includes('phd') || d.includes('doctorate')) return 4;
  if (d.includes('m.tech') || d.includes('mba') || d.includes('m.sc') || d.includes('pg') || d.includes('md') || d.includes('masters')) return 3;
  if (d.includes('b.tech') || d.includes('b.e') || d.includes('bca') || d.includes('b.sc') || d.includes('mbbs') || d.includes('ca') || d.includes('bachelors')) return 2;
  if (d.includes('b.com') || d.includes('b.a') || d.includes('ba') || d.includes('bba')) return 1;
  return 0;
};

// ────────────────────────────────────────────────────────────
// HARD FILTER (DEALBREAKERS)
// ────────────────────────────────────────────────────────────

const checkDealbreakers = (target, candidate) => {
  // 1. Kids
  if ((target.wantKids === 'Yes' && candidate.wantKids === 'No') ||
      (target.wantKids === 'No' && candidate.wantKids === 'Yes')) {
    return 'Fundamental conflict regarding having children.';
  }

  // 2. Extreme Diet Clash
  if ((target.dietPreference === 'Veg' && candidate.dietPreference === 'Non-Veg') ||
      (target.dietPreference === 'Non-Veg' && candidate.dietPreference === 'Veg') ||
      (target.dietPreference === 'Vegan' && candidate.dietPreference === 'Non-Veg') ||
      (target.dietPreference === 'Non-Veg' && candidate.dietPreference === 'Vegan')) {
    // In reality, some might be okay with this, but usually it's a very strong friction point in India
    return 'Fundamental dietary conflict (Veg vs Non-Veg).';
  }

  return null; // No dealbreakers
};

// ────────────────────────────────────────────────────────────
// DIMENSION SCORERS
// ────────────────────────────────────────────────────────────

const scoreReligion = (target, candidate, maxPts) => {
  let pts = 0;
  let reason = '';

  if (target.religion && candidate.religion) {
    if (target.religion === candidate.religion) {
      pts = maxPts;
      reason = `Same religion (${target.religion}).`;
    } else {
      pts = maxPts * 0.1;
      reason = `Different religions (${target.religion} & ${candidate.religion}).`;
    }
  } else {
    pts = maxPts * 0.5; // Missing data fallback
  }

  return { pts, reason };
};

const scoreCaste = (target, candidate, maxPts) => {
  let pts = 0;
  let reason = '';

  if (target.caste && candidate.caste) {
    if (target.caste === candidate.caste) {
      pts = maxPts;
      reason = `Same caste/community (${target.caste}).`;
    } else {
      pts = maxPts * 0.4;
      reason = `Different caste.`;
    }
  } else {
    // If caste isn't filled, assume caste no bar
    pts = maxPts * 0.8;
  }

  return { pts, reason };
};

const scoreAge = (target, candidate, maxPts) => {
  const diff = target.gender === 'Male'
    ? target.age - candidate.age   // positive = she is younger
    : candidate.age - target.age;  // positive = he is older

  let pts = 0;
  let reason = '';

  if (target.gender === 'Male') {
    if (diff >= 1 && diff <= 5)      { pts = maxPts;            reason = `Ideal age gap (${diff} years younger).`; }
    else if (diff === 0)             { pts = maxPts * 0.9;      reason = `Same age.`; }
    else if (diff > 5 && diff <= 8)  { pts = maxPts * 0.7;      reason = `Acceptable age gap (${diff} years).`; }
    else if (diff < 0 && diff >= -2) { pts = maxPts * 0.6;      reason = `She is slightly older (${Math.abs(diff)} yrs).`; }
    else                             { pts = maxPts * 0.2;      reason = `Significant age mismatch.`; }
  } else {
    if (diff >= 1 && diff <= 6)      { pts = maxPts;            reason = `Ideal age gap (${diff} years older).`; }
    else if (diff === 0)             { pts = maxPts * 0.9;      reason = `Same age.`; }
    else if (diff > 6 && diff <= 10) { pts = maxPts * 0.6;      reason = `Acceptable older gap (${diff} years).`; }
    else if (diff < 0 && diff >= -3) { pts = maxPts * 0.6;      reason = `He is slightly younger (${Math.abs(diff)} yrs).`; }
    else                             { pts = maxPts * 0.2;      reason = `Significant age mismatch.`; }
  }

  return { pts, reason };
};

const scoreIncome = (target, candidate, maxPts) => {
  const tTier = incomeTier(target.income);
  const cTier = incomeTier(candidate.income);
  let pts = 0;
  let reason = '';

  // Without explicit preferences, we score income parity neutrally,
  // and only heavily reward/penalize extreme gaps.
  const diff = target.gender === 'Male' ? tTier - cTier : cTier - tTier;

  if (diff === 0) {
    pts = maxPts;
    reason = `Equal income tier — modern parity.`;
  } else if (diff === 1 || diff === 2) {
    pts = maxPts;
    reason = target.gender === 'Male' ? `He earns comfortably more.` : `He earns comfortably more.`;
  } else if (diff === -1) {
    pts = maxPts * 0.8;
    reason = target.gender === 'Male' ? `She earns slightly more (acceptable).` : `She earns slightly more (acceptable).`;
  } else if (diff <= -2) {
    pts = maxPts * 0.4;
    reason = target.gender === 'Male' ? `Significant income gap (She earns more).` : `Significant income gap (She earns more).`;
  } else {
    pts = maxPts * 0.8;
  }

  return { pts, reason };
};

const scoreEducation = (target, candidate, maxPts) => {
  const tL = eduLevel(target.degree);
  const cL = eduLevel(candidate.degree);
  const diff = target.gender === 'Male' ? tL - cL : cL - tL; // Positive = Male is more educated
  
  let pts = 0;
  let reason = '';

  if (tL === cL) {
    pts = maxPts;
    reason = `Equal education level.`;
  } else if (diff === 1) {
    pts = maxPts * 0.9; // Male slightly more educated
    reason = `Compatible education.`;
  } else if (diff === -1) {
    pts = maxPts * 0.8; // Female slightly more educated
    reason = `Compatible education.`;
  } else {
    pts = maxPts * 0.4; // 2+ tier gap
    reason = `Education gap exists.`;
  }

  return { pts, reason };
};

const scoreHeight = (target, candidate, maxPts) => {
  const tH = target.height || 165;
  const cH = candidate.height || 165;
  const MIN_PTS = 3; // Prevent 0-score ceiling problem

  let pts = MIN_PTS;
  let reason = '';

  if (target.gender === 'Male') {
    const diff = tH - cH; // positive = she is shorter
    if (diff >= 5)        { pts = maxPts;        reason = `Comfortable height difference.`; }
    else if (diff >= 0)   { pts = maxPts * 0.8;  reason = `Similar heights.`; }
    else                  { pts = maxPts * 0.5;  reason = `She is taller by ${Math.abs(diff)} cm.`; }
  } else {
    const diff = cH - tH; // positive = he is taller
    if (diff >= 5)        { pts = maxPts;        reason = `Comfortable height difference.`; }
    else if (diff >= 0)   { pts = maxPts * 0.8;  reason = `Similar heights.`; }
    else                  { pts = maxPts * 0.5;  reason = `She is taller by ${Math.abs(diff)} cm.`; }
  }

  return { pts, reason };
};

const scoreValues = (target, candidate, maxPts) => {
  let pts = 0;
  const reasons = [];

  const kidsPts = maxPts * 0.5;
  const familyPts = maxPts * 0.3;
  const maritalPts = maxPts * 0.2;

  // Kids (Dealbreakers handled earlier, this is for alignment)
  if (target.wantKids === candidate.wantKids) {
    pts += kidsPts;
    reasons.push(`Aligned on kids.`);
  } else {
    pts += kidsPts * 0.5;
  }

  // Family type
  if (target.familyType === candidate.familyType) {
    pts += familyPts;
    reasons.push(`Same family preference (${target.familyType}).`);
  } else {
    pts += familyPts * 0.3;
  }

  // Marital status
  if (target.maritalStatus === candidate.maritalStatus) {
    pts += maritalPts;
  }

  return { pts, reason: reasons.join(' ') };
};

const scoreLifestyle = (target, candidate, maxPts) => {
  let pts = 0;
  const reasons = [];

  const smokePts = maxPts * 0.25;
  const drinkPts = maxPts * 0.25;
  const hobbyPts = maxPts * 0.50;

  // Smoking
  if (target.smoking === candidate.smoking) {
    pts += smokePts;
    if (target.smoking === 'No') reasons.push(`Neither smokes.`);
  } else if (target.smoking === 'No' || candidate.smoking === 'No') {
    pts += smokePts * 0.2;
  } else {
    pts += smokePts * 0.5;
  }

  // Drinking
  if (target.drinking === candidate.drinking) {
    pts += drinkPts;
  } else if (target.drinking === 'No' || candidate.drinking === 'No') {
    pts += drinkPts * 0.3;
  } else {
    pts += drinkPts * 0.6;
  }

  // Hobbies
  const tActivities = [...(target.hobbies || []), ...(target.interests || [])];
  const cActivities = [...(candidate.hobbies || []), ...(candidate.interests || [])];
  const sharedCount = arrayOverlap(tActivities, cActivities);

  if (sharedCount >= 3)      { pts += hobbyPts;       reasons.push(`${sharedCount} shared interests.`); }
  else if (sharedCount >= 1) { pts += hobbyPts * 0.6; reasons.push(`${sharedCount} shared interests.`); }
  else                       { pts += hobbyPts * 0.2; }

  return { pts, reason: reasons.join(' ') };
};

const scoreLocation = (target, candidate, maxPts) => {
  let pts = 0;
  let reason = '';

  if (target.city === candidate.city) {
    pts = maxPts;
    reason = `Both in ${target.city}.`;
  } else if (target.relocate === 'Yes' && candidate.relocate === 'Yes') {
    pts = maxPts * 0.8;
    reason = `Both open to relocation.`;
  } else if (target.relocate === 'Yes' || candidate.relocate === 'Yes') {
    pts = maxPts * 0.6;
    reason = `One partner open to relocate.`;
  } else {
    pts = maxPts * 0.2;
    reason = `Different cities, relocation uncertain.`;
  }

  return { pts, reason };
};


// ────────────────────────────────────────────────────────────
// MAIN SCORER
// ────────────────────────────────────────────────────────────

const calculateMatchScore = (targetProfile, candidateProfile) => {
  // 1. Dealbreaker Pass
  const dealbreaker = checkDealbreakers(targetProfile, candidateProfile);
  if (dealbreaker) {
    return { score: 0, reason: `DEALBREAKER: ${dealbreaker}`, breakdown: {}, isDealbreaker: true };
  }

  // 2. Scoring Pass
  const dimensions = [
    { name: 'Religion',     fn: scoreReligion,  maxPts: 14 },
    { name: 'Caste',        fn: scoreCaste,     maxPts: 8  },
    { name: 'Age',          fn: scoreAge,       maxPts: 16 },
    { name: 'Income',       fn: scoreIncome,    maxPts: 12 },
    { name: 'Values',       fn: scoreValues,    maxPts: 14 },
    { name: 'Lifestyle',    fn: scoreLifestyle, maxPts: 14 },
    { name: 'Height',       fn: scoreHeight,    maxPts: 7  },
    { name: 'Education',    fn: scoreEducation, maxPts: 7  },
    { name: 'Location',     fn: scoreLocation,  maxPts: 6  },
  ];

  let totalPts = 0;
  let totalMax = 0;
  const reasonParts = [];
  const breakdown = {};

  for (const dim of dimensions) {
    const { pts, reason } = dim.fn(targetProfile, candidateProfile, dim.maxPts);
    totalPts += pts;
    totalMax += dim.maxPts;
    breakdown[dim.name] = { score: Math.round(pts), max: dim.maxPts };
    if (reason) reasonParts.push(reason);
  }

  // Normalize to 0–100
  const score = Math.round((totalPts / totalMax) * 100);
  const reason = reasonParts.slice(0, 5).join(' ');

  return { score: Math.min(score, 100), reason, breakdown, isDealbreaker: false };
};

const getTopMatches = (targetCustomer, allProfiles, topN = 10) => {
  const scored = allProfiles
    .filter(p => p._id?.toString() !== targetCustomer._id?.toString()) // exclude self
    .map(candidate => {
      const { score, reason, breakdown, isDealbreaker } = calculateMatchScore(targetCustomer, candidate);
      return { candidate, score, reason, breakdown, isDealbreaker };
    })
    .filter(m => !m.isDealbreaker); // Filter out hard dealbreakers immediately

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
};

module.exports = { calculateMatchScore, getTopMatches };
