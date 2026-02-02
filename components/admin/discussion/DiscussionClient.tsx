"use client";

import { useState } from "react";
import { SessionUser } from "@/lib/auth";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import ConversationDetail from "./ConversationDetail";

type Props = {
    currentUser: SessionUser | null;
};

export default function DiscussionClient({ currentUser }: Props) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const currentUserId = currentUser?.id || "";

    return (
        <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-[#111] dark:border-[#333]">
            {/* Column 1: List */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col dark:border-[#333] ${selectedConversationId ? "hidden md:flex" : "flex"}`}>
                <ConversationList
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                />
            </div>

            {/* Column 2: Thread */}
            <div className={`flex-1 border-r border-gray-100 flex flex-col min-w-0 dark:border-[#333] ${!selectedConversationId ? "hidden md:flex" : "flex"}`}>
                {selectedConversationId ? (
                    <MessageThread
                        conversationId={selectedConversationId}
                        currentUserId={currentUserId}
                        onBack={() => setSelectedConversationId(null)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p>Sélectionnez une conversation</p>
                    </div>
                )}
            </div>

            {/* Column 3: Details */}
            {selectedConversationId && (
                <div className="hidden md:flex w-72 bg-gray-50/50 flex flex-col dark:bg-[#161616]">
                    <ConversationDetail
                        conversationId={selectedConversationId}
                        currentUser={currentUser}
                    />
                </div>
            )}
        </div>
    );
}
