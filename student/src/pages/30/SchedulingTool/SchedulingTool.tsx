import { Row, Col, Typography, Space, Card, Form, Checkbox, Collapse, Segmented, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CalendarOutlined, CaretRightOutlined, DownloadOutlined, ImportOutlined, LoadingOutlined, SaveOutlined, ToolOutlined } from '@ant-design/icons';
import { useResponsive } from '../../../hooks/useResponsive';
import AcademicCalendar from '../../../components/AcademicCalendar';
import PlannerTypeModal from '../../../components/ PlannerTypeModal';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/common/PageTitle/PageTitle';
import IconButton from '../../../components/IconButton';
import Banner from '../../../components/Banner';
import './SchedulingTool.styles.css';
import EmptyCourseCard from '../../../components/EmptyCourseCard';
import { ConflictModal } from '../../../components/TimeConflictModal';
import { AddBreakModal } from '../../../components/AddBreakModal';
import BreaksCard from '../../../components/BreaksCard';
import CourseCard from '../../../components/CourseOfferingCard';
import styled from 'styled-components';
import { CourseScheduleOutput, CourseSchedulePreferences, GetSmartSchedule, ScheduleRequestInput, ScheduledSection, Section, postCourseSchedule } from '../../../apiMAG/scheduling_tool';
import { useMutation } from 'react-query';
import { QueryClient, QueryClientProvider } from 'react-query';
import Spin from 'antd/es/spin';
import DaysButton from '../../../components/DaysButton';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { translateSchedule } from '../../../constants/scheduleTranslations';
// ====================== Interfaces ======================
/** 
 * Represents a calendar event with scheduling details
 * Used for both courses and breaks in the calendar
 */
export interface CalendarEvent {
    title: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    color?: string;
    borderColor?: string;
    professor?: string;
}

/**
 * Defines course structure with multiple section offerings
 * Contains core course information and available sections
 */


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,  // Disable automatic refetch on window focus
            retry: 3,                     // Retry failed queries 3 times
            staleTime: 1000 * 60 * 5,     // Data becomes stale after 5 minutes
        },
    },
});

const SchedulingTool = () => {
    const { t } = useTranslation();
    const printRef =useRef(null);

    const handleDownloadPdf = async () => {
        const element = printRef.current;
        if (!element) {
            return;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
        });
        const data = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: "a4",
        });

        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("examplepdf.pdf");
    };
    const [savedEvents, setSavedEvents] = useState<CalendarEvent[]>([]);

    // 2. Load saved events on component mount
    useEffect(() => {
        const saved = localStorage.getItem('savedCalendarEvents');
        if (saved) {
            setSavedEvents(JSON.parse(saved));
        }
    }, []);

    // 3. Save button handler
    const handleSaveCalendar = () => {
        const currentEvents = isGenerateSchedule
            ? [...calendarEventsState, ...breaks]
            : [...calendarEventsToBeAdded, ...breaks];

        localStorage.setItem('savedCalendarEvents', JSON.stringify(currentEvents));
        setSavedEvents(currentEvents);
    };


    // ====================== State Management ======================
    // Schedule constraints and breaks
    const [breaks, setBreaks] = useState<CalendarEvent[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    // Modal visibility states
    const [isModalBreaksVisible, setIsModalBreaksVisible] = useState(false);
    const [plannerTypeModalVisible, setPlannerTypeModalVisible] =
        useState<boolean>(false);
    const [courseModalVisible, setCourseModalVisible] = useState(false);

    // UI/UX states
    // 1) Grab whatever is in sessionStorage (or `""` if nothing)


    // 2) Seed your two useStates
    const [plannerType, setPlannerType] = useState<"Manual" | "Smart" | "">("Manual");
    const [editingPlanner, setEditingPlanner] = useState(false);
    const [shouldFlash, setShouldFlash] = useState(false);
    const [shouldFlashGenerate, setShouldFlashGenerate] = useState(false);

    // Conflict detection states
    const [conflictingEvent, setConflictingEvent] = useState<CalendarEvent | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingBreak, setPendingBreak] = useState<CalendarEvent | null>(null);
    const [pendingSection, setPendingSection] = useState<{ courseId: string; sectionId: string } | null>(null);

    // Course selection state
    const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});
    const [courseOfferings, setCourseOfferings] = useState<CourseScheduleOutput[]>([]);
    const [coursesOfferingsInput, setCoursesOfferingsInput] = useState<any[]>([]);
    const [sourceType, setSourceType] = useState<"CUS" | "AUTO" | "">("");

    // ====================== Core Functionality ======================

    /** Convert course sections to calendar events */
    const calendarEventsToBeAdded = coursesOfferingsInput.flatMap(course => {
        const selectedSectionId = selectedSections[course.id];
        const section = course.sections.find((s: any) => s.id === selectedSectionId);
        return section ? [{
            title: course.code,
            startTime: section.startTime,
            endTime: section.endTime,
            daysOfWeek: section.daysOfWeek,
            professor: section.instructor,
            color: 'rgba(185, 250, 227, 0.6)'
        }] : [];
    });
    const {
        mutate,
        data: scheduleData,    // <-- this is CourseScheduleOutput[] | undefined
        isLoading,
       
    } = useMutation<CourseScheduleOutput[], Error, ScheduleRequestInput>(

        payload => postCourseSchedule(payload),
        {
            mutationKey: ['courses-offerings'],  //  Add unique key
            onSuccess: (data: CourseScheduleOutput[]) => {
                setCourseOfferings(data);
                sessionStorage.setItem('generatedSchedule', JSON.stringify(data));
            },
            onError: (error: Error) => {
                console.error('Schedule generation failed:', error);
                notification.error({
                    message: t('common.error'),
                    description: t('scheduling.generation_failed'),
                });
            }
        }
    );
    useEffect(() => {
        if (!scheduleData) return;

        const transformed = scheduleData.map(course => ({
            id: parseCourse(course.coursename).code.toLowerCase(),
            code: parseCourse(course.coursename).code.replace(/^([A-Za-z]+)(\d+)$/, '$1 $2'),
            name: course.coursename,
            credits: course.credits,
            sections: course.sections.map((section, indx) => {
                const days = section.days.split(',').join('/');
                return {
                    id: `section${indx + 1}`,
                    name: `Section ${indx + 1}`,
                    schedule: `${days}: ${section.startTime.slice(0, 5)}–${section.endTime?.slice(0, 5)}`,
                    daysOfWeek: section.daysOfWeek,
                    startTime: section.startTime.slice(0, 5),
                    endTime: section.endTime?.slice(0, 5),
                    instructor: section.instructor,
                };
            }),
        }));

        setCoursesOfferingsInput(transformed);
        const initialSelectedSections: Record<string, string[]> = {};
        transformed.forEach(course => {
            initialSelectedSections[course.id] = course.sections.map(section => section.id);
        });
        setSelectedSectionsSmart(initialSelectedSections);

        console.log("coursesOfferings", transformed);
        console.log("coursesOfferings", transformed);
    }, [scheduleData]);


    useEffect(() => {
        // Reset all scheduling-related states when planner type changes
        setSelectedSections({});
        setBreaks([]);
        setPendingBreak(null);
        setPendingSection(null);
        if (plannerType == 'Smart') {
            setShouldFlashGenerate(true);
            setTimeout(() => setShouldFlashGenerate(false), 3000);
        }

    }, [plannerType]);
    /** Handle section selection with conflict checking */
    const handleSectionChange = (courseId: string, sectionId: string) => {
        const course = coursesOfferingsInput.find(c => c.id === courseId);
        const section = course?.sections.find((s: any) => s.id === sectionId);

        if (!section) return;

        // Create calendar event for the new section
        const newEvent: CalendarEvent = {
            title: course!.code,
            startTime: section.startTime,
            endTime: section.endTime,
            daysOfWeek: section.daysOfWeek,
            professor: section.instructor
        };

        // Check for conflicts with existing events
        const conflict = checkForConflicts(newEvent, [...calendarEventsToBeAdded, ...breaks]);

        if (conflict) {
            setConflictingEvent(conflict);
            setPendingSection({ courseId, sectionId });
            setShowConflictModal(true);
        } else {
            // No conflict - update immediately
            setSelectedSections(prev => ({
                ...prev,
                [courseId]: sectionId
            }));
        }

    };

    // ====================== Event Handlers ======================
    /** UI interaction handlers */
    const handleFlashButton = () => {
        setShouldFlash(true);
        setTimeout(() => setShouldFlash(false), 3000);
    };
    const handlePlannerSelect = (type: "Manual" | "Smart") => {
        setPlannerType(type);
        setPlannerTypeModalVisible(false);
        localStorage.removeItem('savedCalendarEvents');
        setSavedEvents([]);
    };
    const getStoredScheduleInput = (
        type: 'CUS' | 'AUTO'
    ): ScheduleRequestInput | null => {
        const key =
            type === 'CUS'
                ? 'coursesRecommendedCustomized'
                : 'coursesRecommendedDynamic';

        const raw = sessionStorage.getItem(key);

        if (!raw) {
            notification.error({
                message: `Could not find ${type === 'CUS' ? 'custom' : 'automated'} courses data. Make sure you generated a ${type === 'CUS' ? 'custom' : 'automated'} plan of study to continue with this choice`
                
            });
            return null;
        }

        try {
            return JSON.parse(raw) as ScheduleRequestInput;
        } catch (err) {
            console.error('Parsing error:', err);
            notification.error({
                message: 'Invalid Session Data',
                description: `Failed to parse stored ${type === 'CUS' ? 'custom' : 'automated'} schedule data`,
            });
            return null;
        }
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
    const handleSourceSelect = (type: 'CUS' | 'AUTO') => {
        setSourceType(type);
        const payload = getStoredScheduleInput(type);
        console.log("Scheudle Payload", payload);
        if (!payload) {
            // Optional: Add additional error handling here if needed
            
            return;
        }

        try {
            mutate({
                courseids: payload.courses.flatMap((course: any) => ([{
                    courseid: course.courseid,
                    coursename:course.coursename,
                    coursecode: course.coursecode,
                    coursetype: course.coursetype,
                    credits: course.credits
                }])),
                semester: payload.semester,
                year: payload.year
            });
        } catch (error) {
            notification.error({
                message: 'Submission Failed',
                description: 'Failed to process schedule request',
            });
        }

        setCourseModalVisible(false);
    };


    /** Break management functions */
    const handleAddBreak = () => {
        form.validateFields().then(values => {
            const { timeRange, description, days } = values;
            const [startMoment, endMoment] = timeRange;

            const newBreak: CalendarEvent = {
                title: description,
                startTime: startMoment.format('HH:mm'),
                endTime: endMoment.format('HH:mm'),
                daysOfWeek: days,
                color: '#fab9b980',
                borderColor: "#bf0a37"
            };

            // Check for conflicts with existing events
            const conflict = checkForConflicts(newBreak, [...calendarEventsToBeAdded, ...breaks]);

            if (conflict) {
                setConflictingEvent(conflict);
                setPendingBreak(newBreak);
                setShowConflictModal(true);
            } else {
                setBreaks(prev => [...prev, newBreak]);
                setIsModalBreaksVisible(false);
                form.resetFields();
            }
        });
    };

    // Modified handleQuickConstraint function
    const handleQuickConstraint = (
        startTime: string,
        endTime: string,
        description: string,
        daysOfWeek?: number[]
    ) => {
        const newBreak: CalendarEvent = {
            title: description,
            startTime,
            endTime,
            daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
            color: '#fab9b980',
            borderColor: "#bf0a37"
        };

        // Check for conflicts with existing events
        const conflict = checkForConflicts(newBreak, [...breaks, ...calendarEventsToBeAdded]);

        if (conflict) {
            setConflictingEvent(conflict);
            setPendingBreak(newBreak);
            setShowConflictModal(true);
        } else {
            setBreaks(prev => [...prev, newBreak]);
        }
    };
    const handleDeleteBreak = (index: number) => {
        setBreaks(prev => prev.filter((_, i) => i !== index));
    };

    /** Conflict detection logic */
    const checkForConflicts = (newEvent: CalendarEvent, existingEvents: CalendarEvent[]): CalendarEvent | null => {
        const timeToMinutes = (time: string) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const newDays = new Set(newEvent.daysOfWeek);
        const newStart = timeToMinutes(newEvent.startTime);
        const newEnd = timeToMinutes(newEvent.endTime);

        for (const existingEvent of existingEvents) {
            // Check day overlap
            const hasDayOverlap = existingEvent.daysOfWeek.some(day => newDays.has(day));
            if (!hasDayOverlap) continue;

            // Check time overlap
            const existingStart = timeToMinutes(existingEvent.startTime);
            const existingEnd = timeToMinutes(existingEvent.endTime);

            if (newStart < existingEnd && existingStart < newEnd) {
                return existingEvent;
            }
        }
        return null;
    };
    const [form] = Form.useForm();
    const { mobileOnly, isTablet } = useResponsive();

    ////////////////////////////////////SMART OFFERING SELECTION STUFF
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    const [selectedTabs, setSelectedTabs] = useState<{ [courseId: string]: string }>({});

    const [courseProfessors, setCourseProfessors] = useState<Record<number, string[]>>(() => {
        const init: Record<number, string[]> = {};
        coursesOfferingsInput.forEach(c => {
            init[c.courseid] = [];
        });
        return init;
    });

    const [selectedSectionsSmart, setSelectedSectionsSmart] = useState<Record<string, string[]>>({});
    //const [selectedSectionsSmart, setSelectedSectionsSmart] = useState<Record<number, string[]>>(() => {
    //    const init: Record<number, string[]> = {};
    //    coursesOfferingsInput.forEach(c => {
    //        init[c.courseid] = [];
    //    });
    //    return init;
    //});
    const handleProfessorToggle = (
        courseId: number,
        professor: string,
        checked: boolean
    ) => {
        // 1) Update the professor-map
        setCourseProfessors(prevProfMap => {
            const current = prevProfMap[courseId] || [];
            const updatedProfs = checked
                ? [...current, professor]
                : current.filter(p => p !== professor);

            // 2) Prune/reset selectedSectionsSmart *for this course only*
            setSelectedSectionsSmart(prevSectionsMap => {
                // find this course's full offering
                const course = coursesOfferingsInput.find(c => c.id === courseId)!;
                const allIds = course.sections.map((s: Section) => s.id);

                // compute the new list for this course:
                let newSectionList: string[];
                if (updatedProfs.length === 0) {
                    // no profs selected → select ALL sections
                    newSectionList = allIds;
                } else {
                    // keep only sections taught by a still-selected prof
                    newSectionList = allIds.filter((id: number) => {
                        const sec = course.sections.find((s: Section) => s.id === id)!;
                        return updatedProfs.includes(sec.instructor);
                    });
                }

                // return a brand-new map, updating only this course's bucket
                return {
                    ...prevSectionsMap,
                    [courseId]: newSectionList
                };
            });

            // finally, return the updated prof-map
            return { ...prevProfMap, [courseId]: updatedProfs };
        });
    };



    const handleSectionToggle = (
        courseId: number,
        sectionId: string,
        checked: boolean
    ) => {
        setSelectedSectionsSmart(prev => {
            const currentSections = prev[courseId] ?? [];

            const updatedSections = checked
                ? Array.from(new Set([...currentSections, sectionId]))
                : currentSections.filter(id => id !== sectionId);

            return {
                ...prev,
                [courseId]: updatedSections
            };
        });
    };

    // 3) Debug logging when it changes
    useEffect(() => {
        console.log("selectedSectionsSmart:", selectedSectionsSmart);
    }, [selectedSectionsSmart]);

    const isSectionDisabled = (courseId: number, section: Section) => {
        const selectedProfessors = courseProfessors[courseId] || [];
        return selectedProfessors.length > 0 &&
            !selectedProfessors.includes(section.instructor);
    };

    const [isGenerateSchedule, setIsGeneratedSchedule] = useState<boolean>(false);
    const [generatedSchedule, setGeneratedSchedule] = useState<ScheduledSection[]>([]);
    const generateSchedule = useMutation<
        ScheduledSection[],               // the “data” type returned
        Error,                            // the “error” type thrown
        CourseSchedulePreferences         // the variables you pass to mutate()
    >(
        (payload) => GetSmartSchedule(payload),  // your axios wrapper
        {
            // 2) on success, add events to calendar & invalidate any queries
            onSuccess: (sections) => {
                setIsGeneratedSchedule(true);

                setGeneratedSchedule(sections);

                // 3) if you have a “mySchedules” GET‐query, you can invalidate it:
                queryClient.invalidateQueries(['smartSchedule']);
            },
            onError: (err) => {
                //notification.error(err.message);
            }
        }
    );
    const [calendarEventsState, setCalendarEventsState] = useState<CalendarEvent[]>([]);

    // 2) whenever `generatedSchedule` changes, recalc events
    useEffect(() => {
        if (!generatedSchedule.length) return;

        const events = generatedSchedule.map(section => {
            // Extract HH:mm from ISO datetime strings
            const startTime = section.startTime.includes('T')
                ? section.startTime.split('T')[1].slice(0, 5)
                : section.startTime.slice(0, 5);

            const endTime = section.endTime.includes('T')
                ? section.endTime.split('T')[1].slice(0, 5)
                : section.endTime.slice(0, 5);

            return {
                title: `${section.coursecode} ${section.coursename}`,
                professor: section.instructor,
                daysOfWeek: section.daysOfWeek,
                startTime: startTime,  // e.g. "12:30"
                endTime: endTime,       // e.g. "14:00"
                color: "#52fae180"
            };
        });

        console.log("setCalendarEventsState", events);
        setCalendarEventsState(events);
    }, [generatedSchedule]);
    const DAY_ABBR: Record<number, string> = {
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
        7: "Sun",
    };
    const handleGenerateSchedule = () => {
        // 1) Build up course-preference objects
        const coursePrefs = coursesOfferingsInput.map(course => ({
            courseid: Number(course.id.replace(/\D+/g, '')) || 0, // ✅ Fixed bracket here
            coursecode: course.code.split(" ").join("").toUpperCase(),
            coursename: `${parseCourse(course.name).name }`,
            coursetype: course.type || "Major",
            credits: course.credits,
            sections: (selectedSectionsSmart[course.id] ?? []).map(sectionId => {
                const s = course.sections.find((s: any) => s.id === sectionId)!;
                return {
                    id: Number(s.id.toString().replace(/\D+/g, '')) || 0, // ✅ Consistent conversion
                    days: s.daysOfWeek?.map((d: any) => DAY_ABBR[d]).join(',') || "",
                    daysOfWeek: s.daysOfWeek || [],
                    startTime: s.startTime.includes(':') ? s.startTime : `${s.startTime}:00`,
                    endTime: s.endTime.includes(':') ? s.endTime : `${s.endTime}:00`,
                    instructor: s.instructor
                };
            })
        }));

        // 2) Build final payload
        const payload = {
            CourseOfferingsPreferencesIDs: coursePrefs,
            Breaks: breaks.map(br => ({
                days: br.daysOfWeek.map(d => DAY_ABBR[d]).join(','),
                starttime: br.startTime.includes(':') ? br.startTime : `${br.startTime}:00`,
                endtime: br.endTime.includes(':') ? br.endTime : `${br.endTime}:00`,
                description: br.title || "Break"
            }))
        };

        console.log("Last Payload to be submitted", payload);
        generateSchedule.mutate(payload);
    };
    return (
        <>
            <PageTitle>{t('sched_tool.title')}</PageTitle>
            {/* ====================== Modals ====================== */}
            {/* Offering Conflict Resolution Modal */}
            <ConflictModal
                showConflictModal={showConflictModal}
                conflictingEvent={conflictingEvent}
                pendingBreak={null} // Explicitly set to null for section conflicts
                setShowConflictModal={setShowConflictModal}
                setConflictingEvent={setConflictingEvent}
                setPendingBreak={() => { }} // Empty function for section conflicts
                setBreaks={setBreaks}
                setIsModalBreaksVisible={setIsModalBreaksVisible}
            />
            {/* Break Conflict Resolution Modal */}
            <ConflictModal
                showConflictModal={showConflictModal}
                conflictingEvent={conflictingEvent}
                pendingBreak={pendingBreak}
                setShowConflictModal={setShowConflictModal}
                setConflictingEvent={setConflictingEvent}
                setPendingBreak={setPendingBreak}
                setBreaks={setBreaks}
                setIsModalBreaksVisible={setIsModalBreaksVisible}
            />
            {/* Break Management Modal */}
            <AddBreakModal
                isModalBreaksVisible={isModalBreaksVisible}
                selectedDays={selectedDays}
                form={form}

                setIsModalBreaksVisible={setIsModalBreaksVisible}
                setSelectedDays={setSelectedDays}
                handleAddBreak={handleAddBreak}
            />
            {/* Planner Selection Modals */}
            <PlannerTypeModal
                edit={editingPlanner}
                open={plannerTypeModalVisible}
                mobileOnly={mobileOnly}
                onPlannerSelect={handlePlannerSelect}
                onCancel={() => setPlannerTypeModalVisible(false)}
                modalCoursesSource={false}
            />
            {/* Course Importing Selection Modals */}
            <PlannerTypeModal
                open={courseModalVisible}
                edit={true}
                mobileOnly={mobileOnly}
                onCancel={() => setCourseModalVisible(false)}
                onSourceSelect={handleSourceSelect}
                titleText={t('sched_tool.choose_courses_source')}
                bannerText={t('sched_tool.choose_courses_source_banner')}
                manualTitle={t('sched_tool.cus_modal_title')}
                manualDescription={t('sched_tool.cus_modal_body')}
                smartTitle={t('sched_tool.best_modal_title')}
                smartDescription={t('sched_tool.best_modal_body')}
                modalCoursesSource={true}
            />
            {/* Main Content (only shown after selecting planner) */}
            {(!plannerTypeModalVisible) ? (
                <>

                    <Row align="top" gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={8}  >
                            {mobileOnly && (
                                <Row style={{ marginBottom: "8px", marginTop: "8px", }} gutter={[4, 16]}>
                                    <Col flex="none">
                                        <Space size={8}>
                                            <IconButton icon={<CalendarOutlined />} text={t('sched_tool.switch_planner')} onClick={() => { setPlannerTypeModalVisible(prev => !prev); setEditingPlanner(true); }} />

                                            <IconButton icon={<ImportOutlined />} className={`${shouldFlash ? 'flash-highlight' : ''}`} text={t('sched_tool.import_courses')} onClick={() => { setCourseModalVisible(prev => !prev); }} />
                                            {plannerType !== "Manual" && (
                                                <IconButton
                                                    className={`${shouldFlashGenerate ? 'flash-highlight' : ''}`}
                                                    icon={generateSchedule.isLoading ? <Spin indicator={<LoadingOutlined spin />} /> : <DownloadOutlined />}
                                                    text={generateSchedule.isLoading ? '' : t('sched_tool.generate_schedule') }
                                                    onClick={handleGenerateSchedule}
                                                    disabled={generateSchedule.isLoading}
                                                />
                                            )}
                                        </Space >
                                    </Col>
                                </Row>)}
                            <Row style={{ marginBottom: "8px", marginTop: "8px" }}>
                                <Col style={{ width: "100%" }}>
                                    <Banner
                                        color={{ background: '#e3faf8', icon: '#038b94' }}
                                        text={
                                            plannerType === "Manual"
                                                ? t('sched_tool.info_man') 
                                                : t('sched_tool.info_smart') 
                                        }
                                    />
                                </Col>
                            </Row>
                            <Row style={{ marginBottom: "16px", marginTop: "8px" }}>
                                {plannerType == "Manual" ? (
                                    <Col style={{ width: "100%" }}>
                                        <HoverableDiv>
                                            <Card
                                                title={
                                                    <>
                                                        <Row style={{ marginBottom: "7px" }}>
                                                            <Typography.Text>{t('sched_tool.choose_off')}</Typography.Text>
                                                        </Row>
                                                        <Row>
                                                            <Space
                                                                style={{
                                                                    borderRadius: "20px",
                                                                    color: "#0b58b8",
                                                                    backgroundColor: "#cae0fa",
                                                                    fontSize: "10px",
                                                                    padding: "6px",
                                                                    fontWeight: "bold",
                                                                    paddingLeft: "9px",
                                                                    paddingRight: "9px",
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <ToolOutlined style={{ fontSize: "12px" }} />
                                                                {t('sched_tool.mode_manual')}
                                                            </Space>
                                                        </Row>
                                                    </>
                                                }
                                                style={{ width: "100%", borderLeft: "4px solid #038b94" }}
                                            >
                                                {
                                                    isLoading ? (
                                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                            <Spin size="large" tip="Loading..." />
                                                        </div>
                                                    ) : sourceType !== "" ? (
                                                        coursesOfferingsInput?.map(course => (
                                                            <CourseCard
                                                                key={course.id}
                                                                course={course}
                                                                selectedSectionId={selectedSections[course.id]}
                                                                onSectionChange={handleSectionChange}
                                                            />
                                                        ))
                                                    ) : (
                                                        <EmptyCourseCard onClick={handleFlashButton} />
                                                    )
                                                }
                                            </Card>
                                        </HoverableDiv>
                                    </Col>
                                ) : (<Col style={{ width: "100%" }}>
                                    <HoverableDiv>
                                        <Card
                                            title={
                                                <>
                                                    <Row style={{ marginBottom: "7px" }}>
                                                            <Typography.Text> {t('sched_tool.choose_pref')}</Typography.Text>
                                                    </Row>
                                                    <Row>
                                                        <Space
                                                            style={{
                                                                borderRadius: "20px",
                                                                color: "#7e0bb8",
                                                                backgroundColor: "#e7cafa",
                                                                fontSize: "10px",
                                                                padding: "6px",
                                                                fontWeight: "bold",
                                                                paddingLeft: "9px",
                                                                paddingRight: "9px",
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <ToolOutlined style={{ fontSize: "12px" }} />
                                                                {t('sched_tool.mode_smart')}
                                                        </Space>
                                                    </Row>
                                                </>
                                            }
                                            style={{ width: "100%", borderLeft: "4px solid #038b94" }}
                                        >
                                            {isLoading ? (
                                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                        <Spin size="large" tip={t('common.loading')} />
                                                </div>
                                            ) : sourceType !== "" ? (
                                                coursesOfferingsInput.map((course: any) => {

                                                    const professorsCurrentCourse = Array.from(
                                                        new Set(course.sections.map((s: Section) => s.instructor))
                                                    );



                                                    const selectedForThisCourse = courseProfessors[course.id] ?? []; const getProfessorSectionsCount = (professor: string) => {
                                                        return course.sections.filter(
                                                            (s: any) => s.instructor === professor
                                                        ).length;
                                                    };



                                                    return (
                                                        <HoverableDiv key={course.id}> {/* Added key */}
                                                            <div style={{ marginBottom: 16, borderRadius: 12, border: "1px solid #f4dbff", paddingBlock: 8, width: "100%" }}>
                                                                <Row justify="space-between" style={{ height: "auto", marginBottom: "8px", paddingInline: 8 }} gutter={[0, 16]} >
                                                                    <Col>
                                                                        <Typography.Text style={{ marginBottom: "8px", height: "auto", fontFamily: "monospace" }}>
                                                                         {course.name}
                                                                        </Typography.Text>
                                                                    </Col>
                                                                    <Col>
                                                                        <DaysButton text={`${course.credits}  ${t('sched_tool.credits')}`} onClick={() => console.log("HI")} />
                                                                    </Col>
                                                                </Row>

                                                                <Collapse
                                                                    key={course.id}
                                                                    bordered={false}
                                                                    activeKey={activeKey}
                                                                    onChange={setActiveKey}
                                                                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                                                    style={{ backgroundColor: "transparent", padding: "0px", minWidth: "100%" }}
                                                                >
                                                                    <Collapse.Panel header={t('sched_tool.offering_preferences')} key={course.id} style={{ padding: 0, backgroundColor: "transparent", minWidth: "100%" }}>
                                                                        <Segmented
                                                                            key={course.id}
                                                                            options={[t('sched_tool.sections'), t('sched_tool.professors')]}
                                                                            value={selectedTabs[course.id] || "Sections"}
                                                                            onChange={(value) =>
                                                                                setSelectedTabs(prev => ({ ...prev, [course.id]: value as string }))
                                                                            }
                                                                            block
                                                                            style={{ marginBottom: 8 }}
                                                                        />

                                                                        {selectedTabs[course.id] === t('sched_tool.professors') ? (
                                                                            <Row style={{ padding: 8 }}>
                                                                                <Typography.Text style={{ marginBottom: 8 }}> {t('sched_tool.offering_preferences')}</Typography.Text>
                                                                                {professorsCurrentCourse.map((professor: any) => {
                                                                                    const isChecked = selectedForThisCourse.includes(professor);
                                                                                    const hasSelections = selectedForThisCourse.length > 0;

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
                                                                                                                checked={courseProfessors[course.id]?.includes(professor) ?? false}
                                                                                                                onChange={e => {
                                                                                                                    handleProfessorToggle(
                                                                                                                        course.id,
                                                                                                                        professor,
                                                                                                                        e.target.checked
                                                                                                                    );

                                                                                                                }
                                                                                                                }

                                                                                                            />
                                                                                                            <Typography.Text>{professor}</Typography.Text>
                                                                                                        </Space>
                                                                                                    </Col>
                                                                                                    <Col>
                                                                                                        <Typography.Text style={{ fontSize: "0.85rem", color: "#585859" }}>
                                                                                                            {getProfessorSectionsCount(professor)} {t('sched_tool.section')}(s)
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
                                                                                                            onClick={() => handleProfessorToggle(course, professor, !isChecked)}
                                                                                                        >
                                                                                                            {!isChecked ? t('sched_tool.add_preference') : t('sched_tool.remove_preference')}
                                                                                                        </Typography.Text>
                                                                                                    </Col>
                                                                                                </Row>
                                                                                                {hasSelections && !isChecked && (
                                                                                                    <Row style={{ marginTop: 8 }}>
                                                                                                        <Col>
                                                                                                            <Typography.Text type="secondary" style={{ fontSize: "0.75rem", color: "#ff4d4f" }}>
                                                                                                                {t('sched_tool.add_preference')} {courseProfessors[course.id].join(", ")} {t('sched_tool.preference')}
                                                                                                            </Typography.Text>
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
                                                                                {course.sections.map((section: any) => (
                                                                                    <Row
                                                                                        key={section.id}
                                                                                        style={{
                                                                                            marginBottom: 8,
                                                                                            width: "100%",
                                                                                            border: "1px solid #94f7d3",
                                                                                            padding: "8px",
                                                                                            borderRadius: 8,
                                                                                            backgroundColor: "#e3faf8"
                                                                                        }}
                                                                                        align="top"
                                                                                    >
                                                                                        {/* checkbox column */}
                                                                                        <Col flex="none" style={{ paddingRight: 12 }}>
                                                                                            <Checkbox
                                                                                                key={`${course.id}-${section.id}`}
                                                                                                checked={selectedSectionsSmart[course.id]?.includes(section.id) ?? false}
                                                                                                onChange={e =>
                                                                                                    handleSectionToggle(
                                                                                                        course.id,
                                                                                                        section.id,
                                                                                                        e.target.checked
                                                                                                    )
                                                                                                }
                                                                                                disabled={isSectionDisabled(course.id, section)}
                                                                                                style={{
                                                                                                    opacity: isSectionDisabled(course.id, section) ? 0.6 : 1,
                                                                                                    cursor: isSectionDisabled(course.id, section) ? "not-allowed" : "pointer",
                                                                                                }}
                                                                                            />

                                                                                        </Col>

                                                                                        {/* content column */}
                                                                                        <Col flex="auto">
                                                                                            {/* row 1: section name */}
                                                                                            <Row>
                                                                                                <Typography.Text strong> {t("sched_tool.section")} {section.name.split(" ")[1]}</Typography.Text>
                                                                                            </Row>

                                                                                            {/* row 2: schedule on the left, professor on the right */}
                                                                                            <Row justify="space-between" align="middle" style={{ marginTop: 4 }}>
                                                                                                <Typography.Text style={{ fontSize: "0.85rem", color: "#8c8c8c" }}>{translateSchedule(section.schedule, t)}</Typography.Text>
                                                                                                <Typography.Text style={{ fontSize: "0.85rem", color: "#8c8c8c" }}>{section.instructor}</Typography.Text>
                                                                                            </Row>

                                                                                            {/* optional disabled note */}
                                                                                            {isSectionDisabled(course.id, section) && (
                                                                                                <Typography.Text type="secondary" style={{ fontSize: "0.75rem", color: "#ff4d4f", marginTop: 4, display: "block" }}>
                                                                                                    {t('sched_tool.prof_no_selection')}
                                                                                                </Typography.Text>
                                                                                            )}
                                                                                        </Col>
                                                                                    </Row>

                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </Collapse.Panel>
                                                                </Collapse>
                                                            </div>
                                                        </HoverableDiv>
                                                    );
                                                })
                                            ) : (
                                                <EmptyCourseCard onClick={handleFlashButton} />
                                            )}
                                        </Card>
                                    </HoverableDiv>
                                </Col>
                                )}
                            </Row>
                            <BreaksCard
                                breaks={breaks}
                                onAddBreak={() => setIsModalBreaksVisible(true)}
                                onDeleteBreak={handleDeleteBreak}
                                onQuickConstraint={handleQuickConstraint}
                            />
                        </Col>

                        <Col md={24} lg={16} >
                            <Row
                                justify="space-between"
                                align="bottom"
                                style={{ margin: '0 0 10px' }}
                            >
                                {/* Title always on the left */}
                                <Col flex="auto" >
                                    <Typography.Text
                                        style={{
                                            color: '#038b94',
                                            fontWeight: 'bold',
                                            fontSize: mobileOnly ? 16 : 20,
                                        }}
                                    >
                                        {t('sched_tool.title_cal')}
                                    </Typography.Text>
                                </Col>

                                {/* Buttons grouped on the right, only if on tablet+ */}
                                {isTablet && (
                                    <Col flex="none" >
                                        <Space size={8}>

                                            {plannerType !== "Manual" && (
                                                <IconButton
                                                    className={`${shouldFlashGenerate ? 'flash-highlight' : ''}`}
                                                    icon={generateSchedule.isLoading ? <Spin indicator={<LoadingOutlined spin />} /> : <DownloadOutlined />}
                                                    text={generateSchedule.isLoading ? "" : t('sched_tool.generate_schedule') }
                                                    onClick={handleGenerateSchedule}
                                                    disabled={generateSchedule.isLoading}
                                                />
                                            )}
                                            <IconButton
                                                icon={<CalendarOutlined />}
                                                text={t('sched_tool.switch_planner')}
                                                onClick={() => {
                                                    setPlannerTypeModalVisible(v => !v);
                                                    setEditingPlanner(true);
                                                }}
                                            />
                                            <IconButton
                                                icon={<ImportOutlined />}
                                                text={t('sched_tool.import_courses')}
                                                onClick={() => { setCourseModalVisible(prev => !prev); }}
                                                className={`${shouldFlash ? 'flash-highlight' : ''}`}
                                            />
                                        </Space>
                                    </Col>
                                )}
                            </Row>
                            <Row justify="end" align="top">
                                <Col>
                                    <Row justify="end" align="top">
                                        <AcademicCalendar
                                            mobileOnly={mobileOnly}
                                            events={savedEvents.length > 0 ? savedEvents :
                                                (isGenerateSchedule
                                                    ? [...calendarEventsState, ...breaks]
                                                    : [...calendarEventsToBeAdded, ...breaks])
                                            }
                                            ref={printRef }
                                        />
                                    </Row>
                                    <Row justify="end" align="top" style={{ marginTop: "8px" }} gutter={[16,9] }>
                                        <Col>
                                            <IconButton
                                            icon={<SaveOutlined />}
                                                text={t('sched_tool.save_schedule')}
                                            onClick={handleSaveCalendar}
                                            disabled={generateSchedule.isLoading}
                                            />
                                        </Col>
                                        <Col>
                                            <IconButton
                                                icon={<DownloadOutlined />}
                                                text={t('sched_tool.down_schedule')}
                                                onClick={handleDownloadPdf}
                                             
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                               
                            </Row>
                        </Col>
                    </Row>
                </>
            ) : (!plannerTypeModalVisible) && (
                <>
                    <Row justify="end" style={{ marginBottom: "40px" }}>
                        <IconButton icon={<CalendarOutlined />} onClick={() => setPlannerTypeModalVisible(prev => !prev)} text="Select Planner Type" />
                    </Row>
                    <Row justify="space-evenly" style={{ marginBottom: "10px", }} gutter={[8, 8]}>
                        <Banner
                            text=" You did not choose a schedule planner type, please select one using the button above or reload the page for in-modal selection."
                        />
                    </Row >
                </>
            )
            }
        </>
    )
}; const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  border-radius:12px;
  box-shadow: none;
      width: 100%;
  &:hover {
    box-shadow: 0 10px 20px rgba(3, 139, 148, 0.3);
  }
`;
const App = () => (
    <QueryClientProvider client={queryClient}>
        <SchedulingTool />
    </QueryClientProvider>
);

export default App;