// CourseCard.tsx
import React, { SetStateAction, useMemo, useState } from "react";
import { Card, Typography, Collapse, Row, Col, Segmented, Checkbox, Space, Button } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import DaysButton from "./DaysButton";
import styled from "styled-components";

const { Text } = Typography;
const { Panel } = Collapse;

export interface CourseSection {
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
        id: string;
        code: string;
        name: string;
        credits: number;
        sections: CourseSection[];
    };
    selectedSectionId?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>("Sections");
    const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  

    const professors = useMemo(() =>
        Array.from(new Set(course.sections.map(s => s.instructor))),
        [course.sections]
    );

    const handleProfessorToggle = (profId: string, checked: boolean) => {
        setSelectedProfessors(old => checked ? [...old, profId] : old.filter(id => id !== profId));
    };

    const getProfessorSectionsCount = (professor: string) => {
        return course.sections.filter(s => s.instructor === professor).length;
    };

    const isSectionDisabled = (section: CourseSection) => {
        return selectedProfessors.length > 0 &&
            !selectedProfessors.includes(section.instructor);
    };

    return (
        <HoverableDiv>
            <div style={{ marginBottom: 16, borderRadius: 12, border: "1px solid #f4dbff", paddingBlock: 8, width: "100%" }}>
                <Row justify="space-between" style={{ height: "auto", marginBottom: "8px", paddingInline: 8 }} gutter={[0, 16]} >
                    <Col>
                        <Text style={{ marginBottom: "8px", height: "auto", fontFamily: "monospace" }}>
                            {course.code} - {course.name}
                        </Text>
                    </Col>
                    <Col>
                        <DaysButton text={`${course.credits} credits`} onClick={() => console.log("HI")} />
                    </Col>
                </Row>

                <Collapse
                    bordered={false}
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    style={{ backgroundColor: "transparent", padding: "0px", minWidth: "100%" }}
                >
                    <Panel header="Offering Preferences" key="1" style={{ padding: 0, backgroundColor: "transparent", minWidth: "100%" }}>
                        <Segmented
                            options={["Sections", "Professors"]}
                            value={selectedTab}
                            onChange={(value) => setSelectedTab(value as SetStateAction<string>)}
                            block
                            style={{ marginBottom: 8 }}
                        />

                        {selectedTab === "Professors" ? (
                            <Row style={{ padding: 8 }}>
                                <Typography.Text style={{ marginBottom: 8 }}>Offerings Preference</Typography.Text>
                                {professors.map(professor => {
                                    const isChecked = selectedProfessors.includes(professor);
                                    const hasSelections = selectedProfessors.length > 0;

                                    return (
                                        <Row
                                            key={professor}
                                            style={{
                                                border: hasSelections
                                                    ? isChecked
                                                        ? "1px solid #f2dbfe"
                                                        : "1px solid #f7a3a3"
                                                    : "1px solid #e0e0e0",
                                                width: "100%",
                                                padding: 8,
                                                marginBottom: "10px",
                                                backgroundColor: hasSelections
                                                    ? isChecked
                                                        ? "#e3faf8"
                                                        : "#faf2f3"
                                                    : "#ffffff",
                                                borderRadius: "12px"
                                            }}
                                        >
                                            <Col style={{ padding: "8px", width: "100%" }}>
                                                <Row justify="space-between" style={{ marginBottom: "10px" }}>
                                                    <Col>
                                                        <Space>
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onChange={e => handleProfessorToggle(professor, e.target.checked)}

                                                            />
                                                            <Typography.Text>{professor}</Typography.Text>
                                                        </Space>
                                                    </Col>
                                                    <Col>
                                                        <Typography.Text style={{ fontSize: "0.85rem", color: "#585859" }}>
                                                            {getProfessorSectionsCount(professor)} section(s)
                                                        </Typography.Text>
                                                    </Col>
                                                </Row>
                                                <Row justify="end">
                                                    <Col>
                                                        <Typography.Text
                                                            style={{
                                                                fontSize: "0.85rem",
                                                                color: hasSelections && !isChecked ? "#ff0000" : "#565657",
                                                                cursor: "pointer"
                                                            }}
                                                            onClick={() => handleProfessorToggle(professor, !isChecked)}
                                                        >
                                                            {!isChecked ? "Add to preference" : "Remove from preference"}
                                                        </Typography.Text>
                                                    </Col>
                                                </Row>
                                                {hasSelections && !isChecked && (
                                                    <Row style={{ marginTop: 8 }}>
                                                        <Col>
                                                            <Text type="secondary" style={{ fontSize: "0.75rem", color: "#ff4d4f" }}>
                                                                Deselected due to {selectedProfessors.join(", ")} preference
                                                            </Text>
                                                        </Col>
                                                    </Row>
                                                )}
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </Row>
                        ) : (
                            <div style={{ padding: 8 }}>
                                {course.sections.map(section => (
                                    <Row
                                        key={section.id}
                                        style={{
                                            marginBottom: 8,
                                            width: "100%",
                                            border: "1px solid #94f7d3",
                                            padding: "8px",
                                            borderRadius: 8,
                                            backgroundColor:"#e3faf8"
                                        }}
                                        align="top"
                                    >
                                        {/* checkbox column */}
                                        <Col flex="none" style={{ paddingRight: 12 }}>
                                            <Checkbox
                                                disabled={isSectionDisabled(section)}
                                                
                                                style={{
                                                    opacity: isSectionDisabled(section) ? 0.6 : 1,
                                                    cursor: isSectionDisabled(section) ? "not-allowed" : "pointer",
                                                }}
                                            />
                                        </Col>

                                        {/* content column */}
                                        <Col flex="auto">
                                            {/* row 1: section name */}
                                            <Row>
                                                <Text strong>{section.name}</Text>
                                            </Row>

                                            {/* row 2: schedule on the left, professor on the right */}
                                            <Row justify="space-between" align="middle" style={{ marginTop: 4 }}>
                                                <Typography.Text style={{ fontSize: "0.85rem", color: "#8c8c8c" }}>{section.schedule}</Typography.Text>
                                                <Typography.Text style={{ fontSize: "0.85rem", color: "#8c8c8c" }}>{section.instructor}</Typography.Text>
                                            </Row>

                                            {/* optional disabled note */}
                                            {isSectionDisabled(section) && (
                                                <Text type="secondary" style={{ fontSize: "0.75rem", color: "#ff4d4f", marginTop: 4, display: "block" }}>
                                                    Professor not selected in preferences
                                                </Text>
                                            )}
                                        </Col>
                                    </Row>

                                ))}
                            </div>
                        )}
                    </Panel>
                </Collapse>
            </div>
        </HoverableDiv>
    );
};

export default CourseCard;

const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  border-radius: 12px;
  box-shadow: none;
  width: 100%;
  
  &:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 20px rgba(3, 139, 148, 0.3);
  }
`;