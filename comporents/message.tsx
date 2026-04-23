import React from "react";
import MarkdownRenderer from "@/comporents/markdown";

interface Chat {
  role: "user" | "assistant" | "system";
  content: string;
}

interface MessageProps {
  chat: Chat;
  user: string;
}

const Message = ({ chat, user }: MessageProps) => {
  const isOwn = chat.role === "user";

  if (chat.role === "system") return null;

  return (
    <li className={`flex items-end gap-2 my-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <span className="text-[10px] text-gray-400">
          {chat.role}
        </span>
      )}

      <div
        className={`
          relative max-w-[70%] px-4 py-2.5 text-sm leading-relaxed
          ${
            isOwn
              ? "bg-blue-500 text-white rounded-xl"
              : "bg-white text-gray-800 border rounded-xl"
          }
        `}
      >
        {chat.role === "assistant" ? (
          <MarkdownRenderer content={chat.content} />
        ) : (
          <p>{chat.content}</p>
        )}
      </div>
    </li>
  );
};

export default Message;