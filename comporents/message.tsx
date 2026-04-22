import React, { ReactElement } from 'react';

interface Chat {
    username: string;
    content: ReactElement;
    img: string;
}

interface MessageProps {
    chat: Chat;
    user: string;
}

const Message = ({ chat, user }: MessageProps) => {
    const isOwn = user === chat.username;

    return (
        <li className={`flex items-end gap-2 my-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {!isOwn && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <img
                        src={chat.img}
                        alt={chat.username}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                    <span className="text-[10px] text-gray-400 font-medium max-w-[56px] truncate">
                        {chat.username}
                    </span>
                </div>
            )}

            <div className={`
                relative max-w-[70%] px-4 py-2.5 shadow-sm text-sm leading-relaxed
                ${isOwn
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                    : "bg-white text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-gray-100"
                }
            `}>
                <p>{chat.content}</p>

                {/* Tail */}
                <span className={`
                    absolute bottom-0 w-2 h-2
                    ${isOwn
                        ? "right-[-6px] border-l-8 border-l-blue-600 border-t-8 border-t-transparent"
                        : "left-[-6px] border-r-8 border-r-white border-t-8 border-t-transparent"
                    }
                `} />
            </div>
        </li>
    );
};

export default Message;