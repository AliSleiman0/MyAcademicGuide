import { useState, useCallback } from 'react';
import { Card, Avatar, Spin, Alert, Typography, Button } from 'antd';
import { useQuery } from 'react-query';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Advisor, getRespectiveAdvisors } from '../../apiMAG/advisor';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/common/PageTitle/PageTitle';

const { Title, Text } = Typography;

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

// Styled components
const PageContainer = styled.div`
  padding: 32px;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StyledHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #038b94 0%, #001529 100%);
  border-radius: 8px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 24px;
  }
`;

const CardContainer = styled.div`
  padding: 16px;
`;

const AdvisorCard = ({ advisor }: { advisor: Advisor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChatStart = () => {
        if (!advisor?.userid) return;
        navigate(`/Messager/${advisor.userid}`);
    };
    const handleHover = useCallback((state: boolean) => () => {
        setIsHovered(state);
    }, []);
  
    return (
        <CardContainer>
            <Card
                style={{
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.09)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                }}
                onMouseEnter={handleHover(true)}
                onMouseLeave={handleHover(false)}
            >
                <div style={{ textAlign: 'center' }}>
                    <Avatar
                        src={advisor.image}
                        size={128}
                        style={{
                            border: '3px solid #038b94',
                            marginBottom: 16,
                            display: 'block',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}
                    />
                    <Title level={4} style={{ marginBottom: 8 }}>
                        {advisor.fullname}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        ID: {advisor.userid}
                    </Text>
                    <Text
                        style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'rgba(0, 0, 0, 0.65)'
                        }}
                    >
                        {advisor.email}
                    </Text>
                    <Button onClick={handleChatStart}
                        style={{ color: "white", backgroundColor: "#038b94", marginTop: "9px" }}>
                        {t("sider.reach_out")}</Button>
                </div>
            </Card>
        </CardContainer>
    );
};

const AdvisorsGrid = () => {
    const { t } = useTranslation();
    const { data, isLoading, isError, error, refetch } = useQuery(
        'advisors',
        getRespectiveAdvisors,
        {
            useErrorBoundary: true,
        }
    );

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <Spin size="large" tip="Loading Advisors..." />
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

    return (
        <PageContainer>
            <PageTitle>{t('sider.advisor')}</PageTitle>
            <StyledHeader>
                <Title level={2} style={{ color: 'inherit', marginBottom: 8 }}>
                    {t("sider.advisor_text1")}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                    {t("sider.advisor_text2")}

                </Text>
            </StyledHeader>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '24px',
                }}
            >
                {data?.map(advisor => (
                    <AdvisorCard key={advisor.userid} advisor={advisor} />
                ))}
            </div>
        </PageContainer>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AdvisorsGrid />
    </QueryClientProvider>
);

export default App;