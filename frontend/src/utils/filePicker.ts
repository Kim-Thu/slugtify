export type PickedFiles = {
  files: File[];
  relativePaths: string[];
};

export function pickFiles(options: { directory?: boolean; accept?: string; multiple?: boolean } = {}): Promise<PickedFiles> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = options.directory ? true : options.multiple !== false;
    if (options.accept) input.accept = options.accept;
    if (options.directory) {
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("directory", "");
    }

    input.onchange = () => {
      const files = Array.from(input.files || []);
      const relativePaths = files.map((file) => {
        const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
        return relative || file.name;
      });
      resolve({ files, relativePaths });
    };

    input.oncancel = () => resolve({ files: [], relativePaths: [] });
    input.click();
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
