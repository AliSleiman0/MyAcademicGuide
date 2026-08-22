// flowchartStyles.ts
import styled from 'styled-components';

// Banner style object
export const bannerStyles = {
    banner: {
        backgroundColor: '#e3faf8',
        padding: '16px 24px',
        borderRadius: '8px',
        width: '100%',
    },
    icon: {
        fontSize: '20px',
        color: '#038b94',
    },
    text: {
        fontSize: '16px',
        color: '#262626',
    },
    responsiveText: {
        '@media (max-width: 768px)': {
            fontSize: '10px',
        },
    },
};

// Styled components
export const FlowchartContainer = styled.div`
  width: 100%;
  height: 65vh;
  border: 2px solid #038b94;
  border-radius: 8px;
  background-color: white;
  position: relative;
`;

export const CourseNodeContainer = styled.div<{
    $highlighted?: boolean;
    $showCorequisites: boolean;
}>`
  background: white;
  border: 2px solid #038b94;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  transform: ${(p) =>
        p.$highlighted && p.$showCorequisites ? 'scale(1.1)' : 'none'};
  box-shadow: ${(p) =>
        p.$highlighted && p.$showCorequisites
            ? '0 4px 12px rgba(3, 139, 148, 0.3)'
            : 'none'};
  &:hover {
    box-shadow: 0 4px 12px rgba(3, 139, 148, 0.2);
    transform: translateY(-2px);
  }
`;

export const CourseCode = styled.div`
  font-weight: 600;
  color: #038b94;
  font-size: 25px;
`;

export const LegendContainer = styled.div`

  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
 
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size:1.1rem;
`;

export const ColorSwatch = styled.div<{ color: string, border:string }>`
  width: 20px;
  height: 20px;
  background: ${(p) => p.color};
  border-radius: 4px;
  margin-right: 10px;
  border:${(p) => p.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

export const SolidLine = styled.div`
  width: 60px;
  height: 2px;
  background: #036b74;
  margin-right: 10px;
`;

export const DashedLine = styled.div`
  width: 60px;
  height: 2px;
  border-bottom: 2px dashed #03aabd;
  margin-right: 10px;
`;
