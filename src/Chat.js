import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";
import "./index.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expression, setExpression] = useState(null);

  const getPromptBasedOnExpression = (expression) => {
    const prompts = {
      happy: "The user seems happy! Engage in a cheerful conversation.",
      sad: "The user seems sad. Provide comforting and supportive responses.",
      angry: "The user looks angry. Remain calm and offer helpful solutions.",
      surprised: "The user is surprised! Ask him Why.",
      neutral: "Maintain a neutral and friendly conversation.",
    };
    return prompts[expression] || "Maintain a normal conversation.";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const expressionPrompt = getPromptBasedOnExpression(expression);
    const fullPrompt = `${expressionPrompt}\nUser: ${input}\nAssistant:`;

    try {
      const response = await axios.post("https://api.chatanywhere.tech/v1/chat/completions", {
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: fullPrompt }, { role: "user", content: input }],
      }, {
        headers: {
          Authorization: `API_KEY`,
          "Content-Type": "application/json",
        },
      });

      const botMessage = { sender: "bot", text: response.data.choices[0].message.content };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <Camera onExpressionChange={setExpression} />
      <div>
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index} className={msg.sender === "user" ? "message-user" : "message-bot"}>
              {msg.sender}: {msg.text}
            </p>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
