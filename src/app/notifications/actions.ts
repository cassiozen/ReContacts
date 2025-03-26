"use server";

import * as preparedStatements from "@/db/preparedStatements";
import { revalidatePath } from "next/cache";

export async function dismissNotification(id: number) {
  await preparedStatements.dismissNotification.execute({ id });
  revalidatePath("/notifications");
}