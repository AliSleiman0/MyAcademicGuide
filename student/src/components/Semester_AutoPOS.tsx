// CourseNode.tsx
import React from 'react';
import { Col, Row, Collapse, Space, Tag, Typography, Divider } from 'antd';
import { BookOutlined, CalendarOutlined, LinkOutlined, NumberOutlined } from '@ant-design/icons';
import { useResponsive } from '@app/hooks/useResponsive';
import { BREAKPOINTS } from '../styles/themes/constants';
import { useTranslation } from 'react-i18next';
import { Course } from '../apiMAG/automated_pos';

export interface CourseData {
    title?: string;
    credits?: number;
    courseList?: Array<Course>;
    Upcoming?: string;
    extraInfo?: React.ReactNode;
    height?: string;
}

export const Semester_AutoPOS = ({ courseData }: { courseData: CourseData }) => {
    const { mobileOnly, tabletOnly, desktopOnly, isBigScreen } = useResponsive();
    
    // Responsive style configurations using all breakpoints
    const responsiveStyles = {
        badgeStyle: {
            backgroundColor: "#cae8e6",
            borderRadius: 30,
            padding: mobileOnly ? "3px 8px" : tabletOnly ? "4px 10px" : "5px 12px"
        },
        iconStyle: {
            color: '#038b94',
            fontSize: mobileOnly ? '10px' : tabletOnly ? '12px' : '18px',
            marginRight: mobileOnly ? "3px" : "5px"
        },
        headerTitle: {
            fontSize: mobileOnly ? "1rem" : tabletOnly ? "1.1rem" : desktopOnly ? "1rem" : "1rem"
        },
        badgeText: {
            fontSize: mobileOnly ? '12px' : tabletOnly ? '13px' : '14px'
        },
        courseCode: {
            fontSize: mobileOnly ? '14px' : tabletOnly ? '15px' : '16px'
        },
        courseName: {
            fontSize: mobileOnly ? '13px' : tabletOnly ? '14px' : '15px'
        },
        upcomingText: {
            top: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'transparent',
            maxHeight: "fit-content"
        }
    };
    const { t } = useTranslation();
    const CustomHeader = () => (

        <Row justify="space-between" gutter={[16, 16]} >
            <Col xs={24} md={24}>
                <Row style={{ marginBottom: mobileOnly ? "5px" : "10px" }}>
                    <Col style={{
                        ...responsiveStyles.headerTitle,
                        ...(mobileOnly ? {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'nowrap',
                            overflow: 'hidden'
                        } : {}),
                      
                    }}>
                        
                        <strong >{courseData.title}</strong>
                        <h3 style={{
                            ...(mobileOnly ? {
                                margin: 0,
                                padding: 0,
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            } : {})
                           
                        }}>
                            {courseData.Upcoming && courseData.Upcoming}
                        </h3>
                    </Col>
                    
                </Row>
                <Row>
                    <Space size="small" wrap >
                        <Space style={responsiveStyles.badgeStyle}>
                            <CalendarOutlined style={responsiveStyles.iconStyle} />
                            <Typography.Text style={responsiveStyles.badgeText}>
                                {courseData.credits} {t("customised_pos.credits") }
                            </Typography.Text>
                        </Space>
                        <Space   style={responsiveStyles.badgeStyle}>
                            <BookOutlined style={responsiveStyles.iconStyle} />
                            <Typography.Text style={responsiveStyles.badgeText}>
                                {courseData.courseList?.length ? courseData.courseList?.length : 0} {t("courses.my_courses")}
                            </Typography.Text>
                        </Space>
                    </Space>
                </Row>
            </Col>
           
        </Row>
    );

    return (
        <Collapse
            activeKey={[1]}
            expandIcon={() => null}
            style={{
                backgroundColor: "#e3faf8",
                borderLeft: "4px solid #038b94",
                margin: "0px 0px",
                width: "100%",
            }}
        >
            <Collapse.Panel
                key="1"
                header={<CustomHeader />}
                style={{
                    borderBottom: '1px solid #038b94',
                    padding:'16px',
                    height: courseData.height ? "fit-content" : "700px"
                }}
            >
                {( courseData.credits == 0 && courseData.courseList?.length == 0) && (
                    <div>{t("customised_pos.place_holder")}</div>
                )}
                {(courseData?.courseList || []).map((course: Course, index: number) => (
                    <React.Fragment key={index}>
                        <Row
                            justify="space-between"
                            style={{ marginBottom: 8 }}
                            gutter={[mobileOnly ? 8 : 16, mobileOnly ? 4 : 8]}
                        >
                            <Col xs={24} md={12}>
                                <Row gutter={[mobileOnly ? 4 : 8, mobileOnly ? 4 : 8]}>
                                    <Col xs={24}>
                                        <Space
                                            size={4}
                                            wrap
                                            style={{ width: mobileOnly ? '100%' : 'auto' }}
                                        >
                                            <strong style={responsiveStyles.courseCode}>
                                                {course.coursecode}
                                            </strong>
                                            <Tag
                                                color={
                                                    course.coursetype === "Major" ? "geekblue" :
                                                        course.coursetype === "Core" ? "green" :
                                                            course.coursetype === "Elective" ? "purple" : "gold"
                                                }
                                                style={{
                                                    marginRight: 0,
                                                    fontSize: mobileOnly ? '12px' : 'inherit'
                                                }}
                                            >
                                                {t(`courses.course_types.${course.coursetype}`)}
                                            </Tag>
                                        </Space>
                                    </Col>
                                    <Col xs={24}>
                                        <Typography.Text
                                            style={responsiveStyles.courseName}
                                            ellipsis={mobileOnly ? { tooltip: course.coursename } : false}
                                        >
                                            {course.coursename}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                xs={24}
                                md={12}
                                lg={12}
                                xl={12}
                                style={{
                                    paddingTop: mobileOnly ? '4px' : tabletOnly ? '8px' : '10px',
                                   
                                    display: 'flex',
                                    justifyContent: mobileOnly ? 'flex-start' : 'flex-end',
                                    alignItems: 'center',
                                    
                                }}
                            >
                                <Space size={4} wrap>
                                    <NumberOutlined style={{
                                        color: '#050505',
                                        fontSize: mobileOnly ? '13px' : tabletOnly ? '14px' : '15px'
                                    }} />
                                    <Typography.Text
                                        style={{
                                            fontSize: responsiveStyles.badgeText.fontSize,
                                            color: "#050505"
                                        }}
                                    >
                                        {course.credits} {t(`courses.credits.credits`)}
                                    </Typography.Text>
                                </Space>
                            </Col>
                        </Row>
                        {index < courseData.courseList!!.length - 1 && (
                            <Divider style={{
                                margin: mobileOnly ? '8px 0' : tabletOnly ? '10px 0' : '12px 0',
                                borderColor: '#038b9433'
                            }} />
                        )}
                    </React.Fragment>
                ))}
              
            </Collapse.Panel>
        </Collapse>
    );
};

export default Semester_AutoPOS;