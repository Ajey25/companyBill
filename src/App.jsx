import React, { useState } from "react";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePreview from "./components/InvoicePreview";

function App() {
  const [formData, setFormData] = useState(null);
  const [showPreview, setShowPreview] = useState(false); // Separate UI toggle

  const handleGenerateInvoice = (data) => {
    setFormData(data);
    setShowPreview(true);
  };

  const handleBackToEdit = () => {
    setShowPreview(false); // Go back but keep data
  };

  return (
    <div className="container py-4">
      {showPreview ? (
        <InvoicePreview data={formData} onBack={handleBackToEdit} />
      ) : (
        <InvoiceForm
          onGenerate={handleGenerateInvoice}
          initialData={formData}
        />
      )}
    </div>
  );
}

export default App;
