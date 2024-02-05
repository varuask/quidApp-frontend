import { React, useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chart.js/auto';
import Loader from '../LoaderComponent/Loader';

const DataChart = ({ submitButtonClickRecord, scatterPointEmit }) => {
  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const [point] = elements;
        const { x, y } = point.element.$context.parsed;
        const { id, label } = point.element.$context.raw;
        scatterPointEmit({
          id,
          x,
          y,
          label,
        });
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += `(${context.parsed.x}, ${context.parsed.y})`;
            }
            const dataPoint = context.dataset.data[context.dataIndex];
            if (dataPoint.label) {
              label += ` - ${dataPoint.label}`;
            }
            return label;
          },
        },
      },
    },
  };
  const initialData = {
    datasets: [
      {
        label: 'Dataset',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(initialData);

  const updateDataOnChart = (latestData) => {
    const updatedData = {
      datasets: chartData.datasets.map((dataset) => ({
        ...dataset,
        data: latestData,
      })),
    };
    setChartData(updatedData);
  };
  const getLatestData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/activity/getdata`
      );
      const data = await response.json();
      if (data) {
        const latestchartData = data.map(
          ({ pointId, xCoord, yCoord, label }) => ({
            x: xCoord,
            y: yCoord,
            id: pointId,
            label,
          })
        );
        updateDataOnChart(latestchartData);
        setLoading(false);
        const idMap = data.reduce((finalObj, current) => {
          finalObj[current.pointId] = current._id;
          return finalObj;
        }, {});
        localStorage.setItem('idMap', JSON.stringify(idMap));
      }
    } catch (err) {
      setLoading(false);
      setChartData(initialData);
    }
  };

  useEffect(() => {
    getLatestData();
  }, [submitButtonClickRecord]);

  return (
    <div>
      {loading ? <Loader /> : <Scatter data={chartData} options={options} />}
    </div>
  );
};

export default DataChart;
