export const getPromptBasedOnExpression = (expression) => {
    const prompts = {
      happy: "The user seems happy! Engage in a cheerful conversation.",
      sad: "The user seems sad. Provide comforting and supportive responses.",
      angry: "The user looks angry. Remain calm and offer helpful solutions.",
      surprised: "The user is surprised! Ask them why.",
      neutral: "Maintain a neutral and friendly conversation.",
    };
    return prompts[expression] || "Maintain a normal conversation.";
  };