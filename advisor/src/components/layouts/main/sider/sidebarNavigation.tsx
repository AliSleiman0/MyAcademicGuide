import React from 'react';

import {
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
} from '@ant-design/icons';

export interface SidebarNavigationItem {
    title: string;
    key: string;
    url?: string;
    children?: SidebarNavigationItem[];
    icon?: React.ReactNode;
}

export const sidebarNavigation: SidebarNavigationItem[] = [

    {
        title: 'common.students',
        key: 'students',
        // TODO use path variable
        url: '/',
        icon: <TeamOutlined />,
    },
    {
        title: 'sider.chat',
        key: 'chat',
        url: '/Messager',
        icon: <MessageOutlined />,


    },
     {
        title: 'sider.auth_pages',
        key: 'auth',
        icon: <UserOutlined />,
        children: [
            {
                title: 'sider.profile',
                key: 'profile',
                url: '/profile',
            },
            {
                title: 'sider.logout',
                key: 'logout',
                url: '/auth/logout',
            },
       
          
         
        ],
    },
  
];
