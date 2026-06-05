"use server";

// Two shapes so we can bisect which binding freezes a static (no-backend) host:
//   formAction  -> <form action={formAction}>            (React calls fd => …)
//   stateAction -> useActionState(stateAction, null)     (prev, fd => …)
export async function formAction(formData: FormData): Promise<void> {
  void formData;
}
export async function stateAction(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: boolean; value: string }> {
  return { ok: true, value: String(formData.get("t") ?? "") };
}
