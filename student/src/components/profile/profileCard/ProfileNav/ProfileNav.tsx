import React from 'react';
import { useTranslation } from 'react-i18next';
import { profileNavData } from '@app/constants/profileNavData';
import { useLocation, useNavigate } from 'react-router-dom';
import * as S from './ProfileNav.styles';
import styled from 'styled-components';

export const ProfileNav: React.FC = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <S.Wrapper>
            {profileNavData.map((item) => (
                <HoverableDiv>
                    <S.Btn
                        key={item.id}
                        icon={item.icon}
                        type="text"
                        color={item.color}
                        onClick={() => navigate(item.href)}
                        $isActive={`/profile/${item.href}` === location.pathname}
                    >
                        {t(item.name)}
                    </S.Btn> </HoverableDiv>
      ))}
                </S.Wrapper>
 
    );  
};
const HoverableDiv = styled.div`
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: none;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 10px 10px 20px rgba(3, 139, 148, 0.3);
  }
`;