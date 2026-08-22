import React, { useEffect, useMemo, useState } from 'react';
import { AppstoreOutlined, LaptopOutlined, MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined, NotificationOutlined, ScheduleOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps, TableColumnsType } from 'antd';
import { Button, Card, Col, ConfigProvider, Layout, Menu, Row, Table, notification } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { CourseData, Semester_AutoPOS } from '../../../components/Semester_AutoPOS';
import Modal from 'antd/lib/modal/Modal';
import Spin from 'antd/es/spin';
import './CustomizedPOS.styles.css';
import Typography from 'antd/lib/typography/Typography';
import { useResponsive } from '../../../hooks/useResponsive';
import MobileSiderMenu from '../../../components/sider_DPOS_xs';
import { Checkbox } from '../../../components/common/BaseCheckbox/BaseCheckbox.styles';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from 'react-query';
import { ChosenCourse, Course, submitSelectedCourses } from '../../../apiMAG/customized_pos';
import { RegistrationData, SemesterInfo, getDynamicPOS } from '../../../apiMAG/automated_pos';
import Banner from '../../../components/Banner';
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



//create priorities based on score
const calculatePriorities = (courses: Course[]): Course[] => {
    // 1. Clone and sort by score (descending) and courseid (ascending for tie-breaker)
    const sorted = [...courses].sort((a, b) => {
        // First sort by score descending
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // For equal scores, sort by courseid ascending
        return a.courseid - b.courseid;
    });

    // 2. Assign sequential priorities
    const priorityMap = new Map<number, number>();
    sorted.forEach((course, index) => {
        // Priority starts at 1 and increments by 1 for each course
        priorityMap.set(course.courseid, index + 1);
    });

    // 3. Merge priorities while preserving original order
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

const CustomizedPOS: React.FC = () => {
    const { t } = useTranslation();

    const { data } = useQuery(
        'Dynamic POS',
        getDynamicPOS,
        {
            useErrorBoundary: true,

            onSuccess: (apiData) => {

            }
        }
    );
    const parsedCourses = useMemo(() => {
        return data?.offeredCourses[0]?.courses || [];
    }, [data]);



    const getSemesterTranslation = (semester: string) => {
        switch (semester) {
            case "Fall":
                return t("welcome.semester_fall");
            case "Spring":
                return t("welcome.semester_spring");
            case "Summer":
                return t("welcome.semester_summer");
            default:
                return "";
        }
    };
    const translateCourseType = (courseType: string) => {
        return t(`courses.course_types.${courseType}` as any) as string;
    };
    const { mutate, isLoading, isError } = useMutation(
        (selectedCourses: ChosenCourse[]) =>
            submitSelectedCourses({ chosenCoursesIds: selectedCourses }),
        {
            onSuccess: (data: RegistrationData) => {

                setSemesters(data.recommendedforRegestration);
                setIsGeneratedSemesters(true);
                setShouldFlash(true);
                setTimeout(() => setShouldFlash(false), 3000);
            },
            onError: (error: Error) => {

            }
        }
    );



    const columns: TableColumnsType<Course> = [
        {
            title: t("customised_pos.select"),
            key: 'select',
            dataIndex: 'select',
            width: '5%',
            align: 'center',
            render: (_, record: Course) => {
                const currentCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

                return (
                    <Checkbox
                        checked={selectedCourses.some(c => c.courseid === record.courseid)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                // Check credit limit before adding
                                if (currentCredits + record.credits > 20) {
                                    setShowCreditWarning(true);
                                    return;
                                }
                                setSelectedCourses(prev => [...prev, record]);
                            } else {
                                setSelectedCourses(prev =>
                                    prev.filter(c => c.courseid !== record.courseid)
                                );
                            }
                        }}
                    />
                );
            }
        },
        {
            title: t("customised_pos.priority"),
            key: 'priority',
            dataIndex: 'priority',
            // Original score remains hidden but used for sorting
            sorter: (a, b) => b.score - a.score, // Maintain score-based sorting
            render: (priority) => priority || 'Not ranked',
            // Visual styling for priority
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
            render: (code: string | null) => code || 'N/A' // Handle null values
        },
        {
            title: t("customised_pos.type"),
            dataIndex: 'coursetype',
            key: 'coursetype',
            width: '5%',
            filters: [
                {
                    text: 'Core', value: t('courses.course_types.Core')
                },
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
    const [semesters, setSemesters] = useState<SemesterInfo[]>([]);
    const [isGeneratedSemesters, setIsGeneratedSemesters] = useState(false);
    const [isFullViewSemesters, setIsFullViewSemesters] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<SemesterInfo>();
    const [selectedCourses, setSelectedCourses] = useState<ChosenCourse[]>([]);
    const [showCreditWarning, setShowCreditWarning] = useState(false);
    const totalCredits =
        selectedSemester?.courses.reduce((sum, c) => sum + c.credits, 0) ?? 0;
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
    const [shouldFlash, setShouldFlash] = useState(false);

    const handleGenerateSemesters = () => {
        // Validate selected courses first
        if (selectedCourses.length === 0) {
            notification.error({
                message: "",
                description: "Please select at least one course before proceeding.",
                placement: 'topRight',
            });
            return;
        }

        // Start loading state
        setIsLoadingGenerate(true);
        const sanitizedCourses = selectedCourses.map(({ key, priority, ...rest }) => rest);

        // Execute the mutation
        mutate(sanitizedCourses, {
            onSuccess: (generatedSemesters) => {

                setSemesters(generatedSemesters.recommendedforRegestration);
                setSelectedSemester(generatedSemesters.recommendedforRegestration[0]);
                setIsGeneratedSemesters(true);
                setShouldFlash(true);
                setTimeout(() => setShouldFlash(false), 3000);


                const { semester, year } = generatedSemesters.recommendedforRegestration[0];
                sessionStorage.setItem(
                    "coursesRecommendedCustomized",
                    JSON.stringify({
                        semester,
                        year,
                        courses: selectedCourses,
                    })
                );
            },
            onError: (error) => {
                console.error("Generation failed:", error);
            },
            onSettled: () => {
                // Always runs after success/error
                setShouldFlash(true);
                setTimeout(() => setShouldFlash(false), 3000);
                setIsLoadingGenerate(false);
                setShowConfirmation(false);
            },
        });
    };

    const handleFullViewToggle = () => {
        setIsFullViewSemesters(state => !state);
    };


    const handleSemesterSelect = (semester: SemesterInfo) => {

        setSelectedSemester(semester);
        const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
        setIsFullViewSemesters(false);
    };
    const isFirstSemester = selectedSemester === semesters[0];
    const { isTablet, mobileOnly, tabletOnly, desktopOnly, isDesktop } = useResponsive();
    const totalCreditsSelected = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
    const dataWithPriorities = useMemo(() => {
        if (!parsedCourses || isLoading) return [];
        return calculatePriorities(parsedCourses)?.map((course: Course) => ({
            ...course,
            key: course.courseid
        }));
    }, [parsedCourses, isLoading]);

    const processedData = useMemo(() => {
        return dataWithPriorities?.map((course: Course) =>
        ({
            ...course,
            coursename: parseCourse(course.coursename).name,
            coursecode: parseCourse(course.coursename).code,
        }));
    }, [dataWithPriorities]);


    return (
        <>
            <PageTitle>{t('sider.customized_pos')}</PageTitle>
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
                    <div>
                        {isLoadingGenerate ? (
                            <p>{t("customised_pos.creating_your_optimal_semester_plan")}</p>
                        ) : (
                            <p>{t("customised_pos.modal_text_generate_customized")}<strong style={{ fontWeight: "750", fontStyle: "italic" }}>{t("customised_pos.modal_text_generate_customized1")}</strong>{t("customised_pos.modal_text_generate_customized2")}</p>
                        )}
                    </div>
                </Modal>
                <Modal
                    title="Credit Limit Exceeded"
                    open={showCreditWarning}
                    onOk={() => setShowCreditWarning(false)}
                    onCancel={() => setShowCreditWarning(false)}
                >
                    <p>{t("customised_pos.modal_max1")} {totalCreditsSelected} credits.</p>

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
                                            {`${sem.semester === "Fall" ? "Fall" : sem.semester === "Spring" ? "Spring" : "Summer"} ${sem.year}`}

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
                                    marginTop: "10px",
                                    marginRight: "20px",
                                    fontSize: mobileOnly ? '0.6rem' : '1rem'
                                }}
                                className={shouldFlash ? 'flash-highlight' : ''}
                                onClick={handleFullViewToggle}
                            >
                                {isFullViewSemesters ? t("customised_pos.collapse_view") : t("customised_pos.show_full_timeline")}
                            </Button>
                        )}

                    </div>

                    <Content style={{ padding: '24px', margin: 0, marginTop: mobileOnly ? "36px" : "" }}>
                        <Row justify="space-between" style={{ width: "100%" }}>
                            <Col md={12} lg={12} style={{ width: "100%" }}>
                                {(!isFullViewSemesters && isFirstSemester && !isGeneratedSemesters) &&
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
                                <Row gutter={[75, 48]}>
                                    {semesters?.map((semester, index) => {
                                        const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
                                        return (
                                            <Col key={index} xs={24} md={12} lg={12}>
                                                <SemesterDetailView
                                                    title={`${semester?.semester == "Fall" ? t("welcome.semester_fall") : semester?.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} - ${semester.year}`}
                                                    credits={totalCredits}
                                                    courseList={semester.courses}
                                                    Upcoming={index === 0 ? t("customised_pos.upcoming") : ""}
                                                />

                                            </Col>);
                                    })}
                                </Row>
                            </div>
                        ) : (
                            (() => {

                                return (

                                    <Row gutter={[16, 16]}>
                                        {!isGeneratedSemesters ? (
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
                                                        locale={{
                                                            emptyText: (
                                                                <div style={{ padding: 24 }}>
                                                                    <Spin tip="Loading courses..." />
                                                                </div>
                                                            )
                                                        }}
                                                        onChange={(pagination, filters, sorter) => {
                                                            console.log('Current sort:', sorter);
                                                            console.log('Active filters:', filters);
                                                        }}
                                                    />
                                                </Col>
                                                <Col span={8} xs={24} md={24} lg={24} xl={8}>

                                                    <SemesterDetailView
                                                        title={`${t("customised_pos.title")} ${getSemesterTranslation(selectedSemester?.semester ?? "")} | ${selectedSemester?.semester ?? 'Fall 2025-2026'}`}
                                                        credits={totalCreditsSelected}
                                                        courseList={selectedCourses}

                                                        extraInfo={
                                                            <div style={{ color: totalCreditsSelected > 20 ? 'red' : 'inherit' }}>
                                                                {totalCreditsSelected}/20 {t("customised_pos.credits_selected")}
                                                            </div>
                                                        }
                                                    />
                                                </Col>
                                            </>
                                        ) : (
                                            <>

                                                <Col xs={24} md={24} lg={16} style={{ height: "100%", width: "100%" }}>
                                                    <SemesterDetailView

                                                        title={`${selectedSemester?.semester == "Fall" ? t("welcome.semester_fall") : selectedSemester?.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")} - ${selectedSemester?.year}`}
                                                        credits={totalCredits}
                                                        courseList={selectedSemester?.courses}
                                                    />
                                                </Col>
                                                {isTablet && (
                                                    <Col xs={24} md={24} lg={8} style={{ height: "100%", width: "100%" }}>
                                                        <Row align="top" style={{ marginLeft: "40px" }} >
                                                            <Col>
                                                                <p className="ahmadRequest">{`${selectedSemester?.semester == "Fall" ? t("welcome.semester_fall") : selectedSemester?.semester == "Spring" ? t("welcome.semester_spring") : t("welcome.semester_summer")}`}</p>

                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                )}
                                            </>

                                        )}

                                    </Row>
                                );
                            })()
                        )}

                    </Content>

                </Layout>
            </Layout >
            {isGeneratedSemesters && (<Row><Banner text={'Want a new selection? Just refresh the page!'} color={{ background: '#e7f2f3', icon: '#038b94' }} ></Banner></Row>)}
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
        <CustomizedPOS />
    </QueryClientProvider>
);

export default App;
