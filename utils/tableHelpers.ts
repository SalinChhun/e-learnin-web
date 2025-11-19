// import { ApiParameter } from "@/openapi/apiDefinition";

interface TableColumn {
  key: any;
  label: string;
  required: boolean;
}

export const getVisibleColumns = (params: any[]): TableColumn[] => {
  const allColumns: TableColumn[] = [
    { key: "name", label: "Parameter", required: true },
    { key: "type", label: "Type", required: true },
    { key: "size", label: "Size", required: false },
    { key: "example", label: "Example", required: false },
    { key: "description", label: "Description", required: true },
  ];

  return allColumns.filter((column) => {
    if (column.required) return true;

    return params.some((param) => {
      const value = param[column.key];
      return value !== undefined && value !== null && value !== "";
    });
  });
};

export const getTypeClass = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "string":
      return "type-string";
    case "number":
    case "integer":
      return "type-number";
    case "boolean":
      return "type-boolean";
    case "object":
      return "type-object";
    case "array":
      return "type-array";
    default:
      return "";
  }
};
