import type { PendingExitItem } from "@/features/dashboard/types";
import {
  cancelExitLog,
  createExitLog,
  getExitLog,
  updateExitLog,
  type CreateExitLogItem,
} from "./api";
import { planLinesToCreateItem } from "./buildExitLogCreatePayload";
import { flattenExitLogLocationLines } from "./exitLogDetailNormalize";
import type { ExitPickLine } from "./planExitPick";

function structureKey(
  lines: { productId: string; zoneId?: string | null }[],
): string {
  return lines
    .map((line) => `${line.productId}:${line.zoneId ?? ""}`)
    .sort()
    .join("|");
}

function createItemToStructureLines(item: CreateExitLogItem) {
  if ("locations" in item && item.locations) {
    return item.locations.map((loc) => ({
      productId: item.product_id,
      zoneId: loc.zone_id,
    }));
  }
  return [
    {
      productId: item.product_id,
      zoneId: "zone_id" in item ? item.zone_id : undefined,
    },
  ];
}

/** Agrupa líneas pendientes en ítems POST con locations[] por producto. */
export function pendingItemsToCreateItems(items: PendingExitItem[]): CreateExitLogItem[] {
  const byProduct = new Map<string, ExitPickLine[]>();

  for (const item of items) {
    if (item.confirmedQuantity <= 0) continue;
    const lines = byProduct.get(item.productId) ?? [];
    lines.push({
      zoneId: item.zoneId ?? null,
      quantity: item.confirmedQuantity,
      location: item.pickLocation ?? {},
    });
    byProduct.set(item.productId, lines);
  }

  const createItems: CreateExitLogItem[] = [];
  for (const [productId, plan] of byProduct) {
    const payload = planLinesToCreateItem(productId, plan);
    if (payload) createItems.push(payload);
  }
  return createItems;
}

/** Alinea el borrador del servidor con el plan local antes de confirmar. */
export async function syncExitLogDraftBeforeConfirm(
  exitLogId: string,
  items: PendingExitItem[],
  note?: string | null,
): Promise<{ exitLogId: string }> {
  const detail = await getExitLog(exitLogId);
  const desired = items.filter((item) => item.confirmedQuantity > 0);
  const desiredCreate = pendingItemsToCreateItems(desired);

  const serverLines = flattenExitLogLocationLines(detail);
  const serverStructure = structureKey(
    serverLines.map((line) => ({
      productId: line.productId,
      zoneId: line.zoneId,
    })),
  );
  const desiredStructure = structureKey(
    desiredCreate.flatMap((item) => createItemToStructureLines(item)),
  );

  if (serverStructure !== desiredStructure) {
    await cancelExitLog(exitLogId);
    const created = await createExitLog({
      note: note?.trim() || undefined,
      items: desiredCreate,
    });
    return { exitLogId: created.exit_log.id };
  }

  const patches = serverLines.map((line) => {
    const match = desired.find(
      (item) =>
        item.productId === line.productId &&
        (item.zoneId ?? undefined) === (line.zoneId ?? undefined),
    );
    return {
      item_id: line.itemId,
      quantity: match?.confirmedQuantity ?? 0,
    };
  });

  if (patches.length > 0) {
    await updateExitLog(exitLogId, { items: patches });
  }

  return { exitLogId };
}
