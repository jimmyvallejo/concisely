import { BASE_URL } from "../constants/constants";

export const validateOpenAIKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/gpt-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });
      return response.status === 200;
    } catch (error) {
      console.error("Error validating OpenAI key:", error);
      return false;
    }
  };


  export const validateAnthropicKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/anthropic-validate`, {
        method: "POST",
        headers : {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({apiKey: key}),
      })
      return response.status === 200
    } catch (error) {
      console.error("Error validating Anthropic key:", error);
      return false;
    }
  }

  export const validateDeepseekKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/deepseek-validate`, {
        method: "POST",
        headers : {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({apiKey: key}),
      })
      return response.status === 200
    } catch (error) {
      console.error("Error validating Anthropic key:", error);
      return false;
    }
  }

  export const validateGeminiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/gemini-validate`, {
        method: "POST",
        headers : {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({apiKey: key}),
      })
      return response.status === 200
    } catch (error) {
      console.error("Error validating Anthropic key:", error);
      return false;
    }
  }