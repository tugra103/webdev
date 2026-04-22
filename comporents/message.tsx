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

const Message = ({ chat, user }: MessageProps) => (
    <li className={`chat ${user === chat.username ? "right" : "left"}`}>
        {user !== chat.username
            && <img src={chat.img} alt={`${chat.username}'s profile pic`} />
        }
        {chat.content}
    </li>
);

export default Message;