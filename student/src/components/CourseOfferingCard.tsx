// CourseCard.tsx
import React, { useState } from "react";
import { Card, Typography, Select, Tag, Collapse, Row, Col } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import EventButton from "./EventButton";
import DaysButton from "./DaysButton";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { translateSchedule } from "../constants/scheduleTranslations";

const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface CourseSection {
    id: string;
    name: string;
    schedule: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    instructor: string;
}

interface CourseCardProps {
    course: {
        id?: string | number;
        code?: string | number;
        name?: string;
        credits?: number;
        sections: CourseSection[];
    };
    selectedSectionId?: string;
    onSectionChange: (courseId: string, sectionId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
    course,
    selectedSectionId = 0,
    onSectionChange
}) => {
    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState<string | string[]>([]);

    const currentSection = course.sections.find(s => s.id === selectedSectionId);

    return (
        <HoverableDiv>
            <Card
                style={{ width: "100%", marginBottom: 16, borderRadius: 12, border: "1px solid #cbdff7" }}

            >
                <Row justify="space-between" style={{ height: "auto", marginBottom: "8px" }} gutter={[0, 16]} >
                    <Col>
                        <Text style={{ marginBottom: "8px", height: "auto", fontFamily: "monospace" }}>
                            {course.name}
                        </Text>
                    </Col>
                    <Col>
                        <DaysButton text={`${course.credits} ${t("sched_tool.credits")}`} onClick={() => console.log("HI")} />
                    </Col>
                </Row>


                {currentSection && (
                    <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #dbeafe',
                        borderRadius: 6,
                        padding: 12,

                    }}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>
                            {t("sched_tool.section")} {currentSection.name.split(" ")[1]}
                        </Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {translateSchedule(currentSection.schedule, t)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {currentSection.instructor}
                            </Text>
                        </div>
                    </div>
                )}

                <Collapse
                    bordered={false}
                    activeKey={activeKey}
                    onChange={(keys) => setActiveKey(keys)}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    style={{ backgroundColor: "transparent", padding: "0px" }}
                >
                    <Panel header={`${currentSection ? t("sched_tool.change_off") : t("sched_tool.choose_off")}`} key="1" style={{ padding: 0, backgroundColor: "transparent" }}>
                        <Select
                            style={{ width: '100%', backgroundColor: "transparent", padding: "0px" }}
                            placeholder={t("sched_tool.choose_off_dropdown") }

                            onChange={(value) => onSectionChange((String(course.id) ?? ""), value)}
                        >
                            {course.sections.map(section => (
                                <Option key={section.id} value={section.id}>
                                    {t("sched_tool.section")} {section.name.split(" ")[1]} -  {translateSchedule(section.schedule, t)}
                                </Option>
                            ))}
                        </Select>
                    </Panel>
                </Collapse>
            </Card>
        </HoverableDiv>
    );
};

export default CourseCard;
const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  border-radius:12px;
 
  box-shadow: none;
      width: 100%;
  &:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 20px rgba(3, 139, 148, 0.3);
  }
`;