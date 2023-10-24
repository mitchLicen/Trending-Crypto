import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react';
import CryptoChart from '@/components/CryptoChart';
import Loading from '@/components/Loading';

interface CoinItem {
  item: {
    coin_id: number;
    id: string;
    large: string;
    market_cap_rank: number;
    name: string;
    price_btc: number;
    score: number;
    slug: string;
    symbol: string;
    thumb: string;
  };
}

const url = `https://api.coingecko.com/api/v3/search/trending?key=${process.env.API_KEY}`;

const calculatePercentageChange = (prices: number[][]): number => {
  if (prices.length < 2) {
    return 0; // Not enough data for a change calculation
  }

  const currentPrice = prices[prices.length - 1][1];
  const previousPrice = prices[0][1];
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  return change;
};

const CryptoList = () => {
  const [crypto, setCrypto] = useState<CoinItem[]>([]);
  const [loading, setLoading] = useState(true); // Manage loading state
  const [percentageChangeData, setPercentageChangeData] = useState<{
    [key: string]: number;
  }>({});
  const [euroPrice, setEuroPrice] = useState<{
    [key: string]: number | string;
  }>({});

  const [selectedItem, setSelectedItem] = useState<CoinItem | null>(null);
  const [selectedItemPriceData, setSelectedItemPriceData] = useState<
    number[][] | null
  >(null); // To hold the 24-hour price data

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false); // Set loading to false when data is loaded
    }, 0); // Simulate a 2-second loading time (replace with your actual data loading logic)

    // Your data loading logic goes here
  }, []);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setCrypto(data.coins);

        // Fetch 24-hour percentage change for each coin
        const coinPromises = data.coins.map(async (coinItem) => {
          const id = coinItem.item.id;
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=1`
          );
          const chartData = await response.json();
          const percentageChange = calculatePercentageChange(chartData.prices);
          return { id, percentageChange };
        });

        const coinDataArray = await Promise.all(coinPromises);
        const coinDataMap = coinDataArray.reduce((acc, item) => {
          acc[item.id] = item.percentageChange;
          return acc;
        }, {});

        setPercentageChangeData(coinDataMap);

        // Fetch the EUR price for each coin
        const pricePromises = data.coins.map(async (coinItem) => {
          const id = coinItem.item.id;
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}`
          );
          const coinData = await response.json();
          if (coinData.market_data && coinData.market_data.current_price) {
            const euroPrice = coinData.market_data.current_price.eur;
            return { id, euroPrice };
          }
          return { id, euroPrice: 'N/A' };
        });

        const coinPriceArray = await Promise.all(pricePromises);
        const coinPriceMap = coinPriceArray.reduce((acc, item) => {
          acc[item.id] = item.euroPrice;
          return acc;
        }, {});

        setEuroPrice({ ...coinPriceMap });
      } catch (error) {
        console.log(error);
      }
    };
    fetchCrypto();
  }, []);

  useEffect(() => {
    // When a new item is selected, fetch its 24-hour price data
    const fetchPriceData = async () => {
      if (selectedItem) {
        const id = selectedItem.item.id;
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=1`
        );
        const chartData = await response.json();
        setSelectedItemPriceData(chartData.prices);
      }
    };

    fetchPriceData();
  }, [selectedItem]);

  return (
    <>
      <div className='flex flex-col mx-auto p-2 lg:w-[60%] lg:max-w-[70vw] w-full'>
        <div className='md:inline-block bg-transparent w-full md:p-2 p-5 hidden'>
          <div className='grid md:grid-cols-7 md:gap-2 gap-0 border-b-2 last:border-b-0'>
            <div className='flex md:col-span-2 items-center col-span-7 md:mx-0 mx-auto'>
              <p className='text-[.5rem] mr-1'>Powered by</p>
              <img className='w-5 h-5' src='/CoinGecko Logo.svg' />
            </div>
            <div className='text-left'></div>
            <div className='text-left md:block hidden md:col-span-1 col-span-7 text-xs'>
              Rank
            </div>
            <div className='text-left md:block -ml-5 hidden md:col-span-1 col-span-7 text-xs'>
              Trending
            </div>
            <div className='text-left text-xs'>Price</div>
            <div className='text-center text-xs'>24h%</div>
          </div>
        </div>
        <div className='bg-slate-500/20 rounded-lg'>
          {loading ? ( // Check the loading state
            <Loading /> // Display the loading skeleton if loading is true
          ) : (
            crypto.map((coinItem) => {
              const {
                name,
                symbol,
                price_btc,
                large,
                market_cap_rank,
                score,
                id,
              } = coinItem.item;

              // Retrieve the 24-hour percentage change and round it to two decimal places
              let percentageChange = percentageChangeData[id] ?? 'N/A';
              const isIncrease =
                percentageChange !== 'N/A' ? percentageChange > 0 : false;

              if (typeof percentageChange === 'number') {
                percentageChange = Math.abs(percentageChange).toFixed(2);
              }

              // Retrieve the EUR price and round it to two decimal places
              let euroPriceValue = euroPrice[id] ?? 'N/A';
              if (typeof euroPriceValue === 'number') {
                euroPriceValue = euroPriceValue.toFixed(2);
              }

              // Define the text color based on the value of the 24-hour percentage change
              const textColor = isIncrease ? 'text-green-500' : 'text-red-500';

              return (
                <>
                  <div key={id}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className='md:inline-block bg-transparent w-full md:p-6 p-10'
                          variant='outline'
                          onClick={() => setSelectedItem(coinItem)}
                        >
                          <div className='grid md:grid-cols-7 md:gap-2 gap-0 border-b-2 last:border-b-0 md:-mt-[0.7rem]'>
                            <div className='flex md:col-span-2 col-span-7 md:mx-0 mx-auto'>
                              <img
                                className='h-7 w-7 mr-2 -mt-1'
                                src={large}
                                alt={`${name} Logo`}
                              />
                              <div>{name}</div>
                            </div>
                            <div className='text-left md:pl-0 pl-3'>
                              {symbol}
                            </div>
                            <div className='text-left md:block hidden md:col-span-1 col-span-7'>
                              {market_cap_rank}
                            </div>
                            <div className='text-left md:block hidden md:col-span-1 col-span-7'>
                              {score + 1}
                            </div>
                            <div className='text-left md:pl-0 pl-3'>
                              € {euroPriceValue}
                            </div>
                            <div
                              className={`text-center lg:ml-8 md:pl-0 pl-3 ${textColor}`}
                            >
                              {percentageChange}%
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {selectedItem && (
                          <div>
                            <DialogClose className='text-right' />
                            <CryptoChart priceData={selectedItemPriceData} />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default CryptoList;
