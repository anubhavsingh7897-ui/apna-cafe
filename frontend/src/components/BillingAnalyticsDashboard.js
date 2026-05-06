import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const emptyAnalytics = {
  daily: 0,
  weekly: 0,
  monthly: 0,
  totals: {
    bills: 0,
    customers: 0,
    collection: 0,
    openBills: 0,
    openBillAmount: 0
  },
  today: {
    bills: 0,
    customers: 0,
    collection: 0
  },
  comparisons: {
    day: { bills: 0, customers: 0, collection: 0 },
    month: { bills: 0, customers: 0, collection: 0 }
  },
  charts: {
    daily: [],
    monthly: []
  }
};

function useThemeMode() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme || 'light');
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function trendLabel(value) {
  const number = Number(value || 0);
  const sign = number > 0 ? '+' : '';
  return `${sign}${number}%`;
}

function Trend({ value, label }) {
  const number = Number(value || 0);
  const tone = number > 0 ? 'up' : number < 0 ? 'down' : 'flat';

  return (
    <span className={`analytics-trend ${tone}`}>
      <span>{trendLabel(number)}</span>
      <small>{label}</small>
    </span>
  );
}

function chartColors(theme) {
  const dark = theme === 'dark';

  return {
    text: dark ? '#e5edf7' : '#0f172a',
    muted: dark ? '#9fb0c7' : '#64748b',
    grid: dark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(100, 116, 139, 0.16)',
    teal: dark ? '#2dd4bf' : '#0f766e',
    blue: dark ? '#60a5fa' : '#2563eb',
    amber: dark ? '#fbbf24' : '#d97706',
    violet: dark ? '#a78bfa' : '#7c3aed',
    rose: dark ? '#fb7185' : '#e11d48'
  };
}

function ChartPanel({ title, caption, type = 'bar', labels = [], datasets = [], options = {}, compact = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const theme = useThemeMode();

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const colors = chartColors(theme);
    const context = canvasRef.current.getContext('2d');
    const normalizedDatasets = datasets.map((dataset, index) => {
      const palette = [colors.teal, colors.blue, colors.amber, colors.violet, colors.rose];
      const color = dataset.color || palette[index % palette.length];

      return {
        borderRadius: 10,
        tension: 0.38,
        pointRadius: dataset.type === 'line' ? 3 : 0,
        pointHoverRadius: 5,
        borderWidth: dataset.type === 'line' ? 3 : 0,
        fill: dataset.type === 'line' ? false : true,
        backgroundColor: dataset.backgroundColor || `${color}cc`,
        borderColor: dataset.borderColor || color,
        ...dataset
      };
    });

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(context, {
      type,
      data: { labels, datasets: normalizedDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 950,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: colors.muted,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              font: { family: 'Outfit', weight: 700 }
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#0b1728' : '#ffffff',
            titleColor: colors.text,
            bodyColor: colors.muted,
            borderColor: colors.grid,
            borderWidth: 1,
            padding: 12,
            displayColors: true
          }
        },
        scales: type === 'doughnut' ? undefined : {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.muted,
              maxRotation: 90,
              minRotation: 90,
              font: { family: 'Outfit', size: compact ? 10 : 11, weight: 800 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: colors.grid },
            ticks: {
              color: colors.muted,
              font: { family: 'Outfit', size: 11, weight: 700 }
            }
          }
        },
        ...options
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [caption, compact, datasets, labels, options, theme, title, type]);

  return (
    <div className={`analytics-card analytics-chart-card chartjs-card ${compact ? 'compact' : ''}`}>
      <div className="analytics-card-head">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
      </div>
      <div className={`chart-canvas-wrap ${type === 'doughnut' ? 'doughnut' : ''}`}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function CumulativeList({ rows = [] }) {
  const visibleRows = rows.slice(-5).reverse();

  return (
    <div className="analytics-card">
      <div className="analytics-card-head">
        <div>
          <h3>Cumulative Collection</h3>
          <p>Running total from the visible daily chart.</p>
        </div>
      </div>
      <div className="analytics-list">
        {visibleRows.map((row) => (
          <div className="analytics-list-row" key={row.key}>
            <span>{row.label}</span>
            <strong>{money(row.cumulativeCollection)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BillingAnalyticsDashboard({ analytics, compact = false }) {
  const data = analytics || emptyAnalytics;
  const dailyRows = data.charts?.daily || [];
  const monthlyRows = data.charts?.monthly || [];
  const theme = useThemeMode();
  const colors = chartColors(theme);

  const cards = [
    { label: "Today's Bills", value: data.today?.bills || 0, note: 'Customers billed today' },
    { label: "Today's Collection", value: money(data.today?.collection), note: 'Current paid total' },
    { label: 'Total Bills', value: data.totals?.bills || 0, note: `${data.totals?.customers || 0} customers` },
    { label: 'Total Collection', value: money(data.totals?.collection), note: 'Cumulative paid amount' },
    { label: 'Open Bills', value: data.totals?.openBills || 0, note: money(data.totals?.openBillAmount) },
    { label: 'This Month', value: money(data.monthly), note: `${monthlyRows.at(-1)?.billCount || 0} bills` }
  ];

  return (
    <section className={`billing-analytics ${compact ? 'compact' : ''}`}>
      <div className="analytics-summary-grid">
        {cards.map((card) => (
          <article className="analytics-stat" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.note}</span>
          </article>
        ))}
      </div>

      <div className="analytics-comparison-grid">
        <div className="analytics-card comparison-card">
          <div>
            <h3>Previous Day</h3>
            <p>Today compared with yesterday.</p>
          </div>
          <div className="trend-row">
            <Trend value={data.comparisons?.day?.bills} label="bills" />
            <Trend value={data.comparisons?.day?.collection} label="collection" />
          </div>
        </div>

        <div className="analytics-card comparison-card">
          <div>
            <h3>Previous Month</h3>
            <p>This month compared with last month.</p>
          </div>
          <div className="trend-row">
            <Trend value={data.comparisons?.month?.bills} label="bills" />
            <Trend value={data.comparisons?.month?.collection} label="collection" />
          </div>
        </div>
      </div>

      <div className="analytics-chart-grid">
        <ChartPanel
          title="Date Wise Bills"
          caption="Bill/customer count over the last 14 days."
          labels={dailyRows.map((row) => row.label)}
          compact={compact}
          datasets={[
            {
              label: 'Bills',
              data: dailyRows.map((row) => row.billCount),
              color: colors.blue,
              backgroundColor: `${colors.blue}cc`
            },
            {
              label: 'Customers',
              data: dailyRows.map((row) => row.customerCount),
              color: colors.teal,
              backgroundColor: `${colors.teal}99`
            }
          ]}
        />
        <ChartPanel
          title="Daily Collection"
          caption="Total collection date wise."
          labels={dailyRows.map((row) => row.label)}
          compact={compact}
          datasets={[
            {
              label: 'Collection',
              data: dailyRows.map((row) => row.collection),
              color: colors.teal,
              backgroundColor: `${colors.teal}cc`
            },
            {
              type: 'line',
              label: 'Cumulative',
              data: dailyRows.map((row) => row.cumulativeCollection),
              color: colors.amber,
              borderColor: colors.amber,
              backgroundColor: colors.amber,
              yAxisID: 'y'
            }
          ]}
        />
      </div>

      <div className="analytics-chart-grid">
        <ChartPanel
          title="Monthly Collection"
          caption="Collection by month."
          labels={monthlyRows.map((row) => row.label)}
          compact={compact}
          datasets={[
            {
              label: 'Collection',
              data: monthlyRows.map((row) => row.collection),
              color: colors.violet,
              backgroundColor: `${colors.violet}cc`
            },
            {
              type: 'line',
              label: 'Bills',
              data: monthlyRows.map((row) => row.billCount),
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: colors.blue
            }
          ]}
        />
        <ChartPanel
          title="Billing Mix"
          caption="Paid bills compared with open bills."
          type="doughnut"
          compact={compact}
          labels={['Paid Bills', 'Open Bills']}
          datasets={[
            {
              label: 'Bills',
              data: [data.totals?.bills || 0, data.totals?.openBills || 0],
              backgroundColor: [colors.teal, colors.amber],
              borderColor: theme === 'dark' ? '#0f1b2d' : '#ffffff',
              borderWidth: 4,
              hoverOffset: 8
            }
          ]}
          options={{
            cutout: '68%',
            scales: undefined
          }}
        />
      </div>

      <div className="analytics-chart-grid single">
        <CumulativeList rows={dailyRows} />
      </div>
    </section>
  );
}
