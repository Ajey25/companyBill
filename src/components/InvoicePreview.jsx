import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import numToWords from "num-to-words";
import { useState } from "react";

const InvoicePreview = ({ data, onBack }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  if (!data) return null;

  const {
    invoiceNo,
    invoiceDate = "",
    consignee,
    buyer,
    items,
    taxRows,
    totalAmount,
  } = data;
  function smartTitleCase(str) {
    return str
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("-")
      )
      .join(" ")
      .replace(/^Inr/, "INR"); // Make sure INR stays capital
  }

  function convertToIndianCurrencyWords(amount) {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    const rupeeWords = numToWords(`${rupees} INR`).replace("Rupees", "").trim();
    const paiseWords =
      paise > 0 ? numToWords(`${paise}`).replace("Rupees", "").trim() : "";

    const inWords =
      paise > 0
        ? `INR ${rupeeWords} And ${paiseWords} Paisa Only.`
        : `INR ${rupeeWords} Rupees Only.`;

    return smartTitleCase(inWords);
  }

  const TotalAmountInWords = convertToIndianCurrencyWords(totalAmount);
  const totalTaxAmount =
    (data?.taxRows?.[0]?.amount || 0) + (data?.taxRows?.[1]?.amount || 0);

  const TotalTaxInWords = convertToIndianCurrencyWords(totalTaxAmount);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-content");
    if (!element) return;

    // Clone and clean up the element
    const clonedElement = element.cloneNode(true);
    const buttons = clonedElement.querySelectorAll("button");
    buttons.forEach((btn) => btn.remove());

    // Create a temporary container to render the cleaned version
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.top = "-9999px";
    tempDiv.appendChild(clonedElement);
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div
      id="invoice-content"
      className="container mx-auto px-5 py-4"
      style={{ width: "800px", height: "1300px" }}
    >
      <div className="row align-items-center">
        <div className="col"></div>
        <h5
          className="col text-center  font-weight-semibold mb-0"
          style={{ fontSize: "1rem" }}
        >
          Tax Invoice
        </h5>
        <span
          className="col text-right pr-2 mr-5 mb-0"
          style={{ fontSize: "0.9rem" }}
        >
          (ORIGINAL FOR RECIPIENT)
        </span>
      </div>

      <div className="border border-dark">
        <div
          className="d-grid gap-0 text-sm border border-collapse"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "repeat(9, minmax(0, 0.75fr))",
            lineHeight: "1.2",
          }}
        >
          {/* div1 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "1 / 1 / 4 / 2" }}
          >
            <strong>R B PRAJAPATI AND BROTHERS</strong>
            <br />
            PLOT NO RX-5/8, BAJAJ NAGAR
            <br />
            MIDC WALUJ, AURANGABAD
            <br /> <br />
            <strong>GSTIN/UIN:</strong> 27AZLPP7345P1ZD
            <br />
            <strong>State:</strong> MAHARASHTRA,{" "}
            <strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Code:</strong> 27
          </div>

          {/* div2 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "1 / 2 / 2 / 3", lineHeight: 1 }}
          >
            <strong>Invoice No.</strong>
            <br />
            {invoiceNo}
          </div>

          {/* div3 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "1 / 3 / 2 / 4", lineHeight: 1 }}
          >
            <strong>Dated</strong>
            <br />
            {invoiceDate}
          </div>

          {/* div4 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "2 / 2 / 3 / 3", lineHeight: 1 }}
          >
            <strong>Delivery Note</strong>
          </div>

          {/* div5 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{
              gridArea: "2 / 3 / 3 / 4",
              lineHeight: 1,
              fontSize: "0.92rem",
            }}
          >
            <strong>Mode/Terms of Payment</strong>
          </div>

          {/* div6 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "3 / 2 / 4 / 3", lineHeight: 1 }}
          >
            <strong>Reference No. & Date</strong>
          </div>

          {/* div7 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "3 / 3 / 4 / 4", lineHeight: 1 }}
          >
            <strong>Other References</strong>
          </div>

          {/* div8 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "4 / 1 / 7 / 2" }}
          >
            <strong>Consignee (Ship to)</strong>
            <br />
            <span className="font-weight-semibold border-dark">
              {consignee.name}
            </span>{" "}
            <br />
            {consignee.address}
            <br />
            <br />
            <strong>GSTIN/UIN:</strong> {consignee.gstin}
            <br />
            <strong>State Name:</strong> Maharashtra{" "}
            <strong>&nbsp;&nbsp;Code:</strong> {consignee.code}
          </div>

          {/* div9 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "4 / 2 / 5 / 3", lineHeight: 1 }}
          >
            <strong>Buyer's Order No.</strong>
          </div>

          {/* div10 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "4 / 3 / 5 / 4", lineHeight: 1 }}
          >
            <strong>Dated</strong>
          </div>

          {/* div11 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "5 / 2 / 6 / 3", lineHeight: 1 }}
          >
            <strong>Dispatch Doc No.</strong>
          </div>

          {/* div12 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "5 / 3 / 6 / 4", lineHeight: 1 }}
          >
            <strong>Delivery Note Date</strong>
          </div>

          {/* div13 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "6 / 2 / 7 / 3", lineHeight: 1 }}
          >
            <strong>Dispatched Through</strong>
          </div>

          {/* div14 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "6 / 3 / 7 / 4", lineHeight: 1 }}
          >
            <strong>Destination</strong>
          </div>

          {/* div17 */}
          <div
            className="px-2 border-bottom border-end border-dark"
            style={{ gridArea: "7 / 1 / 10 / 2" }}
          >
            <strong>Buyer (Bill to)</strong>
            <br />
            <span className="font-weight-semibold">{buyer.name}</span>
            <br />
            {buyer.address}
            <br />
            <br />
            <strong>GSTIN/UIN:</strong> {buyer.gstin}
            <br />
            <strong>State Name:</strong> Maharashtra{" "}
            <strong>&nbsp;&nbsp;Code:</strong> {buyer.code}
          </div>

          {/* div18 */}
          <div
            className="px-2 border-bottom border-dark"
            style={{ gridArea: "7 / 2 / 10 / 4" }}
          >
            <strong>Terms of Delivery</strong>
          </div>
        </div>
        {/* table */}
        <div>
          <table
            className="table w-100 text-sm mb-0 "
            style={{ minHeight: "300px", borderCollapse: "collapse" }}
          >
            <thead style={{ fontSize: "0.9rem" }}>
              <tr className="text-left ">
                <th
                  className=" px-2 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                >
                  SrNo.
                </th>
                <th
                  className=" px-2 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                    width: "15rem",
                  }}
                >
                  Description of Goods
                </th>
                <th
                  className=" px-0 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                    fontSize: "0.9rem",
                  }}
                >
                  HSN/SAC
                </th>
                <th
                  className=" px-2 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                >
                  Quantity
                </th>
                <th
                  className="px-2 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                >
                  Rate
                </th>
                <th
                  className=" px-2 py-0"
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                >
                  Per
                </th>
                <th
                  className="px-2 py-0"
                  style={{ borderBottom: "1px solid black" }}
                >
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td
                    className="px-2 py-0 font-weight-bold text-center"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className=" px-2 py-0 font-weight-bold"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    {item.desc}
                  </td>
                  <td
                    className=" px-1 py-0 font-weight-bold text-center"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    {item.hsn}
                  </td>
                  <td
                    className=" px-2 py-0 font-weight-bold text-center"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    {item.qty}
                  </td>
                  <td
                    className=" px-2 py-0 text-right font-weight-bold text-end"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    {item.rate}
                  </td>
                  <td
                    className=" px-2 py-0 font-weight-bold text-center"
                    style={{ borderRight: "1px solid black", lineHeight: 1 }}
                  >
                    Nos
                  </td>
                  <td
                    className=" px-2 py-1  text-right font-weight-bold text-end"
                    style={{ lineHeight: 1 }}
                  >
                    {item.amt.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Spacer rows */}
              <tr>
                <td style={{ borderRight: "1px solid black" }}></td>{" "}
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td></td>
              </tr>
              <tr>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td style={{ borderRight: "1px solid black" }}></td>
                <td></td>
              </tr>

              {/* Tax Rows */}
              {taxRows.map((tax, idx) => (
                <tr
                  key={`tax-${idx}`}
                  className="font-weight-medium"
                  style={{ lineHeight: 1 }}
                >
                  {" "}
                  <td
                    className="px-2 py-1"
                    style={{ borderRight: "1px solid black" }}
                  ></td>
                  <td
                    className=" px-2 py-1 text-end"
                    style={{ borderRight: "1px solid black" }}
                  >
                    {tax.label}
                  </td>
                  <td
                    className=" px-2 py-1"
                    style={{ borderRight: "1px solid black" }}
                  ></td>
                  <td
                    className=" px-2 py-1"
                    style={{ borderRight: "1px solid black" }}
                  ></td>
                  <td
                    className=" px-2 py-1 text-end"
                    style={{ borderRight: "1px solid black" }}
                  >
                    {tax.percentage}
                  </td>
                  <td
                    className=" px-2 py-1"
                    style={{
                      borderRight: "1px solid black",
                    }}
                  ></td>
                  <td className=" px-2 py-1  text-end">
                    {tax.amount.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* More spacing */}
              <tr>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderRight: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                ></td>
                <td
                  style={{
                    borderBottom: "1px solid black",
                  }}
                ></td>
              </tr>
              {/* Total Row */}
              <tr className="font-weight-bold">
                <td
                  className="border-top border-end border-dark px-2 py-0 text-end"
                  colSpan="6"
                  style={{ fontWeight: "500" }}
                >
                  Total
                </td>
                <td
                  className="border-top border-dark px-2 py-0 text-end "
                  style={{ fontWeight: "500" }}
                >
                  ₹ {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          className="d-grid text-sm "
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "auto auto auto auto auto",
            gap: 0,
          }}
        >
          {/* div1 - Amount in Words */}
          <div style={{ gridArea: "1 / 1 / 2 / 3" }}>
            <div
              className="d-flex justify-content-between align-items-center mb-0"
              style={{ fontSize: "0.8rem" }}
            >
              <p className="font-weight-semibold px-2 mb-0">
                Amount Chargeable (in words)
              </p>
              <p className="text-sm px-2 mb-0">E. & O.E</p>
            </div>

            <p
              className=" px-2 mb-0 fst-italic"
              style={{ fontSize: "0.95rem", fontWeight: "500" }}
            >
              {TotalAmountInWords}
            </p>
          </div>

          {/* div2 - Tax Table */}
          <div style={{ gridArea: "2 / 1 / 3 / 3" }}>
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                width: "100%",
                fontSize: "0.875rem",
                lineHeight: 1,
                borderTop: "1px solid black",
                borderBottom: "1px solid black",
              }}
            >
              <thead style={{ lineHeight: 1 }}>
                <tr>
                  <th
                    rowSpan="2"
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center",
                      width: "15rem",
                    }}
                  >
                    HSN/SAC
                  </th>
                  <th
                    rowSpan="2"
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    Taxable Value
                  </th>
                  <th
                    colSpan="2"
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    Central Tax
                  </th>
                  <th
                    colSpan="2"
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    State Tax
                  </th>
                  <th
                    rowSpan="2"
                    style={{
                      borderBottom: "1px solid black",
                    }}
                  >
                    Total Tax
                  </th>
                </tr>
                <tr>
                  <th
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    {data?.items[0]?.hsn || "—"}
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    ₹{" "}
                    {data?.items
                      ?.reduce((sum, item) => sum + item.qty * item.rate, 0)
                      .toFixed(2)}
                  </td>

                  {/* CGST */}
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center ",
                    }}
                  >
                    {data?.taxRows?.[0]?.percentage || "—"}
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    ₹ {data?.taxRows?.[0]?.amount?.toFixed(2) || "0.00"}
                  </td>

                  {/* SGST */}
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    {data?.taxRows?.[1]?.percentage || "—"}
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      borderBottom: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    ₹ {data?.taxRows?.[1]?.amount?.toFixed(2) || "0.00"}
                  </td>

                  {/* Total Tax */}
                  <td
                    style={{
                      borderBottom: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    ₹{totalTaxAmount}
                  </td>
                </tr>

                {/* Total row */}
                <tr>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      textAlign: "right",
                      fontWeight: "500",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      fontWeight: "500",
                      textAlign: "right",
                    }}
                  >
                    ₹{" "}
                    {data?.items
                      ?.reduce((sum, item) => sum + item.qty * item.rate, 0)
                      .toFixed(2)}
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                    }}
                  ></td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      textAlign: "right",
                      fontWeight: "500",
                    }}
                  >
                    ₹ {data?.taxRows?.[0]?.amount?.toFixed(2) || "0.00"}
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                    }}
                  ></td>
                  <td
                    style={{
                      borderRight: "1px solid black",
                      textAlign: "right",
                      fontWeight: "500",
                    }}
                  >
                    ₹ {data?.taxRows?.[1]?.amount?.toFixed(2) || "0.00"}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: "500",
                    }}
                  >
                    ₹{totalTaxAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* div3 - Tax Amount in Words */}
          <div style={{ gridArea: "3 / 1 / 4 / 3" }}>
            <p
              className="font-italic py-1 border-bottom border-dark mb-0"
              style={{ fontSize: "0.85rem" }}
            >
              Tax Amount (in words):
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  letterSpacing: "-0.5px",
                }}
                className="fst-italic"
              >
                {TotalTaxInWords}
              </span>
            </p>
          </div>

          {/* div4 - Declaration */}
          <div
            style={{ gridArea: "4 / 1 / 5 / 2" }}
            className="border-end border-bottom border-dark px-1 pb-0"
          >
            <p className="fw-semibold text-decoration-underline mb-0">
              Declaration
            </p>
            <p className="mb-1" style={{ fontSize: "0.8rem", lineHeight: "1" }}>
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
          </div>

          {/* Company Bank Details */}
          <div
            style={{ gridArea: "4 / 2 / 5 / 3" }}
            className="border-bottom border-dark px-1  pb-0"
          >
            <p className="fw-semibold mb-0 mt-0 text-sm text-decoration-underline">
              Company's Bank Details
            </p>
            <p className="mb-0" style={{ fontSize: "0.9rem", lineHeight: "1" }}>
              <strong>
                Bank Name &nbsp;: &nbsp;&nbsp;&nbsp;State Bank of India
              </strong>
            </p>
            <p className="mb-0" style={{ fontSize: "0.9rem", lineHeight: "1" }}>
              <strong>
                A/c No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                :&nbsp;&nbsp;&nbsp; 42562982959
              </strong>
            </p>
            <p className="mb-0" style={{ fontSize: "0.9rem", lineHeight: "1" }}>
              <strong>
                IFSC Code &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
                SBIN0009992
              </strong>
            </p>
          </div>

          {/* div6 - Jurisdiction */}
          <div
            style={{ gridArea: "5 / 1 / 6 / 2" }}
            className="border-end border-dark px-1 py-3"
          >
            <p className="font-weight-medium">
              SUBJECT TO AURANGABAD JURISDICTION.
            </p>{" "}
          </div>

          {/* div7 - Signature */}
          <div
            style={{ gridArea: "5 / 2 / 6 / 3" }}
            className="text-right px-1"
          >
            <p className="mb-3 text-end " style={{ fontSize: "0.8rem" }}>
              for <strong>R B PRAJAPATI AND BROTHERS</strong>
            </p>
            <p
              className=" text-end mb-0"
              style={{ fontSize: "0.7rem", marginTop: "2.2rem" }}
            >
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-small mb-5">
        <span> This is a Computer Generate Invoice</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Edit
        </button>
        <button className="btn btn-success" onClick={handleDownloadPDF}>
          ⬇️ Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
