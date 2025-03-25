import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";
import Welcom from "./Welcome";
import { Bubble, Sender } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { message } from "antd";
import { getPromptBasedOnExpression } from "../utils";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expression, setExpression] = useState(null);
  const [loading, setLoading] = useState(false);

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
          messages: [
            { role: "system", content: fullPrompt },
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: process.env.REACT_APP_API_KEY,
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
    <div className="chat-wrapper">
      <div className="camera-container">
        <Camera onExpressionChange={setExpression} />
      </div>
      <div className="chat-section">
        <div className="messages">
          {messages.length === 0 && <Welcom />}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
            >
              <Bubble
                content={msg.text}
                position={msg.sender === "user" ? "right" : "left"}
                avatar={{ icon: msg.sender === "user" ? <UserOutlined /> : <RobotOutlined /> }}
                header={msg.sender === "user" ? "You" : "AI Bot"}
                type={msg.sender === "user" ? "primary" : "normal"}
              />
            </div>
          ))}
        </div>
        <Sender
          placeholder="输入你的消息..."
          loading={loading}
          value={input}
          onChange={(v) => setInput(v)}
          onSubmit={sendMessage}
          onCancel={() => {
            setInput("");
            message.info("Cancelled input");
          }}
        />
      </div>
    </div>
  );
};

export default Chat;
