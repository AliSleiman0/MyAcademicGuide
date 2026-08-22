import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useResponsive } from '@app/hooks/useResponsive';

import SubMenu from 'antd/lib/menu/SubMenu';
import { useTranslation } from 'react-i18next';
import { SemesterInfo } from '../apiMAG/automated_pos';

const { Sider } = Layout;

interface SiderProps {
    semesters: SemesterInfo[];
    handleSemesterSelect: (semester: SemesterInfo) => void;
    isGeneratedSemesters: boolean;
    shouldFlash: boolean;
    title: string;
}

const MobileSiderMenu = ({
    semesters,
    handleSemesterSelect,
    isGeneratedSemesters,
    shouldFlash,
    title
}: SiderProps) => {
    const [isSiderCollapsed, setIsSiderCollapsed] = useState(false);
    const { mobileOnly } = useResponsive();

    const handleMenuToggle = () => {
        setIsSiderCollapsed(prev => !prev);
    };
    const { t } = useTranslation();
    return (
        <>
            {/* Mobile Toggle Button */}
            {isGeneratedSemesters && (
                <Button
                    type="text"
                    className={shouldFlash ? 'flash-highlight' : ''}
                    icon={isSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={handleMenuToggle}
                    aria-label={isSiderCollapsed ? "Open menu" : "Close menu"}
                    style={{
                        position: 'fixed',
                        right: 8,
                        top: 85,
                        zIndex: 1004,
                        background: '#daf3f5'
                    }}
                />
            )}


            <Sider
                width={280}
                collapsedWidth={0}
                collapsible
                collapsed={isSiderCollapsed}
                onCollapse={setIsSiderCollapsed}
                trigger={null }
                breakpoint="md"
                theme="light"
                style={{
                    height: '100%',
                    background: '#e7f2f3',
                    borderRight: 0,
                    position: mobileOnly ? 'fixed' : 'relative',
                    zIndex: 900,
                    
                    boxShadow: mobileOnly && !isSiderCollapsed ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['current']}
                    style={{
                        height: '100%',
                        background: '#f5f7fa',
                        borderRight: 0,
                        marginTop:0
                    }}
                >
                    {/* Current Semester */}
                    {semesters?.[0] && (
                        <Menu.Item
                            key="current"
                            icon={<ScheduleOutlined />}
                            onClick={() => {
                                handleSemesterSelect(semesters[0]);
                                mobileOnly && setIsSiderCollapsed(true);
                            }}
                        >
                            {semesters[0].semester} {semesters[0].year}
                        </Menu.Item>
                    )}

                    {/* Generated Semesters Submenu */}
                    {isGeneratedSemesters && (
                        <SubMenu
                            key="generated"
                            icon={<AppstoreOutlined />}
                            title={title }
                            className={shouldFlash ? 'flash-highlight' : ''}
                            popupClassName={mobileOnly ? 'mobile-submenu' : ''}
                        >
                            {semesters?.slice(1).map((sem, index) => (
                                <Menu.Item
                                    key={`gen-${index}`}
                                    icon={<ScheduleOutlined />}
                                    onClick={() => {
                                        handleSemesterSelect(sem);
                                        mobileOnly && setIsSiderCollapsed(true);

                                    }}
                                >
                                    {sem.semester} {sem.year}
                                </Menu.Item>
                            ))}
                        </SubMenu>
                    )}
                </Menu>
            </Sider>
        </>
    );
};

export default MobileSiderMenu;