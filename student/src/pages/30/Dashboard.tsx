import React from 'react';
import { useTranslation } from 'react-i18next';

import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Col, Row } from 'antd/lib/grid';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Divider, Space, Typography } from 'antd';
import Card from 'antd/lib/card/Card';
import DonutChart from '../../components/antvDonutChart';
import CoursesList from '../../components/CoursesList';
import BarChart from '../../components/antvBarChart';
import styled from 'styled-components';
import { useResponsive } from '../../hooks/useResponsive';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { getDashboardData } from '../../apiMAG/Dashboard';
import { Alert } from '../../components/common/BaseAlert/BaseAlert.styles';
import Spin from 'antd/es/spin';
//$env:NODE_OPTIONS = "--openssl-legacy-provider"; yarn start
const { } = Typography;
// Query client configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            staleTime: 1000 * 60 * 5,
        },
    },
});
const Dashboard: React.FC = () => {
    
    const { isDesktop } = useResponsive();
    const { t } = useTranslation();
    //$env:NODE_OPTIONS = "--openssl-legacy-provider"; yarn start
    const { data, isLoading, isError, error, refetch } = useQuery(
        'advisors',
        getDashboardData,
        {
            useErrorBoundary: true,
        }
    );

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <Spin size="large" tip="Loading Dashboard Data..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: '32px' }}>
                <Alert
                    message="Connection Error"
                    description={error instanceof Error ? error.message : 'Failed to load Data'}
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
    const bannerStyles = {
        banner: {
            backgroundColor: '#e3faf8', // Subtle grey matching Ant Design's palette
            padding: '16px 24px',
            borderRadius: '8px',
            width: '100%',
        },
        icon: {
            fontSize: '20px',
            color: '#038b94', // Medium grey for contrast
        },
        text: {
            fontSize: '16px',
            color: '#262626', // Dark grey for readability
        },
        responsiveText: {
            '@media (max-width: 768px)': {
                fontSize: '10px',
            }
        }
    };
  
    const coursesTakenNumber = (data?.total_courses || 0) - (data?.remaining_courses?.length || 0);
   
    const barChartData = Object.entries(data?.grades_distribution ?? {}).map(([grade, count]) => ({
        grade: grade || 'Ungraded',  // Handle empty string case
        count: count
    }));
    return (
        <>
            <PageTitle>{t('common.dashboard')}</PageTitle>
           
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
                                {t('welcome.title')}{' '}{t('welcome.semester_fall')}
                               
                                {t('welcome.contact')}
                            </Typography.Text>
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row gutter={[16, 16]} justify="space-between">
                <Col
                    xs={24}    // Full width on mobile
                    sm={24}    // Full width on small tablets
                    md={24}    // 2 per row on tablets
                    lg={7}     // 3 per row on desktops
                    xl={7}
                    style={{ display: 'flex' }}
                >
                    <HoverableDiv>
                        <Card
                            title={t('courses.completed_vs_required.title')}

                            style={{
                                width: '100%',
                                minHeight: '400px', // Consistent card height
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <DonutChart
                                completed={ data?.courses_destribution_by_status.Passed.course_count}
                                total={data?.total_courses}
                                height={300}
                                kkey="something"
                            />
                        </Card>
                    </HoverableDiv>
                </Col>
                <Col

                    xs={24}    // Full width on mobile
                    sm={24}    // Full width on small tablets
                    md={24}    // 2 per row on tablets
                    lg={7}     // 3 per row on desktops
                    xl={7}
                    style={{ display: 'flex' }}
                >
                    <HoverableDiv>
                        <Card
                            title={t('courses.passed_percentage.title')}

                            style={{
                                width: '100%',
                                minHeight: '400px', // Consistent card height
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <DonutChart
                                completed={data?.courses_destribution_by_status.Passed.course_count}
                                total={coursesTakenNumber}
                                height={300}
                                kkey="percentage"
                            />
                        </Card>
                    </HoverableDiv>
                </Col>
                <Col

                    xs={24}    // Full width on mobile
                    sm={24}    // Full width on small tablets
                    md={24}    // 2 per row on tablets
                    lg={7}     // 3 per row on desktops
                    xl={7}
                    style={{ display: 'flex' }}
                >
                    <HoverableDiv>
                        <Card
                            title={t('courses.credits.title')}

                            style={{
                                width: '100%',
                                minHeight: '400px', // Consistent card height
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <DonutChart
                                completed={data?.courses_destribution_by_status.Passed.credits_count}
                                total={data?.total_credits}
                                height={300}
                                kkey="something"
                            />
                        </Card>
                    </HoverableDiv>
                </Col>
            </Row>
            <br />
            <Row >

                <Col

                    xs={24}    // Full width on mobile
                    sm={24}    // Full width on small tablets
                    md={24}    // 2 per row on tablets
                    lg={24}     // 3 per row on desktops
                    xl={24}
                    style={{ display: 'flex' }}
                >
                    <HoverableDiv2>
                        <Card
                            title={t("grades.distribution")}

                            style={{
                                width: '100%',
                                padding: "20px",
                                minHeight: '400px', // Consistent card height
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                            }}
                        >
                            <BarChart
                                data={barChartData}
                            />
                        </Card>
                    </HoverableDiv2>
                </Col>

            </Row>
            <br /><br />
            <Divider style={{ borderColor: '#038b94' }}>{t("courses.my_courses")}</Divider>
            <br />
            <Row>
                <CoursesList data={data} />
            </Row>

        </>
    );
};
const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: none;
      width: 100%;
  &:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 20px rgba(3, 139, 148, 0.3);
  }
`;
const HoverableDiv2 = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: none;
      width: 100%;
  &:hover {
   
    box-shadow: 0 10px 20px rgba(3, 139, 148, 0.3);
  }
`;

const App = () => (
    <QueryClientProvider client={queryClient}>
        <Dashboard />
    </QueryClientProvider>
)
export default App;;