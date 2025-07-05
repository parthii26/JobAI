import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface InterviewQuestionData {
  skill: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  question: string;
  category: "Technical" | "Behavioral" | "Situational";
}

export async function generateInterviewQuestions(skills: string[]): Promise<InterviewQuestionData[]> {
  if (!skills || skills.length === 0) {
    return [];
  }

  try {
    const prompt = `Generate interview questions based on the following skills: ${skills.join(", ")}

Please create a diverse mix of questions covering:
1. Technical questions for programming/technical skills
2. Behavioral questions for soft skills
3. Situational questions that test problem-solving

For each question, provide:
- The specific skill it targets
- Difficulty level (Easy, Intermediate, or Advanced)
- The question text
- Category (Technical, Behavioral, or Situational)

Generate 8-12 questions total, ensuring a good balance across all skills provided.

Respond with JSON in this format:
{
  "questions": [
    {
      "skill": "JavaScript",
      "difficulty": "Intermediate",
      "question": "Explain the difference between let, const, and var in JavaScript",
      "category": "Technical"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach. Generate high-quality, relevant interview questions based on the provided skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];

  } catch (error) {
    console.error("Error generating interview questions:", error);
    
    // Return fallback questions if API fails
    return generateFallbackQuestions(skills);
  }
}

function generateFallbackQuestions(skills: string[]): InterviewQuestionData[] {
  const fallbackQuestions: InterviewQuestionData[] = [
    {
      skill: "Communication",
      difficulty: "Intermediate",
      question: "Describe a time when you had to explain a complex technical concept to a non-technical stakeholder.",
      category: "Behavioral"
    },
    {
      skill: "Problem Solving",
      difficulty: "Intermediate", 
      question: "Walk me through your approach when facing a challenging problem you've never encountered before.",
      category: "Situational"
    },
    {
      skill: "Leadership",
      difficulty: "Advanced",
      question: "Describe a situation where you had to lead a team through a difficult project or deadline.",
      category: "Behavioral"
    }
  ];

  // Add technical questions for programming skills
  const technicalSkills = skills.filter(skill => 
    ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css'].includes(skill.toLowerCase())
  );

  technicalSkills.forEach(skill => {
    fallbackQuestions.push({
      skill,
      difficulty: "Intermediate",
      question: `What are the key concepts and best practices you follow when working with ${skill}?`,
      category: "Technical"
    });
  });

  return fallbackQuestions.slice(0, 8); // Return maximum 8 fallback questions
}
