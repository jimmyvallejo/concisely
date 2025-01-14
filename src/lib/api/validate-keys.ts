export const validateOpenAI = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/gpt-validate", {
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