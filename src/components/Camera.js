import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const Camera = ({ onExpressionChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [expression, setExpression] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      console.log("Loading models...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      console.log("Models loaded");
    };

    const startVideo = async () => {
      console.log("Starting video...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Video stream started");
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    loadModels().then(startVideo);
  }, []);

  useEffect(() => {
    const detectExpressions = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, detections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
        faceapi.draw.drawFaceExpressions(canvasRef.current, detections);
      }

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) => (expressions[a] > expressions[b] ? a : b));
        setExpression(maxExpression);
        onExpressionChange?.(maxExpression);
      }

      requestAnimationFrame(detectExpressions);
    };

    videoRef.current?.addEventListener("play", detectExpressions);
  }, [onExpressionChange]);

  return (
    <div style={{ position: "relative" }}>
      <video ref={videoRef} autoPlay muted width="640" height="480" style={{  borderRadius: 16 }}/>
      <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", top: 0, left: 0 }} />
      {expression && <p style={{ position: "absolute", top: "10px", left: "10px", color: "white", backgroundColor: "black", padding: "5px" }}>当前表情: {expression}</p>}
    </div>
  );
};

export default Camera;
