import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { Grid, _ } from 'gridjs-react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const PriorityProfessionTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = "https://shaadi-undo-backend.onrender.com";
    const ROLES = ["lawyer", "mediator", "counsellor", "therapist"];

    const fetchEarnings = async (professionalId, token) => {
        try {
            // limit=1000 to get "all" recent for calculation
            const res = await fetch(`${API_BASE}/api/appointments/professional/recent?professionalId=${professionalId}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                if (json.data && Array.isArray(json.data)) {
                    return json.data
                        .filter(app => app.status && app.status.toLowerCase() === 'completed')
                        .reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
                }
            }
            return 0;
        } catch (e) {
            console.warn(`Failed to fetch earnings for ${professionalId}`, e);
            return 0;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch all professionals by role
            const rolePromises = ROLES.map(role =>
                fetch(`${API_BASE}/api/professionals/role/${role}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.ok ? res.json() : { data: [] })
            );

            const results = await Promise.all(rolePromises);

            let allProfessionals = [];
            results.forEach((res, index) => {
                // Normalized data access based on observed API responses in LawyerList.jsx
                let items = [];
                if (Array.isArray(res)) items = res;
                else if (Array.isArray(res.data)) items = res.data;
                else if (Array.isArray(res.professionals)) items = res.professionals;
                else if (Array.isArray(res.results)) items = res.results;

                // Assign role if missing
                const roleName = ROLES[index];
                items.forEach(item => {
                    if (!item.role) item.role = roleName;
                    allProfessionals.push(item);
                });
            });

            // Dedup logic (just in case)
            const uniqueMap = new Map();
            allProfessionals.forEach(p => uniqueMap.set(p._id || p.id, p));
            const uniqueProfessionals = Array.from(uniqueMap.values());

            // 2. Fetch earnings for each
            // Batching could be better, but parallel is simplest for now
            const prosWithEarnings = await Promise.all(uniqueProfessionals.map(async (p) => {
                const earnings = await fetchEarnings(p._id || p.id, token);
                return {
                    ...p,
                    earnings
                };
            }));

            // 3. Sort by Earnings DESC
            prosWithEarnings.sort((a, b) => b.earnings - a.earnings);

            setData(prosWithEarnings);

        } catch (err) {
            console.error("Error loading priority table", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            name: 'Rank',
            width: '60px',
            formatter: (cell) => _(<span className="fw-bold fs-16 text-primary">#{cell}</span>)
        },
        {
            name: 'Professional',
            formatter: (cell, row) => {
                return _(<div className="d-flex align-items-center gap-2">
                    <div className="avatar-sm flex-shrink-0">
                        <span className="avatar-title bg-soft-primary text-primary rounded-circle fs-4">
                            {cell.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h6 className="mb-0 text-dark fw-bold fs-14 text-truncate">{cell}</h6>
                        <small className="text-muted fs-12">{row.cells[7].data}</small>
                    </div>
                </div>);
            }
        },
        {
            name: 'Role',
            formatter: (cell) => _(<Badge bg="light" text="dark" className="border px-2 py-1 text-capitalize fs-12">{cell}</Badge>)
        },
        {
            name: 'Shaadi Commission (30%)',
            formatter: (cell) => _(<div className="text-dark fw-bold fs-14">
                ₹{cell.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>)
        },
        {
            name: 'Professional Fees (70%)',
            formatter: (cell) => _(<div className="text-info fw-bold fs-14">
                ₹{cell.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>)
        },
        {
            name: 'Total Earnings',
            formatter: (cell) => _(<div className="d-flex align-items-center text-success fw-bold fs-15">
                <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-1 fs-18" />
                ₹{cell.toLocaleString()}
            </div>)
        },
        {
            name: 'Action',
            sort: false,
            formatter: (cell, row) => _(<a href={`/pages/profile/${row.cells[8].data}`} className="btn btn-sm btn-soft-primary rounded-pill px-2 py-1 fs-12 text-nowrap">View Profile</a>)
        },
        {
            name: 'Email',
            hidden: true
        },
        {
            name: 'ID',
            hidden: true
        }
    ];

    const [activeTab, setActiveTab] = useState('all');

    const getFilteredData = () => {
        if (activeTab === 'all') return data;
        return data.filter(p => p.role && p.role.toLowerCase() === activeTab);
    };

    const filteredData = getFilteredData();

    // Calculate Totals
    const totalEarnings = filteredData.reduce((sum, p) => sum + (Number(p.earnings) || 0), 0);
    const totalCommission = totalEarnings * 0.30;
    const totalFees = totalEarnings * 0.70;

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-bottom border-light">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <CardTitle as="h5" className="fs-18 mb-1">Priority Profession Records</CardTitle>
                        <p className="text-muted mb-0">Overview of professional earnings and performance rankings.</p>
                    </div>
                    <div>
                        <Badge bg="soft-primary" text="primary" className="fs-12 px-3 py-2 rounded-pill">
                            {filteredData.length} Professionals
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-3 text-muted fw-medium">Calculating earnings...</div>
                    </div>
                ) : (
                    <>
                        {/* Summary Section - Moves to Top */}
                        <Row className="mb-4 g-3">
                            <Col md={4}>
                                <div className="card bg-soft-secondary border-0 overflow-hidden h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="avatar-sm flex-shrink-0 me-3">
                                                <span className="avatar-title bg-dark text-white rounded-circle fs-3 shadow-sm">
                                                    <IconifyIcon icon="solar:pie-chart-2-bold-duotone" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-dark fw-semibold mb-0 text-uppercase fs-12 tracking-wide">Total Shaadi Commission (30%)</p>
                                            </div>
                                        </div>
                                        <h3 className="mb-0 text-dark fw-bold mt-2">₹{totalCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                    </div>
                                    <div className="position-absolute end-0 bottom-0 opacity-10 me-n3 mb-n3">
                                        <IconifyIcon icon="solar:pie-chart-2-bold-duotone" width="80" height="80" />
                                    </div>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="card bg-soft-info border-0 overflow-hidden h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="avatar-sm flex-shrink-0 me-3">
                                                <span className="avatar-title bg-info text-white roundedAction-circle fs-3 shadow-sm">
                                                    <IconifyIcon icon="solar:user-bold-duotone" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-info fw-semibold mb-0 text-uppercase fs-12 tracking-wide">Professional Fees (70%)</p>
                                            </div>
                                        </div>
                                        <h3 className="mb-0 text-dark fw-bold mt-2">₹{totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                    </div>
                                    <div className="position-absolute end-0 bottom-0 opacity-10 me-n3 mb-n3">
                                        <IconifyIcon icon="solar:user-bold-duotone" width="80" height="80" />
                                    </div>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="card bg-soft-success border-0 overflow-hidden h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="avatar-sm flex-shrink-0 me-3">
                                                <span className="avatar-title bg-success text-white rounded-circle fs-3 shadow-sm">
                                                    <IconifyIcon icon="solar:wallet-money-bold-duotone" />
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="text-success fw-semibold mb-0 text-uppercase fs-12 tracking-wide">Grand Total Earnings</p>
                                            </div>
                                        </div>
                                        <h3 className="mb-0 text-dark fw-bold mt-2">₹{totalEarnings.toLocaleString()}</h3>
                                    </div>
                                    <div className="position-absolute end-0 bottom-0 opacity-10 me-n3 mb-n3">
                                        <IconifyIcon icon="solar:wallet-money-bold-duotone" width="80" height="80" />
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <ul className="nav nav-pills nav-custom-light">
                                <li className="nav-item">
                                    <a href="#all" data-bs-toggle="tab" aria-expanded="false" className={`nav-link ${activeTab === 'all' ? 'active' : ''} px-4 py-2 fw-medium`} onClick={(e) => { e.preventDefault(); setActiveTab('all'); }}>
                                        All
                                    </a>
                                </li>
                                {ROLES.map(role => (
                                    <li className="nav-item" key={role}>
                                        <a href={`#${role}`} data-bs-toggle="tab" aria-expanded="false" className={`nav-link ${activeTab === role ? 'active' : ''} text-capitalize px-4 py-2 fw-medium`} onClick={(e) => { e.preventDefault(); setActiveTab(role); }}>
                                            {role}s
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="table-responsive bg-white rounded shadow-sm border p-1">
                            <Grid
                                data={filteredData.map((p, index) => {
                                    const earnings = Number(p.earnings) || 0;
                                    return [
                                        index + 1,
                                        p.name || p.fullName || "Unknown",
                                        p.role,
                                        earnings * 0.30, // Commission
                                        earnings * 0.70, // Fees
                                        earnings,        // Total
                                        null, // Action column placeholder
                                        p.email, // Hidden Email for search
                                        p._id || p.id // Hidden ID for links
                                    ];
                                })}
                                columns={columns}
                                search={true}
                                pagination={{ limit: 10 }}
                                sort={true}
                                className={{
                                    table: 'table table-borderless table-hover align-middle mb-0',
                                    thead: 'bg-light text-muted',
                                    th: 'p-2 text-uppercase fs-12 fw-bold tracking-wide border-bottom',
                                    td: 'p-2'
                                }}
                            />
                        </div>
                    </>
                )}
            </CardBody>
        </Card>
    );
};
export default PriorityProfessionTable;
