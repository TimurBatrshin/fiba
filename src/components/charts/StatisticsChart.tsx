import React from 'react';
import './StatisticsChart.css';

type ChartType = 'line' | 'bar' | 'radar' | 'doughnut';

interface DataSet {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

interface ChartProps {
  type: ChartType;
  labels: string[];
  datasets: DataSet[];
  title: string;
  height?: number;
  width?: number;
  options?: any;
}

/**
 * Упрощенная версия компонента статистики без библиотек chart.js и react-chartjs-2.
 * Отображает табличное представление данных вместо графиков.
 */
const StatisticsChart: React.FC<ChartProps> = ({
  type,
  labels,
  datasets,
  title,
  height = 300,
  width
}) => {
  // Находим максимальное значение для масштабирования
  const maxValue = Math.max(
    ...datasets.flatMap(dataset => dataset.data)
  );

  return (
    <div className="statistics-chart" style={{ height, width: width || '100%' }}>
      <div className="chart-title">{title}</div>
      
      <div className="chart-container">
        {type === 'bar' || type === 'line' ? (
          <div className="table-chart">
            <table>
              <thead>
                <tr>
                  <th>Категория</th>
                  {datasets.map((dataset, idx) => (
                    <th key={idx}>{dataset.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label, labelIdx) => (
                  <tr key={labelIdx}>
                    <td>{label}</td>
                    {datasets.map((dataset, datasetIdx) => (
                      <td key={datasetIdx}>
                        <div className="data-container">
                          <div 
                            className="data-bar" 
                            style={{
                              width: `${(dataset.data[labelIdx] / maxValue) * 100}%`,
                              backgroundColor: Array.isArray(dataset.backgroundColor) 
                                ? dataset.backgroundColor[labelIdx]
                                : (dataset.backgroundColor || '#4bc0c0')
                            }}
                          />
                          <span>{dataset.data[labelIdx]}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-fallback">
            <p>Этот тип графика ({type}) недоступен в текущей версии.</p>
            <p>Используйте тип "bar" или "line" для отображения данных.</p>
            
            {/* Простое табличное представление для всех типов */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Категория</th>
                  {datasets.map((dataset, idx) => (
                    <th key={idx}>{dataset.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label, labelIdx) => (
                  <tr key={labelIdx}>
                    <td>{label}</td>
                    {datasets.map((dataset, datasetIdx) => (
                      <td key={datasetIdx}>{dataset.data[labelIdx]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="chart-legend">
        {datasets.map((dataset, idx) => (
          <div key={idx} className="legend-item">
            <span 
              className="legend-color" 
              style={{ 
                backgroundColor: Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[0] 
                  : (dataset.backgroundColor || '#4bc0c0')
              }}
            />
            <span className="legend-label">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsChart; 