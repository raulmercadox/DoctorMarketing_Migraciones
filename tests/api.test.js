// tests/api.test.js
const request = require("supertest");
const app = require("../server");

// Mock para knex
jest.mock("../db", () => {
  const mockKnex = jest.fn().mockReturnThis();
  mockKnex.select = jest.fn().mockReturnThis();
  mockKnex.where = jest.fn().mockReturnThis();
  mockKnex.join = jest.fn().mockReturnThis();
  mockKnex.leftJoin = jest.fn().mockReturnThis();
  mockKnex.count = jest.fn().mockReturnThis();
  mockKnex.orderBy = jest.fn().mockReturnThis();
  mockKnex.limit = jest.fn().mockReturnThis();
  mockKnex.offset = jest.fn().mockReturnThis();
  mockKnex.first = jest.fn().mockReturnThis();
  mockKnex.modify = jest.fn().mockImplementation((fn) => {
    if (fn) fn(mockKnex);
    return mockKnex;
  });

  return jest.fn(() => mockKnex);
});

describe("API REST Endpoints", () => {
  let db;

  beforeEach(() => {
    db = require("../db/db");
    // Limpiar todas las simulaciones antes de cada prueba
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    test("debería devolver información básica de la API", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("endpoints");
      expect(response.body.endpoints).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/pacientes", () => {
    test("debería obtener una lista de pacientes", async () => {
      const mockPacientes = [
        { id_paciente: 1, nombre: "Juan", apellido: "Pérez" },
        { id_paciente: 2, nombre: "María", apellido: "López" },
      ];

      // Mock para la respuesta de la base de datos
      db.mockImplementation((table) => {
        if (table === "pacientes") {
          return {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            modify: jest.fn().mockReturnThis(),
            then: jest.fn().mockResolvedValue(mockPacientes),
          };
        } else {
          return {
            count: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            modify: jest.fn().mockReturnThis(),
            then: jest.fn().mockResolvedValue([{ total: 2 }]),
          };
        }
      });

      const response = await request(app).get("/api/pacientes");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("error", false);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/pacientes/:id", () => {
    test("debería obtener un paciente específico", async () => {
      const mockPaciente = {
        id_paciente: 1,
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@example.com",
      };

      const mockPresupuestos = [
        { id_presupuesto: 101, fecha: "2022-01-01", monto_total: 100 },
      ];

      // Mock para la respuesta de la base de datos
      db.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockPaciente),
      })).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue(mockPresupuestos),
      }));

      const response = await request(app).get("/api/pacientes/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("error", false);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id_paciente", 1);
    });

    test("debería devolver 404 para un ID de paciente que no existe", async () => {
      // Mock para la respuesta de la base de datos - paciente no encontrado
      db.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app).get("/api/pacientes/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", true);
    });
  });
});
