import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";
import { Bubble, Sender } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { App, Flex } from "antd";
import "../index.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expression, setExpression] = useState(null);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

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
    setLoading(true);

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const expressionPrompt = getPromptBasedOnExpression(expression);
    const fullPrompt = `${expressionPrompt}\nUser: ${input}\nAssistant:`;

    try {
      const response = await axios.post(
        "https://api.chatanywhere.tech/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: fullPrompt }, { role: "user", content: input }],
        },
        {
          headers: {
            Authorization: `API_KEY`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = { sender: "bot", text: response.data.choices[0].message.content };
      setMessages((prev) => [...prev, botMessage]);
      message.success("AI replied successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message");
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <Flex vertical style={{ padding: "20px", gap: "16px" }}>
      <Camera onExpressionChange={setExpression} />
      <div className="messages" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((msg, index) =>
          msg.sender === "user" ? (
            <div key={index} style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <Bubble
                content={msg.text}
                position="right"
                avatar={{ icon: <UserOutlined /> }}
                header="You"
              />
            </div>
          ) : (
            <div key={index} style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
              <Bubble
                content={msg.text}
                position="left"
                avatar={{ icon: <RobotOutlined /> }}
                header="AI Bot"
              />
            </div>
          )
        )}
      </div>

      {/* 使用 Ant Design X 的 Sender */}
      <Sender
        loading={loading}
        value={input}
        onChange={(v) => setInput(v)}
        onSubmit={() => sendMessage()}
        onCancel={() => {
          setInput("");
          message.info("Cancelled input");
        }}
      />
    </Flex>
  );
};

export default () => (
  <App>
    <Chat />
  </App>
);
