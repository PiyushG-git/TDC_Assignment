const { GoogleGenAI } = require('@google/genai');

const aiService = {
  getGenAI() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  },

  async generateProfileSummary(profileData) {
    try {
      const ai = this.getGenAI();
      const prompt = `You are an expert matchmaker. Generate a concise 1-sentence summary of this profile that highlights their key attributes (age, profession, location, family values, and interests). Profile Data: ${JSON.stringify(profileData)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('AI Summary Error:', error);
      return 'Summary generation failed due to AI service error.';
    }
  },

  async analyzeMatchBatch(targetProfile, candidates) {
    try {
      const ai = this.getGenAI();
      
      // We pass stripped down profiles to save tokens
      const strip = (p) => ({
        id: p._id,
        firstName: p.firstName,
        age: p.age,
        height: p.height,
        city: p.city,
        designation: p.designation,
        income: p.income,
        religion: p.religion,
        wantKids: p.wantKids,
        relocate: p.relocate,
        hobbies: p.hobbies
      });

      const prompt = `You are a professional matchmaker. 
Target Profile: ${JSON.stringify(strip(targetProfile))}

Potential Matches:
${candidates.map((c, i) => `Match ${i} (${c.candidate._id}): ${JSON.stringify(strip(c.candidate))}`).join('\n\n')}

Analyze how well each Potential Match aligns with the Target Profile. 
Provide a unique AI reasoning for each match focusing on why they are compatible.
Return ONLY a JSON array of objects with exactly these keys:
[
  {
    "candidateId": "string (the exact ID of the candidate)",
    "aiScore": <number 0-100>,
    "aiReason": "string (1 sentence explaining compatibility)"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let textResponse = response.text;
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(textResponse);
    } catch (error) {
      console.error('AI Batch Match Error:', error);
      throw new Error('Failed to analyze match batch with AI.');
    }
  },

  async analyzeCompatibility(profileA, profileB) {
    try {
      const ai = this.getGenAI();
      const prompt = `You are a professional matchmaker for Indian matrimonials. 
Compare Profile A and Profile B.
Profile A: ${JSON.stringify(profileA)}
Profile B: ${JSON.stringify(profileB)}

Return a JSON object ONLY, with exactly these keys:
{
  "compatibility_score": <number between 0-100>,
  "strengths": ["string", "string"],
  "concerns": ["string", "string"],
  "recommendation": "string",
  "summary": "string"
}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let textResponse = response.text;
      // Clean up markdown block if present
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(textResponse);
    } catch (error) {
      console.error('AI Compatibility Error:', error);
      throw new Error('Failed to analyze compatibility.');
    }
  },

  async generateMatchIntroduction(profileA, profileB) {
    try {
      const ai = this.getGenAI();
      const prompt = `You are an executive matchmaker writing an email intro.
Write a warm, professional, and personalized introduction paragraph (max 4 sentences) highlighting why Profile A and Profile B would be a great match.
Profile A: ${profileA.firstName}, ${profileA.age}, ${profileA.designation} in ${profileA.city}
Profile B: ${profileB.firstName}, ${profileB.age}, ${profileB.designation} in ${profileB.city}
Focus on shared values or complementary traits based on common matchmaking sense.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('AI Intro Error:', error);
      return 'I am thrilled to introduce you two! You both have wonderful profiles and share great alignment in your life goals.';
    }
  }
};

module.exports = aiService;
