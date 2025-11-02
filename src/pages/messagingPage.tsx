/**
 * src/pages/messagingPage.tsx
 * Page component for displaying conversations and the active chat window.
 */
import { useEffect, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useTitle } from '../utils/hooks';
import ConversationList from '../components/messaging/conversationsList';
import ChatWindow from '../components/messaging/chatWindow';
import { setActiveConversation } from '../slices/messaging/messageSlice';
import { DEVELOPER_MODE } from '../appConfig';
import '../styles/messagingPage.css';

const MessagingPage = (): JSX.Element => {
    const dispatch = useAppDispatch();

    // Get conversationId from URL parameters, if present
    const { conversationId } = useParams<{ conversationId?: string }>();
    const { activeConversationId } = useAppSelector((state) => state.messages);


    useTitle("Messages - WolexChange"); // Set page title

    // EFFECT 1: Sets the active conversation based on the URL parameter
    useEffect(() => {
        const newActiveId = conversationId || null;
        if (newActiveId !== activeConversationId) {
            DEVELOPER_MODE && console.log("Setting active conversation from URL:", newActiveId);
            dispatch(setActiveConversation(newActiveId));

        }

    }, [conversationId, activeConversationId, dispatch]);

    const layoutClass = activeConversationId ? 'messaging-page-layout chat-active' : 'messaging-page-layout';
    return (
        <div className={layoutClass}>
            <div className="messaging-sidebar">
                <ConversationList />
            </div>
            <div className="messaging-main-content">
                <ChatWindow />
            </div>
        </div>
    );
};

export default MessagingPage;