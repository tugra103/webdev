"use client";

import { useState, useEffect, useRef } from "react";
import Message from "./Message";

const INITIAL_CHATS = [
  { username: "Kevin Hsu",   content: <p>Hello World!</p>,                                                                          img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "Alice Chen",  content: <p>Love it! ❤️</p>,                                                                           img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "Kevin Hsu",   content: <p>Check out my Github at https://github.com/WigoHunter</p>,                                  img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "KevHs",       content: <p>Lorem ipsum dolor sit amet, nibh ipsum. Cum class sem inceptos incidunt sed sed...</p>,    img: "http://i.imgur.com/ARbQZix.jpg" },
  { username: "Kevin Hsu",   content: <p>So</p>,                                                                                    img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "Kevin Hsu",   content: <p>Chilltime is going to be an app for you to view videos with friends</p>,                   img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "Kevin Hsu",   content: <p>You can sign-up now to try out our private beta!</p>,                                      img: "http://i.imgur.com/Tj5DGiO.jpg" },
  { username: "Alice Chen",  content: <p>Definitely! Sounds great!</p>,                                                             img: "http://i.imgur.com/Tj5DGiO.jpg" },
];

const USERNAME = "Kevin Hsu";

export default function Chatroom() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const chatsRef = useRef(null);
  const msgRef = useRef(null);

  const scrollToBot = () => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBot();
  }, [chats]); // Runs on mount and whenever chats updates

  const submitMessage = (e) => {
    e.preventDefault();
    if (!msgRef.current?.value.trim()) return;

    setChats((prev) => [
      ...prev,
      {
        username: USERNAME,
        content: <p>{msgRef.current.value}</p>,
        img: "http://i.imgur.com/Tj5DGiO.jpg",
      },
    ]);

    msgRef.current.value = "";
  };

  return (
    <div className="chatroom">
      <h3>Chilltime</h3>
      <ul className="chats" ref={chatsRef}>
        {chats.map((chat, index) => (
          <Message key={index} chat={chat} user={USERNAME} />
        ))}
      </ul>
      <form className="input" onSubmit={submitMessage}>
        <input type="text" ref={msgRef} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}