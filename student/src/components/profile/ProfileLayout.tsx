import React, { useEffect } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { ProfileInfo } from '@app/components/profile/profileCard/ProfileInfo/ProfileInfo';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { ProfileNav } from '@app/components/profile/profileCard/ProfileNav/ProfileNav';
import { useResponsive } from '@app/hooks/useResponsive';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { BaseRow } from '../common/BaseRow/BaseRow';
import { BaseCol } from '../common/BaseCol/BaseCol';
import { Row } from 'antd';
import { useUser } from '../../Context/UserContext';

const ProfileLayout: React.FC = () => {
     const { profile:user, usertype } = useUser();

    const { t } = useTranslation();
    const { isTablet: isTabletOrHigher, mobileOnly, isDesktop } = useResponsive();
    const location = useLocation();
    const navigate = useNavigate();

    const { isTablet } = useResponsive();

    const isTitleShown = isTabletOrHigher || (mobileOnly && location.pathname === '/profile');
    const isMenuShown = isTabletOrHigher || (mobileOnly && location.pathname !== '/profile');

    useEffect(() => {
        isTablet && location.pathname === '/profile' && navigate('personal-info');
    }, [isTablet, isDesktop, location.pathname, navigate]);

    return (
        <div style={{ minHeight: "75vh" }}>
            <PageTitle>{t('profile.profile')}</PageTitle>
            {!isTitleShown && (
                <Btn icon={<LeftOutlined />} type="text" onClick={() => navigate('/profile')}>
                    {t('common.back')}
                </Btn>
            )}

            <BaseRow gutter={30} style={{ marginTop: isDesktop ? "40px" : "0px" }} >
                {isTitleShown && (
                    <BaseCol xs={24} md={24} xl={8} >
                        <ProfileCard >
                            <BaseRow gutter={[30, 30]}>
                                <BaseCol xs={24} md={12} xl={24}>
                                    <ProfileInfo profileData={user} />
                                </BaseCol>

                                <BaseCol xs={24} md={12} xl={24}>
                                    <ProfileNav />
                                </BaseCol>
                            </BaseRow>
                        </ProfileCard>
                    </BaseCol>
                )}

                {isMenuShown && (
                    <BaseCol  xs={24} md={24} xl={16}>
                        <HoverableDiv>
                            <Outlet  />
                        </HoverableDiv>
                    </BaseCol>
                )}
            </BaseRow>

        </div>
    );
};
const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: none;

  &:hover {
   
    box-shadow: 0 5px 10px rgba(3, 139, 148, 0.3);
  }
`;
const ProfileCard = styled(BaseCard)`
            height: unset;
            transition: all 0.3s ease;
  
  box-shadow: none;
  
  &:hover {
  
    box-shadow: 0 5px 10px rgba(3, 139, 148, 0.3);
            `;
const BaseCont = styled(BaseCard)`
            height: unset;
            `;
const Btn = styled(BaseButton)`
            font-size: 1rem;
            margin-bottom: 1rem;
            font-weight: 600;
            padding: 0;
            height: unset;
            color: var(--secondary-color);
            `;

export default ProfileLayout;
