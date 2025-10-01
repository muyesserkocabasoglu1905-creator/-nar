
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const reviewCode = async (code: string, language: string): Promise<string> => {
  if (!code.trim()) {
    throw new Error("Cannot review empty code.");
  }
  // FIX: Removed redundant API_KEY check. Per guidelines, we assume the API key is configured in the environment,
  // and the GoogleGenAI client is initialized at the module level.

  const prompt = `
    You are an expert software engineer and world-class code reviewer.
    Your task is to provide a thorough and constructive review of the following code snippet written in ${language}.

    Analyze the code for the following aspects:
    1.  **Bugs and Errors:** Identify any potential bugs, logic errors, or edge cases that are not handled.
    2.  **Performance:** Suggest optimizations for performance, memory usage, or efficiency.
    3.  **Best Practices & Readability:** Check for adherence to common best practices, conventions, and code style for ${language}. Suggest improvements for clarity, naming, and structure.
    4.  **Security:** Point out any potential security vulnerabilities.
    5.  **Maintainability:** Comment on the code's long-term maintainability and suggest ways to make it more modular or easier to understand.

    Provide your feedback in a clear, concise, and actionable manner. Use Markdown formatting. Start with a high-level summary, then provide a list of specific suggestions. Use code blocks for examples where applicable.
    
    Here is the code:
    \`\`\`${language.toLowerCase()}
    ${code}
    \`\`\`
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    // FIX: Improved error handling. Instead of returning an error message as a string,
    // re-throw the error to be caught by the calling component.
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while reviewing the code: ${error.message}`);
    }
    throw new Error("An unknown error occurred while reviewing the code.");
  }
};
