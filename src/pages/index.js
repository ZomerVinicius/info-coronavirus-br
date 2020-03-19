import axios from "axios"
import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { useMediaQuery } from "react-responsive"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { HomeCards } from "../components/HomeCards"
import { HomeFooter } from "../components/HomeFooter"
import { HomeHeader } from "../components/HomeHeader"
import Layout from "../components/Layout"
import SEO from "../components/Seo"
import { getUnique } from "../utils/index"

export default function Index() {
  const [coronavirusCases, setCoronavirusCases] = useState([])
  const [loadingCoronaVirusCases, setLoadingCoronaVirusCases] = useState(true)
  const [selectedState, setSelectedState] = useState("")
  const [suspiciousCases, setSuspiciousCases] = useState(0)
  const [testedNotInfectedCases, setTestedNotInfectedCases] = useState(0)
  const [infectedCases, setInfectedCases] = useState(0)
  const [deceasedCases, setDeceasedCases] = useState(0)
  const [casesByDay, setCasesByDay] = useState([])

  const getWordometerBrazilCases = async () => {
    try {
      const brazilConfirmedCasesRealTime = await axios.get(
        "https://corona.lmao.ninja/countries/Brazil"
      )
      return brazilConfirmedCasesRealTime.data
    } catch (error) {
      console.log(error)
    }
  }

  const getMinistryOfHealthBrazilAndStatesCases = async () => {
    try {
      const allCases = await axios.get(
        "https://api.apify.com/v2/key-value-stores/TyToNta7jGKkpszMZ/records/LATEST?disableRedirect=true"
      )
      return allCases.data
    } catch (error) {
      alert(
        "Não foi possível obter os dados, avise nesse e-mail infocoronavirusbr@gmail.com"
      )
    }
  }

  const getCoronavirusCases = async () => {
    setLoadingCoronaVirusCases(true)
    const allCases = await getMinistryOfHealthBrazilAndStatesCases()
    const brazilConfirmedCasesRealTime = await getWordometerBrazilCases()
    setCoronavirusCases(allCases)
    setSuspiciousCases(allCases.suspiciousCases)
    setTestedNotInfectedCases(allCases.testedNotInfected)
    //check which data source is more updated based on data
    setInfectedCases(
      brazilConfirmedCasesRealTime?.cases > allCases.infected
        ? brazilConfirmedCasesRealTime?.cases
        : allCases.infected
    )
    setDeceasedCases(
      brazilConfirmedCasesRealTime?.deaths > allCases.deceased
        ? brazilConfirmedCasesRealTime?.deaths
        : allCases.deceased
    )
    setLoadingCoronaVirusCases(false)
  }

  useEffect(() => {
    getCoronavirusCases()
    getCasesByDay()
  }, [])

  const getCasesByDay = async () => {
    try {
      const response = await axios.get(
        "https://pomber.github.io/covid19/timeseries.json"
      )
      const brazilCasesByDay = response.data.Brazil
      const nonRepeatedBrazilCasesByDay = getUnique(
        brazilCasesByDay,
        "confirmed"
      )
      const nonRepeatedBrazilCasesByDayWithFormattedDate = nonRepeatedBrazilCasesByDay.map(
        casesByDay => ({
          date: format(new Date(casesByDay.date), "dd/MM/yyyy"),
          confirmed: casesByDay.confirmed,
          deaths: casesByDay.deaths,
          recovered: casesByDay.recovered
        })
      )
      setCasesByDay(nonRepeatedBrazilCasesByDayWithFormattedDate)
    } catch (error) {
      console.log(error)
    }
  }

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-device-width: 1000px)"
  })

  return (
    <Layout>
      <SEO keywords={[`coronavirus`, `brasil`, `casos`]} title="Home" />

      <HomeHeader
        {...{
          loadingCoronaVirusCases,
          setSelectedState,
          selectedState,
          coronavirusCases,
          setSuspiciousCases,
          setTestedNotInfectedCases,
          setInfectedCases,
          setDeceasedCases,
          getCoronavirusCases
        }}
      />
      <HomeCards
        suspiciousCases={suspiciousCases}
        loadingCoronaVirusCases={loadingCoronaVirusCases}
        infectedCases={infectedCases}
        testedNotInfectedCases={testedNotInfectedCases}
        deceasedCases={deceasedCases}
      />

      {!selectedState && (
        <div className={"max-w mt-5"}>
          <div
            className="border-r border-b border-l border-gray-900 lg:border-l-0  rounded-lg py-6 pr-6 md:px-6  flex flex-col text-center"
            style={{ backgroundColor: "#212024" }}
          >
            <span className="text-gray-400 text-lg">Relatório diário</span>
            <ResponsiveContainer height={isDesktopOrLaptop ? 500 : 350}>
              <LineChart
                data={casesByDay}
                margin={{ left: 0, right: 16, top: 24, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  textAnchor="middle"
                  tick={{ fontSize: 16, angle: -25, stroke: "white" }}
                  tickMargin={20}
                />
                <YAxis dataKey="confirmed" />
                <Tooltip label="date" />
                <Line dataKey="confirmed" name="Confirmados" stroke="#e74c3c" />
                <Line dataKey="deaths" name="Mortes" stroke="black" />
                <Line dataKey="recovered" name="Recuperados" stroke="#2ecc71" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <HomeFooter />
      {/*
      <AdSense.Google client="ca-pub-5598257228129274" slot="7806394673" />
      */}
    </Layout>
  )
}
