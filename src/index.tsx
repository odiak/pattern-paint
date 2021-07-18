import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import { App } from './App'

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
`

const e = document.getElementById('app')
ReactDOM.render(
  <>
    <GlobalStyle />
    <App />
  </>,
  e
)
