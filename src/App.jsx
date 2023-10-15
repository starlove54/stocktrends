import logo from './assets/stocktrends_logo.png'
import { useEffect, useState } from 'react'

const App = () => {
  const [stockSymbol, setStockSymbol] = useState('')
  const [stockData, setStockData] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTableView, setIsTableView] = useState(false)
  const [isPopping, setPopping] = useState(false)
  const [isEmptyDataMessage, setisEmptyDataMessage] = useState(false)
  const [maxValue, setMaxValue] = useState(0)
  const [inputEmpty, setInputEmpty] = useState(-1)

  // make the buttons pop
  const handlePop = () => {
    setPopping(true)
    setTimeout(() => {
      setPopping(false)
    }, 200)
  }

  //grab the latest value for stockSymbol from input field
  const handleSymbolChange = (e) => {
    setStockSymbol(e.target.value.toUpperCase())
  }

  //handle analyze button and deal with api request
  const fetchStockData = async () => {
    handlePop()
    try {
      const response = await fetch(
        'https://f68370a9-1a80-4b78-b83c-8cb61539ecd6.mock.pstmn.io/api/v1/get_market_data/'
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const newIndex = data.pagination.count
      setMaxValue(newIndex)

      const filteredData = data.data.filter(
        (item) => item.symbol === stockSymbol
      )

      if (inputEmpty === 1 && filteredData.length === 0) {
        setisEmptyDataMessage(true)
        setIsTableView(false)
        return
      } else {
        setisEmptyDataMessage(false)
      }

      const formattedData = filteredData.map((item, index) => {
        //format date
        const datePart = item.date.slice(0, 10)
        const [year, month, day] = datePart.split('-')
        const formattedDate = `${day}-${month}-${year}`

        //format colour according to given logic
        let color
        if (index === filteredData.length - 1) {
          color = 'black'
        } else if (item.open > filteredData[index + 1].close) {
          color = 'green'
        } else if (item.open < filteredData[index + 1].close) {
          color = 'red'
        } else {
          color = 'black'
        }

        return { ...item, date: formattedDate, color }
      })

      const startSliceIndex = currentIndex

      if (startSliceIndex >= 0 && startSliceIndex < formattedData.length) {
        const sevenDaysData = formattedData.slice(
          startSliceIndex,
          startSliceIndex + 7
        )
        setStockData(sevenDaysData)
        setIsTableView(true)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchStockData()
  }, [currentIndex, inputEmpty])

  const handlePrev = () => {
    handlePop()
    const newIndex = currentIndex + 7
    if (newIndex < maxValue) {
      setCurrentIndex(newIndex)
    }
  }

  const handleNext = () => {
    handlePop()
    const newIndex = currentIndex - 7
    if (newIndex >= 0) {
      setCurrentIndex(newIndex)
    }
  }

  const handleAnalyze = () => {
    setisEmptyDataMessage(false)

    if (stockSymbol === '') {
      setInputEmpty(0)
    } else {
      setInputEmpty(1)
      fetchStockData()
    }
  }

  const handleAnalyzeNewStock = () => {
    handlePop()
    setStockSymbol('')
    setStockData([])
    setIsTableView(false)
    setInputEmpty(-1)
  }

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='bg-neutral-200 p-6 rounded shadow-lg w-120'>
        <div className='flex justify-center items-center'>
          <img src={logo} alt='StockTrends Logo' className='h-6 mr-2' />
          <h1 className='text-4xl text-stone-600 font-bold'>StockTrends</h1>
        </div>
        <p className='text-xs text-center text-stone-700 font-regular mb-12 pl-5'>
          Track your favorite stocks
        </p>

        {!isTableView ? (
          <div className='flex flex-col justify-center items-center'>
            <p className='text-lg text-center text-stone-600 font-semibold mb-2'>
              Enter Stock Symbol
            </p>
            <input
              type='text'
              placeholder='for eg: AAPL'
              className='w-1/2 p-2 mt-4 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200 text-center'
              value={stockSymbol}
              onChange={handleSymbolChange}
              id={crypto.randomUUID()}
            />
            <div
              className='error-messages'
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <p
                className={`${
                  inputEmpty === 0 ? 'visible' : 'invisible'
                } text-xs text-center mt-1 text-blue-800 font-seriff`}
              >
                Please enter a valid stock symbol
              </p>
              <p
                className={`${
                  isEmptyDataMessage ? 'visible' : 'invisible'
                } text-xs text-center text-blue-800 font-seriff`}
              >
                There is no data to show, are you sure you entered the correct
                stock symbol?
              </p>
            </div>
            <button
              className={`w-1/2  bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-12 ${
                isPopping ? `transition transform hover:scale-105` : ''
              }`}
              onClick={(fetchStockData, handleAnalyze)}
            >
              Analyze
            </button>
            <a
              target='_blank'
              href='https://www.investopedia.com/terms/s/stocksymbol.asp'
              rel='noreferrer'
            >
              <p className='text-xs text-stone-800 text-center mt-6 font-bold font-seriff'>
                What is a stock symbol?
              </p>
            </a>
          </div>
        ) : (
          <div className='flex justify-center flex-col items-center mb-8'>
            <table>
              <thead>
                <tr>
                  <th className='pb-6 px-4'>Symbol</th>
                  <th className='pb-6 px-4'>Date</th>
                  <th className='pb-6  px-4'>Opening Price</th>
                  <th className='pb-6 px-4'>Closing Price</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => (
                  <tr key={item.date}>
                    <td className='pb-4 text-center'>{item.symbol}</td>
                    <td className='pb-4 text-center'>{item.date}</td>
                    <td
                      className='pb-4 text-center'
                      style={{ color: item.color }}
                    >
                      {item.open}
                    </td>
                    <td
                      className='pb-4 text-center'
                      style={{
                        color: item.close > item.open ? 'green' : 'red',
                      }}
                    >
                      {item.close}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='flex justify-between mb-2 mt-4 items-center'>
              <button
                className={`mr-20  bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isPopping ? `transition transform hover:scale-105` : ''
                }`}
                onClick={handlePrev}
              >
                Prev
              </button>
              <button
                className={`ml-20 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isPopping ? `transition transform hover:scale-105` : ''
                }`}
                onClick={handleNext}
              >
                Next
              </button>
            </div>

            <button
              className={`w-1/2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 ${
                isPopping ? `transition transform hover:scale-105` : ''
              }`}
              onClick={handleAnalyzeNewStock}
            >
              Analyze New Stock
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
