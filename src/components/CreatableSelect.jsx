import CreatableSelect from "react-select/creatable";

<div className="col-4">
  <CreatableSelect
    isClearable
    options={materials.map((m) => ({ value: m.desc, label: m.desc }))}
    value={row.material ? { value: row.material, label: row.material } : null}
    onChange={(selected) =>
      handleMaterialChange(idx, "material", selected ? selected.value : "")
    }
    placeholder="Select or type material"
  />
</div>;
