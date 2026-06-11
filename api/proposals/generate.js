// POST /api/proposals/generate
const { getUser, insert } = require('../_lib/supabase.js')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const FRAMEWORKS = {
  'problem-solution': {
    name: 'Problem → Solution',
    systemPrompt: `You are a proposal writing expert. Write a proposal using the PROBLEM → SOLUTION framework.

STRUCTURE:
1. Hook: Start with a strong statement about the client's pain point
2. Empathy: Show you understand their specific challenge
3. Credibility: Briefly establish why you can solve it
4. Solution: Present your specific approach
5. Outcome: Paint a picture of the result
6. Call to Action: Clear next step

TONE: Confident, consultative, solution-oriented. Show you've done your homework.`
  },
  'storytelling': {
    name: 'Storytelling',
    systemPrompt: `You are a proposal writing expert. Write a proposal using the STORYTELLING framework.

STRUCTURE:
1. Hook: Open with a relatable story or scenario
2. The Struggle: Describe a past challenge (yours or a similar client's)
3. The Turning Point: How you found the solution
4. The Result: The transformation that happened
5. Their Story: Connect it to the client's current situation
6. Call to Action: Invite them to be the next success story

TONE: Narrative, engaging, human. Make the client see themselves in the story.`
  },
  'before-after': {
    name: 'Before → After Bridge',
    systemPrompt: `You are a proposal writing expert. Write a proposal using the BEFORE → AFTER BRIDGE framework.

STRUCTURE:
1. The "Before": Describe the client's current painful reality
2. The "After": Paint a vivid picture of what success looks like
3. The "Bridge": Explain YOUR specific process that gets them from Before to After
4. Proof: Include relevant results or case studies
5. Risk Reversal: Address objections upfront
6. Call to Action: Clear next step

TONE: Transformational, visionary, results-focused. Contrast is your weapon.`
  },
  'sandler': {
    name: 'Sandler (Reverse Selling)',
    systemPrompt: `You are a proposal writing expert. Write a proposal using the SANDLER (REVERSE SELLING) framework.

STRUCTURE:
1. Connect: Build rapport by acknowledging their expertise
2. Upset: Gently challenge their current approach or assumptions
3. Re-evaluate: Help them see what they're missing
4. Emotional Impact: Connect to the real cost of not solving this
5. Financial Impact: Connect to the business cost
6. Solution: Present your approach as the logical next step

TONE: Consultative, challenging but respectful. Let the client convince themselves.`
  },
  'consultative': {
    name: 'Consultative Selling',
    systemPrompt: `You are a proposal writing expert. Write a proposal using the CONSULTATIVE SELLING framework.

STRUCTURE:
1. Diagnosis: Show deep understanding of their specific situation
2. Implications: Explore what happens if nothing changes
3. Needs: Define what a real solution looks like
4. Solution: Map your approach to their specific needs
5. ROI: Quantify the value you'll deliver
6. Commitment: Clear next step with low friction

TONE: Advisor-like, strategic, insight-driven. You're a partner, not a vendor.`
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing authorization' })

  const { status: authStatus } = await getUser(token)
  if (authStatus >= 400) return res.status(401).json({ error: 'Unauthorized' })

  const { jobDescription, framework } = req.body
  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({ error: 'Job description is too short' })
  }
  if (!FRAMEWORKS[framework]) {
    return res.status(400).json({ error: `Invalid framework. Choose: ${Object.keys(FRAMEWORKS).join(', ')}` })
  }

  const fw = FRAMEWORKS[framework]

  try {
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://propello-omega.vercel.app',
        'X-Title': 'Propello'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: fw.systemPrompt },
          { role: 'user', content: `Write a freelance proposal for this job description using the "${fw.name}" framework. Make it compelling, specific, and professional.

JOB DESCRIPTION:
${jobDescription}

Write the full proposal with clear section headings matching the ${fw.name} structure.` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!aiRes.ok) {
      const err = await aiRes.text()
      console.error('OpenRouter error:', err)
      return res.status(502).json({ error: 'AI generation failed. Please try again.' })
    }

    const data = await aiRes.json()
    const proposal = data.choices[0].message.content

    return res.status(200).json({
      framework: framework,
      frameworkName: fw.name,
      proposal: proposal
    })
  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'AI generation failed' })
  }
}