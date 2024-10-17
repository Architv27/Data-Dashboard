import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactWordcloud, { Options } from 'react-wordcloud';
import { Spin, Alert, Tabs, Typography } from 'antd';

const { TabPane } = Tabs;
const { Title } = Typography;

const WordCloudChart: React.FC = () => {
  const [positiveData, setPositiveData] = useState([]);
  const [negativeData, setNegativeData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/analytics/sentiment_wordcloud')
      .then((response) => {
        setPositiveData(response.data.positive.words);
        setNegativeData(response.data.negative.words);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch word cloud data.');
        setLoading(false);
      });
  }, []);

  const options: Partial<Options> = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    fontSizes: [12, 60] as [number, number],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading word cloud..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <Title level={3}>Customer Sentiment Word Clouds</Title>
      <Tabs defaultActiveKey="positive">
        <TabPane tab="Positive Reviews" key="positive">
          <ReactWordcloud words={positiveData} options={options} />
        </TabPane>
        <TabPane tab="Negative Reviews" key="negative">
          <ReactWordcloud words={negativeData} options={options} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default WordCloudChart;
