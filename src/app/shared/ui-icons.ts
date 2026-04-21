import {
  FolderClosed,
  Folders,
  LayoutGrid,
  List,
  type LucideIconData,
  Upload
} from 'lucide-angular';

export const UI_ICONS = {
  folder: FolderClosed,
  folders: Folders,
  grid: LayoutGrid,
  list: List,
  upload: Upload
} satisfies Record<string, LucideIconData>;
