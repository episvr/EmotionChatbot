import React from "react";
import Chat from "./components/Chat";
import "./index.css";

const App = () => {
  return (
    <div className="container">
      <h1 className="header">智能客服系统</h1>
      <div className="chat-container">
        <Chat />
      </div>
    </div>
  );
};

export default App;