import { useEffect, useMemo, useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from 'react-apexcharts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Table
} from 'react-bootstrap';

const COLORS = ['#f9b931', '#ff86c8', '#4ecac2', '#7f56da'];

const SalesByCategory = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // ---------- YEAR OPTIONS ----------
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // ---------- FETCH API ----------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const url =
          period === 'year'
            ? `https://shadi-undo-backend.onrender.com/api/appointments/stats?period=year&year=${selectedYear}`
            : `https://shadi-undo-backend.onrender.com/api/appointments/stats?period=${period}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch appointment stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, selectedYear]);

  // ---------- CHART DATA ----------
  const chartData = useMemo(() => {
    if (!stats) return null;

    return {
      series: stats.categories.map((c) => c.count),
      labels: stats.categories.map(
        (c) => c.role.charAt(0).toUpperCase() + c.role.slice(1)
      ),
    };
  }, [stats]);

  const chartOptions = {
    chart: { height: 250, type: 'donut' },
    labels: chartData?.labels || [],
    colors: COLORS,
    legend: { show: false },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              label: 'Total',
              formatter: () => (stats ? stats.total : 0),
            },
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>
          Numbers of Appointment{' '}
          {period === 'year' && `(${selectedYear})`}
        </CardTitle>

        <Dropdown>
          <DropdownToggle as="a" role="button" className="arrow-none card-drop">
            <IconifyIcon
              icon="iconamoon:menu-kebab-vertical-circle-duotone"
              className="fs-20 align-middle text-muted"
            />
          </DropdownToggle>

          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem onClick={() => setPeriod('month')}>
              This Month
            </DropdownItem>

            <DropdownItem onClick={() => setPeriod('previous_month')}>
              Previous Month
            </DropdownItem>

            <DropdownItem onClick={() => setPeriod('year')}>
              This Year ({new Date().getFullYear()})
            </DropdownItem>

            <Dropdown.Divider />

            {yearOptions.map((year) => (
              <DropdownItem
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setPeriod('year');
                }}
              >
                Year {year}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </CardHeader>

      <CardBody>
        {loading && <p className="text-center">Loading...</p>}

        {!loading && chartData && (
          <>
            <ReactApexChart
              height={250}
              options={chartOptions}
              series={chartData.series}
              type="donut"
              className="apex-charts"
            />

            <div className="table-responsive mt-3">
              <Table borderless size="sm" className="table-nowrap table-centered mb-0">
                <thead className="bg-light bg-opacity-50 thead-sm">
                  <tr>
                    <th>Category</th>
                    <th>Appointments</th>
                    <th>Perc.</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categories.map((item, idx) => (
                    <tr key={item.role}>
                      <td>
                        <span
                          className="d-inline-block rounded-circle me-2"
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: COLORS[idx],
                          }}
                        />
                        {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                      </td>
                      <td>{item.count}</td>
                      <td>
                        {item.percent}%{' '}
                        {item.trend !== 'neutral' && (
                          <span
                            className={`badge ms-1 ${item.trend === 'up'
                              ? 'badge-soft-success'
                              : 'badge-soft-danger'
                              }`}
                          >
                            {item.changePercent}%{' '}
                            {item.trend === 'up' ? 'Up' : 'Down'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default SalesByCategory;
