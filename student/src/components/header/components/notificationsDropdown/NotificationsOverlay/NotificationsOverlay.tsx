import { useState, useEffect } from 'react';

import * as S from './NotificationsOverlay.styles';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { ChatList, IChatListProps } from 'react-chat-elements';
import { RoomWithLastMsg, subscribeToUserRooms } from '../../../../../firebase/firebase';
import { getUserProfile } from '../../../../../apiMAG/user';
import Empty from 'antd/lib/empty';

import "../../../../../pages/30/Messager/Messager.styles.css";

export const NotificationsOverlay= ({

}) => {

    const [chatRooms, setChatRooms] = useState<IChatListProps['dataSource'] | null>(null); // rooms associated with the current user
    const currentUserId = localStorage.getItem('userId') ?? '';
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
                          
                        };
                    })
                );
                const filteredDs = ds
                    .filter(room => room.unread > 0)       // keep only rooms with unread > 0
                    .filter(room => room.id !== 1);   
                setChatRooms(filteredDs);

            }
        );

        return () => unsub();
    }, [currentUserId]);

  return (
    <S.NoticesOverlayMenu>
      <BaseRow>
      
              <BaseCol span={24} style={{width:"100%"} }>
                  {(chatRooms && chatRooms.length > 0)
                      ? (
                          <ChatList
                              lazyLoadingImage="adas"
                              id={432}
                              className="chat-list"
                              dataSource={(chatRooms ?? []).map(room => ({
                                  ...room,
                                  className:  "chat-room-notifcation" 
                              }))}
                             
                          />
                      )
                      : (
                          <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description="No notifications"
                              style={{ margin: '24px 0' }}
                          />
                      )}
        </BaseCol>
      </BaseRow>
    </S.NoticesOverlayMenu>
  );
};
