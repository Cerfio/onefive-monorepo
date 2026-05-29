// Re-exports vers les composants Untitled UI migrés (Vagues 1-4)
// Maintenu temporairement pour les fichiers qui utilisent encore le barrel
// `from '@/components/ui'` — à terme ces imports doivent passer en direct.
export { Badge } from '@/components/base/badges/badges';
export { Skeleton } from '@/components/base/skeleton/skeleton';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/base/card/card';
export { Separator } from '@/components/base/separator/separator';
export { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
export { Input } from '@/components/base/input/input';
export { TextArea as Textarea } from '@/components/base/textarea/textarea';
export { Avatar } from '@/components/base/avatar/avatar';
export { Checkbox } from '@/components/base/checkbox/checkbox';
export { Toggle } from '@/components/base/toggle/toggle';
export {
  RadioGroup,
  RadioButton,
} from '@/components/base/radio-buttons/radio-buttons';
export { Select } from '@/components/base/select/select';
export { Button } from '@/components/base/buttons/button';
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/base/dialog/dialog';
export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/base/dialog/alert-dialog';
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/base/tabs/tabs';
export { Label } from '@/components/base/label/label';
export {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/base/alert/alert';

// Composants custom OneFive (pas d'équivalent Untitled UI direct)
export * from './hover-card';
export * from './input-search';
