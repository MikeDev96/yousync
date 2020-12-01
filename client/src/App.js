import React from "react"
import "./App.css"
import 'fontsource-roboto'
import Layout from "./components/Layout"
import Routes from "./components/Routes"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { QueryParamProvider } from "use-query-params"
import GlobalStateProvider from "./state/GlobalStateProvider"
import DrawerProvider from "./components/DrawerProvider"

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <QueryParamProvider ReactRouterRoute={Route} >
        <GlobalStateProvider>
          <DrawerProvider>
            <Layout>
              <Routes />
            </Layout>
          </DrawerProvider>
        </GlobalStateProvider>
      </QueryParamProvider>
    </Router>
  )
}

export default App