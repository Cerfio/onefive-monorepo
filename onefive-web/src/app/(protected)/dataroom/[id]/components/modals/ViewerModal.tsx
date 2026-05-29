import { Dialog, DialogContent } from "@/components/base/dialog/dialog";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface ViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: { uri: string; fileName: string } | null;
}

export const ViewerModal = ({
    isOpen,
    onClose,
    document
}: ViewerModalProps) => {
    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="ph-no-capture max-w-6xl h-[80vh]">
                <DocViewer
                    documents={[{ uri: document.uri }]}
                    pluginRenderers={DocViewerRenderers}
                    style={{ height: "100%" }}
                />
            </DialogContent>
        </Dialog>
    );
}; 