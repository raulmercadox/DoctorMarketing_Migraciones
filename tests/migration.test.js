// tests/migration.test.js
const {
  validateField,
  formatDateForMySQL,
} = require("../utils/migrationHelpers");
const { readXlsxFile } = require("../utils/xlsxHelpers");
const path = require("path");

// Mock para fs y xlsx
jest.mock("xlsx", () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

describe("Funciones de utilidad para migración", () => {
  describe("validateField", () => {
    test("debería devolver el valor por defecto si el valor es null", () => {
      expect(validateField(null, "default")).toBe("default");
    });

    test("debería devolver el valor por defecto si el valor es undefined", () => {
      expect(validateField(undefined, "default")).toBe("default");
    });

    test("debería convertir a string si el tipo es string", () => {
      expect(validateField(123, "default", "string")).toBe("123");
    });

    test("debería convertir a número si el tipo es number", () => {
      expect(validateField("123", 0, "number")).toBe(123);
    });

    test("debería devolver el valor por defecto si el número no es válido", () => {
      expect(validateField("abc", 0, "number")).toBe(0);
    });

    test("debería convertir a boolean si el tipo es boolean", () => {
      expect(validateField(1, false, "boolean")).toBe(true);
      expect(validateField(0, true, "boolean")).toBe(false);
    });

    test("debería convertir a fecha si el tipo es date", () => {
      const result = validateField("2022-01-01", null, "date");
      expect(result).toContain("2022-01-01");
    });

    test("debería devolver el valor por defecto si la fecha no es válida", () => {
      expect(validateField("no-es-fecha", "default-date", "date")).toBe(
        "default-date"
      );
    });

    test("debería convertir a decimal si el tipo es decimal", () => {
      expect(validateField("123.45", 0, "decimal")).toBe("123.45");
    });

    test("debería devolver el valor original para tipos desconocidos", () => {
      const obj = { test: "value" };
      expect(validateField(obj, null, "unknown")).toBe(obj);
    });
  });

  describe("formatDateForMySQL", () => {
    test("debería devolver null para fechas no válidas", () => {
      expect(formatDateForMySQL(null)).toBeNull();
      expect(formatDateForMySQL(undefined)).toBeNull();
      expect(formatDateForMySQL("not-a-date")).toBeNull();
    });

    test("debería formatear correctamente fechas válidas", () => {
      expect(formatDateForMySQL("2022-01-01")).toBe("2022-01-01");
      expect(formatDateForMySQL(new Date("2022-01-01"))).toBe("2022-01-01");
    });
  });
});

describe("Funciones de lectura de XLSX", () => {
  const xlsx = require("xlsx");
  const fs = require("fs");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debería retornar un array vacío si el archivo no existe", () => {
    fs.existsSync.mockReturnValue(false);

    const result = readXlsxFile("/fake/path/to/file.xlsx");

    expect(result).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith("/fake/path/to/file.xlsx");
  });

  test("debería procesar correctamente un archivo XLSX", () => {
    const mockData = [
      { id: 1, nombre: "Test1" },
      { id: 2, nombre: "Test2" },
    ];

    fs.existsSync.mockReturnValue(true);
    xlsx.readFile.mockReturnValue({ SheetNames: ["Sheet1"] });
    xlsx.utils.sheet_to_json.mockReturnValue(mockData);

    const result = readXlsxFile("/fake/path/to/file.xlsx");

    expect(result).toEqual(mockData);
    expect(fs.existsSync).toHaveBeenCalledWith("/fake/path/to/file.xlsx");
    expect(xlsx.readFile).toHaveBeenCalledWith(
      "/fake/path/to/file.xlsx",
      expect.any(Object)
    );
    expect(xlsx.utils.sheet_to_json).toHaveBeenCalled();
  });
});
