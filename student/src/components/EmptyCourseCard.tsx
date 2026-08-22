import React from 'react';
import { Row, Col } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface EmptyCourseCardProps {
    onClick: () => void;
}

const EmptyCourseCard: React.FC<EmptyCourseCardProps> = ({ onClick }) => {
    const { t } = useTranslation();
    return (<Row onClick={onClick} style={{ cursor: 'pointer' }}>
        <Col
            style={{
                width: '100%',
                height: '100%',
                padding: '20px',
                border: '2px dashed #4a8f94',
                borderRadius: '9px',
            }}
        >
            <Row justify="center" style={{ color: '#4a8f94' }}>
                <Col style={{ padding: '8px' }}>
                    <ReadOutlined style={{ fontSize: '40px' }} />
                </Col>
            </Row>
            <Row justify="center" style={{ color: '#4a8f94' }}>
                <Col style={{ padding: '8px' }}>{t("sched_tool.no_courses")}</Col>
            </Row>
            <Row justify="center" style={{ color: '#4a8f94' }}>
                <Col style={{ padding: '8px', fontSize: '12px', paddingBottom: '15px' }}>
                    {t("sched_tool.no_courses_desc")}
                </Col>
            </Row>
        </Col>
    </Row>)
}

export default EmptyCourseCard;
