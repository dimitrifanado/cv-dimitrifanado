/**
 * Export du bloc CV en PDF : images en data URL, capture via `html-to-image` (OK avec Tailwind / oklch),
 * puis jsPDF. Enregistrement via l’API File System Access ou téléchargement classique.
 */
import type { RefObject } from 'react'
import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Remplace les `src` des images par des data URLs (CORS / capture fiable).
 */
async function inlineImagesAsDataUrls(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src
      if (!src || src.startsWith('data:')) return
      try {
        const res = await fetch(src, { mode: 'cors', credentials: 'omit' })
        if (!res.ok) return
        const blob = await res.blob()
        const dataUrl = await blobToDataUrl(blob)
        img.crossOrigin = 'anonymous'
        img.src = dataUrl
        if (img.decode) await img.decode()
      } catch {
        /* image ignorée si fetch impossible */
      }
    }),
  )
}

type SavePickerWindow = typeof globalThis & {
  showSaveFilePicker?: (options: {
    suggestedName?: string
    types?: Array<{ description?: string; accept: Record<string, string[]> }>
  }) => Promise<{
    createWritable: () => Promise<{
      write: (chunk: Blob) => Promise<void>
      close: () => Promise<void>
    }>
  }>
}

/**
 * Enregistrement sur le disque (API Fichiers si dispo) ou téléchargement classique.
 */
export async function savePdfBlob(blob: Blob, suggestedName: string): Promise<void> {
  const g = globalThis as SavePickerWindow
  if (typeof g.showSaveFilePicker === 'function') {
    try {
      const handle = await g.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'PDF',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      console.warn('showSaveFilePicker a échoué, téléchargement classique.', e)
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function exportCvElementToPdfFile(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  await document.fonts.ready

  await inlineImagesAsDataUrls(element)

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  /**
   * `html-to-image` rasterise via SVG foreignObject : le moteur du navigateur
   * applique le CSS (dont oklch Tailwind v4). `html2canvas` parse le CSS lui-même
   * et plante sur oklch.
   */
  const canvas = await toCanvas(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH)

  const blob = pdf.output('blob')
  await savePdfBlob(blob, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
}

/** Pour `useRef<HTMLDivElement>(null)` */
export async function exportCvRefToPdfFile(
  ref: RefObject<HTMLElement | null>,
  fileName: string,
): Promise<void> {
  const el = ref.current
  if (!el) throw new Error('Aucun contenu à exporter.')
  await exportCvElementToPdfFile(el, fileName)
}
