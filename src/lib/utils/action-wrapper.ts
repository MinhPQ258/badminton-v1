import { ActionResponse, AppError } from "./error";

export async function actionWrapper<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    console.error("❌ [Server Action Error]:", error);

    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    if (error?.message) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Đã xảy ra lỗi không xác định." };
  }
}
