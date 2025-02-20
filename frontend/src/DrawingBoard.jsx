import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to backend

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // Listen for drawing data from server
    socket.on("draw", ({ x, y, lastX, lastY }) => {
      drawOnCanvas(x, y, lastX, lastY);
    });

    // Listen for clear command from server
    socket.on("clear", () => {
      clearCanvas(false); // Don't emit clear event again
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  const drawOnCanvas = (x, y, lastX, lastY) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(lastX, lastY);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const handleMouseDown = () => {
    setDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lastX = ctxRef.current.lastX || x;
    const lastY = ctxRef.current.lastY || y;

    drawOnCanvas(x, y, lastX, lastY);

    // Send drawing data to server
    socket.emit("draw", { x, y, lastX, lastY });

    ctxRef.current.lastX = x;
    ctxRef.current.lastY = y;
  };

  const handleMouseUp = () => {
    setDrawing(false);
    ctxRef.current.lastX = null;
    ctxRef.current.lastY = null;
  };

  const clearCanvas = (emitEvent = true) => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (emitEvent) {
      socket.emit("clear"); // Send clear event to all clients
    }
  };

  return (
    <div>
      <h2>Multiplayer Drawing Board</h2>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: "1px solid black", cursor: "crosshair" }}
      />
      <br />
      <button onClick={() => clearCanvas()} style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
        Clear Canvas
      </button>
    </div>
  );
};

export default DrawingBoard;
