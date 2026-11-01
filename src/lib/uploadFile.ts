// Shared helpers for every Supabase Storage upload in the app.
//
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
//    explicitly it defaults to `text/plain;charset=UTF-8` for every upload,
//    regardless of the real file. `resolveContentType` passes the browser's
//    detected MIME type (or a safe binary fallback) so files are stored with
//    the correct type instead of all being tagged as plain text.
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function resolveContentType(file: File): string {
  return file.type || 'application/octet-stream';
}
