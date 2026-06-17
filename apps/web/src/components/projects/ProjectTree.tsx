type Props = {
  files: string[];
};

export default function ProjectTree({ files }: Props) {
  return (
    <div className="scrollbar-thin max-h-[460px] overflow-y-auto rounded border border-sentinel-border bg-sentinel-bg/60 p-3 font-mono text-xs text-slate-300">
      {files.length === 0 ? (
        <p className="font-sans text-sm text-slate-500">No file tree loaded.</p>
      ) : (
        files.map((file) => (
          <div key={file} className={file.endsWith("/") ? "text-cyan-200" : "text-slate-300"}>
            {file}
          </div>
        ))
      )}
    </div>
  );
}

