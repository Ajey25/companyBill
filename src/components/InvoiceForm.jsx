import React, { useState } from "react";
import { consignees, materials } from "../data/invoiceStaticData";

const InvoiceForm = ({ onGenerate, initialData }) => {
  const [selectedConsignee, setSelectedConsignee] = useState(
    initialData?.consignee?.name || ""
  );
  const [materialRows, setMaterialRows] = useState(
    initialData?.items?.map((item) => ({
      material: item.desc,
      qty: item.qty,
      rate: item.rate,
    })) || [{ material: "", qty: "", rate: "" }]
  );
  const [invoiceNo, setInvoiceNo] = useState(
    initialData?.invoiceNo || "2025-26/03"
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoiceDate || "2025-06-30"
  );

  const handleConsigneeChange = (e) => {
    setSelectedConsignee(e.target.value);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialRows];

    if (field === "material") {
      const selectedMaterial = materials.find((m) => m.desc === value);
      updated[index]["material"] = value;
      updated[index]["rate"] = selectedMaterial?.rate || ""; // auto-fill rate
    } else {
      updated[index][field] = value;
    }

    setMaterialRows(updated);
  };

  const addRow = () => {
    setMaterialRows([...materialRows, { material: "", qty: "" }]);
  };

  const removeRow = (index) => {
    const updated = [...materialRows];
    updated.splice(index, 1);
    setMaterialRows(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const consigneeData = consignees.find((c) => c.name === selectedConsignee);

    const filledMaterials = materialRows
      .map((row) => {
        const mat = materials.find((m) => m.desc === row.material);
        if (!mat || !row.qty || !row.rate) return null;
        const qty = parseFloat(row.qty);
        const rate = parseFloat(row.rate);
        return {
          ...mat,
          qty,
          rate,
          amt: +(qty * rate).toFixed(2),
        };
      })
      .filter(Boolean);

    const totalAmount = filledMaterials.reduce(
      (acc, curr) => acc + curr.amt,
      0
    );
    const tax = +(totalAmount * 0.09).toFixed(2); // 9% CGST + SGST each

    const finalData = {
      invoiceNo,
      invoiceDate,
      consignee: consigneeData,
      buyer: consigneeData, // Same as consignee
      items: filledMaterials,
      taxRows: [
        { label: "CGST", percentage: "9%", amount: tax },
        { label: "SGST", percentage: "9%", amount: tax },
      ],
      totalAmount: +(totalAmount + tax * 2).toFixed(2),
    };

    onGenerate(finalData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">Invoice Generator</h4>

      {/* Consignee Dropdown */}
      <div className="mb-3">
        <label className="form-label">Select Consignee:</label>
        <select
          className="form-select"
          value={selectedConsignee}
          onChange={handleConsigneeChange}
          required
        >
          <option value="">-- Select --</option>
          {consignees.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Invoice Details */}
      <div className="mb-3 row">
        <div className="col">
          <label className="form-label">Invoice No:</label>
          <input
            type="text"
            className="form-control"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </div>
        <div className="col">
          <label className="form-label">Date:</label>
          <input
            type="date"
            className="form-control"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
      </div>

      {/* Material Rows */}
      <div className="mb-3">
        <label className="form-label">Add Materials:</label>
        {materialRows.map((row, idx) => (
          <div className="row mb-2" key={idx}>
            <div className="col-4">
              <select
                className="form-select"
                value={row.material}
                onChange={(e) =>
                  handleMaterialChange(idx, "material", e.target.value)
                }
                required
              >
                <option value="">-- Select Material --</option>
                {materials.map((m) => (
                  <option key={m.desc} value={m.desc}>
                    {m.desc}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-3">
              <input
                type="number"
                className="form-control"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) =>
                  handleMaterialChange(idx, "qty", e.target.value)
                }
                required
              />
            </div>
            <div className="col-3">
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Rate"
                value={row.rate}
                onChange={(e) =>
                  handleMaterialChange(idx, "rate", e.target.value)
                }
                required
              />
            </div>

            <div className="col-2">
              {idx > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeRow(idx)}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addRow}>
          + Add Item
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="btn btn-primary mt-3">
        Generate Invoice
      </button>
    </form>
  );
};

export default InvoiceForm;
