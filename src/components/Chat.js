import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";
import Welcom from "./Welcome";
import { Bubble, Sender } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { message } from "antd";
import { getPromptBasedOnExpression } from "../utils";
import "./Chat.css";

const projectInfo = `
你是一个智能客服 AI，专为一个基于面部表情识别的智能客服系统提供支持。
该系统可以通过摄像头分析用户的表情，并根据用户的情绪调整客服回复内容。
核心功能包括：
1. **面部表情识别**：实时检测用户情绪，如高兴、悲伤、愤怒等。
2. **个性化聊天**：根据用户表情调整客服的语气和内容，使沟通更自然。
3. **智能问答**：提供基于知识库和 AI 生成的精准回答，提升用户体验。
4. **多模态交互**：结合文本输入和表情反馈，让客服更具人性化。

如果用户询问“请介绍一下这个项目”，请使用基于上述信息，用自然的语言回答。

以下是对你额外的一些要求：
- 不要出现机械性的回答，尽量使用自然的语言和用户进行交流。
- 尽量保持回答的简洁性，不要过于冗长。
`;


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
    const fullPrompt = `${expressionPrompt}\nAssistant:`;

    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            { role: "system", content: projectInfo },  // 预输入项目信息
            { role: "system", content: fullPrompt },
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
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
          placeholder="说点什么吧~"
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
