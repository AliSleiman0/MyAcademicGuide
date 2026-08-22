import React from 'react';
import { Modal, Row, Col, Typography, ModalProps } from 'antd';
import { EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Banner from './Banner';
import { Model } from 'echarts';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

type PlannerType = 'Manual' | 'Smart';
type SourceType = 'CUS' | 'AUTO';
interface PlannerTypeModalProps extends Omit<ModalProps, 'title' | 'visible'> {
    edit: boolean;
    open: boolean;
    mobileOnly: boolean;
    onPlannerSelect?: (type: PlannerType) => void;
    onSourceSelect?: (type: SourceType) => void;
    // 🆕 Text Props
    titleText?: string;
    bannerText?: string;
    manualTitle?: string;
    manualDescription?: string;
    smartTitle?: string;
    smartDescription?: string;
    modalCoursesSource: boolean;
}

const PlannerTypeModal: React.FC<PlannerTypeModalProps> = ({
    edit,
    open,
    modalCoursesSource,
    mobileOnly,
    onPlannerSelect,
    onSourceSelect,
    titleText = 'Select Planner Type',
    bannerText,
    manualTitle = 'Custom Plan',
    manualDescription = 'Manually create and adjust your academic schedule',
    smartTitle = 'Smart Planner',
    smartDescription = 'Automatically generate optimized schedules',

    ...modalProps
}) => {
    const { t } = useTranslation();
    titleText = titleText != 'Select Planner Type' ? titleText : t("sched_tool.choose_plan");
    manualTitle = manualTitle != 'Custom Plan' ? manualTitle : t("sched_tool.cus_plan_title");
    manualDescription = manualDescription != 'Manually create and adjust your academic schedule' ? manualDescription : t("sched_tool.cus_plan_body");
    smartTitle = smartTitle != 'Smart Planner' ? smartTitle : t("sched_tool.smart_modal_title");
    smartDescription = smartDescription != 'Automatically generate optimized schedules' ? smartDescription : t("sched_tool.smart_modal_body");
    const cardBaseStyle: React.CSSProperties = {
        background: modalCoursesSource ? 'linear-gradient(135deg, #038b94 0%, #010f0f 100%)' : 'linear-gradient(135deg, #f0fafa 0%, #ffffff 100%)',
        borderRadius: '12px',
        padding: mobileOnly ? 16 : 24,
        cursor: 'pointer',
        height: mobileOnly ? 160 : 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    };

    const effectiveBannerText = modalCoursesSource
        ? t("sched_tool.choose_courses_source_banner")
        : t("sched_tool.choose_plan_banner");

    return (
        <Modal
            title={
                <Title
                    style={{
                        color: '#038b94',
                        marginBottom: 0,
                        fontSize: mobileOnly ? 24 : 35,
                    }}
                >
                    {titleText}
                </Title>
            }
            open={open}
            footer={null}
            closable={false}
            centered
            width={mobileOnly ? '90%' : 800}
            bodyStyle={{
                padding: mobileOnly ? 12 : 24,
                background: 'transparent',
            }}
            maskStyle={{ background: 'rgba(255, 255, 255, 0.8)', minHeight: "fitContent" }}
            {...modalProps}
        >
            <Row gutter={[mobileOnly ? 0 : 24, 24]} justify="space-between">
                {edit && <Banner text={effectiveBannerText} />}

                {/* Manual Plan Card */}
                <Col span={mobileOnly ? 24 : 11} style={{ marginBottom: mobileOnly ? 16 : 0 }}>
                    <div
                        style={{ ...cardBaseStyle, border: '2px solid #038b94' }}
                        onClick={() => {
                            if (modalCoursesSource) {
                                onSourceSelect?.('CUS');
                            } else {
                                onPlannerSelect?.('Manual');
                            }
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <EditOutlined
                            style={{
                                fontSize: modalCoursesSource ? (mobileOnly ? 30 : 38) : (mobileOnly ? 32 : 48),
                                color: modalCoursesSource ? "white" : '#038b94',
                                marginBottom: 16,
                            }}
                        />
                        <Title level={modalCoursesSource ? (mobileOnly ? 4 : 3) : (mobileOnly ? 4 : 3)} style={{ color: modalCoursesSource ? "white" : '#038b94', margin: 0 }}>
                            {manualTitle}
                        </Title>
                        <Text
                            type="secondary"
                            style={{ textAlign: 'center', fontSize: modalCoursesSource ? (mobileOnly ? 10 : 12) : (mobileOnly ? 12 : 14), color: modalCoursesSource ? "white" : '#038b94', }}
                        >
                            {manualDescription}
                        </Text>
                    </div>
                </Col>

                {/* Smart Planner Card */}
                <Col span={mobileOnly ? 24 : 11}>
                    <div
                        style={{ ...cardBaseStyle, border: '2px solid #036956' }}
                        onClick={() => {
                            if (modalCoursesSource) {
                                onSourceSelect?.('AUTO');
                            } else {
                                onPlannerSelect?.('Smart');
                            }
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <ThunderboltOutlined
                            style={{
                                fontSize: modalCoursesSource ? (mobileOnly ? 30 : 38) : (mobileOnly ? 32 : 48),
                                color: modalCoursesSource ? "white" : '#038b94',
                                marginBottom: 16,
                            }}
                        />
                        <Title level={modalCoursesSource ? (mobileOnly ? 4 : 3) : (mobileOnly ? 4 : 3)} style={{ color: modalCoursesSource ? "white" : '#038b94', margin: 0 }}>
                            {smartTitle}
                        </Title>
                        <Text
                            type="secondary"
                            style={{ textAlign: 'center', fontSize: modalCoursesSource ? (mobileOnly ? 10 : 12) : (mobileOnly ? 12 : 14), color: modalCoursesSource ? "white" : '#038b94', }}
                        >
                            {smartDescription}
                        </Text>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};

export default PlannerTypeModal;
