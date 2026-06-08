import React, { useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

type DocItem = {
  id: string;
  file: File;
  url: string;
  name: string;
  type: string;
  status: 'draft' | 'in review' | 'signed';
  signature?: string; // data URL of signature
};

export const DocumentChamber: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedUploadType, setSelectedUploadType] = useState<'all' | 'document' | 'image' | 'text'>('all');
  const [isSigning, setIsSigning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map(f => {
      const url = URL.createObjectURL(f);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: f,
        url,
        name: f.name,
        type: f.type,
        status: 'draft' as const
      } as DocItem;
    });
    setDocs(prev => [...arr, ...prev]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleQuickUpload = (type: typeof selectedUploadType) => {
    setSelectedUploadType(type);
    fileInputRef.current?.click();
  };

  const allowedAccept = selectedUploadType === 'all'
    ? 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,text/plain'
    : selectedUploadType === 'document'
      ? 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : selectedUploadType === 'image'
        ? 'image/*'
        : 'text/plain';

  const handlePreview = (doc: DocItem) => {
    setPreviewUrl(doc.url);
    setSelectedDocId(doc.id);
    setIsSigning(false);
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selectedDocId === id) {
      setSelectedDocId(null);
      setPreviewUrl(null);
    }
  };

  const handleStatusChange = (id: string, status: DocItem['status']) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  // Signature pad
  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const endDrawing = () => {
    setIsDrawing(false);
  };
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveSignatureToDoc = () => {
    if (!canvasRef.current || !selectedDocId) return;
    const data = canvasRef.current.toDataURL('image/png');
    setDocs(prev => prev.map(d => d.id === selectedDocId ? { ...d, signature: data, status: 'signed' } : d));
    setIsSigning(false);
    setStatusMessage('Document signed.');
  };

  const [statusMessage, setStatusMessage] = useState('');

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Document Chamber</h3>
            <p className="text-sm text-slate-500">Choose a document type and upload files for deals, contracts, or investor materials.</p>
          </div>

          <div className="space-y-3 w-full lg:w-auto">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => handleQuickUpload('document')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Upload contract
              </button>
              <button
                type="button"
                onClick={() => handleQuickUpload('image')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Upload pitch deck
              </button>
              <button
                type="button"
                onClick={() => handleQuickUpload('all')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Upload any file
              </button>
              <button
                type="button"
                onClick={() => handleQuickUpload('text')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Upload notes
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedAccept}
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
              <Button onClick={handleUploadClick}>Upload files</Button>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {selectedUploadType === 'all' && 'Select any supported file type: PDF, Word, images, or text.'}
              {selectedUploadType === 'document' && 'Choose contracts, proposals, or PDF documents.'}
              {selectedUploadType === 'image' && 'Choose images for pitch decks, mockups, or visual attachments.'}
              {selectedUploadType === 'text' && 'Choose plain text files like notes, summaries, or specification docs.'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-900">Documents</h4>
              <p className="text-xs text-slate-500">{docs.length} files</p>
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {docs.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              ) : (
                docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-white">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.type || 'Unknown'}</div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <Badge variant={doc.status === 'draft' ? 'gray' : doc.status === 'in review' ? 'warning' : 'success'}>
                        {doc.status}
                      </Badge>
                      <select
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        value={doc.status}
                        onChange={(e) => handleStatusChange(doc.id, e.target.value as DocItem['status'])}
                      >
                        <option value="draft">Draft</option>
                        <option value="in review">In review</option>
                        <option value="signed">Signed</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => handlePreview(doc)}>Preview</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(doc.id); setIsSigning(true); setPreviewUrl(doc.url); }}>Sign</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)}>Delete</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-lg border border-slate-100 bg-white p-3 min-h-[280px]">
              {previewUrl ? (
                <div>
                  {/* preview area */}
                  {previewUrl.endsWith('.pdf') || previewUrl.includes('application/pdf') ? (
                    <embed src={previewUrl} type="application/pdf" width="100%" height="420px" />
                  ) : previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img src={previewUrl} alt="preview" className="w-full max-h-[420px] object-contain" />
                  ) : (
                    <iframe src={previewUrl} title="doc-preview" className="w-full h-[420px]" />
                  )}

                  {selectedDocId && docs.find(d => d.id === selectedDocId)?.signature ? (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600">Signature:</p>
                      <img src={docs.find(d => d.id === selectedDocId)?.signature} alt="signature" className="mt-2 border w-48" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="h-[420px] flex items-center justify-center text-slate-500">Select a document to preview</div>
              )}
            </div>

            {isSigning && selectedDocId ? (
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900">E-signature</h4>
                  <div className="text-xs text-slate-500">Status will update to <span className="font-semibold">signed</span> after saving</div>
                </div>

                <div className="mt-3">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    className="w-full border rounded bg-white"
                  />

                  <div className="mt-3 flex items-center gap-3">
                    <Button size="sm" onClick={saveSignatureToDoc}>Save signature</Button>
                    <Button size="sm" variant="outline" onClick={clearCanvas}>Clear</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsSigning(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            ) : null}

            {statusMessage ? <div className="text-sm text-slate-600">{statusMessage}</div> : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
