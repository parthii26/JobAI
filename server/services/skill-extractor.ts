import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface SkillsData {
  technicalSkills: string[];
  softSkills: string[];
}

export async function extractSkills(resumeText: string): Promise<SkillsData> {
  try {
    const prompt = `Analyze the following resume text and extract skills. Categorize them into technical skills and soft skills.

Technical skills include: programming languages, frameworks, tools, databases, methodologies, certifications, etc.
Soft skills include: communication, leadership, teamwork, problem-solving, time management, etc.

Resume text:
${resumeText}

Please respond with JSON in this format:
{
  "technicalSkills": ["JavaScript", "React", "Node.js", "SQL"],
  "softSkills": ["Leadership", "Communication", "Problem Solving"]
}

Only include skills that are clearly mentioned or can be reasonably inferred from the text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst specialized in resume analysis and skill extraction. Extract only relevant, legitimate skills from the provided resume text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      technicalSkills: Array.isArray(result.technicalSkills) ? result.technicalSkills : [],
      softSkills: Array.isArray(result.softSkills) ? result.softSkills : []
    };

  } catch (error) {
    console.error("Error extracting skills:", error);
    
    // Fallback to keyword-based extraction if AI fails
    return extractSkillsByKeywords(resumeText);
  }
}

function extractSkillsByKeywords(resumeText: string): SkillsData {
  const text = resumeText.toLowerCase();
  
  const technicalKeywords = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'typescript', 'sass', 'less', 'bootstrap', 'tailwind',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
    'machine learning', 'data science', 'artificial intelligence', 'tensorflow', 'pytorch',
    'api', 'rest', 'graphql', 'microservices', 'devops', 'ci/cd', 'agile', 'scrum'
  ];

  const softSkillKeywords = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'creativity', 'adaptability', 'time management', 'project management',
    'critical thinking', 'collaboration', 'interpersonal', 'presentation',
    'negotiation', 'conflict resolution', 'mentoring', 'coaching'
  ];

  const foundTechnicalSkills = technicalKeywords.filter(skill => 
    text.includes(skill.toLowerCase())
  );

  const foundSoftSkills = softSkillKeywords.filter(skill => 
    text.includes(skill.toLowerCase())
  );

  return {
    technicalSkills: foundTechnicalSkills.map(skill => 
      skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    softSkills: foundSoftSkills.map(skill => 
      skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    )
  };
}
