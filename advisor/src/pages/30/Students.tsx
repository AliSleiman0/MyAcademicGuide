import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Input, InputRef, Modal, Typography, List, Col, Row, Card, Avatar, Badge, Progress, Tag, message, Form, Radio, Alert } from 'antd';
import type { FilterDropdownProps, ColumnType } from 'antd/es/table/interface';
import {
    MailOutlined,
    MessageOutlined,
    SolutionOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
    BankOutlined,
    IdcardOutlined,
    LoginOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import './Students.styles.css';

import { useNavigate, useParams } from 'react-router-dom';
import { Course, Student, getStudents } from '../../apiMAG/students';
import { useUser } from '../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '../../hooks/useResponsive';

interface CourseListProps {
    title: string;
    courses: Course[];
    color: string;
}

const CourseList: React.FC<CourseListProps> = ({ title, courses, color }) => (
    <Card
        title={title}
        bordered={false}
        headStyle={{
            borderBottom: `2px solid ${color}`,
            padding: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: 500,
            paddingLeft: '9px',
        }}
    >
        <List
            dataSource={courses}
            renderItem={(course) => (
                <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography.Text strong>{course.coursename}</Typography.Text>
                    <div style={{ marginLeft: 'auto', color }}>{course.credits} credits</div>
                </List.Item>
            )}
            bordered={false}
        />
    </Card>
);

export default function Students() {
    const { t } = useTranslation();
    const { confirm } = Modal;
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdviseModalVisible, setAdviseModalVisible] = useState(false);
    const [adviseStudent, setAdviseStudent] = useState<Student | null>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState<keyof Student | ''>('');
    const searchInput = useRef<InputRef>(null);
    const navigate = useNavigate();

  
    const { profile } = useUser();
    const [isSendModalVisible, setSendModalVisible] = useState(false);
    ////////////////////////////
    const [emailTitle, setEmailTitle] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendOption, setSendOption] = useState<'current' | 'all'>('current');
    // Fetch students on mount or when deptId changes
    useEffect(() => {
        setLoading(true);
        getStudents(profile?.userid ?? 1)
            .then((data) => setStudents(data))
            .catch((err) => message.error(err.message))
            .finally(() => setLoading(false));
    }, [profile?.userid ]);
    // Move getGroupColor above StudentsWithGroups
    const getGroupColor = useCallback((index: number) => {
        const colors = [
            '#ff6b6b', '#4dabf7', '#40c057', '#f783ac', '#748ffc',
            '#63e6be', '#ffa94d', '#9775fa', '#ff8787', '#3bc9db'
        ];
        return colors[index % colors.length];
    }, []);

    // Then define StudentsWithGroups
    const StudentsWithGroups = useMemo(() => {
        const groupedStudents = students.reduce((acc, student) => {
            const currentKey = JSON.stringify({
                current: student.currentlyRegisteredCourses
                    .map(c => c.courseid)
                    .sort((a, b) => a - b),
                remaining: student.remainingCourses
                    .map(c => c.courseid)
                    .sort((a, b) => a - b)
            });

            if (!acc[currentKey]) {
                acc[currentKey] = {
                    students: [],
                    color: getGroupColor(Object.keys(acc).length)
                };
            }
            acc[currentKey].students.push(student);
            return acc;
        }, {} as Record<string, { students: Student[]; color: string }>);

        return Object.values(groupedStudents).flatMap(group =>
            group.students.map(student => ({
                ...student,
                groupColor: group.color
            }))
        );
    }, [students, getGroupColor]); // Add getGroupColor to dependencies

    // Rest of the code remains the same
    const groupColorMap = useMemo(() => {
        const map = new Map<number, string>();
        StudentsWithGroups.forEach(student => {
            map.set(student.userid, student.groupColor);
        });
        return map;
    }, [StudentsWithGroups]);
    const getColumnSearchProps = (dataIndex: keyof Student): ColumnType<Student> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${String(dataIndex)}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => {
                        confirm();
                        setSearchText(selectedKeys[0] as string);
                        setSearchedColumn(dataIndex);
                    }}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            confirm();
                            setSearchText(selectedKeys[0] as string);
                            setSearchedColumn(dataIndex);
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters?.();
                            setSearchText('');
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            String(record[dataIndex])
                .toLowerCase()
                .includes(String(value).toLowerCase()),
        render: (text: string) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={String(text)}
                />
            ) : (
                text
            ),
    });

    // Handlers
    const showAdviseModal = (student: Student) => {
        setAdviseStudent(student);
        setAdviseModalVisible(true);
    };
    const handleAdviseCancel = () => {
        setAdviseModalVisible(false);
        setAdviseStudent(null);
    };
    const handleSendPlan = () => {
        setAdviseModalVisible(false);
        setSendModalVisible(true);
    };
    const handleEmail = (email?: string) => {
        if (!email) return;
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`, '_blank');
    };
    const handleChat = (studentId?: number) => {
        if (!studentId) return;
        confirm({
            title: 'Start Chat?',
            icon: <ExclamationCircleOutlined />,
            content: `Do you want to open the chat for student #${studentId}?`,
            okText: 'Yes', cancelText: 'No',
            onOk: () => navigate(`/Messager/${studentId}`),
        });
    };

    const columns: ColumnType<Student>[] = [
        { title: t('student_id'), dataIndex: 'userid', key: 'userid', ...getColumnSearchProps('userid'), sorter: (a, b) => a.userid - b.userid },
        { title: t('student_name'), dataIndex: 'fullname', key: 'fullname', ...getColumnSearchProps('fullname') },
        {
            title: t("matching_progress"),
            key: 'group',
            render: (_, record) => {
                const groupColor = groupColorMap.get(record.userid);
                return (
                    <Tag
                        color={groupColor}
                        style={{
                            borderRadius: 12,
                            border: `1px solid ${groupColor}33`,
                            fontWeight: 500
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <div style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: groupColor
                            }} />
                         
                        </div>
                    </Tag>
                );
            }
        },
        {
            title: t('campus'), dataIndex: 'campusname', key: 'campusname',
            filters: Array.from(new Set(students.map(d => d.campusname))).map(c => ({ text: c, value: c })),
            onFilter: (value, record) => record.campusname === value,
        },
        {
            title: t('department'), dataIndex: 'departmentname', key: 'departmentname',
            filters: Array.from(new Set(students.map(d => d.departmentname))).map(dpt => ({ text: dpt, value: dpt })),
            onFilter: (value, record) => record.departmentname === value,
        },
        { title: t('finished_credits'), dataIndex: 'creditsFinished', key: 'creditsFinished', sorter: (a, b) => a.creditsFinished - b.creditsFinished },
        {
            title: t('actions'), key: 'actions', align: 'center',
            render: (_: any, record: Student) => (
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="small">
                            <Button type="link" icon={<MailOutlined />} onClick={() => handleEmail(record.email)}>
                                {t('email')}
                            </Button>
                            <Button type="link" icon={<MessageOutlined />} onClick={() => handleChat(record.userid)}>
                                {t('chat')}
                            </Button>
                        </Space>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<SolutionOutlined />} onClick={() => showAdviseModal(record)}>
                            {t('advise')}
                        </Button>
                    </Col>
                </Row>
            ),
        },
    ];
    const { mobileOnly } = useResponsive();
    return (
        <>
            <Table
                loading={loading}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                className="custom-table"
                rowKey="userid"
                dataSource={students}
                columns={columns}
            />

            <Modal
                title={null}
                open={isAdviseModalVisible}
                onCancel={handleAdviseCancel}
                width={mobileOnly ? '95vw' : '90vw'}
                style={{ maxWidth: 1200 }}
                footer={null}
                centered
                destroyOnClose
                className="luxury-modal"
                bodyStyle={{
                    padding: 0,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.15)'
                }}
            >
                {adviseStudent && (
                    <div className="modal-container" style={{ borderRadius: '12px' }}>
                        {/* Profile Header with Image */}
                        <div
                            className="profile-header"
                            style={{
                                background: 'linear-gradient(135deg, #038b94 0%, #025e63 100%)',
                                padding: mobileOnly ? '24px 16px' : '32px 40px',
                                color: 'white',
                                display: 'flex',
                                flexDirection: mobileOnly ? 'column' : 'row',
                                alignItems: mobileOnly ? 'flex-start' : 'center',
                                gap: mobileOnly ? '16px' : '24px'
                            }}
                        >
                            <Badge
                                dot
                                color="#4cd964"
                                offset={mobileOnly ? [-10, 40] : [-20, 80]}
                                status="processing"
                            >
                                <Avatar
                                    src={adviseStudent.image || '/default-avatar.png'}
                                    size={mobileOnly ? 80 : 120}
                                    style={{
                                        border: '3px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                    }}
                                />
                            </Badge>
                            <div>
                                <Typography.Title
                                    level={mobileOnly ? 3 : 2}
                                    style={{
                                        color: 'white',
                                        margin: 0,
                                        fontWeight: 600,
                                        letterSpacing: '-0.5px',
                                        fontSize: mobileOnly ? '20px' : '24px'
                                    }}
                                >
                                    {adviseStudent.fullname}
                                </Typography.Title>
                                <Space
                                    size={mobileOnly ? 8 : 16}
                                    style={{ marginTop: 8 }}
                                    wrap={mobileOnly}
                                >
                                    <Tag style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        margin: mobileOnly ? '4px 0' : 0
                                    }}>
                                        <IdcardOutlined /> id: {adviseStudent.userid}
                                    </Tag>
                                    <Tag style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        margin: mobileOnly ? '4px 0' : 0
                                    }}>
                                        <BankOutlined /> {adviseStudent.campusname}
                                    </Tag>
                                </Space>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div style={{
                            padding: mobileOnly ? '16px 20px' : '32px 40px',
                            background: '#f8fafc'
                        }}>
                            {/* Academic Overview */}
                            <Card
                                title={t('academicOverview')}
                                bordered={false}
                                headStyle={{
                                    borderBottom: '2px solid #038b94',
                                    padding: '0 0 8px 0',
                                    fontSize: mobileOnly ? '16px' : '20px',
                                    fontWeight: 500
                                }}
                                style={{ marginBottom: 12 }}
                            >
                                <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
                                    {/* Department & GPA */}
                                    <Col span={mobileOnly ? 24 : 12}>
                                        <div>
                                            <Typography.Text strong>{t('department')}:</Typography.Text>
                                            <Typography.Text style={{
                                                display: 'block',
                                                fontWeight: 500,
                                                fontSize: mobileOnly ? '14px' : 'inherit'
                                            }}>
                                                {adviseStudent.departmentname}
                                            </Typography.Text>
                                        </div>
                                    </Col>
                                    <Col span={mobileOnly ? 24 : 12}>
                                        <div>
                                            <Typography.Text strong>{t('currentGPA')}:</Typography.Text>
                                            <Typography.Text style={{
                                                display: 'block',
                                                color: '#038b94',
                                                fontWeight: 600,
                                                fontSize: mobileOnly ? '14px' : 'inherit'
                                            }}>
                                                3.97
                                            </Typography.Text>
                                        </div>
                                    </Col>

                                    {/* Progress & Contact */}
                                    <Col span={mobileOnly ? 24 : 12}>
                                        <div style={{ width: mobileOnly ? '100%' : '80%' }}>
                                            <Typography.Text
                                                strong
                                                style={{
                                                    display: 'block',
                                                    marginBottom: 8,
                                                    fontSize: mobileOnly ? '14px' : 'inherit'
                                                }}
                                            >
                                                {t('creditsProgress')}:
                                            </Typography.Text>
                                            <Progress
                                                percent={Number(
                                                    (adviseStudent.creditsFinished / Number(adviseStudent.totalCredits) * 100
                                                    ).toFixed(0))}
                                                strokeColor="#038b94"
                                                trailColor="#e6f4ff"
                                                strokeWidth={12}
                                                format={() => `${adviseStudent.creditsFinished}/${adviseStudent.totalCredits}`}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={mobileOnly ? 24 : 12}>
                                        <Typography.Text strong>{t('contact')}:</Typography.Text>
                                        <div style={{ marginTop: 8, fontSize: mobileOnly ? '14px' : 'inherit' }}>
                                            <MailOutlined /> {adviseStudent.email}
                                        </div>
                                    </Col>

                                    {/* Buttons */}
                                    <Col span={24}>
                                        <Row
                                            justify={mobileOnly ? 'start' : 'end'}
                                            gutter={[16, 16]}
                                            style={{ marginTop: 24 }}
                                        >
                                            <Col>
                                                <Button
                                                    icon={<SendOutlined />}
                                                    type="primary"
                                                    size={mobileOnly ? 'middle' : 'large'}
                                                    style={{
                                                        background: '#038b94',
                                                        padding: mobileOnly ? '6px 16px' : '8px 24px',
                                                        height: 'auto',
                                                        fontSize: mobileOnly ? '14px' : 'inherit'
                                                    }}
                                                    onClick={() => handleSendPlan()}
                                                >
                                                    {t('sendAdvisingPlan')}
                                                </Button>
                                            </Col>
                                            <Col>
                                                <Button
                                                    icon={<LoginOutlined />}
                                                    type="primary"
                                                    size={mobileOnly ? 'middle' : 'large'}
                                                    style={{
                                                        background: '#038b94',
                                                        padding: mobileOnly ? '6px 16px' : '8px 24px',
                                                        height: 'auto',
                                                        fontSize: mobileOnly ? '14px' : 'inherit'
                                                    }}
                                              
                                                >
                                                    {t('accessProfile')}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>

                            <Row gutter={mobileOnly ? 16 : 32}>
                                <Col span={mobileOnly ? 24 : 12}>
                                    <CourseList
                                        title={t('currentCourses')}
                                        courses={adviseStudent.currentlyRegisteredCourses}
                                        color="#038b94"

                                    />
                                </Col>
                                <Col span={mobileOnly ? 24 : 12}>
                                    <CourseList
                                        title={t('remainingRequirements')}
                                        courses={adviseStudent.remainingCourses}
                                        color="#ff6b6b"

                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                title={t("composeAdvisoryMessage")}
                open={isSendModalVisible}
                onCancel={() => {
                    setSendModalVisible(false);
                    setAdviseModalVisible(true); // Reopen parent modal
                }}
                footer={null}
                centered
           
                className="luxury-modal"
                style={{ minWidth: "45%" }}
                bodyStyle={{
                    padding: 0,
                    borderRadius: 12,
                    overflow: 'hidden',
                    minWidth: "100%",
               
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e6f4ff 100%)',
                    padding: 24,
                    minWidth: "100%"
                }}>
                    <Form layout="vertical">
                        {/* Email Header Section */}
                        <div style={{
                            background: 'white',
                            minWidth: "100%",
                            borderRadius: 8,
                            padding: 24,
                            marginBottom: 24,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#025e63' }}>{t("emailTitle")}</span>}
                                rules={[{ required: true, message: 'Please enter a title' }]}
                            >
                                <Input
                                    value={emailTitle}
                                    onChange={(e) => setEmailTitle(e.target.value)}
                                    placeholder={t("enterEmailSubject")}
                                    prefix={<MailOutlined style={{ color: '#038b94' }} />}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#025e63' }}>{t("recipients")}</span>}
                            >
                                
                                    <Radio.Group
                                        value={sendOption}
                                        onChange={(e) => setSendOption(e.target.value)}
                                        buttonStyle="solid"
                                        style={{ width: "100%", gap: 8 }}
                                    >
                                        <Row justify="center">
                                        <Col lg={12} style={{ maxWidth: "70%" } }>
                                                <Radio.Button
                                                    value="current"
                                                style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: "5px" }}
                                                >

                                                {t("currentStudent")}
                                                </Radio.Button>
                                            </Col>
                                        <Col lg={12} style={{ maxWidth: "70%" }}>
                                                <Radio.Button
                                                    value="all"
                                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                                >

                                                {t("entireGroup")}  (
                                                {StudentsWithGroups.filter(s =>
                                                    s.groupColor === groupColorMap.get(adviseStudent?.userid || 0)
                                                ).length}{" "}  {t("students")})
                    )
                                                </Radio.Button>
                                        </Col>
                                        <Alert
                                            message={t("recepients")}
                                            description={t("sendAllDescription")}
                                            type="info"
                                            showIcon={false} 
                                            banner
                                            style={{ width: "100%", borderRadius:"12px",marginTop:"10px"} }
                                        />
                                        </Row>
                                    </Radio.Group>
                            
                            </Form.Item>
                        </div>

                        {/* Message Composition Area */}
                        <Form.Item
                            label={<span style={{ fontWeight: 600, color: '#025e63' }}>{t("yourMessage")}</span>}
                            rules={[{ required: true, message: t("pleaseEnterMessage") }]}
                        >
                            <Input.TextArea
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder={t("writeMessageHere")}
                                autoSize={{ minRows: 6, maxRows: 10 }}
                                style={{
                                    borderRadius: 8,
                                    border: '1px solid #e6f4ff',
                                    padding: 16,
                                    fontSize: 16
                                }}
                            />
                        </Form.Item>

                        {/* Action Bar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 16,
                            marginTop: 32,
                            borderTop: '1px solid #e6f4ff',
                            paddingTop: 24
                        }}>
                            <Button
                                size="large"
                                onClick={() => setSendModalVisible(false)}
                                style={{ padding: '8px 24px' }}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                icon={<SendOutlined />}
                                style={{
                                    background: '#038b94',
                                    padding: '8px 32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                                onClick={() => {
                                    if (!adviseStudent) return;

                                    // Get emails based on selection
                                    const emails = sendOption === 'current'
                                        ? [adviseStudent.email]
                                        : StudentsWithGroups
                                            .filter(s => s.groupColor === groupColorMap.get(adviseStudent.userid))
                                            .map(s => s.email);

                                    // Create mailto link
                                    const subject = encodeURIComponent(emailTitle);
                                    const body = encodeURIComponent(emailMessage);
                                    const mailtoLink = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;
                                    window.open(mailtoLink, '_blank');
                                }}
                            >
                                {t("sendEmail")}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
}
