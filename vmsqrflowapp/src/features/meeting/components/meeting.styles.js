import styled from 'styled-components/native';

export const Heading = styled.Text`
  font-size: 25px;
  font-weight: bold;
`;

export const VisitorImageWrapper = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const VisitorImage = styled.Image`
  height: 200px;
  width: 200px;
  border-radius: 10px;
`;

export const ActionsContainer = styled.View`
  margin-top: 50px;
  margin-bottom: 50px;
`;

export const ButtonsContainer = styled.View`
  margin-top: 20px;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;
