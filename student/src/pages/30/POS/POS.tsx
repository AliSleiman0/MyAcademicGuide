import React, { useEffect, useRef, useState } from 'react';
import { Graph, Edge, Node } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import {  Col, Row, Space, Spin, Switch, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../../../hooks/useResponsive';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { getPOS } from '../../../apiMAG/POS';
import {
    bannerStyles,
    FlowchartContainer,
    CourseNodeContainer,
    CourseCode,
  
    LegendItem,
    ColorSwatch,
    SolidLine,
    DashedLine,
} from './flowchartStyles';
import { PageTitle } from '../../../components/common/PageTitle/PageTitle';
import { useUser } from '../../../Context/UserContext';
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

export const FlowchartContext = React.createContext({
    showCorequisites: false,
    showCourseStatus: false,
});

// === Query Client Configuration ===
// Configures default React Query behaviors for data fetching
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // disable refetch when window regains focus
            retry: 3,                     // retry failed requests up to 3 times
            staleTime: 1000 * 60 * 5,     // cache data for 5 minutes
        },
    },
});

// === Course Node Component ===
// Custom node renderer to show course code and status
const CourseNodeComponent = ({ node }: { node?: any }) => {
    const courseData = node?.getData();
    const showCourseStatus = courseData?.showCourseStatus ?? false;

    // Conditionally apply status-based styles
    const statusStyles = showCourseStatus
        ? (() => {
            const status = courseData.course.status;
            switch (status) {
                case 'Passed':
                    return {
                        background: '#06c2bf',
                        border: '1px solid #038187',
                    };
                case 'Registered':
                    return {
                        background: '#defeff',
                        border: '1px solid #038187',
                    };
                case 'Can Register':
                    return {
                        background: '#f8fab4',         // light cyan
                        border: '1px solid black',  // dashed medium cyan
                    };
                case 'Cannot Register':
                    return {
                        background: '#ffebee',         // light red
                        border: '1px solid #e53935',  // dashed dark red
                    };
                default:
                    return {
                        background: '#f74f48',
                        border: '1px solid #f70f05',
                    };
            }
        })()
        : {}; // no extra styling when status is hidden

    // Pick font color based on status
    const fontColor = showCourseStatus
        ? (() => {
            const status = courseData.course.status;
            if (status === 'Registered') return '#0D47A1';
            if (status === 'Can Register') return 'black';       // dark cyan
            if (status === 'Cannot Register') return '#b71c1c';    // dark red
            return '#FFFFFF';  // white text for passed & default
        })()
        : '#038b94';        // default teal when status hidden


    return (
        <CourseNodeContainer
            style={statusStyles}
            $showCorequisites={courseData?.showCorequisites ?? false}
            $highlighted={courseData?.highlighted}
        >
            <CourseCode style={{ color: fontColor }}>
                {courseData?.course?.code}
            </CourseCode>
        </CourseNodeContainer>
    );
};

// Register the custom node shape for use in the graph
register({
    shape: 'course-node',
    width: 120,
    height: 60,
    component: CourseNodeComponent,
});

// === Main Flowchart Component ===
export const Flowchart = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    // Local state for toggling visibility options
    const [showPrerequisites, setShowPrerequisites] = useState(true);
    const [showCorequisites, setShowCorequisites] = useState(false);
    const [showCourseStatus, setShowCourseStatus] = useState(false);

    // Track mouse for tooltip positioning
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [activeTooltip, setActiveTooltip] = useState<any>(null);

    // Tooltip state
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        content: any;
        x: number;
        y: number;
    }>({ visible: false, content: null, x: 0, y: 0 });

    // Refs to access latest toggle values inside event handlers
    const showPrereqRef = useRef(showPrerequisites);
    const showCoreqRef = useRef(showCorequisites);
    const showCourseStatusRef = useRef(showCourseStatus);

    //API DATA:

    const { data, isLoading, isError, error, refetch } =
        useQuery('POS', getPOS, { useErrorBoundary: true }); // Fetch POS data
    console.log(data);

    const courses = data?.map(item => {
        const preqArray = item.prerequisites?.flatMap(pre => {
            const preRequFullInfo = data.find(course => course.courseid === pre.prerequisitecourseid);
            return preRequFullInfo?.coursename ? [parseCourse(preRequFullInfo.coursename).code] : [];
        }) ?? [];


        const coreArray = item.corerequisites.flatMap(co => {
            const coRequFullInfo = data.find(course => course.courseid === co);
            return coRequFullInfo?.coursename ? [parseCourse(coRequFullInfo.coursename).code] : [];
        }) ?? [];

        return {
            courseid: item.courseid,
            code: parseCourse(item.coursename).code,
            name: parseCourse(item.coursename).name,
            level: parseCourse(item.coursename).level,
            status: item.status,
            corequisites: coreArray,
            prerequisites: preqArray
        }
    });

    // === Effect: Update mouse position for tooltips ===
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.pageX + 10, y: e.pageY - 130 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // === Effect: Sync show options to each node's data ===
    const graphRef = useRef<Graph | null>(null);
    useEffect(() => {
        if (!graphRef.current) return;

        graphRef.current.getNodes().forEach((node) => {
            const data = node.getData();
            node.setData({
                ...data,
                showCorequisites: showCorequisites,
                showCourseStatus: showCourseStatus,
            });
        });
    }, [showCorequisites, showCourseStatus]);

    // Keep refs updated with state
    useEffect(() => {
        showPrereqRef.current = showPrerequisites;
        showCoreqRef.current = showCorequisites;
        showCourseStatusRef.current = showCourseStatus;
    }, [showPrerequisites, showCorequisites, showCourseStatus]);

    // === Effect: Initialize Graph & Render Nodes/Edges ===
    useEffect(() => {
        if (!containerRef.current) return;

        // Create new graph instance
        const graph = new Graph({
            container: containerRef.current,
            grid: { visible: true, size: mobileOnly ? 10 : 15 },
            background: { color: '#f8f9fa' },
            interacting: { nodeMovable: false },
            panning: true,
            mousewheel: true,
            connecting: {
                router: {
                    name: 'manhattan',
                    args: {
                        excludeShapes: ['course-node'],
                        maximumLoops: 100,
                        startDirections: ['top'],    // routing “entry” hint :contentReference[oaicite:1]{index=1}
                        endDirections: ['bottom'], // routing “exit” hint :contentReference[oaicite:2]{index=2}
                    },
                },

            },
        });


        // Adjust view for mobile
        if (mobileOnly) {
            graph.zoomToFit({ padding: 20, maxScale: 0.9 });
            graph.centerContent();
        }
        graphRef.current = graph;

        // === Pre-process course data ===
        const validatedCourses = courses?.map((course) => ({
            ...course,
            prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
            corequisites: Array.isArray(course.corequisites) ? course.corequisites : [],
        }));
        console.log("valid Courses: ", validatedCourses);
        // Determine layout: unique levels & spacing
        // === Layout constants ===
        const levelSpacing = 150;  // vertical distance between rows (levels)
        const nodeSpacing = 250;  // horizontal distance between nodes in same level
        const baseX = 100;  // left margin
        const baseY = 100;  // top margin

        // Compute unique, sorted levels
        const courseLevels = Array.from(
            new Set(validatedCourses?.map(c => c.level ?? 0))
        ).sort((a, b) => a - b);

        // === Add Nodes ===
        validatedCourses?.forEach(course => {
            // Which row (level) this course sits on?
            const levelIndex = courseLevels.indexOf(course.level ?? 0);

            // All courses in this same level, to compute horizontal position
            const sameLevelCourses = validatedCourses.filter(c => c.level === course.level);
            const indexInLevel = sameLevelCourses.findIndex(c => c.code === course.code);

            // Define ports (unchanged logic)
            const inPorts = course.prerequisites.map((_, i) => ({ id: `in-${course.code}-${i}`, group: 'in' }));
            const outPorts = course.corequisites.map((_, i) => ({ id: `out-${course.code}-${i}`, group: 'out' }));

            graph.addNode({
                id: course.code,
                shape: 'course-node',
                data: { course },

                // --- NEW: swap X/Y roles ---
                x: baseX + indexInLevel * nodeSpacing,      // horizontal position by index within level
                y: baseY + levelIndex * levelSpacing,       // vertical position by level (row)

                width: 120,
                height: 60,

                // Ports now on top/bottom
                ports: {
                    groups: {
                        in: {
                            position: 'top',
                            markup: [{ tagName: 'circle', selector: 'portBody' }],
                            attrs: {
                                portBody: { r: 4, fill: 'transparent', stroke: 'transparent', magnet: true }
                            },
                        },
                        out: {
                            position: 'bottom',
                            markup: [{ tagName: 'circle', selector: 'portBody' }],
                            attrs: {
                                portBody: { r: 4, fill: 'transparent', stroke: 'transparent', magnet: true }
                            },
                        },
                    },
                    items: [...inPorts, ...outPorts],
                },
            } as Node.Metadata);
        });


        // === Add Edges ===
        validatedCourses?.forEach((course) => {
            // Prerequisite edges
            course.prerequisites.forEach((pre, idx) => {
                graph.addEdge({
                    source: { cell: pre, port: `out-${pre}-0` },
                    target: { cell: course.code, port: `in-${course.code}-${idx}` },
                    router: { name: 'manhattan', args: { padding: 15 } },
                    attrs: { line: { stroke: '#036b74', strokeWidth: 3, targetMarker: 'classic' } },
                    data: { type: 'prerequisite' },
                });
            });
            // Corequisite edges
            course.corequisites.forEach((co, idx) => {
                const edge = graph.addEdge({
                    source: { cell: course.code, port: `out-${course.code}-${idx}` },
                    target: { cell: co, port: `in-${co}-0` },
                    router: { name: 'manhattan', args: { padding: 15 } },
                    attrs: {
                        line: {
                            stroke: '#03aabd',
                            strokeDasharray: '5 3',
                            strokeWidth: 2,
                            sourceMarker: { name: 'circle', size: 6 },
                            targetMarker: { name: 'classic', size: 15 },
                        },
                    },
                    data: { type: 'corequisite' },
                });
                edge.setVisible(showCorequisites);
            });
        });

        // === Performance Optimization: Cache edges per node ===
        const edgeCache = new Map<string, Edge[]>();
        graph.getNodes().forEach((node) => {
            const connectedEdges = graph.getConnectedEdges(node);
            console.log('connected Links ', connectedEdges);
            edgeCache.set(node.id, connectedEdges);
        });
        graph.on('node:mouseenter', ({ node: hoveredNode, e }) => {
            const course = hoveredNode.data?.course;
            setActiveTooltip(course);                  // Store active course for tooltip
            if (!course) return;

            // Retrieve pre-cached connected edges for this node
            const connectedEdges = edgeCache.get(hoveredNode.id) || [];
            console.log('Connected edges:', connectedEdges);

            // Highlight connected corequisite nodes if enabled
            if (showCoreqRef.current) {
                const coreqEdges = connectedEdges.filter(edge =>
                    edge.getData()?.type === 'corequisite'
                );
                const coreqNodes = coreqEdges.map(edge => {
                    const src = edge.getSourceCell();
                    const tgt = edge.getTargetCell();
                    return src === hoveredNode ? tgt : src;
                });
                coreqNodes.forEach(node => {
                    if (node?.isNode()) {
                        const data = node.getData();
                        node.setData({ ...data, highlighted: true }); // Mark node as highlighted
                    }
                });
            }

            // Iterate all edges to update visibility & style
            graph.getEdges().forEach(edge => {
                const type = edge.getData()?.type;

                // Corequisite outgoing edges: highlight target nodes
                if (type === 'corequisite' && showCoreqRef.current) {
                    const isOutgoing = edge.getSourceCell() === hoveredNode;
                    if (isOutgoing) {
                        const targetNode = edge.getTargetCell();
                        if (targetNode?.isNode()) {
                            const data = targetNode.getData();
                            targetNode.setData({ ...data, highlighted: true });
                        }
                    }
                }

                // Determine whether each edge should be visible
                const shouldShow =
                    type === 'prerequisite'
                        ? connectedEdges.includes(edge) && showPrereqRef.current
                        : type === 'corequisite'
                            ? edge.getSourceCell() === hoveredNode && showCoreqRef.current
                            : true;

                // Apply visibility and color based on type
                edge.setVisible(shouldShow);
                const baseStroke = edge.attr('line/strokeDasharray') ? '#03aabd' : '#036b74';
                edge.attr('line/stroke', shouldShow ? baseStroke : '#f0f0f0');
            });

            // Position & show tooltip near cursor
            setTooltip({
                visible: true,
                content: course,
                x: e.clientX + 10,
                y: e.clientY + 10,
            });
        });

        // -- Mouse Move: Update tooltip position dynamically --
        graph.on('node:mousemove', ({ e }) => {
            setTooltip(prev => ({ ...prev, x: e.clientX + 10, y: e.clientY + 10 }));
        });

        // -- Hover Leave: Reset highlights & tooltip --
        graph.on('node:mouseleave', () => {
            setActiveTooltip(null);
            graph.getEdges().forEach(edge => {
                const type = edge.getData()?.type;
                // Show edges based on current toggle states
                const shouldShow =
                    type === 'prerequisite' ? showPrereqRef.current :
                        type === 'corequisite' ? showCoreqRef.current :
                            true;
                // Reset node highlight flags
                graph.getNodes().forEach(node => {
                    const data = node.getData();
                    if (data.highlighted) {
                        node.setData({ ...data, highlighted: false });
                    }
                });
                edge.setVisible(shouldShow);
                const baseStroke = edge.attr('line/strokeDasharray') ? '#03aabd' : '#036b74';
                edge.attr('line/stroke', shouldShow ? baseStroke : '#f0f0f0');
            });
            // Hide tooltip completely
            setTooltip({ visible: false, content: null, x: 0, y: 0 });
        });

        // -- Initial Zoom-to-Fit & cleanup --
        graph.zoomToFit({ padding: 50 });
        return () => graph.dispose();
    }, [data]);

    // === Effect: Toggle edges visibility on option changes ===
    useEffect(() => {
        if (!graphRef.current) return;
        graphRef.current.getEdges().forEach(edge => {
            const type = edge.getData()?.type;
            if (type === 'prerequisite') {
                edge.setVisible(showPrerequisites);
            } else if (type === 'corequisite') {
                edge.setVisible(showCorequisites);
            }
        });
    }, [showPrerequisites, showCorequisites]);

    // === Query & Responsive Hooks ===
    const { mobileOnly } = useResponsive();               // Detect mobile view

    const { department } = useUser();
    //<pre>{JSON.stringify(data, null, 2)}</pre>
    return (
        <>
            <PageTitle>{t('sider.plan_of_study')}</PageTitle>
            {isLoading ? (<div style={{ textAlign: 'center', padding: '64px' }}>
                <Spin size="large" tip="Loading Data..." />
            </div>) : (

                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                            <div style={bannerStyles.banner}>
                                <Space align="center">
                                    {/* Info icon */}
                                    <InfoCircleOutlined style={bannerStyles.icon} />

                                    {/* Dynamic content */}
                                    <Typography.Text
                                        style={{ ...bannerStyles.text, ...bannerStyles.responsiveText }}
                                    >
                                            {t("pos.text")} {department}

                                    </Typography.Text>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                    <Row style={{ width: "100%" }}>
                        <Col style={{ bottom: "5px", fontSize: mobileOnly ? "0.6rem" : "1rem", border: "2px solid #038b94", borderRadius: "18px", padding: "10px", width: "100%", boxShadow: "4px 2px 8px rgba(0,0,0,0.3)" }}>
                            <Row style={{ fontWeight: '600', color: '#038b94' }}>
                                    {t("pos.legends")}
                            </Row>

                            <Row gutter={[20, 0]} justify="center">
                                <Col>
                                    <LegendItem>
                                        <ColorSwatch color="#06c2bf" border="1px solid " />
                                            <span>{t("pos.passed_course")}</span>
                                    </LegendItem>
                                </Col>
                                <Col>
                                    <LegendItem>
                                        <ColorSwatch color="#defeff" border="1px solid #038b94" />
                                            <span>{t("pos.registered_course")}</span>
                                    </LegendItem>
                                </Col>  <Col>
                                    <LegendItem>
                                        <ColorSwatch color="#f8fab4" border="1px solid #000000" />
                                            <span>{t("pos.can_register_course")}</span>
                                    </LegendItem>
                                </Col>   <Col>
                                    <LegendItem>
                                        <ColorSwatch color="#ffebee" border="1px solid #b71c1c" />
                                            <span>{t("pos.cannot_register_course")}</span>
                                    </LegendItem>
                                </Col>

                                <Col>
                                    <LegendItem>
                                        <SolidLine />
                                        <span>{t("pos.prerequisites")}</span>
                                    </LegendItem>
                                </Col>   <Col>
                                    <LegendItem>
                                        <DashedLine />
                                        <span>{t("pos.corequisites")}</span>
                                    </LegendItem>
                                </Col>
                                <Col style={{ fontSize: '1rem', color: '#666', marginTop: '12px' }}>
                                    <div>● = {t("pos.source_course")}</div>

                                </Col>
                                <Col style={{ fontSize: '1rem', color: '#666', marginTop: '12px' }}>
                                    <div>&gt; = {t("pos.target_course")}</div>
                                </Col>
                            </Row>

                        </Col>
                    </Row >
                    <FlowchartContext.Provider value={{ showCorequisites, showCourseStatus, }}>

                        <div style={{ position: 'relative' }}>
                            <Space style={{
                                position: 'absolute',
                                top: 10,
                                right: mobileOnly ? 4 : 10,
                                fontSize: mobileOnly ? "0.55rem" : "1rem",
                                zIndex: 1000,
                                background: 'white',
                                padding: 8,
                                borderRadius: 4,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    checked={showCourseStatus}
                                    onChange={setShowCourseStatus}
                                    style={{ marginRight: 8 }}
                                />
                                <span style={{ marginRight: "10px" }}>{t("pos.show")}</span>
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    checked={showPrerequisites}
                                    onChange={setShowPrerequisites}
                                    style={{ marginRight: 8 }}
                                />
                                <span>{t("pos.prerequisites")}</span>

                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    checked={showCorequisites}
                                    onChange={setShowCorequisites}
                                    style={{ marginLeft: 16, marginRight: 8 }}
                                />
                                <span>{t("pos.corequisites")}</span>


                            </Space>
                            <FlowchartContainer ref={containerRef} />
                            {activeTooltip && (
                                <div className="tooltip-container"
                                    style={{
                                        position: 'fixed',
                                        left: mousePosition.x,
                                        top: mousePosition.y,
                                        background: '#038b94',
                                        color: 'white',
                                        padding: 12,
                                        borderRadius: 6,
                                        boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                                        zIndex: 100,
                                        minWidth: 150,
                                        pointerEvents: 'none',
                                        transition: 'transform 0.1s ease-out'
                                    }}
                                >
                                    <h4 style={{ margin: 0, color: 'white', fontSize: "0.8rem" }}>
                                        {tooltip.content.name}
                                    </h4>
                                    <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
                                        <div>{t("pos.prerequisites")}: {(tooltip.content.prerequisites || []).join(', ') || 'None'}</div>
                                        <div>{t("pos.corequisites")}: {(tooltip.content.corequisites || []).join(', ') || 'None'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FlowchartContext.Provider>
                </>
            )}
        </>

    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <>
            <Flowchart />
        </>
    </QueryClientProvider>
);

export default App;
