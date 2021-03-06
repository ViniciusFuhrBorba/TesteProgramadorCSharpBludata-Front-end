import styled from 'styled-components';
import { shade } from 'polished';

export const Container = styled.div`
  > header {
    height: 94px;
    background: #468faf;

    display: flex;
    align-items: center;

    border-bottom: black solid 2px;

    div {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;

      svg {
        color: black;
        height: 35px;
        width: 35px;

        &:hover {
          color: ${shade(0.2, '#495057')};
        }
      }
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  width: 100%;
  form {
    width: 334px;
    text-align: center;

    h1 {
      margin-top: -73px;
      margin-bottom: 48px;
    }
  }
`;
