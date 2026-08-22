import React, { useEffect, useState } from 'react';
import { Row, Col, Tag, Typography, Collapse, Divider } from 'antd';
import { BookOutlined, CalendarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FormOutlined, LockOutlined, MinusCircleOutlined, UnlockOutlined, WarningOutlined } from '@ant-design/icons';
import CourseCard from './CourseCard';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Course, DashboardData } from '../apiMAG/Dashboard';
import { countReset } from 'console';
import { TFunction } from 'i18next';

const { Panel } = Collapse;
const { Text } = Typography;
const gradeColorMap: Record<string, string> = {
    'A+': '#389e0d',  // Ant green-6
    'A': '#52c41a',   // Ant green-5
    'A-': '#73d13d',  // Ant green-4
    'B+': '#1890ff',  // Ant blue-6
    'B': '#40a9ff',   // Ant blue-5
    'B-': '#69c0ff',  // Ant blue-4
    'C+': '#ffc53d',  // Ant gold-5
    'C': '#ffd666',   // Ant gold-4
    'C-': '#fff1b8',  // Ant gold-2
    'D': '#ff9c6e',   // Ant volcano-4
    'F': '#cf1322',   // Ant red-6
    'W': '#595959',   // Ant gray-8
    '': '#8c8c8c'     // Ant gray-6 for ungraded
};
const getGradeColor = (grade?: string | null): string => {
    if (!grade) return gradeColorMap[''];
    return gradeColorMap[grade.trim().toUpperCase()] || gradeColorMap[''];
};

const semesterMap: Record<string, string> = {
    'FALL': 'semester_fall',
    'SPRING': 'semester_spring',
    'SUMMER': 'semester_summer',
    'FALL-SPRING': 'semester_fall_spring',  // Combined key
    'SPRING-FALL': 'semester_spring_fall',  // Reverse order
    'SUMMER-FALL': 'semester_summer_fall',
    'FALL-SUMMER': 'semester_fall_summer',
    '': 'unknown_semester'
};

const getCombinedSemesterTrans = (sem: string | null | undefined, t: TFunction): string => {
    const normalizedSem = sem?.trim().toUpperCase() || '';

    // Handle combined semesters first
    if (normalizedSem.includes('-')) {
        const [first, second] = normalizedSem.split('-');

        const firstPart = t(`welcome.${semesterMap[first] || 'unknown_semester'}`);
        const secondPart = t(`welcome.${semesterMap[second] || 'unknown_semester'}`);

        return `${firstPart} - ${secondPart}`;
    }

    // Handle single semesters
    return t(`welcome.${semesterMap[normalizedSem] || 'unknown_semester'}`);
};

interface CoursesListProps {
    data?: DashboardData; // Properly type the data prop
}
const CourseLists: React.FC<CoursesListProps> = ({ data }) => {
    useEffect(() => {
       
    }, [data]);
    const [loading] = useState<boolean>(true);
    const { t } = useTranslation();

    return (
        <Row gutter={[16, 16]} justify="center" style={{ width: "100%" }}>
            {/* Completed Courses */}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <HoverableDiv>
                    <Collapse style={{ backgroundColor: "#e3faf8" }} expandIconPosition="end">
                        <Panel style={{ paddingTop: "7px", paddingBottom: "7px" }}
                            key="completed"
                            header={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Row align="middle" gutter={8}>
                                            <Col>
                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            </Col>
                                            <Col>
                                                <Text strong>{t("courses.courses_lists.completed_courses")}</Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Tag color="geekblue">{data?.courses_destribution_by_status?.Passed.course_count}</Tag>
                                    </Col>
                                </Row>
                            }
                        >
                            <div style={{
                                height: '640px',  // Adjust this value based on your card height (4 cards * card height)
                                overflowY: 'auto',
                                paddingRight: '8px'  // Prevents scrollbar from overlapping content
                            }}>
                                {data?.courses_destribution_by_status?.Passed?.courses?.map((course) => (
                                    <CourseCard
                                        key={`passed-${course.courseid}-${course.semestertaken}`}
                                        courseName={`${course.coursename}`}
                                        grade={course.grade || t('common.no_grade')}
                                        gradeColor={getGradeColor(course.grade)}
                                        semester={getCombinedSemesterTrans(course.semestertaken.toUpperCase(), t)}
                                        credits={course.credits ?? 0}
                                        textBottom={t(`courses.course_types.${course.coursetype}`)}
                                    />
                                ))}


                            </div>
                        </Panel>
                    </Collapse>
                </HoverableDiv>
            </Col>

            {/* Registered Courses */}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <HoverableDiv>
                    <Collapse style={{ backgroundColor: "#e3faf8" }} expandIconPosition="end">

                        <Panel style={{ paddingTop: "7px", paddingBottom: "7px" }}
                            key="registered"
                            header={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Row align="middle" gutter={8}>
                                            <Col>
                                                <FormOutlined style={{ color: '#038b94' }} />
                                            </Col>
                                            <Col>
                                                <Text strong>{t("courses.courses_lists.currently_registered")}</Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Tag color="geekblue">{data?.courses_destribution_by_status?.Registered.course_count}</Tag>
                                    </Col>
                                </Row>
                            }
                        >

                            <div style={{
                                maxHeight: '686px',  // Adjust this value based on your card height (4 cards * card height)
                                overflowY: 'auto',
                                paddingRight: '8px'  // Prevents scrollbar from overlapping content
                            }}>

                                {data?.courses_destribution_by_status?.Registered?.courses?.map((course) => (
                                    <CourseCard
                                        key={`registered-${course.courseid}-${course.semestertaken}`}
                                        gradeColor="#038b94"
                                        courseName={`${course.coursename}`}

                                        semester={getCombinedSemesterTrans(course.semestertaken.toUpperCase(), t)}
                                        credits={course.credits ?? 0}
                                        textBottom={t(`courses.course_types.${course.coursetype}`)}
                                        iconBottom={<CalendarOutlined />}
                                    />
                                ))}
                            </div>
                        </Panel>
                    </Collapse></HoverableDiv>
            </Col>

            {/* Remaining Courses */}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <HoverableDiv>
                    <Collapse style={{ backgroundColor: "#e3faf8" }} expandIconPosition="end">
                        <Panel style={{ paddingTop: "7px", paddingBottom: "7px" }}
                            key="remaining"
                            header={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Row align="middle" gutter={8}>
                                            <Col>
                                                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                                            </Col>
                                            <Col>
                                                <Text strong>{t("courses.courses_lists.remianing_failed_courses")}</Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Tag color="geekblue">{(data?.courses_destribution_by_status?.Failed?.course_count || 0) + (data?.courses_destribution_by_status?.WithDrawn?.course_count || 0) + (data?.remaining_courses.length || 0)}</Tag>
                                    </Col>
                                </Row>
                            }
                        >
                            <Divider orientation="left" style={{ borderColor: '#038b94' }}>{t("courses.credits.remaining")}</Divider>
                            <div style={{
                                height: '470px', // Adjust this value based on your card height (4 cards * card height)
                                overflowY: 'auto',
                                paddingRight: '8px', // Prevents scrollbar from overlapping content
                                marginBottom: "20px"
                            }}>
                                {data?.remaining_courses?.map((course) => {
                                    console.log("rem ", course.semester.toUpperCase());
                                    return (
                                        <CourseCard
                                            courseName={course.coursename}
                                            gradeColor="transparent"
                                            semester={getCombinedSemesterTrans(course.semester.toUpperCase(), t)}
                                            credits={course.credits}
                                            textBottom={course.canregister ? t("courses.register_status.can_register") : t("courses.register_status.cannot_register")}
                                            iconBottom={course.canregister ? <UnlockOutlined style={{ color: "green" }} /> : <LockOutlined style={{ color: "red" }} />}
                                            canRegister={course.canregister}
                                        />)
                                })}


                            </div>
                            <Divider orientation="left" style={{ borderColor: '#038b94' }}>{t("courses.credits.failed_withdrawn")}</Divider>
                            <div style={{
                                maxHeight: '300px', // Adjust this value based on your card height (4 cards * card height)
                                overflowY: 'auto',
                                paddingRight: '8px'  // Prevents scrollbar from overlapping content
                            }}>
                                {(!data?.courses_destribution_by_status?.Failed?.courses && !data?.courses_destribution_by_status?.WithDrawn?.courses) &&
                                    <h4 style={{ padding: "5px", alignContent: "center", alignItems: "center" }}>No Failed/Withdrawn Courses, You are doing great!!</h4>
                                }
                                {data?.courses_destribution_by_status?.Failed?.courses?.map((course) => (
                                    <CourseCard
                                        courseName={course.coursename}

                                        semester={`${getCombinedSemesterTrans(course.semester.toUpperCase(), t)} - ${course.yeartaken}`}
                                        credits={course.credits}
                                        textBottom={t("courses.failed_withdrawn_status.status_f")}
                                        textColor="red"
                                        iconBottom={< WarningOutlined style={{ color: "red" }} />}
                                        borderC="red"
                                        grade="F"
                                        gradeColor="red"
                                    />
                                ))}
                                {data?.courses_destribution_by_status?.WithDrawn?.courses?.map((course) => (
                                    <CourseCard
                                        courseName={course.coursename}

                                        semester={`${getCombinedSemesterTrans(course.semester.toUpperCase(), t)} - ${course.yeartaken}`}
                                        credits={course.credits}
                                        textBottom={t("courses.failed_withdrawn_status.status_w")}
                                        textColor="grey"
                                        iconBottom={<MinusCircleOutlined style={{ color: "grey" }} />}
                                        borderC="grey"
                                        grade="W"
                                        gradeColor="grey"

                                    />
                                ))}


                            </div>
                        </Panel>

                    </Collapse>
                </HoverableDiv>
            </Col>
        </Row>
    );
};
const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  border-radius:20%;
  transform: scale(1);
  box-shadow: none;
      width: 100%;
  &:hover {
   
   box-shadow: 0 5px 10px rgba(3, 139, 148, 0.3);
  }
`;
export default CourseLists;

