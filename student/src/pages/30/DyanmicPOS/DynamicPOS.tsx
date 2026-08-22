import React, { useEffect, useMemo, useState } from 'react';
import { AppstoreOutlined, CloudOutlined, LaptopOutlined, MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined, NotificationOutlined, ScheduleOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps, TableColumnsType } from 'antd';
import { Alert, Button, Card, Col, ConfigProvider, Layout, Menu, Row, Table } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { CourseData, Semester_AutoPOS } from '../../../components/Semester_AutoPOS';
import Modal from 'antd/lib/modal/Modal';
import Spin from 'antd/es/spin';
import './DynamicPOS.styles.css';
import Typography from 'antd/lib/typography/Typography';
import { useResponsive } from '../../../hooks/useResponsive';
import MobileSiderMenu from '../../../components/sider_DPOS_xs';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Course, SemesterInfo, getDynamicPOS } from '../../../apiMAG/automated_pos';
import { PageTitle } from '../../../components/common/PageTitle/PageTitle';
const { Content, Sider } = Layout;

/*****************************
 * Query Client Configuration
 *****************************/
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,  // Disable automatic refetch on window focus
            retry: 3,                     // Retry failed queries 3 times
            staleTime: 1000 * 60 * 5,     // Data becomes stale after 5 minutes
        },
    },
});

/************************************
 * Priority Calculation Utilities
 ************************************/
/**
 * Assigns course priorities based on score and course ID tie-breaker
 * @param courses - Array of Course objects
 * @returns Courses with priority assignments
 */
const calculatePriorities = (courses: Course[] | undefined): Course[] | undefined => {
    if (!courses) return
    // Clone and sort by score (descending) and courseid (ascending)
    const sorted = [...courses].sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) return b.score - a.score;
        // Secondary sort by course ID for tie-breaker
        return a.courseid - b.courseid;
    });

    // Create priority mapping
    const priorityMap = new Map<number, number>();
    sorted.forEach((course, index) => {
        priorityMap.set(course.courseid, index + 1);
    });

    // Merge priorities with original array order
    return courses.map(course => ({
        ...course,
        priority: priorityMap.get(course.courseid)!
    }));
};
function parseCourse(input: string) {
    // Split the string at the colon
    const [code, name] = input.split(':').map(str => str.trim());

    // Extract the level from the course code (first digit after letters)
    const levelDigit = code.match(/\d/);
    const level = levelDigit ? parseInt(levelDigit[0]) * 100 : null;

    // Return the structured object
    return {
        code: code,
        level: level,
        name: name
    };
}
// Process course data and add unique keys



/************************************
 * Main Component: DynamicPOS
 ************************************/
const DynamicPOS: React.FC = () => {
    /*************************
     * Localization Setup
     *************************/
    const { t } = useTranslation();
    const translateCourseType = (courseType: string) => {
        return t(`courses.course_types.${courseType}` as any) as string;
    };
    const { data, isLoading, isError, error, refetch } = useQuery(
        'Dynamic POS',
        getDynamicPOS,
        { useErrorBoundary: true }
    );
    /*************************
     * Table Column Definitions
     *************************/
    const columns: TableColumnsType<Course> = [
        {
            title: t("customised_pos.priority"),
            key: 'priority',
            dataIndex: 'priority',
            sorter: (a, b) => b.score - a.score,  // Hidden score-based sorting
            render: (priority) => priority || 'Not ranked',
            className: 'priority-column',
            align: 'center',
            width: '5%'
        },
        {
            title: t("customised_pos.course_name"),
            dataIndex: 'coursename',
            key: 'coursename',
            filterSearch: true,
            width: '25%'
        },
        {
            title: t("customised_pos.code"),
            dataIndex: 'coursecode',
            key: 'coursecode',
            width: '5%',
            render: (code: string | null) => code || 'N/A'
        },
        {
            title: t("customised_pos.type"),
            dataIndex: 'coursetype',
            key: 'coursetype',
            width: '5%',
            filters: [
                { text: 'Core', value: t('courses.course_types.Core') },
                { text: 'Major', value: t('courses.course_types.Major') },
                { text: 'Major Elective', value: t('courses.course_types.Major Elective') },
                { text: 'General Requirement', value: t('courses.course_types.General Requirement') },
                { text: 'General Elective', value: t('courses.course_types.General Elective') }
            ],
            onFilter: (value, record) => record.coursetype === value,
            render: (text: string) => translateCourseType(text),
        },
        {
            title: t("customised_pos.credits"),
            dataIndex: 'credits',
            key: 'credits',
            width: '5%',
            sorter: (a, b) => a.credits - b.credits
        },
    ];

    /*************************
     * State Management
     *************************/
    const [semesters, setSemesters] = useState<SemesterInfo[]>(data?.recommendedforRegestration ?? []);

    const [isGeneratedSemesters, setIsGeneratedSemesters] = useState(false);
    const [isFullViewSemesters, setIsFullViewSemesters] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<SemesterInfo | undefined>(data?.recommendedforRegestration[0]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
    const [shouldFlash, setShouldFlash] = useState(false);

    // Calculate total credits for selected semester
    const totalCredits = selectedSemester?.courses.reduce((sum, c) => sum + c.credits, 0) ?? 0;
    const isFirstSemester = selectedSemester === semesters[0];
    const { isTablet, mobileOnly, tabletOnly, desktopOnly, isDesktop } = useResponsive();

    /*************************
     * Handler Functions
     *************************/
    const handleGenerateSemesters = () => {
        setIsLoadingGenerate(true);
        setTimeout(() => {
            setIsLoadingGenerate(false);
            setIsGeneratedSemesters(true);

            setShowConfirmation(false);
            setShouldFlash(true);
            setTimeout(() => setShouldFlash(false), 3000);
        }, 2000);
    };

    const handleFullViewToggle = () => {
        setIsFullViewSemesters(state => !state);
    };

    const handleSemesterSelect = (semester: SemesterInfo) => {
        setSelectedSemester(semester);
        setIsFullViewSemesters(false);
    };

    /*************************
     * Data Fetching & Rendering
     *************************/
    useEffect(() => {
        if (data?.recommendedforRegestration) {
            setSemesters(data.recommendedforRegestration);
            setSelectedSemester(data.recommendedforRegestration[0]);
            setIsGeneratedSemesters(false);
            setShouldFlash(false);

            // Store in sessionStorage instead
            console.log("data.recommendedforRegestration[0].courses", data.recommendedforRegestration[0].courses);
            sessionStorage.setItem(
                "coursesRecommendedDynamic",
                JSON.stringify(data.recommendedforRegestration[0])
            );

        }
    }, [data]);

    /*************************
     * Derived Data Calculations
     *************************/
    const dataWithPrioirities = useMemo(() => {

        if (!data?.recommendedforRegestration?.[0]?.courses) return [];
        sessionStorage.setItem(
            "coursesRecommendedDynamic",
            JSON.stringify(data.recommendedforRegestration[0])
        );
        return calculatePriorities(data.offeredCourses[0].courses)?.map((course: Course) => ({ ...course, key: course.courseid }));
    }, [data?.recommendedforRegestration]); // <-- Only recalculates when courses change

    const processedData = useMemo(() => {
        return dataWithPrioirities?.map((course: Course) =>
        ({
            ...course,
            coursename: parseCourse(course.coursename).name,
            coursecode: parseCourse(course.coursename).code,
        }));
    }, [dataWithPrioirities]);
    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <Spin size="large" tip="Loading Data..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: '32px' }}>
                <Alert
                    message="Connection Error"
                    description={error instanceof Error ? error.message : 'Failed to load advisors'}
                    type="error"
                    showIcon
                    action={
                        <button
                            onClick={() => refetch()}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#1890ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px'
                            }}
                        >
                            Retry
                        </button>
                    }
                />
            </div>
        );
    }

    console.log(data);
    return (
        // <pre>{JSON.stringify(data, null, 2)}</pre>
        <>
            <PageTitle>{t('sider.dynamic_pos')}</PageTitle>
            <Layout style={{ background: '#e7f2f3' }}>

            <Modal
                title={t("customised_pos.modal_title_generate")}
                style={{ marginTop: "50px" }}
                open={showConfirmation}
                onCancel={() => setShowConfirmation(false)}
                footer={[
                    <Button key="back" onClick={() => setShowConfirmation(false)}>
                        {t("customised_pos.cancel")}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleGenerateSemesters}
                        disabled={isLoadingGenerate}
                    >
                        {isLoadingGenerate ? <Spin /> : t("customised_pos.confirm")}
                    </Button>,
                ]}
            >
                <div style={{ textAlign: 'center' }}>
                    {isLoadingGenerate ? (
                        <p>{t("customised_pos.creating_your_optimal_semester_plan")}</p>
                    ) : (
                        <p>{t("customised_pos.modal_text_generate_dynamic")}</p>
                    )}
                </div>
            </Modal>

            {(!isFullViewSemesters && isDesktop && isGeneratedSemesters) && (
                <Sider
                    width={280}
                    style={{ height: 'fitContent', background: '#e7f2f3', borderRight: 0 }}
                >
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['current']}
                        className="semester-navigation-menu"
                        style={{
                            background: '#f5f7fa',
                            borderRight: 0,
                            //marginTop: shouldCollapseSider ? 48 : 0
                        }}
                    >
                        {/* Current Semester Item */}
                        {semesters?.[0] && (
                            <Menu.Item
                                key="current-semester"
                                icon={<ScheduleOutlined />}
                                onClick={() => handleSemesterSelect(semesters[0])}
                                className="current-semester-item"
                            >
                                {semesters[0].semester == "Fall" ? t("welcome.semester_fall") : semesters[0].semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} {semesters[0].year}
                            </Menu.Item>
                        )}

                        {/* Generated Semesters Submenu */}
                        {isGeneratedSemesters && (
                            <SubMenu
                                key="generated-semesters"
                                icon={<AppstoreOutlined />}
                                title={t("customised_pos.generated_semesters")}
                                className={`generated-semesters-submenu ${shouldFlash ? 'flash-highlight' : ''}`}
                            >
                                {semesters?.slice(1).map((sem, index) => (
                                    <Menu.Item
                                        key={`generated-semester-${index}`}
                                        onClick={() => handleSemesterSelect(sem)}
                                        icon={<ScheduleOutlined style={{ fontSize: "0.85rem" }} />}
                                        className="generated-semester-item"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        {sem.semester == "Fall" ? t("welcome.semester_fall") : sem.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} {sem.year}
                                    </Menu.Item>
                                ))}
                            </SubMenu>
                        )}
                    </Menu>
                </Sider>
            )}
            {(mobileOnly || tabletOnly) && (
                <MobileSiderMenu
                    semesters={semesters}
                    handleSemesterSelect={handleSemesterSelect}
                    isGeneratedSemesters={isGeneratedSemesters}
                    shouldFlash={shouldFlash}
                    title={t("customised_pos.generated_semesters")}
                />
            )}



            <Layout style={{ background: '#f5f7fa' }}>

                <div style={{
                    display: 'flex',
                    justifyContent: mobileOnly ? 'flex-start' : 'flex-end',
                    width: "100%",

                    marginTop: mobileOnly ? "5px" : ""
                }}>
                    {isGeneratedSemesters && (
                        <Button
                            style={{

                                width: mobileOnly ? '190px' : '30%',
                                marginRight: "10px",
                                marginTop: "10px",
                                fontSize: mobileOnly ? '0.6rem' : '1rem'
                            }}
                            className={shouldFlash ? 'flash-highlight' : ''}
                            onClick={handleFullViewToggle}
                        >
                            {isFullViewSemesters ? t("customised_pos.collapse_view") : t("customised_pos.show_full_timeline")}
                        </Button>
                    )}
                   
                </div>

                    <Content style={{ padding: '12px', margin: 0, marginTop: mobileOnly ? "36px" : "" }}>
                        <Row justify="space-between" style={{ width: "100%", paddingTop: "10px"}}>
                            <Col md={12} lg={12} style={{ width: "100%" }}>
                                {(!isFullViewSemesters && isFirstSemester) &&
                                    <Typography
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 600,
                                            marginBottom: "10px",
                                            color: '#084C61',
                                            letterSpacing: '0.5px',

                                        }}
                                    >
                                        {t("customised_pos.courses_eligible_for_registration_below")}
                                    </Typography>
                                }
                            </Col>
                            <Col style={{ width: "100%", display: "flex", justifyContent: "end", alignContent: "end", paddingBottom: "10px" }} md={12} lg={12} >
                                {!isGeneratedSemesters && (
                                    <Button
                                        onClick={() => setShowConfirmation(true)}
                                        style={{
                                            background: '#038b94',
                                            color: 'white',

                                            width: "fit-content",
                                         
                                            flexWrap: "wrap",
                                            fontSize: mobileOnly ? '0.6rem' : '1rem',
                                           
                                        }}
                                    >
                                        {t("customised_pos.generate_remaining_semesters")}
                                    </Button>
                                )}
                            </Col>
                        </Row>
                   
                    {isFullViewSemesters ? (
                        <div style={{ margin: '0 auto' }}>
                            <Row gutter={[50, 48]}>
                                    {semesters?.map((semester, index) => {
                         
                                    const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
                                    return (
                                        <Col key={index} xs={24} md={12} lg={12}>
                                            <SemesterDetailView
                                                title={`Best Plan for ${semester?.semester == "Fall" ? t("welcome.semester_fall") : semester?.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} - ${semester.year}`}
                                                credits={totalCredits}
                                                courseList={semester.courses}
                                                Upcoming={index === 0 ? t("customised_pos.upcoming") : ""}
                                            />

                                        </Col>);
                                })}
                            </Row>
                        </div>
                    ) : selectedSemester ? (
                        (() => {
                            // 1. Derive once, use strict equality:

                            
                            return (
                                <Row gutter={[16, 16]}>
                                    {isFirstSemester ? (
                                        <>
                                            <Col span={16} xs={24} md={24} lg={24} xl={16} >

                                                <Table<Course>
                                                    components={{
                                                        header: {
                                                            cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                                                                <th
                                                                    {...props}
                                                                    style={{
                                                                        backgroundColor: '#e3faf8',
                                                                        color: '#000',
                                                                    }}
                                                                />
                                                            ),
                                                        },
                                                    }}

                                                    columns={columns}
                                                    dataSource={processedData}
                                                    rowKey="courseid"
                                                    bordered
                                                    pagination={false}
                                                    scroll={{ x: 800 }}
                                                    locale={{ emptyText: t("customised_pos.no_courses_available") }}
                                                    onChange={(pagination, filters, sorter) => {
                                                        console.log('Current sort:', sorter);
                                                        console.log('Active filters:', filters);
                                                    }}
                                                />
                                            </Col>
                                            <Col span={8} xs={24} md={24} lg={24} xl={8}>
                                                <SemesterDetailView
                                                    title={`${t("customised_pos.Best_title")} ${semesters[0].semester == "Fall" ? t("welcome.semester_fall") : semesters[0].semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")}  | ${semesters[0].year}`}
                                                    credits={totalCredits}
                                                    courseList={selectedSemester.courses}
                                                    Upcoming={t("customised_pos.upcoming")}
                                                    height="fit-content"
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col xs={24} md={24} lg={16} style={{ height: "100%", width: "100%" }}>
                                                <SemesterDetailView
                                                        title={`${selectedSemester.semester == "Fall" ? t("welcome.semester_fall") : selectedSemester.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} - ${selectedSemester?.year}`}
                                                    credits={totalCredits}
                                                    courseList={selectedSemester.courses}
                                                />
                                            </Col>
                                            {isTablet && (
                                                <Col xs={24} md={24} lg={8} style={{ height: "100%", width: "100%" }}>
                                                        <Row align="top" style={{marginLeft:"40px"} } >
                                                        <Col>
                                                                <p className="ahmadRequest">{`${selectedSemester.semester == "Fall" ? t("welcome.semester_fall") : selectedSemester.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")}`}</p>
                                                               
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            )}

                                        </>
                                    )}
                                </Row>
                            );
                        })()
                    ) : null}

                </Content>

            </Layout>
        </Layout >
        </>
    );
};



const SemesterDetailView = (courseData: CourseData) => (

    <>
        <Semester_AutoPOS courseData={courseData} />
    </>

);
const App = () => (
    <QueryClientProvider client={queryClient}>
        <DynamicPOS />
    </QueryClientProvider>
);

export default App;

