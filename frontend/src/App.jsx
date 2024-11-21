import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        // Fetch chat history from backend
        axios.get('http://localhost:5000/messages')
            .then((res) => setMessages(res.data))
            .catch((err) => console.error(err));

        // Listen for new messages
        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const joinChat = () => {
        if (username.trim()) {
            socket.emit('join', username);
            setIsJoined(true);
        }
    };

    const sendMessage = () => {
        if (input.trim() && isJoined) {
            const message = { username, message: input };
            socket.emit('chatMessage', message);
            setInput('');
        }
    };

    const groupMessagesBySender = () => {
        const groupedMessages = [];
        let lastSender = '';

        messages.forEach((msg) => {
            if (msg.username !== lastSender) {
                // New sender, add their name and message
                groupedMessages.push({ username: msg.username, messages: [msg] });
            } else {
                // Same sender, just add the message
                groupedMessages[groupedMessages.length - 1].messages.push(msg);
            }
            lastSender = msg.username;
        });

        return groupedMessages;
    };

    return (
        <div className="flex flex-col items-center bg-green-50 min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4 text-green-800">Chat App</h1>

            {!isJoined ? (
                <div className="flex flex-col items-center">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-green-400 rounded-md p-2 mb-4"
                    />
                    <button
                        onClick={joinChat}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Join Chat
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md">
                    {/* Display the username at the top of the chat */}
                    <div className="bg-green-600 text-white p-2 rounded-md mb-4">
                        <strong>{username} entered the Chat</strong>
                    </div>

                    <div className="bg-gray-100 rounded-sm shadow-md p-4 h-80 overflow-y-auto mb-4 border border-zinc-700 ">
                        {groupMessagesBySender().map((group, index) => (
                            <div key={index}>
                                {/* Displaying the sender's name once per group */}
                                <div className={`text-sm font-semibold text-gray-700 ${group.username === username ? 'text-right' : 'text-left'}`}>
                                    {group.username}
                                </div>
                                {group.messages.map((msg, msgIndex) => (
                                    <div
                                        key={msgIndex}
                                        className={`mb-2 flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`p-2 rounded-md max-w-xs ${msg.username === username ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="border border-green-400 rounded-md p-2 flex-1"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
