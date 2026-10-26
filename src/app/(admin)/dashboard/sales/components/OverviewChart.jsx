import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "react-bootstrap";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const OverviewChart = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 🔥 dynamic years (last 15 years including current)
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState("year"); // "month" | "year"
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(null); // 0–11

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("period", period);
        params.append("year", year);

        if (period === "month" && month !== null) {
          params.append("month", month);
        }

        const res = await fetch(
          `https://shaadi-undo-backend.onrender.com/api/appointments/overview?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        if (data.success) {
          setOverview(data);
        }
      } catch (err) {
        console.error("Failed to load overview data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [period, year, month]);

  // ---------------- PREVIOUS MONTH ----------------
  const goToPreviousMonth = () => {
    const d = new Date(year, month ?? now.getMonth());
    d.setMonth(d.getMonth() - 1);

    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setPeriod("month");
  };

  // ---------------- CHART DATA ----------------
  const chartData = useMemo(() => {
    if (!overview) return null;

    return {
      labels: overview.labels,
      revenue: overview.revenue,
      bookings: overview.bookings,
    };
  }, [overview]);

  // ---------------- CHART OPTIONS ----------------
  const chartOptions = {
    chart: {
      height: 369,
      type: "line",
      toolbar: { show: false },
    },
    series: [
      {
        name: "Revenue",
        type: "area",
        data: chartData?.revenue || [],
      },
      {
        name: "Total Bookings",
        type: "line",
        data: chartData?.bookings || [],
      },
    ],
    stroke: {
      dashArray: [0, 8],
      width: [2, 2],
      curve: "smooth",
    },
    fill: {
      opacity: [1, 1],
      type: ["gradient", "solid"],
      gradient: {
        type: "vertical",
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 70],
      },
    },
    markers: {
      size: 0,
      hover: { size: 4 },
    },
    xaxis: {
      categories: chartData?.labels || [],
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (val) => val.toFixed(0),
      },
    },
    grid: {
      padding: { top: 0, right: -2, bottom: 15, left: 15 },
    },
    legend: {
      show: true,
      horizontalAlign: "center",
      offsetY: 5,
    },
    colors: ["#7f56da", "#22c55e"],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: (y) =>
            typeof y !== "undefined" ? `₹${y.toFixed(0)}` : y,
        },
        {
          formatter: (y) =>
            typeof y !== "undefined" ? `${y}` : y,
        },
      ],
    },
  };

  // ---------------- RENDER ----------------
  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <CardTitle>Overview</CardTitle>

        {/* CONTROLS */}
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Button
            size="sm"
            variant="soft-secondary"
            active={period === "month" && month === now.getMonth()}
            onClick={() => {
              setPeriod("month");
              setYear(currentYear);
              setMonth(now.getMonth());
            }}
          >
            This Month
          </Button>

          <Button
            size="sm"
            variant="soft-secondary"
            onClick={goToPreviousMonth}
          >
            Prev Month
          </Button>

          <Button
            size="sm"
            variant="soft-secondary"
            active={period === "year" && year === currentYear}
            onClick={() => {
              setPeriod("year");
              setYear(currentYear);
              setMonth(null);
            }}
          >
            This Year
          </Button>

          {/* YEAR SELECT — 🔥 DYNAMIC */}
          <select
            className="form-select form-select-sm w-auto"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPeriod("year");
              setMonth(null);
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* MONTH SELECT */}
          <select
            className="form-select form-select-sm w-auto"
            disabled={period !== "month"}
            value={month ?? ""}
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setPeriod("month");
            }}
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardBody>
        {loading && <p className="text-center">Loading...</p>}

        {!loading && chartData && (
          <ReactApexChart
            height={369}
            options={chartOptions}
            series={chartOptions.series}
            type="line"
            className="apex-charts"
          />
        )}
      </CardBody>
    </Card>
  );
};

export default OverviewChart;
