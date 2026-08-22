import React from 'react';
import { Modal, Typography } from 'antd';
import {
    WarningFilled,
    CalendarOutlined,
    ClockCircleOutlined,
    ScheduleOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import IconButton from './IconButton';
import { useTranslation } from 'react-i18next';
import { dayNumberToKey } from './BreaksCard';


interface ConflictEvent {
    title: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
}

interface ConflictModalProps {
    showConflictModal: boolean;
    conflictingEvent: ConflictEvent | null;
    pendingBreak: any; // Replace 'any' with your specific type for pendingBreak
    setShowConflictModal: (value: boolean) => void;
    setConflictingEvent: (value: ConflictEvent | null) => void;
    setPendingBreak: (value: any) => void; // Replace 'any' with your specific type
    setBreaks: (value: any) => void; // Replace 'any' with your specific type
    setIsModalBreaksVisible: (value: boolean) => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
    showConflictModal,
    conflictingEvent,
    pendingBreak,
    setShowConflictModal,
    setConflictingEvent,
    setPendingBreak,
    setBreaks,
    setIsModalBreaksVisible,
}) => {
    const { t } = useTranslation();
    return (
        <Modal
            zIndex={20} 
            title={null}
            open={showConflictModal}
            onOk={() => {
                if (pendingBreak) setBreaks((prev:any) => [...prev, pendingBreak]);
                setShowConflictModal(false);
                setConflictingEvent(null);
                setPendingBreak(null);
                setIsModalBreaksVisible(false);
            }}
            onCancel={() => {
                setShowConflictModal(false);
                setConflictingEvent(null);
                setPendingBreak(null);
            }}
            footer={null}
            centered
            closable={false}
            okText={t("common.confirm")}
            cancelText={t("common.back")}
        >
            {/* Custom Header */}
            <div style={{
                background: 'linear-gradient(211.49deg, #014145 15.89%, #038b94 48.97%)',
                padding: '24px',
                margin: '-24px -24px 24px -24px',
                position: 'relative'
            }}>
                <WarningFilled style={{
                    fontSize: '32px',
                    color: '#e3faf8',
                    position: 'absolute',
                    right: 24,
                    top: 24
                }} />
                <Typography.Title
                    level={3}
                    style={{
                        color: '#e3faf8',
                        margin: 0,
                        fontWeight: 600
                    }}
                >
                    {t("sched_tool.schedule_conflict")}
                </Typography.Title>
            </div>

            {/* Conflict Content */}
            {conflictingEvent && (
                <div style={{ padding: '0 16px' }}>
                    <div style={{
                        backgroundColor: '#e3faf8',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid rgba(4, 139, 148, 0.15)'
                    }}>
                        <Typography.Text strong style={{ color: '#4a8f94', display: 'block', marginBottom: 8 }}>
                            ⚠️ {t("sched_tool.conflicting_with")}:
                        </Typography.Text>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            <CalendarOutlined style={{ color: '#038b94' }} />
                            <Typography.Text strong style={{ color: '#038b94' }}>
                                {conflictingEvent.title}
                            </Typography.Text>

                            <ClockCircleOutlined style={{ color: '#4a8f94' }} />
                            <Typography.Text style={{ color: '#4a8f94' }}>
                                {conflictingEvent.startTime} - {conflictingEvent.endTime}
                            </Typography.Text>

                            <ScheduleOutlined style={{ color: '#4a8f94' }} />
                            <Typography.Text style={{ color: '#4a8f94' }}>
                                {[1, 2, 3, 4, 5].every(d => conflictingEvent.daysOfWeek.includes(d))
                                    ? t('days.all_week')
                                    : conflictingEvent.daysOfWeek
                                        .map(day => t(`days.${dayNumberToKey[day]}`))
                                        .join(', ')
                                }
                            </Typography.Text>
                        </div>
                    </div>

                    {/* Resolution Options */}
                    <Typography.Title
                        level={5}
                        style={{
                            color: '#038b94',
                            marginBottom: 8,
                            fontWeight: 500
                        }}
                    >
                        {t("sched_tool.available_options")}
                      
                    </Typography.Title>

                    <div style={{
                        display: 'grid',
                        gap: '12px',
                        marginBottom: 16
                    }}>
                        {[
                            { icon: <EditOutlined />, text: t("sched_tool.adjust")  },
                            { icon: <DeleteOutlined />, text: t("sched_tool.remove") },
                        ].map((option, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '3px',
                                    borderRadius: '8px',
                                    backgroundColor: index === 2 ? 'rgba(255, 77, 79, 0.08)' : 'transparent',
                                    border: index === 2 ? '1px solid rgba(255, 77, 79, 0.2)' : 'none'
                                }}
                            >
                                <span style={{ color: index === 2 ? '#ff4d4f' : '#4a8f94' }}>
                                    {option.icon}
                                </span>
                                <Typography.Text
                                    style={{
                                        color: index === 2 ? '#ff4d4f' : '#4a8f94',
                                        fontWeight: index === 2 ? 500 : 400
                                    }}
                                >
                                    {option.text}
                                </Typography.Text>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        borderTop: '1px solid rgba(4, 139, 148, 0.1)',
                        paddingTop: '10px'
                    }}>
                        <IconButton
                            onClick={() => {
                                setShowConflictModal(false);
                                setConflictingEvent(null);
                                setPendingBreak(null);
                            }}
                            text={t("common.confirm")}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};