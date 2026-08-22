import React from 'react';

import {
    CompassOutlined,

    DashboardOutlined,
    FormOutlined,
    HomeOutlined,
    LayoutOutlined,
    LineChartOutlined,
    TableOutlined,
    UserOutlined,
    BlockOutlined,
    PartitionOutlined,
    GoldOutlined,
    BranchesOutlined,
    SolutionOutlined,
    MessageOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { ReactComponent as NftIcon } from '@app/assets/icons/nft-icon.svg';
import { useTranslation } from 'react-i18next';

export interface SidebarNavigationItem {
    title: string;
    key: string;
    url?: string;
    children?: SidebarNavigationItem[];
    icon?: React.ReactNode;
}

export const sidebarNavigation: SidebarNavigationItem[] = [

    {
        title: 'common.dashboard',
        key: 'dashboard',
        // TODO use path variable
        url: '/',
        icon: <HomeOutlined />,
    },
    {
        title: 'sider.plan_of_study',
        key: 'pos',
        // TODO use path variable
        url: '/POS',
        icon: < PartitionOutlined />,
    },
    {
        title: 'sider.dynamic_pos',
        key: 'Dynamic-pos',
        url: '/DynamicPOS',
        icon: <GoldOutlined />,
    },
    {
        title: 'sider.customized_pos',
        key: 'apps',
        url: '/CustomizedPOS',
        icon: <BranchesOutlined />,
    }, {
    title: 'sider.schedule',
    key: 'schedule',
    url: '/Scheduling_Tool',
    icon: <CalendarOutlined />, 
    },
    {
        title: 'sider.advisor',
        key: 'advisor',
        url: '/advisors',
        icon: <SolutionOutlined />,
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
