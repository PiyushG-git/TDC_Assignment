const Customer = require('../models/Customer');
const Match = require('../models/Match');
const { getTopMatches } = require('../services/matchingEngine');
const aiService = require('../services/aiService');

const suggestMatches = async (req, res) => {
  try {
    const { customerId } = req.params;
    const targetCustomer = await Customer.findById(customerId);

    if (!targetCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const oppositeGender = targetCustomer.gender === 'Male' ? 'Female' : 'Male';

    // Find all potential candidates of opposite gender
    const allCandidates = await Customer.find({ gender: oppositeGender });

    // Run local engine — returns { candidate, score, reason, breakdown }
    let topMatches = getTopMatches(
      targetCustomer.toObject(),
      allCandidates.map(c => c.toObject())
    );

    // Try to have Gemini analyze and re-rank the top 10 local matches
    try {
      const aiRankings = await aiService.analyzeMatchBatch(targetCustomer.toObject(), topMatches);
      
      // Merge AI results with local results
      topMatches = topMatches.map(localMatch => {
        const aiData = aiRankings.find(r => r.candidateId === localMatch.candidate._id.toString());
        if (aiData) {
          // Weight: 65% Local Algo, 35% AI (prevents AI variance from wildly skewing stable local scores)
          localMatch.score = Math.round((localMatch.score * 0.65) + (aiData.aiScore * 0.35));
          // Prepend the AI's custom reasoning
          localMatch.reason = `[AI Analysis]: ${aiData.aiReason} | [Local]: ${localMatch.reason}`;
        }
        return localMatch;
      });

      // Re-sort based on the new combined score
      topMatches.sort((a, b) => b.score - a.score);
    } catch (aiErr) {
      console.warn('AI ranking failed, falling back to local engine scores.');
    }

    res.json(topMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMatch = async (req, res) => {
  try {
    const { customerId, matchedCustomerId, score, reason } = req.body;

    const match = await Match.create({
      customerId,
      matchedCustomerId,
      score,
      reason,
      status: 'Sent'
    });

    const profileA = await Customer.findById(customerId);
    const profileB = await Customer.findById(matchedCustomerId);

    // Generate AI email — gracefully fall back if Gemini quota exhausted
    let emailPreview;
    try {
      emailPreview = await aiService.generateMatchIntroduction(
        profileA.toObject(),
        profileB.toObject()
      );
    } catch (aiErr) {
      // Fallback email if AI is unavailable
      emailPreview = `Dear ${profileA.firstName},\n\nWe are delighted to introduce you to ${profileB.firstName} ${profileB.lastName}, a ${profileB.age}-year-old ${profileB.designation} based in ${profileB.city}.\n\nBased on our careful analysis, we believe you two share strong compatibility across values, lifestyle, and life goals. ${profileA.firstName} and ${profileB.firstName} both exhibit qualities that complement each other beautifully.\n\nWe would love for you to review their profile and let us know your thoughts. Our team at The Date Crew is here to support every step of your journey.\n\nWith warm regards,\nThe Date Crew Matchmaking Team`;
    }

    // Update status tags for both profiles
    await Customer.findByIdAndUpdate(customerId, { statusTag: 'Match Sent' });
    await Customer.findByIdAndUpdate(matchedCustomerId, { statusTag: 'Match Sent' });

    res.status(201).json({ match, emailPreview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAiCompatibility = async (req, res) => {
  try {
    const { customerId, matchedCustomerId } = req.body;

    const profileA = await Customer.findById(customerId);
    const profileB = await Customer.findById(matchedCustomerId);

    if (!profileA || !profileB) {
      return res.status(404).json({ message: 'One or both profiles not found' });
    }

    let analysis;
    try {
      analysis = await aiService.analyzeCompatibility(
        profileA.toObject(),
        profileB.toObject()
      );
    } catch (aiErr) {
      // Fallback: generate a rule-based compatibility analysis
      const { calculateMatchScore } = require('../services/matchingEngine');
      const { score, breakdown } = calculateMatchScore(profileA.toObject(), profileB.toObject());

      // Build strengths/concerns from breakdown
      const strengths = [];
      const concerns = [];
      for (const [dim, { score: s, max }] of Object.entries(breakdown || {})) {
        const pct = Math.round((s / max) * 100);
        if (pct >= 75) strengths.push(`Strong ${dim} compatibility (${pct}%)`);
        else if (pct < 40) concerns.push(`${dim} alignment needs discussion (${pct}%)`);
      }

      analysis = {
        compatibility_score: score,
        strengths: strengths.length ? strengths : [`Both profiles align well on key dimensions`],
        concerns: concerns.length ? concerns : [`Minor lifestyle differences worth discussing`],
        recommendation: `Based on algorithmic analysis, ${profileA.firstName} and ${profileB.firstName} show ${score >= 70 ? 'strong' : score >= 50 ? 'good' : 'moderate'} overall compatibility.`,
        summary: `Algorithm-based analysis (AI service temporarily unavailable)`
      };
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { suggestMatches, sendMatch, getAiCompatibility };
