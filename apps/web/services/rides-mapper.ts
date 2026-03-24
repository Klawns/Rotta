import { Ride, RideResponseDTO } from "../types/rides";

/**
 * Mapper para desacoplar o modelo da API (DTO) do modelo da UI (Domain/Domain-like).
 * Centraliza qualquer transformação necessária ao receber ou enviar dados.
 */
export class RidesMapper {
  /**
   * Converte um RideResponseDTO vindo da API para o modelo Ride usado na UI.
   * Garante compatibilidade com componentes que esperam clientId/clientName flat.
   */
  static toDomain(dto: RideResponseDTO): Ride {
    return {
      ...dto,
      // Flattening para retrocompatibilidade e facilidade de acesso na UI
      clientId: dto.client?.id,
      clientName: dto.client?.name || "Sem nome",
      paid: dto.paymentStatus === 'PAID'
    };
  }

  /**
   * Converte uma lista de RideResponseDTO para uma lista de Ride.
   */
  static toDomainList(dtos: RideResponseDTO[]): Ride[] {
    if (!dtos) return [];
    return dtos.map((dto) => this.toDomain(dto));
  }

  /**
   * Pode ser expandido para transformações de saída (toDTO) se necessário no futuro,
   * facilitando a manutenção caso o payload de criação/atualização mude drasticamente.
   */
}
