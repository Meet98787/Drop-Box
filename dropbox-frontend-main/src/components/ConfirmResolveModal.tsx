import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmResolveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmResolveModal: React.FC<ConfirmResolveModalProps> = ({ isOpen, onConfirm, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg shadow-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg text-black text-[26px] font-semibold">Resolve Message</DialogTitle>
        </DialogHeader>
        <p className="p-4 text-gray-700">
          Are you sure you want to mark this message as <strong>resolved</strong>? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-green-600 text-white hover:bg-green-700" onClick={onConfirm}>
            Yes, Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmResolveModal;
