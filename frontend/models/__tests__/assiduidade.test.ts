import { describe, it, expect } from "vitest";
import { TipoAssiduidade, RegistoAssiduidade, RegistoAssiduidadeUpdate } from "../assiduidade";

describe("Modelo de Assiduidade — Alinhamento com Backend Spring Boot", () => {
  it("deve suportar todos os tipos de assiduidade em UPPER_SNAKE_CASE", () => {
    const tiposValidos: TipoAssiduidade[] = [
      "PRESENTE",
      "AUSENTE",
      "FALTA_INJUSTIFICADA",
      "FALTA_JUSTIFICADA",
      "FALTA_AUTORIZADA",
      "ATRASADO",
      "LESIONADO",
      "AO_SERVICO_SELECAO",
      "DISPENSADO",
      "TREINO_CONDICIONADO",
      "OUTRO",
    ];

    tiposValidos.forEach((tipo) => {
      const registo: RegistoAssiduidade = {
        id: "test-id",
        eventoId: "evento-1",
        atletaId: "atleta-1",
        tipoAssiduidade: tipo,
      };
      expect(registo.tipoAssiduidade).toBe(tipo);
    });
  });

  it("deve permitir criar um payload de atualização de assiduidade válido", () => {
    const updatePayload: RegistoAssiduidadeUpdate = {
      tipoAssiduidade: "ATRASADO",
      minutosAtraso: 15,
      justificacao: "Trânsito intenso na ponte",
    };

    expect(updatePayload.tipoAssiduidade).toBe("ATRASADO");
    expect(updatePayload.minutosAtraso).toBe(15);
    expect(updatePayload.justificacao).toBe("Trânsito intenso na ponte");
  });
});
