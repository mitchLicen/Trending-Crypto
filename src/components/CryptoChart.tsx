import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const CryptoChart = ({ priceData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!priceData || priceData.length === 0) {
      return;
    }

    const yourTimeLabels = priceData.map((item) => item[0]);

    // Round off the price values to 2 decimal places
    const yourData = priceData.map((item) => parseFloat(item[1]).toFixed(2));

    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy the previous chart instance
      }

      const ctx = chartRef.current.getContext('2d');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: yourTimeLabels,
          datasets: [
            {
              label: '',
              data: yourData,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
              },
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Price',
              },
            },
          },
        },
      });
    }
  }, [priceData]);

  useEffect(() => {
    // Cleanup function to destroy the chart instance when unmounted
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} />;
};

export default CryptoChart;
