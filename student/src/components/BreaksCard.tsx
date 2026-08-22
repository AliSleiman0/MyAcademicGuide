import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import IconButton from './IconButton'; // adjust path
import EventButton from './EventButton'; // adjust path
import { useTranslation } from 'react-i18next';
export const dayNumberToKey: Record<number,string> = {
    1: 'mon', // Monday
    2: 'tue', // Tuesday
    3: 'wed', // Wednesday
    4: 'thu', // Thursday
    5: 'fri', // Friday
    
};
interface BreakItem {
    title: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
}

interface BreaksCardProps {
    breaks: BreakItem[];
    onAddBreak: () => void;
    onDeleteBreak: (index: number) => void;
    onQuickConstraint: (start: string, end: string, title: string, days: number[]) => void;
}

const BreaksCard: React.FC<BreaksCardProps> = ({ breaks, onAddBreak, onDeleteBreak, onQuickConstraint }) => {
    const { t } = useTranslation();
    return (
        <Row style={{ marginBottom: "15px" }}>
            <Col style={{ width: "100%" }}>
                <Card
                    title={
                        <Row justify="space-between">
                            <Col>
                                <Typography.Text>{t('sched_tool.time_constraint')}</Typography.Text>
                            </Col>
                            <Col>
                                <IconButton icon={<PlusOutlined />} text={t('sched_tool.add_break')} onClick={onAddBreak} />
                            </Col>
                        </Row>
                    }
                    style={{ width: "100%", borderLeft: "4px solid #038b94" }}
                >
                    <Row justify="center" style={{ color: "#4a8f94", marginBlock: "20px" }}>
                        {breaks.length === 0 ? (
                            t('sched_tool.no_constraint') 
                        ) : (
                            <Space direction="vertical" style={{ width: '100%', maxWidth: '600px' }}>
                                {breaks.map((breakItem, index) => (
                                    <Row
                                        key={index}
                                        align="middle"
                                        justify="space-between"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            width: '100%'
                                        }}
                                    >
                                        <Col>
                                            <Typography.Text strong>{breakItem.title}</Typography.Text>
                                            <Typography.Text type="secondary" style={{ marginLeft: 16 }}>
                                                {`${breakItem.startTime} - ${breakItem.endTime} (${[1, 2, 3, 4, 5].every(d => breakItem.daysOfWeek.includes(d))
                                                    ? t('days.all_week') // Add this key to your translations
                                                        : breakItem.daysOfWeek
                                                        .map(day => t(`days.${dayNumberToKey[day]}`))
                                                            .join(', ')
                                                    })`}
                                            </Typography.Text>
                                        </Col>
                                        <Col>
                                            <DeleteOutlined
                                                onClick={() => onDeleteBreak(index)}
                                                style={{
                                                    color: '#ff4d4f',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    transition: 'color 0.3s'
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = 'black')}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = '#ff4d4f')}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                            </Space>
                        )}
                    </Row>

                    <Row>{t('sched_tool.quick_restrictions')}</Row>
                    <Row gutter={[16, 8]} style={{ marginTop: "10px" }}>
                        <Col><EventButton text={t('sched_tool.evening_classes')} onClick={() => onQuickConstraint('15:00', '17:00', t('sched_tool.evening_classes') , [1, 2, 3, 4, 5])} /></Col>
                        <Col><EventButton text={t('sched_tool.morning_classes')} onClick={() => onQuickConstraint('08:00', '10:45', t('sched_tool.morning_classes'), [1, 2, 3, 4, 5])} /></Col>
                        <Col><EventButton text={t('sched_tool.lunch_break')} onClick={() => onQuickConstraint('12:00', '13:00', t('sched_tool.lunch_break'), [1, 2, 3, 4, 5])} /></Col>
                        <Col><EventButton text={t('sched_tool.wed_classes')} onClick={() => onQuickConstraint('08:00', '17:00', t('sched_tool.wed_classes'), [3])} /></Col>
                        <Col><EventButton text={t('sched_tool.fri_classes')} onClick={() => onQuickConstraint('08:00', '17:00', t('sched_tool.fri_classes'), [5])} /></Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default BreaksCard;
