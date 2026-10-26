import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getInvoiceById } from "@/helpers/data";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";
import logoDark from "@/assets/images/shadiundo.png";
import SubmissionButton from "./components/SubmissionButton";
import { currency } from "@/context/constants";

// 🪙 Membership plans with correct pricing
const PLANS = [
  { name: "Silver", price: 1999 },
  { name: "Gold", price: 2999 },
  { name: "Platinum", price: 3999 },
];

const emptyLineItem = () => ({
  plan: "Silver",
  months: 1,
  price: 1999,
});

const InvoiceDetail = () => {
  const [invoice, setInvoice] = useState(null);
  const [editable, setEditable] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (invoiceId) {
        const data = await getInvoiceById(invoiceId);
        if (data) {
          setInvoice(data);
          setEditable(normalizeInvoiceForEdit(data));
        } else {
          navigate("/pages/error-404-alt");
        }
      }
    })();
  }, [invoiceId, navigate]);

  function normalizeInvoiceForEdit(src) {
    return {
      id: src.id || src._id || "N/A",
      customer: {
        name: src.customer?.name || "",
        address:
          src.customer?.address || "135 White Cemetery Rd, Perryville, KY, 40468",
        phone: src.customer?.phone || "(304) 584-4345",
      },
      items:
        src.items?.length > 0
          ? src.items.map((it) => ({
              plan: it.plan || "Silver",
              months: Number(it.months || 1),
              price: Number(it.price || 1999),
            }))
          : [emptyLineItem()],
      notes:
        src.notes ||
        `All accounts are to be paid within 7 days from receipt of invoice.`,
    };
  }

  function calcTotals(items) {
    const subtotal = items.reduce(
      (s, it) => s + Number(it.price || 0) * Number(it.months || 0),
      0
    );
    return { subtotal, total: subtotal };
  }

  function onChangeCustomer(field, value) {
    setEditable((s) => ({ ...s, customer: { ...s.customer, [field]: value } }));
  }

  function onChangeItem(idx, field, value) {
    setEditable((s) => {
      const items = [...s.items];
      const item = { ...items[idx] };

      if (field === "plan") {
        item.plan = value;
        const found = PLANS.find((p) => p.name === value);
        if (found) item.price = found.price; // auto update price when plan changes
      } else if (field === "months" || field === "price") {
        item[field] = Number(value) || 0;
      }

      items[idx] = item;
      return { ...s, items };
    });
  }

  function onAddItem() {
    setEditable((s) => ({ ...s, items: [...s.items, emptyLineItem()] }));
  }

  function onRemoveItem(idx) {
    setEditable((s) => {
      const items = [...s.items];
      items.splice(idx, 1);
      return { ...s, items };
    });
  }

  function onSave() {
    setInvoice(editable);
    setIsEditing(false);
  }

  if (!invoice || !editable) {
    return (
      <Card>
        <CardBody>Loading invoice...</CardBody>
      </Card>
    );
  }

  const { subtotal, total } = calcTotals(editable.items);

  return (
    <>
      <PageBreadcrumb subName="Invoice" title={`Invoice #${editable.id}`} />
      <PageMetaData title={`Invoice #${editable.id}`} />

      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="clearfix">
                <div className="float-sm-end">
                  <img src={logoDark} alt="logo" height={100} />
                  <address className="mt-3">
                    1729 Bangor St,
                    <br />
                    Houlton, ME 04730 <br />
                    <abbr title="Phone">P:</abbr> (207) 532-9109
                  </address>
                </div>

                <div className="float-sm-start">
                  <CardTitle as="h5">Invoice: #{editable.id}</CardTitle>
                </div>
              </div>

              {/* Customer Details */}
              <Row className="mt-3">
                <Col md={6}>
                  <h6 className="fw-normal text-muted">Customer</h6>

                  {!isEditing ? (
                    <>
                      <h6 className="fs-16">{editable.customer.name}</h6>
                      <address>
                        {editable.customer.address}
                        <br />
                        <abbr title="Phone">P:</abbr> {editable.customer.phone}
                      </address>
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          value={editable.customer.name}
                          onChange={(e) =>
                            onChangeCustomer("name", e.target.value)
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={editable.customer.address}
                          onChange={(e) =>
                            onChangeCustomer("address", e.target.value)
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          value={editable.customer.phone}
                          onChange={(e) =>
                            onChangeCustomer("phone", e.target.value)
                          }
                        />
                      </Form.Group>
                    </>
                  )}
                </Col>
              </Row>

              {/* Plan / Items */}
              <Row>
                <Col xs={12}>
                  <div className="table-responsive table-borderless text-nowrap mt-3">
                    <table className="table mb-0">
                      <thead className="bg-light bg-opacity-50">
                        <tr>
                          <th>Plan</th>
                          <th>No. of Months</th>
                          <th>Price (₹)</th>
                          <th className="text-end">Total (₹)</th>
                          {isEditing && <th className="text-end">Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {editable.items.map((it, idx) => {
                          const totalRow =
                            Number(it.price) * Number(it.months) || 0;
                          return (
                            <tr key={idx}>
                              <td>
                                {!isEditing ? (
                                  it.plan
                                ) : (
                                  <Form.Select
                                    value={it.plan}
                                    onChange={(e) =>
                                      onChangeItem(idx, "plan", e.target.value)
                                    }
                                  >
                                    {PLANS.map((p) => (
                                      <option key={p.name} value={p.name}>
                                        {p.name} Plan — ₹{p.price}/Month
                                      </option>
                                    ))}
                                  </Form.Select>
                                )}
                              </td>
                              <td>
                                {!isEditing ? (
                                  it.months
                                ) : (
                                  <Form.Control
                                    type="number"
                                    min={1}
                                    value={it.months}
                                    onChange={(e) =>
                                      onChangeItem(
                                        idx,
                                        "months",
                                        e.target.value
                                      )
                                    }
                                  />
                                )}
                              </td>
                              <td>
                                {!isEditing ? (
                                  `₹${it.price}`
                                ) : (
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="number"
                                      min={0}
                                      value={it.price}
                                      readOnly // lock price (auto-set by plan)
                                    />
                                  </InputGroup>
                                )}
                              </td>
                              <td className="text-end">₹{totalRow}</td>
                              {isEditing && (
                                <td className="text-end">
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onRemoveItem(idx)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {isEditing && (
                    <div className="mt-2">
                      <Button variant="link" onClick={onAddItem}>
                        + Add Plan
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>

              {/* Notes */}
              <Row className="mt-3">
                <Col sm={7}>
                  <h6 className="text-muted">Notes:</h6>
                  {!isEditing ? (
                    <small className="text-muted">{editable.notes}</small>
                  ) : (
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editable.notes}
                      onChange={(e) =>
                        setEditable((s) => ({ ...s, notes: e.target.value }))
                      }
                    />
                  )}
                </Col>

                <Col sm={5}>
                  <div className="float-end">
                    <p>
                      <span className="fw-medium">Subtotal:</span>{" "}
                      <span className="float-end">₹{subtotal}</span>
                    </p>
                    <h3>₹{total}</h3>
                  </div>
                </Col>
              </Row>

              {/* Buttons */}
              <div className="mt-4 d-flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <SubmissionButton />
                  </>
                ) : (
                  <>
                    <Button variant="success" onClick={onSave}>
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default InvoiceDetail;
