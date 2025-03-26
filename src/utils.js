export const getPromptBasedOnExpression = (expression) => {
  const prompts = {
    happy: "用户正在微笑，看起来很开心。请用热情和积极的语气回应。",
    sad: "用户看起来有些难过。请使用温暖和富有同情心的语言进行回应。",
    angry: "用户似乎有些生气或沮丧。请保持冷静，认可他们的感受，并提供建设性的建议。",
    surprised: "用户看上去很惊讶。请用友好的方式与他们交流，并表达你的好奇。",
    neutral: "用户的表情较为中性。请保持专业和友善的语气，提供清晰、直接的沟通。",
  };
  return `${prompts[expression] || "请保持友好和有帮助的语气，与用户进行有意义的交流。"}`;
};
