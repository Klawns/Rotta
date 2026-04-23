import { resolveRideDateValue } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils";
import type { RideViewModel } from "@/types/rides";
import type {
  RideCardDetailItem,
  RideCardFinancialState,
  RideCardPresentation,
} from "./ride-card.types";

const FALLBACK_CLIENT_NAME = "Passageiro";
const FALLBACK_DATE = "Data indisponível";
const FALLBACK_LOCATION = "Local não informado";

function normalizeMoneyValue(value?: number | null) {
  const amount = Number(value ?? 0);
  return amount > 0 ? amount : 0;
}

function formatRideShortLabel(id: string) {
  const shortId = id.split("-")[0]?.toUpperCase() || id.toUpperCase();
  return `Corrida #${shortId}`;
}

function formatShortDate(date: Date | null) {
  if (!date) {
    return FALLBACK_DATE;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatLongDate(date: Date | null) {
  if (!date) {
    return FALLBACK_DATE;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFinancialState(ride: RideViewModel): RideCardFinancialState {
  const debtValue = normalizeMoneyValue(ride.debtValue);
  const paidWithBalance = normalizeMoneyValue(ride.paidWithBalance);

  if (debtValue > 0 && paidWithBalance > 0) {
    return "partial";
  }

  if (debtValue > 0) {
    return "debt";
  }

  if (ride.paymentStatus === "PENDING") {
    return "pending";
  }

  return "paid";
}

function getFinancialCopy(
  ride: RideViewModel,
  financialState: RideCardFinancialState,
) {
  const paidWithBalance = normalizeMoneyValue(ride.paidWithBalance);
  const debtValue = normalizeMoneyValue(ride.debtValue);

  switch (financialState) {
    case "partial":
      return {
        financialLabel: "Parcial",
        financialHelper: `${formatCurrency(debtValue)} em aberto`,
        paymentActionLabel: "Marcar como pago",
      };
    case "debt":
      return {
        financialLabel: "Em aberto",
        financialHelper: `${formatCurrency(debtValue)} em aberto`,
        paymentActionLabel: "Marcar como pago",
      };
    case "pending":
      return {
        financialLabel: "Pendente",
        financialHelper: "Aguardando quitação",
        paymentActionLabel: "Marcar como pago",
      };
    case "paid":
    default:
      return {
        financialLabel: "Pago",
        financialHelper:
          paidWithBalance > 0
            ? `Saldo aplicado ${formatCurrency(paidWithBalance)}`
            : null,
        paymentActionLabel: "Marcar como pendente",
      };
  }
}

function buildDetails(
  ride: RideViewModel,
  financialState: RideCardFinancialState,
  rideDate: Date | null,
  financialLabel: string,
): RideCardDetailItem[] {
  const debtValue = normalizeMoneyValue(ride.debtValue);
  const paidWithBalance = normalizeMoneyValue(ride.paidWithBalance);
  const details: RideCardDetailItem[] = [
    {
      label: "Status",
      value: financialLabel,
      tone:
        financialState === "paid"
          ? "positive"
          : financialState === "debt"
            ? "danger"
            : "warning",
    },
    {
      label: "Data",
      value: formatLongDate(rideDate),
    },
    {
      label: "Local",
      value: ride.location?.trim() || FALLBACK_LOCATION,
    },
    {
      label: "ID completo",
      value: ride.id,
    },
  ];

  if (paidWithBalance > 0) {
    details.push({
      label: "Saldo usado",
      value: formatCurrency(paidWithBalance),
      tone: "positive",
    });
  }

  if (debtValue > 0) {
    details.push({
      label: "Valor pendente",
      value: formatCurrency(debtValue),
      tone: "danger",
    });
  }

  return details;
}

export function getRideCardPresentation(
  ride: RideViewModel,
): RideCardPresentation {
  const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
  const financialState = getFinancialState(ride);
  const financialCopy = getFinancialCopy(ride, financialState);

  return {
    rideShortLabel: formatRideShortLabel(ride.id),
    clientName: ride.clientName || FALLBACK_CLIENT_NAME,
    formattedValue: formatCurrency(ride.value),
    financialState,
    financialLabel: financialCopy.financialLabel,
    financialHelper: financialCopy.financialHelper,
    paymentStatus: ride.paymentStatus,
    paymentActionLabel: financialCopy.paymentActionLabel,
    metaItems: [
      formatShortDate(rideDate),
      ride.location?.trim() || FALLBACK_LOCATION,
    ],
    details: buildDetails(
      ride,
      financialState,
      rideDate,
      financialCopy.financialLabel,
    ),
    notes: ride.notes?.trim() || null,
    photoUrl: ride.photo?.trim() || null,
  };
}
