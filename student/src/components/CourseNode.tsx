// CourseNode.tsx
import React from 'react';
import { Col, Row, Collapse, Space, Tag, Typography, Divider } from 'antd';
import { BookOutlined, CalendarOutlined, LinkOutlined, NumberOutlined } from '@ant-design/icons';
import { useResponsive } from '@app/hooks/useResponsive';

export interface CourseNodeData {
    title: string;
    credits: number;
    courses: number;
    courseList: Array<{
        courseCode: string;
        title: string;
        credits: number;
        prerequisites: string[];
        courseType: string;
    }>;
    Upcoming?: string;
}

export interface CourseNodeProps {
    node: Node; // Remove generic type parameter
}

const badgeStyle = {
    backgroundColor: "#cae8e6",
    borderRadius: 30,
    padding: "5px 12px"
};

const iconStyle = {
    color: '#038b94',
    fontSize: '18px',
    marginRight: "5px"
};

const upcomingStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    background: 'transparent',
    maxHeight: "fit-content"
};

export const CourseNode = ({ node }: { node?: any }) => {
    const courseData = node?.getData();
  
    const { isDesktop, isMobile } = useResponsive();

    const CustomHeader = () => (
        <Row justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={14}>
                <Row style={{ marginBottom: "10px" }}>
                    <Col style={{ fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                        <strong>{courseData.title}</strong>
                    </Col>
                </Row>
                <Row>
                    <Space size={isMobile ? "small" : "large"} wrap>
                        <Space style={badgeStyle}>
                            <CalendarOutlined style={iconStyle} />
                            <Typography.Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                {courseData.credits} credits
                            </Typography.Text>
                        </Space>
                        <Space style={badgeStyle}>
                            <BookOutlined style={iconStyle} />
                            <Typography.Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                {courseData.courses} Courses
                            </Typography.Text>
                        </Space>
                    </Space>
                </Row>
            </Col>
            {courseData.Upcoming && (
                <Col xs={24} md={6} style={upcomingStyle}>
                    <Typography.Text style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        {courseData.Upcoming }
                    </Typography.Text>
                </Col>
            )}
        </Row>
    );

    return (
        <Collapse
            activeKey={[1]}
            expandIcon={() => null}
            style={{
                backgroundColor: "#e3faf8",
                borderLeft: "4px solid #038b94",
                width: isDesktop ? "40%" : "100%",
                margin: "0 16px"
            }}
        >
            <Collapse.Panel
                key="1"
                header={<CustomHeader />}
            >
                {(courseData?.courseList || []).map((course: any, index: number) => (
                    <React.Fragment key={index}>
                        <Row
                            key={index}
                            justify="space-between"
                            style={{ marginBottom: 8 }}
                            gutter={[16, 8]}
                        >
                            <Col xs={24} md={14}>
                                <Row gutter={[8, 8]}>
                                    <Col>
                                        <Space size={4} wrap>
                                            <strong>{course.courseCode}</strong>
                                            <Tag color={
                                                course.courseType === "Major" ? "geekblue" :
                                                    course.courseType === "Core" ? "green" :
                                                        course.courseType === "Elective" ? "purple" : "gold"
                                            }>
                                                {course.courseType}
                                            </Tag>
                                        </Space>
                                    </Col>
                                    <Col xs={24}>
                                        <Typography.Text>{course.title}</Typography.Text>
                                    </Col>
                                </Row>
                            </Col>

                            <Col xs={24} md={10} style={{ paddingTop: "10px" }}>
                                <Row gutter={[8, 8]}>
                                    <Col flex="auto">
                                        <Space size={4} wrap>
                                            <NumberOutlined style={{ color: '#050505', fontSize: '15px' }} />
                                            <Typography.Text style={{ fontSize: '13px', color: "#050505" }}>
                                                {course.credits} Credits
                                            </Typography.Text>
                                        </Space>
                                    </Col>
                                    <Col flex="auto">
                                        <Space size={4} wrap>
                                            <LinkOutlined style={{ color: '#9da3a3', fontSize: '15px' }} />
                                            <Typography.Text style={{ fontSize: '13px' }}>
                                                {course.prerequisites.length > 0
                                                    ? course.prerequisites.join(", ")
                                                    : "NONE"}
                                            </Typography.Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        {index < courseData.courseList.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Collapse.Panel>
        </Collapse>
    );
};