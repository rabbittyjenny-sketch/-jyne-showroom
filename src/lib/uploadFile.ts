// Shared helpers for every Supabase Storage upload in the app.
//
// Copied from Creatr365. The content-type half of the fix now lives in
// src/lib/uploadRules.ts (contentTypeOf), which also decides which files each box accepts.
// Two real bugs these fix (found while investigating "PDF/zip won't upload
// to Toolbox"):
//
// 1. @supabase/storage-js builds the upload request URL from the raw path
//    string with NO URL-encoding — it does not escape spaces, Thai/non-ASCII
//    characters, or symbols. A path built from the original file name (e.g.
//    "เทมเพลต Caption (1).pdf") can produce a malformed request that some
//    filenames survive and others don't, depending on which characters they
//    contain. `sanitizeFileName` strips it down to a safe key; the original
//    name is kept separately (`file_name` column) for display.
// 2. storage-js does NOT read `File.type` — when `contentType` isn't passed
//    explicitly it defaults to `text/plain;charset=UTF-8` for every upload.
//    uploadMedia passes contentTypeOf(file) (from the extension) instead.
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
