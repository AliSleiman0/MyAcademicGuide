import { Card, Row, Col, Tag, Typography, Divider, Statistic } from 'antd';
import { BookOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

// Interface for Course Card component
interface CourseCardProps {
    courseName: string;
    grade?: string;
    semester: string;
    credits: number;
    textBottom?: string;
    textColor?: string;
    gradeColor?: string;
    iconBottom?: ReactNode;
    borderC?: string;
    canRegister?: boolean | null;
    
}

const CourseCard: React.FC<CourseCardProps> = ({
    courseName,
    grade = "Current",
    semester,
    credits,
    textBottom,
    textColor,
    gradeColor = '#52c41a',
    iconBottom = <BookOutlined />,
    canRegister=null,
    borderC = "#dedede",
}) => {
    const { t } = useTranslation();
    const borderRaduisDynamic = grade == "Current" ? "10%" : "30%";
    return (
        <Card hoverable style={{ marginBottom: "10px", borderColor: borderC } }>
            <Card.Meta
                title={
                    <Row
                        wrap={grade === "Current"}
                        justify="space-between"
                        align="middle"
                        
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexWrap: grade === "Current" ? 'wrap' : 'nowrap'
                        }}
                    >
                        <Col
                            flex="auto"
                            style={{
                                overflow: 'hidden',
                                minWidth: '60%',  // Prevent title from shrinking too much
                                ...(grade === "Current" ? {
                                    maxWidth: '100%',
                                    flexBasis: '100%',
                                    marginBottom: 8  // Add spacing when wrapped
                                } : {})
                            }}
                        >
                            <Title
                                style={{
                                    margin: 0,
                                    fontSize: "0.8rem",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {courseName}
                            </Title>
                        </Col>

                        <Col
                            flex="none"
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                ...(grade === "Current" ? {
                                    width: '100%',
                                    justifyContent: 'flex-start'
                                } : {})
                            }}
                        >
                            <Tag
                                style={{
                                    borderRadius: borderRaduisDynamic,
                                    padding: '4px 8px',
                                    backgroundColor: gradeColor,
                                    color: "white",
                                    border: "none",
                                    fontSize: grade === "Current" ? "0.8rem" : "1rem",
                                    flexShrink: 0  // Prevent tag from shrinking
                                }}
                            >
                                {canRegister === null
                                    && grade
                                }
                            </Tag>
                        </Col>
                    </Row>
                }
                description={
                    <div>
                        <Divider style={{ margin: '12px 0' }} />
                        <Row justify="space-between">
                            <Col><Text type="secondary" style={{ fontSize: "0.9rem" } }>{semester}</Text></Col>
                            <Col>
                                <Statistic
                                    value={credits}
                                    suffix={t("courses.credits.credits")}
                                    valueStyle={{ fontSize: 14 }}
                                />
                            </Col>
                        </Row>
                        <Row align="middle" gutter={8} style={{ marginTop: 8 }}>
                            <Col>{iconBottom}</Col>
                            <Col><Text type="secondary" style={{ color: textColor,fontSize:"0.9rem" } }>{textBottom}</Text></Col>
                        </Row>
                    </div>
                }
            />
        </Card>
    );
};
export default CourseCard