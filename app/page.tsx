"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

interface Message {
  message: string;
  author: string;
  date: string;
}

export default function Home() {
  const socket = useMemo(() => io(process.env.NEXT_PUBLIC_API_URL), []);

  const [messages, setMessages] = useState([] as Message[]);
  const [author, setAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      socket.on("message", (data: Message) => {
        setMessages((oldState) => [...oldState, data]);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: newMessage,
        author,
        date: new Date().toISOString(),
      }),
    })
      .catch(() => alert("Erro ao enviar a mensagem"))
      .finally(() => setNewMessage(""));
  }

  return (
    <main className="w-screen h-screen bg-black text-white">
      <div className="h-[5%]">
        <input
          className="w-full text-center"
          placeholder="Autor"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <hr className="opacity-50" />
      </div>

      <div className="h-[90%] overflow-y-auto flex flex-col px-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-xl w-fit p-4 mt-2 ${author === message.author ? "self-end bg-green-900/50" : "self-start bg-gray-900"}`}
          >
            {author !== message.author && (
              <p className="font-bold text-sm text-green-900">
                {message.author}
              </p>
            )}
            <p>{message.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(message.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>

      <div className="h-[5%]">
        <hr className="opacity-50" />
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="w-full"
            placeholder="Digite sua mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="border border-white/50 px-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={!newMessage || !author}
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
