import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { downloadClientProfileFile, parseClientProfileFile } from "@/lib/clientProfileExchange"
import type { ClientRecord, CreateClientPayload } from "@/lib/store"
import { useAppStore } from "@/lib/store"
import { RiAlertLine, RiCheckboxCircleLine, RiDownload2Line, RiFileUploadLine, RiUpload2Line } from "@remixicon/react"
import { useRef, useState } from "react"

const MAX_IMPORT_BYTES = 2 * 1024 * 1024

type ImportPreview = {
  fileName: string
  clients: CreateClientPayload[]
  duplicates: string[]
}

export function ImportClientsDrawer() {
  const existingClients = useAppStore((state) => state.clients)
  const createClient = useAppStore((state) => state.createClient)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [importedCount, setImportedCount] = useState(0)

  function reset() {
    setPreview(null)
    setErrors([])
    setImportedCount(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function selectFile(file?: File) {
    reset()
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".json")) {
      setErrors(["Choose a Gap Tool client-profile JSON file."])
      return
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setErrors(["The file is larger than the 2 MB client-import limit."])
      return
    }

    const result = parseClientProfileFile(await file.text())
    if (result.ok === false) {
      setErrors(result.errors)
      return
    }

    const existingNames = new Set(existingClients.map((client) => `${client.firstName}|${client.lastName}`.toLowerCase()))
    const duplicates = result.clients
      .filter((client) => existingNames.has(`${client.firstName}|${client.lastName}`.toLowerCase()))
      .map((client) => `${client.firstName} ${client.lastName}`)
    setPreview({ fileName: file.name, clients: result.clients, duplicates })
  }

  function importClients() {
    if (!preview) return
    for (const client of preview.clients) createClient(client)
    setImportedCount(preview.clients.length)
    setPreview(null)
  }

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset() }}>
      <DrawerTrigger asChild>
        <Button variant="secondary">
          <RiUpload2Line className="size-4" aria-hidden="true" />
          Import Clients
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader><DrawerTitle>Import Client Profiles</DrawerTitle></DrawerHeader>
        <DrawerBody className="space-y-5">
          <div>
            <p className="text-sm leading-6 text-gray-300">Import one or multiple client input profiles from a Gap Tool JSON file. Existing clients, reviews, calculations, and advisor assumptions will not be changed.</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">Review the detected profiles before confirming. Imported clients receive new internal IDs and are ready for risk-review generation.</p>
          </div>

          <input ref={inputRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => void selectFile(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-950/50 px-6 py-10 text-center transition hover:border-brand-500/60 hover:bg-brand-500/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400">
            <RiFileUploadLine className="size-7 text-brand-400" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold text-gray-100">Choose client-profile file</span>
            <span className="mt-1 text-xs text-gray-500">JSON · up to 2 MB · up to 500 clients</span>
          </button>

          {errors.length ? (
            <div role="alert" className="rounded-xl border border-red-900/70 bg-red-950/25 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-red-200"><RiAlertLine className="size-4" />Import file needs attention</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-red-300/80">{errors.map((error) => <li key={error}>• {error}</li>)}</ul>
            </div>
          ) : null}

          {preview ? (
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><RiCheckboxCircleLine className="size-4" />Ready to import {preview.clients.length} client{preview.clients.length === 1 ? "" : "s"}</p>
              <p className="mt-1 truncate text-xs text-emerald-300/70">{preview.fileName}</p>
              <ul className="mt-3 max-h-36 space-y-1 overflow-auto text-sm text-gray-300">{preview.clients.map((client, index) => <li key={`${client.firstName}-${client.lastName}-${index}`}>{client.firstName} {client.lastName} · {client.clientType === "couple" ? "Couple" : "Individual"}</li>)}</ul>
              {preview.duplicates.length ? <p className="mt-3 text-xs leading-5 text-amber-300">Possible existing name match: {preview.duplicates.join(", ")}. Confirming will create a separate client profile.</p> : null}
            </div>
          ) : null}

          {importedCount ? <div role="status" className="rounded-xl border border-emerald-800/70 bg-emerald-950/30 p-4 text-sm font-semibold text-emerald-200">Imported {importedCount} client{importedCount === 1 ? "" : "s"} successfully.</div> : null}
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>{importedCount ? "Done" : "Cancel"}</Button>
          {preview ? <Button onClick={importClients}><RiUpload2Line className="size-4" />Import {preview.clients.length} Client{preview.clients.length === 1 ? "" : "s"}</Button> : null}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function ExportAllClientsButton({ clients }: { clients: ClientRecord[] }) {
  return <Button variant="secondary" disabled={!clients.length} onClick={() => downloadClientProfileFile(clients, "all-clients")}><RiDownload2Line className="size-4" />Export All</Button>
}

export function ExportClientButton({ client, compact = false, disabled = false }: { client: ClientRecord; compact?: boolean; disabled?: boolean }) {
  const clientName = client.displayName?.trim() || `${client.firstName} ${client.lastName}`.trim() || "client"
  const title = disabled ? "Save changes before exporting this client profile" : "Export client profile"

  if (compact) {
    return <button type="button" disabled={disabled} aria-label={`Export ${clientName}`} title={title} className="rounded-md p-1.5 text-[#80d5db] transition-colors hover:bg-brand-500/15 hover:text-[#b0e5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:bg-transparent" onClick={() => downloadClientProfileFile([client], clientName)}><RiDownload2Line className="size-4" aria-hidden="true" /></button>
  }
  return <Button variant="secondary" disabled={disabled} title={title} onClick={() => downloadClientProfileFile([client], clientName)}><RiDownload2Line className="size-4" />Export Profile</Button>
}
