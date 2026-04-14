import type { FormResponseDto } from "../client/types.gen";
import type { FormSchema } from "@alliance/common/forms/form-schema";

/**
 * Interpolates a share text template using form response answers.
 *
 * Template syntax: ${field label} — case-insensitive match against form field labels.
 * Example: "Donated ${amount} to Helen Keller International"
 *
 * If a variable name doesn't match any field label, it is left as-is.
 */
export function interpolateShareText(
  template: string,
  formResponse: FormResponseDto,
): string {
  const schema = formResponse.schemaSnapshot as unknown as FormSchema;
  if (!schema?.pages) return template;

  const allFields = schema.pages.flatMap((page) => page.fields);

  return template.replace(/\$\{([^}]+)\}/g, (match, varName: string) => {
    const normalized = varName.trim().toLowerCase();
    const field = allFields.find(
      (f) =>
        "label" in f &&
        typeof f.label === "string" &&
        f.label.toLowerCase() === normalized,
    );
    if (!field || !("id" in field)) return match;
    const value = formResponse.answers[(field as { id: string }).id];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function buildShareText({
  template,
  formResponse,
  url,
}: {
  template?: string | null;
  formResponse?: FormResponseDto | null;
  url: string;
}): string {
  if (!template) return url;

  const interpolated = formResponse
    ? interpolateShareText(template, formResponse)
    : template;
  const trimmed = interpolated.trim();

  return trimmed ? `${trimmed}\n\n${url}` : url;
}
