const Customer = require('../models/Customer');
const Note = require('../models/Note');
const aiService = require('../services/aiService');

const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', gender, statusTag } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (gender) query.gender = gender;
    if (statusTag) query.statusTag = statusTag;

    // Filter by matchmaker if we want strict visibility, but for MVP let's allow seeing all or filter
    // query.assignedMatchmaker = req.user._id;

    const customers = await Customer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalCustomers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generates a rich profile summary locally without AI — used as fallback
 * when Gemini API quota is exhausted or unavailable.
 */
const generateLocalSummary = (c) => {
  const income = c.income ? `₹${(c.income / 100000).toFixed(0)} LPA` : null;
  const edu = c.degree && c.college ? `${c.degree} from ${c.college}` : (c.degree || null);
  const kids = c.wantKids ? `${c.wantKids === 'Yes' ? 'wants' : c.wantKids === 'No' ? 'does not want' : 'is open about having'} children` : null;
  const relocate = c.relocate === 'Yes' ? 'open to relocation' : c.relocate === 'No' ? 'prefers to stay in ' + c.city : null;
  const hobbies = c.hobbies?.length ? c.hobbies.slice(0, 2).join(' and ') : null;

  const parts = [
    `${c.firstName} is a ${c.age}-year-old ${c.gender === 'Male' ? 'professional' : 'professional'} based in ${c.city}`,
    c.designation && c.company ? `working as ${c.designation} at ${c.company}` : null,
    income ? `with an annual income of ${income}` : null,
    edu ? `holding a ${edu}` : null,
    c.religion ? `of ${c.religion} faith` : null,
    kids,
    relocate,
    hobbies ? `with interests in ${hobbies}` : null,
  ].filter(Boolean);

  return parts.join(', ') + '.';
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedMatchmaker', 'username');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // If AI summary is missing, try generating — but NEVER block the response on it
    if (!customer.aiSummary || customer.aiSummary === 'Pending AI Analysis.') {
      // Generate local fallback immediately so the response is never empty
      const localSummary = generateLocalSummary(customer.toObject());

      // Try Gemini in the background — fire and forget, do not await
      setImmediate(async () => {
        try {
          const aiSummary = await aiService.generateProfileSummary(customer.toObject());
          // Only save if it looks like a real AI response (not the fallback error string)
          if (aiSummary && !aiSummary.includes('failed') && aiSummary.length > 20) {
            await Customer.findByIdAndUpdate(req.params.id, { aiSummary });
          }
        } catch (bgErr) {
          // Silently ignore — background AI call failing is expected on free tier
        }
      });

      // Immediately respond with local fallback
      customer.aiSummary = localSummary;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerNotes = async (req, res) => {
  try {
    const notes = await Note.find({ customerId: req.params.id })
      .populate('matchmakerId', 'username')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCustomerNote = async (req, res) => {
  try {
    const note = await Note.create({
      customerId: req.params.id,
      matchmakerId: req.user._id,
      content: req.body.content
    });
    const populatedNote = await Note.findById(note._id).populate('matchmakerId', 'username');
    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeMatches = await require('../models/Match').countDocuments({ status: { $in: ['Suggested', 'Sent'] } });
    
    // Aggregate status distribution
    const statusDistribution = await Customer.aggregate([
      { $group: { _id: '$statusTag', count: { $sum: 1 } } }
    ]);

    // Aggregate gender distribution
    const genderDistribution = await Customer.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCustomers,
      activeMatches,
      statusDistribution,
      genderDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomers, getCustomerById, getCustomerNotes, addCustomerNote, getDashboardStats };
