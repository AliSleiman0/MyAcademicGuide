// Messager.tsx
// ---------------------------
// 1. IMPORTS & DEPENDENCIES
// ---------------------------
import whatsappImg from 'assets/wtsp3.jpg';
// React Core
import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useNavigate } from 'react-router-dom';

// Third-party Components
import { ChatList, IChatListProps, MessageBox, SystemMessage } from "react-chat-elements";
import { Avatar, Button, Col, List, Row, Space, Tag } from "antd";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

// Firebase & Types
import {
    subscribeToMessages, updateMessageStatus, sendMessage,
    Message, RoomWithLastMsg, subscribeToUserRooms, resetUnreadCount
} from "../../../firebase/firebase";

// Context & Hooks
import { useUser } from "../../../Context/UserContext";
import { useResponsive } from "../../../hooks/useResponsive";

// API & Utilities
import { getUserProfile } from "../../../apiMAG/user";
import "./Messager.styles.css"
import ChatComposer from "./Input";
import { ArrowLeftOutlined, ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';

import { Typography } from 'antd';
import Spin from 'antd/es/spin';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/common/PageTitle/PageTitle';



// ---------------------------
// 2. TYPE DEFINITIONS
// ---------------------------
interface ChatInterfaceProps {
    receiverId: string;
    onSelectRoom: (receiverId: string) => void;
}

interface ChatMessage {
    id: string;
    text: string;
    position: 'left' | 'right';
    type: 'text' | 'file';
    date: Date;
    title?: string;
    status: 'waiting' | 'sent' | 'received' | 'read';
    notch: boolean;
    retracted: boolean;
    removeButton: boolean;
    replyButton: boolean;
    forwarded: boolean;
    titleColor: string;
    senderId: string;
    statusColorType: string;
    data?: {
        uri: string;
        status: { click: boolean; loading: number };
        name?: string;
    };
}

// ---------------------------
// 3. QUERY CLIENT CONFIG
// ---------------------------
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,  // Prevent refetch on window focus
            retry: 2,                     // Retry failed queries twice
            staleTime: 1000 * 60 * 5      // 5 minutes cache lifetime
        }
    }
});

// ---------------------------
// 4. CUSTOM HOOKS
// ---------------------------
const useReceiverProfile = (receiverId: string) => {
    return useQuery({
        queryKey: ['receiverProfile', receiverId],
        queryFn: () => getUserProfile(Number(receiverId)),
        enabled: !!receiverId,            // Only fetch when ID exists
        staleTime: 1000 * 60 * 5,         // 5 minute cache
        retry: 2,                         // Retry twice on failure
    });
};

// ---------------------------
// 5. MAIN COMPONENT
// ---------------------------
const ChatInterface: React.FC<ChatInterfaceProps> = ({ receiverId, onSelectRoom }) => {
    // ---------------------------
    // 5.1 COMPONENT STATE & REFS
    // ---------------------------
    const { t } = useTranslation();
    const listRef = useRef<HTMLDivElement>(null);  // Reference to messages container

    const [messages, setMessages] = useState<ChatMessage[]>([]);//messages
    const [isSending, setIsSending] = useState(false); //message is sending?

    const {profile } = useUser();
    const currentUserId = String(profile?.userid); //Current userid
    const [chatRooms, setChatRooms] = useState<IChatListProps['dataSource'] | null>(null); // rooms associated with the current user

    const { data: receiverProfile } = useReceiverProfile(receiverId); //gets the receiver profile from its id

    // ---------------------------
    // 5.2 CHAT ROOM SUBSCRIPTION
    // ---------------------------

    useEffect(() => {

        if (!currentUserId) return;

        const unsub = subscribeToUserRooms(
            String(currentUserId),
            async (rooms: RoomWithLastMsg[]) => {
                const ds = await Promise.all(
                    rooms.map(async (room) => {
                        // find the “other” participant
                        const otherId = room.participants.find(
                            (id) => id !== String(currentUserId)
                        )!;

                        // load their profile
                        const other = await getUserProfile(Number(otherId));

                        // determine slots A/B for this room
                        const [userA, userB] = [...room.participants].sort();

                        // pick the right unread count for currentUser
                        const unread =
                            String(currentUserId) === userA
                                ? room.unreadCountA
                                : room.unreadCountB;

                        return {
                            id: other.userid,
                            avatar: other.image,
                            alt: other.fullname,
                            title: other.fullname,
                            subtitle: room.lastMessage.content || "New chat",
                            date: room.lastMessageAt?.toDate() || new Date(),
                            unread,
                            statusColorType: "badge",
                            onClick: async () => {
                                onSelectRoom(String(other.userid));
                                await resetUnreadCount(currentUserId, String(other.userid));
                            },
                        };
                    })
                );

                const filteredDs = ds.filter(room => room.id !== 1);
                setChatRooms(filteredDs);

            }
        );

        return () => unsub();
    }, [currentUserId]);
    // ---------------------------
    // 5.3 MESSAGE SUBSCRIPTION
    // ---------------------------
    useEffect(() => {
        if (!currentUserId || !receiverId) return;

        // Reset unread count when opening chat
        resetUnreadCount(currentUserId, receiverId).catch(console.error);

        // Subscribe to real-time messages
        const unsubscribe = subscribeToMessages(
            currentUserId,
            receiverId,
            (firestoreMessages: Message[]) => {
                const formattedMessages = firestoreMessages.map(msg =>
                    mapFirestoreToChatMessage(msg, currentUserId)
                );
                setMessages(formattedMessages);
            }
        );

        return () => unsubscribe();  // Cleanup on unmount
    }, [currentUserId, receiverId]);

    // ---------------------------
    // 5.4 MESSAGE STATUS UPDATES
    // ---------------------------
    useEffect(() => {
        // Mark received messages as read
        messages.forEach(async (msg) => {
            if (!currentUserId) return;
            if (msg.position === 'left' && msg.status !== 'read') { //check for received messages that are unread
                await updateMessageStatus(msg.id, receiverId, currentUserId, 'read');// change status of unread to red messages in firebase
                setMessages(prev => prev.map(m =>
                    m.id === msg.id ? { ...m, status: 'read' } : m
                ));// change status of unread to red messages in local code
            }
        });
    }, [messages]);

    // ---------------------------
    // 5.5 UI EFFECTS
    // ---------------------------
    useEffect(() => {
        // Auto-scroll to bottom on new messages
        const el = listRef.current;
        if (el) {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // ---------------------------
    // 5.6 MESSAGE HANDLING
    // ---------------------------
    const handleSend = async (text: string, file?: File) => {
        if (!currentUserId || isSending) return;

        const tempId = `temp-${Date.now()}`;  // Temporary ID for optimistic update
        setIsSending(true);

        // Optimistic UI update
        setMessages(prev => [...prev, createTempMessage(tempId, text)]);

        try {
            const newMessage = await sendMessage(currentUserId, receiverId, text);

            // Replace temporary message with actual Firestore message
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? mapFirestoreToChatMessage(newMessage, currentUserId) : msg
            ));
        } catch (error) {
            // Rollback optimistic update on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
           
        } finally {
            setIsSending(false);
        }
    };

    // ---------------------------
    // 5.7 HELPER FUNCTIONS
    // ---------------------------
    const createTempMessage = (tempId: string, text: string): ChatMessage => ({
        id: tempId,
        position: 'right',
        type: 'text',
        text,
        date: new Date(),
        title: t("chats.you") ,
        status: 'waiting',
        notch: false,
        retracted: false,
        removeButton: false,
        replyButton: false,
        forwarded: false,
        titleColor: '#000',
        statusColorType: "badge",
        senderId: "temp-user"
    });

    const mapFirestoreToChatMessage = (
        msg: Message,
        currentUserId: string
    ): ChatMessage => {
        const position = msg.senderId === currentUserId ? 'right' : 'left';

        return {
            id: msg.id,
            position,
            type: msg.contentType,
            text: msg.content,
            date: msg.createdAt?.toDate() || new Date(),
            senderId: msg.senderId,
            status: msg.status,
            notch: false,
            retracted: false,
            removeButton: false,
            replyButton: false,
            forwarded: false,
            titleColor: '#000',
            statusColorType: "badge",
            ...(msg.contentType === 'file' && {
                data: {
                    uri: msg.fileUrl || '',
                    status: { click: false, loading: 0 },
                    name: msg.fileName,
                },
            }),
        };
    };

    const [isChatListVisible, setIsChatListVisible] = useState(false);
    const { mobileOnly, isTablet, isDesktop, tabletOnly } = useResponsive();
    return (
        <Row style={{
            padding: 0,
            marginTop: "0px",
            backgroundColor: "#f0f7f7",
            ...(isTablet && {
                borderLeft: "24px solid #ebeded",
                borderTop: "24px solid #ebeded",
            }),
            borderRadius: "12px",
            minHeight: mobileOnly ? "70vh" : "auto",
            position: "relative"
        }}>
            <PageTitle>{t('sider.chat')}</PageTitle>
            {mobileOnly &&
                <>
                    <Button
                        style={{
                            zIndex:  556,
                            position: "absolute",
                            top: isChatListVisible ? -10 : 80,
                            color: "#014a2f",
                            right: isChatListVisible ? 0 : ''
                        }}
                        onClick={() => setIsChatListVisible(prev => !prev)}
                    icon={isChatListVisible ? <ArrowLeftOutlined /> : <ArrowRightOutlined /> }
                    >
                    {t("chats.chats") }
                    </Button >
                    {isChatListVisible &&
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={6}
                            xl={6}
                            style={{
                                zIndex: 555,
                                position: "absolute",
                                top: 0,
                                backgroundColor: "#f0f7f7",
                                width: "100%",
                                padding: mobileOnly ? "4px" : "8px",

                                height: mobileOnly ? '100%' : "100%",

                            }}
                        >
                            {chatRooms === null ? (
                                <Row justify="center" align="middle">
                                <Spin tip={t("commmon.loading")} />
                                </Row>
                            ) : (
                                <>
                                    <Row justify="start">
                                        <Typography.Text style={{
                                            padding: mobileOnly ? "8px" : "10px",
                                            fontWeight: "bold",
                                            fontSize: mobileOnly ? 14 : 16
                                        }}>
                                            {t("chats.chats_h")}
                                        </Typography.Text>
                                    </Row>
                                    <Row style={{ width: "100%", backgroundColor: "#f0f7f7" }}>
                                        <ChatList
                                            lazyLoadingImage="adas"
                                            id={432}
                                            className='chat-list'
                                            dataSource={(chatRooms ?? []).map(room => ({
                                                ...room,
                                                className: String(room.id) === receiverId ? "chat-room-selected" : ""
                                            }))}
                                            onClick={(item: any) => item?.onClick?.()}
                                        />
                                    </Row>
                                </>
                            )}
                        </Col>
                    }
                </>
            }
            {isTablet && (<Col
                xs={24}
                sm={24}
                md={24}
                lg={6}
                xl={6}
                style={{
                    backgroundColor: "#f0f7f7",
                    padding: mobileOnly ? "4px" : "8px",
                    borderTopLeftRadius: "12px",
                    borderBottomLeftRadius: "12px",
                    height: mobileOnly ? 'auto' : "70vh",

                }}
            >
                {chatRooms === null ? (
                    <Row justify="center" align="middle">
                        <Spin tip={t("common.loading")} />
                    </Row>
                ) : (
                    <>
                        <Row justify="start">
                            <Typography.Text style={{
                                padding: mobileOnly ? "4px" : "10px",
                                fontWeight: "bold",
                                fontSize: mobileOnly ? 14 : 16
                            }}>
                                    {t("chats.chats_h")}
                            </Typography.Text>
                        </Row>
                        <Row style={{ width: "100%", backgroundColor: "#f0f7f7" }}>
                            <ChatList
                                lazyLoadingImage="adas"
                                id={432}
                                className='chat-list'
                                dataSource={(chatRooms ?? []).map(room => ({
                                    ...room,
                                    className: String(room.id) === receiverId ? "chat-room-selected" : ""
                                }))}
                                onClick={(item: any) => item?.onClick?.()}
                            />
                        </Row>
                    </>
                )}
            </Col>)}



            {/* Chat Messages Column */}
            <Col
                xs={24}
                sm={24}
                md={24}
                lg={18}
                xl={18}
                style={{
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    height: mobileOnly ? '80vh' : 'auto'
                }}
            >
                <Row>
                    {(receiverId && receiverId !== "1" && receiverProfile) && (
                        <Col md={24} lg={24} style={{ width: "100%", borderRadius: "8px" }}>
                            <Row
                                align="middle"
                                gutter={[mobileOnly ? 8 : 16, mobileOnly ? 8 : 16]}
                                style={{
                                    maxWidth: "100%",
                                    backgroundColor: '#fff',
                                    padding: mobileOnly ? '6px' : '6px 18px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    borderRadius: '8px 8px 0 0',
                                }}
                            >
                                {/* Avatar */}
                                <Col>
                                    <Avatar
                                        size={mobileOnly ? 40 : 64}
                                        src={receiverProfile?.image}
                                        shape="circle"
                                        style={{ border: '2px solid #fafafa' }}
                                    />
                                </Col>

                                {/* Name & Email */}
                                <Col flex="auto">
                                    <Space direction="vertical" size={0}>
                                        <Typography.Title
                                            level={mobileOnly ? 5 : 4}
                                            style={{ margin: 0, fontSize: mobileOnly ? 14 : 16 }}
                                        >
                                            {receiverProfile?.fullname}
                                        </Typography.Title>
                                        <Typography.Text style={{ fontSize: mobileOnly ? 12 : 14 }}>
                                            {receiverProfile?.email}
                                        </Typography.Text>
                                    </Space>
                                </Col>

                                {/* User Type & Campus */}
                                <Col>
                                    <Space direction="vertical" align="end">
                                        <Tag style={{
                                            backgroundColor: "#dcf8c6",
                                            color: "black",
                                            padding: "3px",
                                            fontSize: mobileOnly ? 12 : 14
                                        }}>
                                            {receiverProfile?.usertype}
                                        </Tag>
                                        <Typography.Text style={{ fontSize: mobileOnly ? 12 : 14 }}>
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                                            {receiverProfile?.campusname}
                                        </Typography.Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Col>
                    )}

                    <Col md={24} lg={24} style={{ minWidth: "100%" }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: mobileOnly ? 'calc(100vh - 120px)' : isDesktop ? '80vh' : '70vh',
                            width: '100%',
                            backgroundImage: `url(${whatsappImg})`,
                         
                        }}>
                            {/* Messages Container */}
                            <div ref={listRef} style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: mobileOnly ? 4 : 8,
                                scrollBehavior: 'smooth'
                            }}>
                                {receiverId && receiverId !== "1" && receiverProfile ? (
                                    <List
                                        split={false}
                                        locale={{ emptyText: <SystemMessage text="Start a conversation" /> }}
                                        style={{ width: "100%" }}
                                        bordered={false}
                                        dataSource={messages}
                                        renderItem={(item) => (
                                            <List.Item
                                                key={item.id}
                                                style={{
                                                    width: "100%",
                                                    display: 'flex',
                                                    justifyContent: item.position === 'right' ? 'flex-end' : 'flex-start',
                                                    padding: mobileOnly ? '4px 0' : '8px 0'
                                                }}
                                            >
                                                {item.position === 'right' ? (
                                                    <MessageBox
                                                        {...item}
                                                        className="message-right"
                                                        title={ t("chats.you")}
                                                        notch
                                                        retracted={false}
                                                        onTitleClick={() => { }}
                                                        status={item.status}
                                                       
                                                    />
                                                ) : (
                                                    <MessageBox
                                                        {...item}
                                                        className="message-left"
                                                            title={`${t("chats.advisor")} ${receiverProfile?.fullname}`}
                                                        retracted={false}
                                                        onTitleClick={() => { }}
                                                        status={undefined}
                                                        style={{ maxWidth: mobileOnly ? '80%' : '60%' }}
                                                    />
                                                )}
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                        <SystemMessage text={t("chats.please")} />
                                )}
                            </div>

                            {/* Composer */}
                            <div style={{
                                padding: mobileOnly ? 8 : 16,
                                borderTop: '1px solid #f0f0f0',
                                position: mobileOnly ? 'sticky' : 'relative',
                                bottom: 0,
                                width: '100%',
                                background: 'white',
                                zIndex: 1
                            }}>
                                <ChatComposer onSend={handleSend} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

const ChatInterfaceWrapper: React.FC = () => {
    const navigate = useNavigate();
    const { receiverId } = useParams<{ receiverId: string }>();
    return (
        <QueryClientProvider client={queryClient}>
            <ChatInterface
                receiverId={receiverId!}
                onSelectRoom={(newReceiver) => {
                    navigate(`/Messager/${newReceiver}`);
                }}
            />
        </QueryClientProvider>
    );
};
export default ChatInterfaceWrapper